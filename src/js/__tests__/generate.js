import FS from 'fs';
import mkdirp from 'mkdirp';

import { getOverwriteOption, manageFileNames, generateFileData } from '../generate';

jest.mock('fs');
jest.mock('mkdirp');
jest.mock('../logger');

const FIXTURES = {
    OPTION_OUTPUT: { output: 'some/directory' },
    TEMPLATE_DESCRIPTION_NOOVERWRITE: { template: '/test' },
    FILENAMES: '/file',
    EMPTY_GENERATOR: {
        options: {},
        design: {},
        map: {},
        extensionBuilder: {}
    }
};

describe('# generate', () => {
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
        });
        it('### should generate template file', () => {
            FS.readFileSync.mockReturnValue('some template');
            const output = generateFileData(
                FIXTURES.EMPTY_GENERATOR,
                FIXTURES.TEMPLATE_DESCRIPTION_NOOVERWRITE,
                FIXTURES.FILENAMES
            );
            expect(output).toMatchSnapshot();
        });
    });
});
