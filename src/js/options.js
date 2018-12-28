import Getopt from 'node-getopt';

function parseOptions(processArgs) {
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

    return getopt.parse(processArgs);
}

export default parseOptions;
