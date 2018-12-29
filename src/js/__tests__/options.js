import Getopt from 'node-getopt';

import Options from '../options';

jest.mock('node-getopt');

describe('# options', () => {
    describe('## constructor', () => {
        it('### should parse all options', () => {
            Getopt.mockImplementation(() => ({
                bindHelp: jest.fn(),
                parse: jest.fn(() => ({
                    options: { someOption: {} }
                }))
            }));
            let options = new Options({});
            expect(options).toMatchSnapshot();
        });
    });
});
