import FS from 'fs';
import Extension from '../extension';

jest.mock('fs');

const FIXTURES = {
    GENERATOR: { design: 'b', map: 'c', options: 'd', labels: [] }
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

    describe('## template', () => {
        it('### should generate extension', () => {
            FS.readFileSync.mockReturnValue('test template <%labels.forEach(lab => {%>"<%=lab%>"<%})%>');
            const extension = new Extension('a', FIXTURES.GENERATOR);
            extension.load();

            let text = extension.generate('test');
            expect(text).toMatchSnapshot();

            text = extension.generate();
            expect(text).toMatchSnapshot();

            text = extension.generate(['test', 'test2']);
            expect(text).toMatchSnapshot();
        });
    });
});
