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

function generateFileData(generator, templateDescription, fileName) {
    const template = _.template(
        FS.readFileSync(templateDescription.template).toString()
    );
    const newFileText = template({
        design: generator.design,
        options: generator.options,
        context: templateDescription.context,
        map: generator.map,
        extension: (matcher, labels) =>
            generator.extensionBuilder.getExtensions(
                matcher,
                labels,
                templateDescription
            ),
        lodash,
        fileName,
        labels: []
    });

    return newFileText;
}

function generate(generator) {
    const generatedFiles = [];

    Object.entries(generator.map).forEach(
        ([generatedFileName, templateDescription]) => {
            const fileName = manageFileNames(
                generator.options,
                generatedFileName
            );
            const newFileText = generateFileData(
                generator,
                templateDescription,
                fileName
            );

            FS.writeFileSync(fileName, newFileText);
            logger.info(
                `Generated ${fileName} from template ${
                    templateDescription.template
                }`
            );

            generatedFiles.push(fileName);
        }
    );

    return generatedFiles;
}

export { generate, manageFileNames, generateFileData };
