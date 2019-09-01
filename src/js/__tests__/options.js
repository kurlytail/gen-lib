import Getopt from 'node-getopt';

import Options from '../options';
import { readFileSync } from 'fs';
import YAML from 'yaml';

jest.mock('node-getopt');
jest.mock('fs');

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
        beforeEach(() => {
            readFileSync.mockReset();
        });

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

        it('### should merge yaml options', () => {
            Getopt.mockImplementation(() => ({
                bindHelp: jest.fn(),
                parse: jest.fn(() => ({ options: { someOption: {} } }))
            }));
            readFileSync.mockReturnValue(YAML.stringify(FIXTURES.mergeA));

            const options = new Options({}, { options: ['someoption.yml'] });
            expect(options).toMatchSnapshot();
        });

        it('### should merge json options', () => {
            Getopt.mockImplementation(() => ({
                bindHelp: jest.fn(),
                parse: jest.fn(() => ({ options: { someOption: {} } }))
            }));
            readFileSync
                .mockReturnValueOnce(JSON.stringify(FIXTURES.mergeA))
                .mockReturnValueOnce(JSON.stringify(FIXTURES.mergeB));

            const options = new Options(
                {},
                { options: ['someoption.json', 'moreoption.json'] }
            );
            expect(options).toMatchSnapshot();
        });
    });
});
