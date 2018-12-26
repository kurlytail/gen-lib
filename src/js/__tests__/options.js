import Getopt from 'node-getopt';

import parseOptions from '../options';

jest.mock('node-getopt');

describe('# options', () => {
    describe('## parseOptions', () => {
        it('### should parse all options', () => {
            parseOptions({});
            expect(Getopt.mock.instances[0].bindHelp).toHaveBeenCalled();
            expect(Getopt.mock.instances[0].parse).toHaveBeenCalled();
        });
    });
});
