// @flow

import Getopt from 'node-getopt';

type OptionType = {
    design: Array<string>,
    map: Array<string>,
    extension: Array<string>,
    generator: Array<string>
};

class Options {
    design: Array<string>;
    map: Array<string>;
    extension: Array<string>;
    generator: Array<string>;
    output: string;

    // eslint-disable-next-line flowtype/no-weak-types
    constructor(processArgs: Array<string>, overrideOptions: OptionType) {
        const getopt = new Getopt([
            ['m', 'map=ARG+', 'mapping files'],
            ['d', 'design=ARG+', 'design files'],
            ['e', 'extension=ARG+', 'extension directories or files'],
            ['o', 'output=ARG', 'output directory for generated files'],
            ['g', 'generator=ARG+', 'generators to be used']
        ]);

        getopt.bindHelp();

        Object.assign(
            this,
            { design: [], map: [], extension: [], generator: [] },
            getopt.parse(processArgs).options,
            overrideOptions
        );
    }

    merge(options: OptionType) {
        this.design = [...this.design, ...options.design];
        this.map = [...this.map, ...options.map];
        this.extension = [...this.extension, ...options.extension];
        this.generator = [...this.generator, ...options.generator];
    }
}

export default Options;
