import FS from 'fs';
import Extension from '../extension';
import ExtensionBuilder from '../extension-builder';
import logger from 'logger';

jest.mock('fs');
jest.mock('../extension');
jest.mock('logger');

const FIXTURES = {
    GENERATOR: {
        design: 'b',
        map: 'c',
        options: {
            extension: Array.apply(null, { length: 10 })
                .map(Number.call, Number)
                .map(n => n.toString() + '._')
        }
    },
    STATS_FILE: {
        isFile: () => true,
        isDirectory: () => false
    },
    DIR_FILE: {
        isFile: () => false,
        isDirectory: () => true
    },
    READDIR: Array.apply(null, { length: 3 })
        .map(Number.call, Number)
        .map(n => n.toString() + '._')
};

describe('# ExtensionBuilder', () => {
    beforeEach(() => {
        FS.readdirSync.mockReset();
        FS.statSync.mockReset();
        FS.statSync.mockReturnValue(FIXTURES.STATS_FILE);
    });

    describe('## constructor', () => {
        it('### should construct default builder', () => {
            const builder = new Extension(FIXTURES.GENERATOR);
            expect(builder).toMatchSnapshot();
        });
    });

    describe('## load', () => {
        it('### should load template from files and folders', () => {
            FS.readdirSync
                .mockReturnValueOnce(FIXTURES.READDIR)
                .mockReturnValueOnce(FIXTURES.READDIR)
                .mockReturnValueOnce(FIXTURES.READDIR)
                .mockReturnValueOnce(FIXTURES.READDIR)
                .mockReturnValueOnce(FIXTURES.READDIR)
                .mockReturnValueOnce(FIXTURES.READDIR)
                .mockReturnValueOnce(FIXTURES.READDIR)
                .mockReturnValueOnce(FIXTURES.READDIR)
                .mockReturnValue([]);
            FS.statSync
                .mockReturnValueOnce(FIXTURES.DIR_FILE)
                .mockReturnValueOnce(FIXTURES.DIR_FILE)
                .mockReturnValueOnce(FIXTURES.DIR_FILE)
                .mockReturnValueOnce(FIXTURES.DIR_FILE)
                .mockReturnValueOnce(FIXTURES.DIR_FILE)
                .mockReturnValueOnce(FIXTURES.DIR_FILE)
                .mockReturnValueOnce(FIXTURES.DIR_FILE)
                .mockReturnValueOnce(FIXTURES.DIR_FILE)
                .mockReturnValue(FIXTURES.STATS_FILE);
            const builder = new ExtensionBuilder(FIXTURES.GENERATOR);
            builder.build();
            expect(builder).toMatchSnapshot();
        });
    });
});
