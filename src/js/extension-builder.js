// @flow

import FS from 'fs';
import Extension from './extension';
import PATH from 'path';
import logger from './logger';

class ExtensionBuilder {

    // eslint-disable-next-line flowtype/no-weak-types
    _generator: Object;
    // eslint-disable-next-line flowtype/no-weak-types
    _extensions: Array<Object>

    // eslint-disable-next-line flowtype/no-weak-types
    constructor(generator: Object) {
        this._generator = generator;
    }

    // eslint-disable-next-line flowtype/no-weak-types
    _loadOneExtension(extensions: Array<Object>, extension: string): Array<Object> {
        const stat = FS.statSync(extension);

        /* Convert file and directories to extensions */
        if (stat.isFile() && extension.match(/.*\._$/)) {
            extensions.push({
                name: PATH.basename(extension).replace(/\._$/, ''),
                file: extension
            });
            return extensions;
        }

        /* Assume file is a directory */
        if (stat.isDirectory()) {
            const files = FS.readdirSync(extension).filter(
                (file: string): boolean => !!file.match(/.*\._$/) && FS.statSync(`${extension}/${file}`).isFile()
            );
            // eslint-disable-next-line flowtype/no-weak-types
            extensions = files.reduce((extensions: Array<Object>, file: string): Array<Object> =>
                this._loadOneExtension(extensions, `${extension}/${file}`), extensions);

            const directories = FS.readdirSync(extension).filter((dir: string): boolean => {
                return FS.statSync(`${extension}/${dir}`).isDirectory();
            });
            // eslint-disable-next-line flowtype/no-weak-types
            extensions = directories.reduce((extensions: Array<Object>, dir: string): Array<Object> =>
                this._loadOneExtension(extensions, `${extension}/${dir}`), extensions);
            return extensions;
        }

        throw new Error(`Unrecognized extension ${extension}`);
    }

    build() {
        /* reverse the list so that the last extension is seen first */
        this._extensions = this.generator.options.extension
            // eslint-disable-next-line flowtype/no-weak-types
            .reduce((...args: any): Array<Object> => this._loadOneExtension(...args), [])
            .reverse();
    }

    // eslint-disable-next-line flowtype/no-weak-types
    getExtensions(match: string, labels: Array<string>, templateDescription: Object): Array<string> {
        return this.extensions
            // eslint-disable-next-line flowtype/no-weak-types
            .filter((ext: Object): boolean => ext.name.match(match))
            // eslint-disable-next-line flowtype/no-weak-types
            .map((ext: Object): string => {
                if (!ext.extension) {
                    logger.info(`loading extension ${PATH.relative(PATH.resolve('./'), PATH.resolve(ext.file))}`);
                    ext.extension = new Extension(ext.file, this.generator).load();
                }
                return ext.extension.generate(labels, templateDescription);
            });
    }

    // eslint-disable-next-line flowtype/no-weak-types
    get generator(): Object {
        return this._generator;
    }

    // eslint-disable-next-line flowtype/no-weak-types
    get extensions(): Array<Object> {
        return this._extensions;
    }

    toString(): string {
        return this.extensions.toString();
    }
}

export default ExtensionBuilder;
