// @flow

import FS from 'fs';
import _ from 'underscore';
import lodash from 'lodash';

class Extension {

    _file: string;
    // eslint-disable-next-line flowtype/no-weak-types
    _generator: Object;
    _template: string;

    // eslint-disable-next-line flowtype/no-weak-types
    constructor(file: string, generator: Object) {
        this._file = file;
        this._generator = generator;
    }

    load(): Extension {
        this._template = FS.readFileSync(this.file).toString();
        return this;
    }

    // eslint-disable-next-line flowtype/no-weak-types
    generate(labels: any, templateDescription: Object): string {
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
            extension: (matcher: string, labels: Array<string>): Array<string> =>
                this.generator.extensionBuilder.getExtensions(matcher, labels, templateDescription),
            lodash,
            labels: this.generator.labels
        });

        this.generator.labels = oldLabels;
        return generatedText;
    }

    get file(): string {
        return this._file;
    }

    get template(): string {
        return this._template;
    }

    // eslint-disable-next-line flowtype/no-weak-types
    get generator(): Object {
        return this._generator;
    }

    toString(): string {
        return this._file;
    }
}

export default Extension;
