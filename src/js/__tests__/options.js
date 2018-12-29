import Getopt from 'node-getopt';

import Options from '../options';

jest.mock('node-getopt');

describe('# options', () => {
    describe('## constructor', () => {
        it('### should parse all options', () => {
            const options = new Options({});
            expect(Getopt.mock.instances[0].bindHelp).toHaveBeenCalled();
            expect(Getopt.mock.instances[0].parse).toHaveBeenCalled();
        });
    });
});
