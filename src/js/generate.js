import PATH from 'path';
import FS from 'fs';
import mkdirp from 'mkdirp';
import { merge } from 'node-diff3';
import logger from './logger';
import _ from 'underscore';
import lodash from 'lodash';

function manageFileNames(options, fileName) {
    const outputDirectory = options.output ? options.output : './';
    const baseFileName = PATH.join(outputDirectory, '.generated', fileName);
    if (!PATH.isAbsolute(fileName)) {
        fileName = PATH.join(outputDirectory, fileName);
    }
    mkdirp.sync(PATH.dirname(fileName));
    mkdirp.sync(PATH.dirname(baseFileName));

    return { fileName, baseFileName };
}

function getOverwriteOption(options, templateDescription) {
    let overwrite = templateDescription.overwrite || options.overwrite;
    return options.forceOverwrite ? options.overwrite : overwrite;
}

function generateFileData(generator, templateDescription, { fileName, baseFileName }) {
    const template = _.template(FS.readFileSync(templateDescription.template).toString());
    let newFileText = template({
        design: generator.design,
        options: generator.options,
        context: templateDescription.context,
        map: generator.map,
        extension: matcher => generator.extensionBuilder.getExtensions(matcher),
        lodash
    });

    let currentFileText;
    let baseFileText;

    if (FS.existsSync(fileName)) {
        currentFileText = FS.readFileSync(fileName).toString();
    }

    if (FS.existsSync(baseFileName)) {
        baseFileText = FS.readFileSync(baseFileName).toString();
    }

    const overwrite = getOverwriteOption(generator.options, templateDescription);
    baseFileText = baseFileText && overwrite !== 'gen-merge' ? baseFileText : '';

    if (baseFileText && currentFileText && (overwrite === 'merge' || overwrite === 'gen-merge')) {
        const merged = merge(currentFileText, baseFileText, newFileText);
        if (merged.conflict) {
            logger.warn(
                `conflicts between ${fileName} and ${baseFileName}, ${fileName} file unchanged, please merge manually`
            );
            baseFileText = newFileText;
            newFileText = undefined;
        } else {
            baseFileText = newFileText;
            newFileText = merged.result.join('');
        }
    } else {
        baseFileText = newFileText;
    }

    return { currentFileText, baseFileText, newFileText };
}

function manageOverwriteState(options, fileName, templateDescription, { currentFileText, baseFileText }) {
    const overwrite = getOverwriteOption(options, templateDescription);

    switch (overwrite) {
        default:
        case 'skip':
            // Skip files already present
            if (currentFileText) return;

            break;

        case 'regen':
            // Skip files with manual edits
            if (currentFileText && currentFileText !== baseFileText) return;

            break;

        case 'error':
            // Error files with manual edits
            if (currentFileText && currentFileText !== baseFileText) throw new Error(`${fileName} has been modified`);

            break;

        case 'merge':
            if (currentFileText && !baseFileText) {
                throw new Error(`${fileName} already exists`);
            }

            break;
    }
}

function writeFiles({ fileName, baseFileName }, { newFileText, baseFileText }) {
    if (newFileText !== undefined) {
        FS.writeFileSync(fileName, newFileText);
    }
    FS.writeFileSync(baseFileName, baseFileText);
}

function generate(generator) {
    Object.entries(generator.map).forEach(([generatedFileName, templateDescription]) => {
        const { fileName, baseFileName } = manageFileNames(generator.options, generatedFileName);
        const { baseFileText, currentFileText, newFileText } = generateFileData(generator, templateDescription, {
            fileName,
            baseFileName
        });
        logger.info(`Generating ${fileName} from template ${templateDescription.template}`);
        writeFiles({ fileName, baseFileName }, { currentFileText, baseFileText, newFileText });
    });
}

export { generate, getOverwriteOption, manageFileNames, generateFileData, manageOverwriteState, writeFiles };
