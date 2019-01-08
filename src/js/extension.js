import FS from 'fs';
import _ from 'underscore';
import lodash from 'lodash';

class Extension {
    constructor(file, generator) {
        this._file = file;
        this._generator = generator;
    }

    load() {
        this._template = FS.readFileSync(this.file).toString();
        this._text = _.template(this.template)({
            design: this.generator.design,
            options: this.generator.options,
            map: this.generator.map,
            extension: matcher => this.generator.extensionBuilder.getExtensions(matcher),
            lodash
        });

        return this;
    }

    get file() {
        return this._file;
    }

    get text() {
        return this._text;
    }

    get template() {
        return this._template;
    }

    get generator() {
        return this._generator;
    }

    toString() {
        return this.text;
    }
}

export default Extension;
