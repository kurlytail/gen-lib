import Getopt from 'node-getopt';

import Options from '../options';

jest.mock('node-getopt');

const FIXTURES = {
    mergeA: {
        map: ['ma', 'mb'],
        design: ['da', 'db'],
        extension: ['ea', 'eb'],
        generator: ['ga', 'gb']
    },
    mergeB: {
        map: ['mc', 'md'],
        design: ['dc', 'dd'],
        extension: ['ec', 'ed'],
        generator: ['gc', 'gd']
    }
};

describe('# options', () => {
    describe('## constructor', () => {
        it('### should parse all options', () => {
            Getopt.mockImplementation(() => ({
                bindHelp: jest.fn(),
                parse: jest.fn(() => ({ options: { someOption: {} } }))
            }));
            const options = new Options({});
            expect(options).toMatchSnapshot();
        });

        it('### should merge options', () => {
            Getopt.mockImplementation(() => ({
                bindHelp: jest.fn(),
                parse: jest.fn(() => ({ options: { someOption: {} } }))
            }));
            const options = new Options({}, FIXTURES.mergeA);
            expect(options).toMatchSnapshot();

            options.merge(FIXTURES.mergeB);
            expect(options).toMatchSnapshot();
        });
    });
});
