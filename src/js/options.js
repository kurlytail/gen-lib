import Getopt from 'node-getopt';

class Options {
    constructor(processArgs, overrideOptions) {
        const getopt = new Getopt([
            ['m', 'map=ARG+', 'mapping files'],
            ['d', 'design=ARG+', 'design files'],
            ['o', 'output=ARG', 'output directory for generated files'],
            ['', 'overwrite=ARG', 'Overwrite modes, can be one of skip, regen, error or merge', 'skip'],
            [
                '',
                'forceOverwrite',
                'Override overwrite flags in the generator map with the one provided on --overwrite',
                false
            ]
        ]);

        getopt.bindHelp();

        Object.assign(this, { design: [], map: [] }, getopt.parse(processArgs).options, overrideOptions);
    }
}

export default Options;
