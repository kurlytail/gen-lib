import Options from './options';
import getDesign from './design';
import FS from 'fs';
import { generate } from './generate';
import PATH from 'path';
import _ from 'underscore';
import ExtensionBuilder from './extension-builder';

class Generator {
    _loadOneDesign(design, designFile) {
        const augmentedDesign = JSON.parse(FS.readFileSync(designFile));
        return { ...design, ...augmentedDesign };
    }

    _loadDesign(design) {
        design = design || {};

        // Load design files and overwrite with input design
        let rawDesign = { ...this.options.design.reduce((...args) => this._loadOneDesign(...args), {}), ...design };

        // Normalize design
        this._design = getDesign(rawDesign);
    }

    _normalizeMapEntry(mapFile, map, [fileName, templateDescription]) {
        const templateFile = templateDescription.template;
        let template = PATH.relative(PATH.resolve('./'), PATH.resolve(PATH.dirname(mapFile), templateFile));
        if (PATH.isAbsolute(templateFile)) template = templateFile;
        map[fileName] = { ...templateDescription, template };
        return map;
    }

    _loadOneMap(map, mapFile) {
        let mapFileText = FS.readFileSync(mapFile).toString();
        let newMap = JSON.parse(_.template(mapFileText)({ design: this.design, options: this.options, map }));

        // Fixup all file names to global names
        newMap = Object.entries(newMap).reduce((...args) => this._normalizeMapEntry(mapFile, ...args), {});

        return { ...map, ...newMap };
    }

    _loadMaps(map) {
        // Load map files
        this._map = this.options.map.reduce((...args) => this._loadOneMap(...args), {});

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

    constructor(design = undefined, map = undefined, overrideOptions = undefined) {
        this._options = new Options(process.argv.slice(2), overrideOptions);
        this._extensionBuilder = new ExtensionBuilder(this);
        this._loadDesign(design);
        this._loadMaps(map);
        this._checkErrors();
        this._extensionBuilder.build();
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

    generate() {
        return generate(this);
    }
}

export default Generator;
