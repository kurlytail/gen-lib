import PATH from 'path';
import FS from 'fs';
import mkdirp from 'mkdirp';
import { merge } from 'node-diff3';
import logger from './logger';
import _ from 'underscore';

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

function generateFileData(options, design, templateDescription, { fileName, baseFileName }) {
    const template = _.template(FS.readFileSync(templateDescription.template).toString());
    let newFileText = template({ design, options, context: templateDescription.context });

    let currentFileText;
    let baseFileText;

    if (FS.existsSync(fileName)) {
        currentFileText = FS.readFileSync(fileName).toString();
    }

    if (FS.existsSync(baseFileName)) {
        baseFileText = FS.readFileSync(baseFileName).toString();
    }

    const overwrite = getOverwriteOption(options, templateDescription);

    if (baseFileText && currentFileText && newFileText && overwrite === 'merge') {
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
    if (newFileText) {
        FS.writeFileSync(fileName, newFileText);
    }
    FS.writeFileSync(baseFileName, baseFileText);
}

function generate(design, map, options) {
    Object.entries(map).forEach(([generatedFileName, templateDescription]) => {
        const { fileName, baseFileName } = manageFileNames(options, generatedFileName);
        const { baseFileText, currentFileText, newFileText } = generateFileData(options, design, templateDescription, {
            fileName,
            baseFileName
        });
        logger.info(`Generating ${fileName} from template ${templateDescription.template}`);
        writeFiles({ fileName, baseFileName }, { currentFileText, baseFileText, newFileText });
    });
}

export { generate, getOverwriteOption, manageFileNames, generateFileData, manageOverwriteState, writeFiles };
