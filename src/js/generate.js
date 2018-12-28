import PATH from 'path';
import lodash from 'lodash';
import FS from 'fs';
import mkdirp from 'mkdirp';
import merge from 'three-way-merge';

function manageFileNames(options, fileName) {
    const outputDirectory = options.output ? options.output : './';

    if (!PATH.isAbsolute(fileName)) {
        fileName = PATH.join(outputDirectory, fileName);
    }
    const baseFileName = PATH.join(outputDirectory, '.generated', fileName);

    mkdirp(PATH.dirname(fileName));
    mkdirp(PATH.dirname(baseFileName));

    return { fileName, baseFileName };
}

function getOverwriteOption(options, templateDescription) {
    let overwrite = templateDescription.overwrite || options.overwrite;
    return options.forceOverwrite ? options.overwrite : overwrite;
}

function generateFileData(options, templateDescription, { fileName, baseFileName }) {
    console.log(`Generating ${fileName} from ${templateDescription.template}`);
    const template = lodash.template(FS.readFileSync(fileName));
    let newFileText = template(templateDescription.object);

    let currentFileText;
    let baseFileText;

    if (FS.existsSync(fileName)) {
        currentFileText = FS.readFileSync(fileName);
    }

    if (FS.existsSync(baseFileName)) {
        baseFileText = FS.readFileSync(baseFileName);
    }

    const overwrite = getOverwriteOption(options, templateDescription);

    if (baseFileText && currentFileText && newFileText && overwrite === 'merge') {
        const merged = merge(baseFileText, currentFileText, newFileText);
        if (merged.conflict) {
            throw new Error(`${fileName} cannot be merged due to conflicts`);
        }

        baseFileText = newFileText;
        newFileText = merged.joinedResult();
    } else {
        baseFileText = newFileText;
    }

    return { currentFileText, baseFileText, newFileText };
}

function manageOverwriteState(options, fileName, templateDescription, { currentFileText, baseFileText, newFileText }) {
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

function writeFiles({ fileName, baseFileName }, { currentFileText, baseFileText, newFileText }) {
    FS.writeFileSync(fileName, newFileText);
    FS.writeFileSync(baseFileName, newFileText);
}

function generate(design, map, options) {
    Object.entries(map).forEach(([generatedFileName, templateDescription]) => {
        const { fileName, baseFileName } = manageFileNames(options, generatedFileName);
        const { baseFileText, currentFileText, newFileText } = generateFileData(options, templateDescription, {
            fileName,
            baseFileName
        });

        writeFiles({ fileName, baseFileName }, { currentFileText, baseFileText, newFileText });
    });
}

export { generate, getOverwriteOption, manageFileNames, generateFileData, manageOverwriteState, writeFiles };
