import FS from 'fs';
import Extension from '../extension';

jest.mock('fs');

const FIXTURES = {
    GENERATOR: { design: 'b', map: 'c', options: 'd' }
};

describe('# Extension', () => {
    beforeEach(() => {
        FS.readFileSync.mockReset();
    });
    describe('## constructor', () => {
        it('### should construct default object', () => {
            const extension = new Extension('a', FIXTURES.GENERATOR);
            expect(extension).toMatchSnapshot();
        });
    });

    describe('## load', () => {
        it('### should load template from file', () => {
            FS.readFileSync.mockReturnValue('test template');
            const extension = new Extension('a', FIXTURES.GENERATOR);
            extension.load();
            expect(extension).toMatchSnapshot();
        });
    });
});
