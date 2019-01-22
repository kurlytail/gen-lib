import PATH from 'path';
import FS from 'fs';
import mkdirp from 'mkdirp';
import logger from './logger';
import _ from 'underscore';
import lodash from 'lodash';

function manageFileNames(options, fileName) {
    const outputDirectory = options.output ? options.output : './';
    if (!PATH.isAbsolute(fileName)) {
        fileName = PATH.join(outputDirectory, fileName);
    }
    mkdirp.sync(PATH.dirname(fileName));

    return fileName;
}

function getOverwriteOption(options, templateDescription) {
    let overwrite = templateDescription.overwrite || options.overwrite;
    return options.forceOverwrite ? options.overwrite : overwrite;
}

function generateFileData(generator, templateDescription, fileName) {
    const template = _.template(FS.readFileSync(templateDescription.template).toString());
    const newFileText = template({
        design: generator.design,
        options: generator.options,
        context: templateDescription.context,
        map: generator.map,
        extension: matcher => generator.extensionBuilder.getExtensions(matcher),
        lodash,
        fileName
    });

    return newFileText;
}

function generate(generator) {
    Object.entries(generator.map).forEach(([generatedFileName, templateDescription]) => {
        const fileName = manageFileNames(generator.options, generatedFileName);
        const newFileText = generateFileData(generator, templateDescription, fileName);
        logger.info(`Generating ${fileName} from template ${templateDescription.template}`);
        FS.writeFileSync(fileName, newFileText);
    });
}

export { generate, getOverwriteOption, manageFileNames, generateFileData };
