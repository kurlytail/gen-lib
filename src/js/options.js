import Getopt from 'node-getopt';

function parseOptions(processArgs) {
    const getopt = new Getopt([
        ['m', 'map=ARG+', 'mapping files'],
        ['d', 'design=ARG+', 'design files'],
        ['o', 'output=ARG', 'output directory for generated files']
    ]);

    getopt.bindHelp();

    return getopt.parse(processArgs);
}

export default parseOptions;
