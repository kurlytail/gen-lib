/* eslint-disable no-undef */
import { execSync } from 'child_process';
import FS from 'fs';
import lodash from 'lodash';
import NodeGit from 'nodegit';
import PATH from 'path';
import _ from 'underscore';
import uuidv4 from 'uuid/v4';
import YAML from 'yaml';

import getDesign from './design';
import ExtensionBuilder from './extension-builder';
import { generate } from './generate';
import logger from './logger';
import Options from './options';

class Generator {
    _loadOneDesign(design, designFile) {
        const augmentedDesign = designFile.endsWith('yml')
            ? YAML.parse(FS.readFileSync(designFile))
            : JSON.parse(FS.readFileSync(designFile));
        return { ...design, ...augmentedDesign };
    }

    _loadDesign(design) {
        design = design || {};

        // Load design files and overwrite with input design
        let rawDesign = {
            ...this.options.design.reduce(
                (...args) => this._loadOneDesign(...args),
                {}
            ),
            ...design
        };

        // Normalize design
        this._design = getDesign(rawDesign);
    }

    _loadGeneratorPackage(pack) {
        // eslint-disable-next-line no-undef
        const requireFunc =
            typeof __webpack_require__ === 'function'
                ? __non_webpack_require__
                : require;

        if (Object.keys(this._packages).includes(pack)) return;

        let packageName = `@kurlytail/gen-${pack}`;
        let options;

        try {
            options = requireFunc(packageName);
        } catch (err) {
            packageName = `gen-${pack}`;
            try {
                options = requireFunc(packageName);
            } catch (err) {
                packageName = pack;
                options = requireFunc(packageName);
            }
        }
        this._packages[pack] = { ...options.default, packageName };
        const generators = options.default.generator || [];
        generators.forEach(depPack => this._loadGeneratorPackage(depPack));

        // Merge options after dependent package options are merged are loaded
        this.options.merge(options.default);
        logger.info(
            `Loaded generator ${packageName}@${options.default.version}`
        );
    }

    _loadGeneratorPackages() {
        this._packages = {};

        const generator = this.options.generator;
        this.options.generator = [];

        generator.forEach(pack => {
            this._loadGeneratorPackage(pack);
            if (!this.options.generator.includes(pack)) {
                this.options.generator.push(pack);
            }
        });
    }

    _normalizeMapEntry(mapFile, map, [fileName, templateDescription]) {
        const templateFile = templateDescription.template;
        let template = PATH.relative(
            PATH.resolve('./'),
            PATH.resolve(PATH.dirname(mapFile), templateFile)
        );
        if (PATH.isAbsolute(templateFile)) template = templateFile;
        map[fileName] = { ...templateDescription, template };
        return map;
    }

    _loadOneMap(map, mapFile) {
        logger.info(
            `loading map ${PATH.relative(
                PATH.resolve('./'),
                PATH.resolve(mapFile)
            )}`
        );
        const mapFileText = FS.readFileSync(mapFile).toString();
        const template = _.template(mapFileText);
        const mapContents = template({
            design: this.design,
            options: this.options,
            map,
            extension: (matcher, labels, args) =>
                this.extensionBuilder.getExtensions(matcher, labels, {}, args),
            lodash,
            labels: []
        });
        let newMap = mapFile.endsWith('yml')
            ? YAML.parse(mapContents)
            : JSON.parse(mapContents);

        // Fixup all file names to global names
        newMap = Object.entries(newMap).reduce(
            (...args) => this._normalizeMapEntry(mapFile, ...args),
            {}
        );

        return { ...map, ...newMap };
    }

    _loadMaps(map) {
        // Load map files
        this._map = this.options.map.reduce(
            (...args) => this._loadOneMap(...args),
            {}
        );

        // merge maps
        this._map = map ? { ...this.map, ...map } : this.map;
    }

    _checkErrors() {
        if (Object.keys(this.map).length === 0) {
            throw new Error('No maps found');
        }

        if (Object.keys(this.design).length === 0) {
            throw new Error('No designs found');
        }
    }

