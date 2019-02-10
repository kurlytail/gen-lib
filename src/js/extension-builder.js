import FS from 'fs';
import Extension from './extension';
import PATH from 'path';
import logger from './logger';

class ExtensionBuilder {
    constructor(generator) {
        this._generator = generator;
    }

    _loadOneExtension(extensions, extension) {
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
                file => file.match(/.*\._$/) && FS.statSync(`${extension}/${file}`).isFile()
            );
            extensions = files.reduce((extensions, file) => {
                return this._loadOneExtension(extensions, `${extension}/${file}`);
            }, extensions);

            const directories = FS.readdirSync(extension).filter(dir => {
                return FS.statSync(`${extension}/${dir}`).isDirectory();
            });
            extensions = directories.reduce((extensions, dir) => {
                return this._loadOneExtension(extensions, `${extension}/${dir}`);
            }, extensions);
            return extensions;
        }

        throw new Error(`Unrecognized extension ${extension} ${stat.isFile()}`);
    }

    build() {
        /* reverse the list so that the last extension is seen first */
        this._extensions = this.generator.options.extension
            .reduce((...args) => this._loadOneExtension(...args), [])
            .reverse();
    }

    getExtensions(match) {
        return this.extensions
            .filter(ext => ext.name.match(match))
            .map(ext => {
                if (!ext.extension) {
                    logger.info(`loading extension ${PATH.relative(PATH.resolve('./'), PATH.resolve(ext.file))}`);
                    ext.extension = new Extension(ext.file, this.generator).load();
                }
                return ext.extension.text;
            });
    }

    get generator() {
        return this._generator;
    }

    get extensions() {
        return this._extensions;
    }

    toString() {
        return this.extensions;
    }
}

export default ExtensionBuilder;
