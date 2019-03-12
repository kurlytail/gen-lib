// @flow

import FS from 'fs';
import _ from 'underscore';
import lodash from 'lodash';

class Extension {

    _file: string;
    _generator: Object;
    _template: string;

    constructor(file: string, generator: Object) {
        this._file = file;
        this._generator = generator;
    }

    load() {
        this._template = FS.readFileSync(this.file).toString();
        return this;
    }

    generate(labels: any, templateDescription: Object) {
        if (!Array.isArray(labels)) {
            if (!labels) {
                labels = [];
            } else {
                labels = [labels];
            }
        }

        const oldLabels = this.generator.labels;
        this.generator.labels = [...oldLabels, ...labels];

        const generatedText = _.template(this.template)({
            design: this.generator.design,
            options: this.generator.options,
            map: this.generator.map,
            context: templateDescription.context,
            extension: (matcher, labels) =>
                this.generator.extensionBuilder.getExtensions(matcher, labels, templateDescription),
            lodash,
            labels: this.generator.labels
        });

        this.generator.labels = oldLabels;
        return generatedText;
    }

    get file() {
        return this._file;
    }

    get template() {
        return this._template;
    }

    get generator() {
        return this._generator;
    }

    toString() {
        return this._file;
    }
}

export default Extension;
