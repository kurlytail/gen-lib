// @flow

import Getopt from 'node-getopt';

class Options {
    design: Array<string>;
    map: Array<string>;
    extension: Array<string>;
    generator: Array<string>;
    output: string;
    overwrite: string;
    forceOverwrite: string;

    // eslint-disable-next-line flowtype/no-weak-types
    constructor(processArgs: Array<string>, overrideOptions: Object) {
        const getopt = new Getopt([
            ['m', 'map=ARG+', 'mapping files'],
            ['d', 'design=ARG+', 'design files'],
            ['e', 'extension=ARG+', 'extension directories or files'],
            ['o', 'output=ARG', 'output directory for generated files'],
            ['g', 'generator=ARG', 'generators to be used']
        ]);

        getopt.bindHelp();

        Object.assign(
            this,
            {
                design: [],
                map: [],
                extension: [],
                generator: []
            },
            getopt.parse(processArgs).options,
            overrideOptions
        );
    }
}

export default Options;
