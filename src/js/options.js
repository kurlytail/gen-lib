import Getopt from 'node-getopt';

class Options {
    constructor(processArgs, overrideOptions) {
        const getopt = new Getopt([
            ['m', 'map=ARG+', 'mapping files'],
            ['d', 'design=ARG+', 'design files'],
            ['e', 'extension=ARG+', 'extension directories or files'],
            ['o', 'output=ARG', 'output directory for generated files'],
            ['', 'overwrite=ARG', 'Overwrite modes, can be one of skip, regen, error', 'error'],
            [
                '',
                'forceOverwrite',
                'Override overwrite flags in the generator map with the one provided on --overwrite',
                false
            ]
        ]);

        getopt.bindHelp();

        Object.assign(this, { design: [], map: [], extension: [] }, getopt.parse(processArgs).options, overrideOptions);
    }
}

export default Options;