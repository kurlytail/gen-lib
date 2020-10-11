// @flow

import FS from 'fs';
import YAML from 'yaml';
import Getopt from 'node-getopt';
import deepmerge from 'deepmerge';

type OptionType = {
    design: Array<string>,
    map: Array<string>,
    extension: Array<string>,
    generator: Array<string>,
    options: Array<string>,
    swarm: boolean
};

class Options {
    design: Array<string>;
    map: Array<string>;
    extension: Array<string>;
    generator: Array<string>;
    options: Array<string>;
    output: string;
    swarm: boolean;

    // eslint-disable-next-line flowtype/no-weak-types
    constructor(processArgs: Array<string>, overrideOptions: OptionType) {
        const getopt = new Getopt([
            ['m', 'map=ARG+', 'mapping files'],
            ['d', 'design=ARG+', 'design files'],
            ['e', 'extension=ARG+', 'extension directories or files'],
            ['o', 'output=ARG', 'output directory for generated files'],
            ['g', 'generator=ARG+', 'generators to be used'],
            ['p', 'options=ARG+', 'extra option json/yaml files'],
            ['s', 'swarm', 'Apply swarm design transformations']
        ]);

        getopt.bindHelp();

        processArgs[0] == '--' && processArgs.shift();
        const commandLineOptions = Object.assign(
            {},
            getopt.parse(processArgs).options
        );

        Object.assign(this, {
            design: [],
            map: [],
            extension: [],
            generator: [],
            options: [],
            swarm: false
        });

        let fileOptions =
            (overrideOptions
                ? overrideOptions.options
                : commandLineOptions.options) || [];

        fileOptions.forEach((optionFile: string) => {
            let fileOptions = optionFile.endsWith('yml')
                ? YAML.parse(FS.readFileSync(optionFile, 'utf8'))
                : JSON.parse(FS.readFileSync(optionFile, 'utf8'));
            Object.assign(this, deepmerge(this, fileOptions));
        });

        Object.assign(this, commandLineOptions, overrideOptions);
    }

    merge(options: OptionType) {
        options.design = options.design || [];
        options.map = options.map || [];
        options.extension = options.extension || [];
        options.generator = options.generator || [];
        options.swarm = options.swarm || false;

        this.design = [...this.design, ...options.design];
        this.map = [...this.map, ...options.map];
        this.extension = [...this.extension, ...options.extension];
        this.generator = [...this.generator, ...options.generator];
        this.swarm = this.swarm || options.swarm;
    }
}

export default Options;
