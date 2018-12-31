import FS from 'fs';
import mkdirp from 'mkdirp';
import { merge } from 'node-diff3';

import { getOverwriteOption, manageFileNames, generateFileData, manageOverwriteState, writeFiles } from '../generate';

jest.mock('fs');
jest.mock('mkdirp');
jest.mock('node-diff3');
jest.mock('../logger');

const FIXTURES = {
    OPTION_OUTPUT: { output: 'some/directory' },
    TEMPLATE_DESCRIPTION_NOOVERWRITE: { template: '/test' },
    FILENAMES: { baseFileName: '/basefile', fileName: '/file' },
    MANAGE_OVERWRITE_STATE: { baseFileText: 'baseFile', newFileText: 'newFile', currentFileText: 'currentFile' },
    MANAGE_OVERWRITE_STATE_WITH_NO_EDITS: {
        baseFileText: 'baseFile',
        newFileText: 'newFile',
        currentFileText: undefined
    },
    MANAGE_OVERWRITE_STATE_WITH_EDITS: {
        newFileText: 'newFile',
        currentFileText: 'currentFile'
    }
};

describe('# generate', () => {
    describe('## getOverwriteOption', () => {
        it('### should return non truthy when no overwrite options', () => {
            let overwrite = getOverwriteOption({}, {});
            expect(overwrite).not.toBeTruthy();
        });

        it('### should return skip when option is skip', () => {
            let overwrite = getOverwriteOption({ overwrite: 'skip' }, {});
            expect(overwrite).toBe('skip');
        });

        it('### should return skip when template option is skip', () => {
            let overwrite = getOverwriteOption({}, { overwrite: 'skip' });
            expect(overwrite).toBe('skip');
        });

        it('### should template option should override program option', () => {
            let overwrite = getOverwriteOption({ overwrite: 'regen' }, { overwrite: 'skip' });
            expect(overwrite).toBe('skip');
        });

        it('### should program option should override template option when forced', () => {
            let overwrite = getOverwriteOption({ overwrite: 'regen', forceOverwrite: true }, { overwrite: 'skip' });
            expect(overwrite).toBe('regen');
        });
    });

    describe('## manageFileNames', () => {
        beforeEach(() => {
            mkdirp.mockReset();
        });
        it('### should return filenames for filename with no options', () => {
            let fileNames = manageFileNames({}, 'test');
            expect(fileNames).toMatchSnapshot();
            expect(mkdirp.sync).toBeCalled();
        });
        it('### should return filenames for filename with output options', () => {
            let fileNames = manageFileNames(FIXTURES.OPTION_OUTPUT, 'test');
            expect(fileNames).toMatchSnapshot();
            expect(mkdirp.sync).toBeCalled();
        });
        it('### should return filenames for absolute filename with output options', () => {
            let fileNames = manageFileNames(FIXTURES.OPTION_OUTPUT, '/test');
            expect(fileNames).toMatchSnapshot();
            expect(mkdirp.sync).toBeCalled();
        });
    });

    describe('## generateFileData', () => {
        beforeEach(() => {
            FS.readFileSync.mockReset();
            FS.existsSync.mockReset();
            merge.mockReturnValue({ conflict: false, result: 'merged file'.split('') });
        });
        it('### should generate template file when no base or edited files present', () => {
            FS.readFileSync.mockReturnValue('some template');
            const output = generateFileData({}, {}, FIXTURES.TEMPLATE_DESCRIPTION_NOOVERWRITE, FIXTURES.FILENAMES);
            expect(output).toMatchSnapshot();
        });
        it('### should generate template file when base file present and no edited files present', () => {
            FS.readFileSync.mockReturnValueOnce('some template');
            FS.readFileSync.mockReturnValueOnce('current edited file');
            FS.readFileSync.mockReturnValueOnce('old base template');
            FS.existsSync.mockReturnValueOnce(false);
            FS.existsSync.mockReturnValueOnce(true);
            const output = generateFileData({}, {}, FIXTURES.TEMPLATE_DESCRIPTION_NOOVERWRITE, FIXTURES.FILENAMES);
            expect(output).toMatchSnapshot();
        });
        it('### should generate template file when base file and edited files present', () => {
            FS.readFileSync.mockReturnValueOnce('some template');
            FS.readFileSync.mockReturnValueOnce('current edited file');
            FS.readFileSync.mockReturnValueOnce('old base template');
            FS.existsSync.mockReturnValue(true);
            const output = generateFileData({}, {}, FIXTURES.TEMPLATE_DESCRIPTION_NOOVERWRITE, FIXTURES.FILENAMES);
            expect(output).toMatchSnapshot();
        });
        it('### should generate template file when base file and edited files present with merge option', () => {
            FS.readFileSync.mockReturnValueOnce('some template');
            FS.readFileSync.mockReturnValueOnce('current edited file');
            FS.readFileSync.mockReturnValueOnce('old base template');
            FS.existsSync.mockReturnValue(true);
            const output = generateFileData(
                { overwrite: 'merge' },
                {},
                FIXTURES.TEMPLATE_DESCRIPTION_NOOVERWRITE,
                FIXTURES.FILENAMES
            );
            expect(output).toMatchSnapshot();
        });
        it('### should throw when base file and edited files present with merge option and merge conflict', () => {
            merge.mockReturnValue({ conflict: true, joinedResult: () => 'merged file' });
            FS.readFileSync.mockReturnValueOnce('some template');
            FS.readFileSync.mockReturnValueOnce('current edited file');
            FS.readFileSync.mockReturnValueOnce('old base template');
            FS.existsSync.mockReturnValue(true);
            const output = generateFileData(
                { overwrite: 'merge' },
                {},
                FIXTURES.TEMPLATE_DESCRIPTION_NOOVERWRITE,
                FIXTURES.FILENAMES
            );
            expect(output).toMatchSnapshot();
        });
    });

    describe('## manageOverwriteState', () => {
        it('### should return normally for skip options', () => {
            expect(() =>
                manageOverwriteState({ overwrite: 'skip' }, 'test', {}, FIXTURES.MANAGE_OVERWRITE_STATE)
            ).not.toThrow();
        });
        it('### should return normally for regen options', () => {
            expect(() =>
                manageOverwriteState({ overwrite: 'regen' }, 'test', {}, FIXTURES.MANAGE_OVERWRITE_STATE)
            ).not.toThrow();
        });
        it('### should throw for error options and current file is modified', () => {
            expect(() =>
                manageOverwriteState({ overwrite: 'error' }, 'test', {}, FIXTURES.MANAGE_OVERWRITE_STATE)
            ).toThrowErrorMatchingSnapshot();
        });
        it('### should return normally for merge options', () => {
            expect(() =>
                manageOverwriteState({ overwrite: 'merge' }, 'test', {}, FIXTURES.MANAGE_OVERWRITE_STATE)
            ).not.toThrow();
        });
        it('### should return normally for error options and current file does not exist', () => {
            expect(() =>
                manageOverwriteState({ overwrite: 'error' }, 'test', {}, FIXTURES.MANAGE_OVERWRITE_STATE_WITH_NO_EDITS)
            ).not.toThrow();
        });
        it('### should throw an error for merge options and base file does not exist', () => {
            expect(() =>
                manageOverwriteState({ overwrite: 'merge' }, 'test', {}, FIXTURES.MANAGE_OVERWRITE_STATE_WITH_EDITS)
            ).toThrowErrorMatchingSnapshot();
        });
    });
    describe('## writeFiles', () => {
        it('### should return normally for skip options', () => {
            writeFiles({}, {});
            expect(FS.writeFileSync).toHaveBeenCalled();
        });
    });
});
