// @flow

import FS from 'fs';
import lodash from 'lodash';
import _ from 'underscore';

class Extension {
    _file: string;
    // eslint-disable-next-line flowtype/no-weak-types
    _generator: Object;
    // eslint-disable-next-line flowtype/no-weak-types
    _template: any;

    // eslint-disable-next-line flowtype/no-weak-types
    constructor(file: string, generator: Object) {
        this._file = file;
        this._generator = generator;
    }

    load(): Extension {
        this._template = _.template(
            FS.readFileSync(this.file, 'utf-8').toString()
        );
        return this;
    }

    generate(
        // eslint-disable-next-line flowtype/no-weak-types
        labels: any,
        // eslint-disable-next-line flowtype/no-weak-types
        templateDescription: Object,
        // eslint-disable-next-line flowtype/no-weak-types
        genArgs: ?Object
    ): string {
        if (!Array.isArray(labels)) {
            if (!labels) {
                labels = [];
            } else {
                labels = [labels];
            }
        }

        const oldLabels = this.generator.labels;
        this.generator.labels = [...oldLabels, ...labels];

        const generatedText = this._template({
            packages: this.generator.packages,
            design: this.generator.design,
            options: this.generator.options,
            map: this.generator.map,
            context: templateDescription.context,
            extension: (
                matcher: string,
                labels: Array<string>,
                // eslint-disable-next-line flowtype/no-weak-types
                args: ?Object
            ): Array<string> =>
                this.generator.extensionBuilder.getExtensions(
                    matcher,
                    labels,
                    templateDescription,
                    args
                ),
            lodash,
            labels: this.generator.labels,
            args: genArgs
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