    async _getCurrentBranch() {
        const data = await this._repo.getCurrentBranch();
        const name = (await data.name()).replace(/^refs\/heads\//, '');
        return { name, data };
    }

    async _switchToBranch(branch) {
        logger.warn(`Checkout branch ${branch.name}`);
        await this._repo.checkoutRef(branch.data);
    }

    async _createStash() {
        const branch = await this._getCurrentBranch();

        try {
            const name = uuidv4();
            const oid = await NodeGit.Stash.save(
                this._repo,
                this._repo.defaultSignature(),
                name,
                NodeGit.Stash.FLAGS.DEFAULT
            );
            logger.info(`Stashed branch ${branch.name}`);

            return { branch, oid, name };
            /* eslint no-empty: "off" */
        } catch (error) {
            logger.warn(`Ignoring error ${error}`);
        }

        return { branch };
    }

    async _restoreStash(stash) {
        if (stash && stash.oid) {
            await this._switchToBranch(stash.branch);
            await NodeGit.Stash.pop(
                this._repo,
                0,
                new NodeGit.StashApplyOptions()
            );
            logger.info(`Unstashed branch ${stash.branch.name}`);
        }
    }

    async _deleteIndexedFiles() {
        const index = await this._repo.refreshIndex();
        const outputDirectory = PATH.resolve(this.options.output || './');

        index.entries().forEach(entry => {
            const filePath = PATH.join(outputDirectory, entry.path);
            if (FS.existsSync(filePath)) FS.unlinkSync(filePath);
        });

        await index.removeAll('*');
        await index.write();
        await index.writeTree();
    }

    async _clearIndex() {
        const index = await this._repo.refreshIndex();
        await index.clear();
        await index.write();
        await index.writeTree();
    }

    async _initRepository() {
        const outputDirectory = this.options.output || './';
        const gitDirectory = PATH.join(outputDirectory, '.git');

        const gitDirectoryExists = FS.existsSync(gitDirectory);
        if (gitDirectoryExists) {
            logger.info(`Opening git repository ${gitDirectory}`);
            this._repo = await NodeGit.Repository.open(outputDirectory);
        } else {
            logger.info(`Initializing git repository ${gitDirectory}`);
            this._repo = await NodeGit.Repository.init(outputDirectory, 0);
        }

        const commitTarget = await this._repo.getHeadCommit();
        this._newRepo = !commitTarget;
    }

    async _getHeadCommit(branch) {
        await this._switchToBranch(branch);
        const head = await NodeGit.Reference.nameToId(this._repo, 'HEAD');
        return await this._repo.getCommit(head);
    }

    async _ensureBranch(name, sourceBranch) {
        try {
            logger.info(`Attempting to use branch ${name}`);
            const data = await this._repo.getBranch(name);
            return { name, data };
        } catch (error) {
            logger.info(`Creating new branch ${name}`);
            const commit = await this._getHeadCommit(sourceBranch);
            const data = await this._repo.createBranch(name, commit, false);
            return { name, data };
        }
    }

    getGeneratorBranchName() {
        return `${this._userBranch.name}-sgen-generated`;
    }

    getCommitMessage() {
        const versionString = Object.entries(this._packages)
            .map(
                ([, options]) =>
                    `    - ${options.packageName}@${options.version}`
            )
            .join('\n');
        return `generated by \n    - gen-lib@${app.version}\n${versionString}`;
    }

    async _commit(generatedFiles, parent) {
        const outputDirectory = this.options.output || './';
        const index = await this._repo.refreshIndex();
        const filesToDelete = [];

        index.entries().forEach(entry => {
            const filePath = PATH.join(outputDirectory, entry.path);
            if (!_.contains(generatedFiles, filePath)) {
                filesToDelete.push(entry.path);
            }
        });

        for (let ii in filesToDelete) {
            const fileName = filesToDelete[ii];
            const filePath = PATH.join(outputDirectory, fileName);
            await index.removeByPath(fileName);
            if (FS.existsSync(filePath)) FS.unlinkSync(filePath);
        }

        for (let ii in generatedFiles) {
            const fileName = PATH.relative(outputDirectory, generatedFiles[ii]);
            await index.addByPath(fileName);
        }

        await index.write();

        const oid = await index.writeTree();
        const statuses = await this._repo.getStatus();
        const modified = statuses.reduce(() => true, false);
        let commit;

        if (modified) {
            const author = NodeGit.Signature.default(this._repo);
            commit = await this._repo.createCommit(
                'HEAD',
                author,
                author,
                this.getCommitMessage(),
                oid,
                parent ? [parent] : []
            );
            logger.info('Committed generated files');
        } else {
            const branch = await this._getCurrentBranch();
            commit = await this._getHeadCommit(branch);
            logger.warn('Nothing changed in generated files');
        }

        return { modified, commit };
    }

    async _setupRepository() {
        await this._initRepository();

        if (!this._newRepo) {
            this._userBranch = await this._getCurrentBranch();
            if (this._userBranch.name.endsWith('sgen-generated')) {
                throw new Error('Repository should use user branch');
            }
            this._stash = await this._createStash();

            this._generatorBranch = await this._ensureBranch(
                this.getGeneratorBranchName(),
                this._userBranch
            );
            await this._switchToBranch(this._generatorBranch);
        }

        await this._deleteIndexedFiles();
    }

    async _finalizeRepository(generatedFiles) {
        if (this._newRepo) {
            this._postCommit = await this._commit(generatedFiles);
            this._userBranch = await this._getCurrentBranch();
            this._generatorBranch = await this._ensureBranch(
                this.getGeneratorBranchName(),
                this._userBranch
            );
        } else {
            const parent = await this._getHeadCommit(this._generatorBranch);
            this._postCommit = await this._commit(generatedFiles, parent);
        }

        await this._restoreStash(this._stash);
        await this._switchToBranch(this._userBranch);

        if (this._postCommit.modified && !this._newRepo) {
            logger.warn(
                `Generator branch ${this._generatorBranch.name} was modified`
            );
            logger.warn(
                `Please cherrypick changes from ${this._generatorBranch.name} from ${this._postCommit.commit}`
            );
            logger.info(`git cherry-pick ${this._postCommit.commit}`);
        }
    }

    async cleanupOnError() {
        logger.warn('Attempting to cleanup on error');
        if (this._generatorBranch) {
            logger.warn(`Checkout branch ${this._generatorBranch.name}`);
            await this._switchToBranch(this._generatorBranch);
            await this._clearIndex();
        }
        if (this._postCommit) {
            logger.warn(
                `Revert commit on branch ${this._generatorBranch.name}`
            );
            await NodeGit.Revert.revert(
                this._repo,
                this._postCommit.commit,
                new NodeGit.RevertOptions()
            );
        }
        if (this._userBranch) {
            logger.warn(`Checkout branch ${this._userBranch.name}`);
            await this._switchToBranch(this._userBranch);
        }
        if (this._stash) {
            await this._restoreStash(this._stash);
        }
    }

    constructor(
        design = undefined,
        map = undefined,
        overrideOptions = undefined
    ) {
        this._options = new Options(process.argv.slice(2), overrideOptions);
        this._loadGeneratorPackages();
        this._extensionBuilder = new ExtensionBuilder(this);
        this._loadDesign(design);
        this._extensionBuilder.build();
        this._loadMaps(map);
        this._checkErrors();
    }

    get design() {
        return this._design;
    }

    get map() {
        return this._map;
    }

    get options() {
        return this._options;
    }

    get extensionBuilder() {
        return this._extensionBuilder;
    }

    get labels() {
        return this._labels || [];
    }

    set labels(labels) {
        this._labels = labels;
    }

    get packages() {
        return this._packages || [];
    }

    async generate() {
        await this._setupRepository();
        const generatedFiles = generate(this);
        try {
            execSync(
                generatedFiles.reduce(
                    (cmd, file) => cmd + ' ' + file,
                    'prettier --write '
                )
            );
        } catch (err) {}

        await this._finalizeRepository(generatedFiles);
    }
}

export default Generator;
