import parseOptions from '../options';
import getDesign from '../design';
import FS from 'fs';
import { generate } from '../generate';

import Generator from '../generator';

jest.mock('../options');
jest.mock('../design');
jest.mock('fs');
jest.mock('../generate');

const FIXTURES = {
    NO_OPTIONS: {
        map: [],
        design: []
    },

    MAP_ONLY_OPTIONS: {
        map: ['a', 'b'],
        design: []
    },

    DESIGN_ONLY_OPTIONS: {
        map: [],
        design: ['aa', 'bb']
    },

    ALL_OPTIONS: {
        map: ['a', 'b'],
        design: ['aa', 'bb']
    },

    MAP: {
        a: {
            template: 'a'
        },
        b: {
            template: 'b'
        }
    },

    JSON_MAP: `{
        "a": {
            "template": "a"
        },
        "b": {
            "template": "b"
        }
    }`,

    TEMPLATE_MAP: `{
        "<%=cc%>": {
            "template": "a"
        },
        "b": {
            "template": "b"
        }
    }`,

    DESIGN: {
        aa: 'aa',
        bb: 'bb'
    },

    TEMPLATE_DESIGN: {
        cc: 'dddd',
        bb: 'bb'
    },

    EMPTY: {}
};

describe('# Generator', () => {
    describe('## constructor', () => {
        afterEach(() => {
            parseOptions.mockReset();
            getDesign.mockReset();
            generate.mockReset();
            FS.readFileSync.mockReset();
        });

        it('### should throw an error when no map or no design', () => {
            parseOptions.mockReturnValue(FIXTURES.NO_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.EMPTY);
            expect(() => new Generator()).toThrowErrorMatchingSnapshot();
        });

        it('### should throw an error when no map', () => {
            parseOptions.mockReturnValue(FIXTURES.DESIGN_ONLY_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            FS.readFileSync.mockReturnValue(FIXTURES.JSON_MAP);
            expect(() => new Generator()).toThrowErrorMatchingSnapshot();
            expect(() => new Generator(FIXTURES.DESIGN, undefined)).toThrowErrorMatchingSnapshot();
        });

        it('### should throw an error when no design', () => {
            parseOptions.mockReturnValue(FIXTURES.MAP_ONLY_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.EMPTY);
            FS.readFileSync.mockReturnValue(FIXTURES.JSON_MAP);
            expect(() => new Generator()).toThrowErrorMatchingSnapshot();
            expect(() => new Generator(undefined, FIXTURES.MAP)).toThrowErrorMatchingSnapshot();
        });

        it('### should construct when parsed options present', () => {
            parseOptions.mockReturnValue(FIXTURES.ALL_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            FS.readFileSync.mockReturnValue(FIXTURES.JSON_MAP);
            let generator = new Generator();
            expect(generator).toMatchSnapshot();
        });

        it('### should construct when mixed options present - design as argument', () => {
            parseOptions.mockReturnValue(FIXTURES.MAP_ONLY_OPTIONS);
            FS.readFileSync.mockReturnValue(FIXTURES.JSON_MAP);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            let generator = new Generator(FIXTURES.DESIGN);
            expect(generator).toMatchSnapshot();
        });

        it('### should construct when mixed options present - map as argument', () => {
            parseOptions.mockReturnValue(FIXTURES.DESIGN_ONLY_OPTIONS);
            FS.readFileSync.mockReturnValue(FIXTURES.JSON_MAP);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            let generator = new Generator(undefined, FIXTURES.MAP);
            expect(generator).toMatchSnapshot();
        });

        it('### should construct when mixed options present - template map as argument', () => {
            parseOptions.mockReturnValue(FIXTURES.ALL_OPTIONS);
            FS.readFileSync.mockReturnValue(FIXTURES.TEMPLATE_MAP);
            getDesign.mockReturnValue(FIXTURES.TEMPLATE_DESIGN);
            let generator = new Generator();
            expect(generator).toMatchSnapshot();
        });
    });

    describe('## generate', () => {
        it('### should call generate function', () => {
            parseOptions.mockReturnValue(FIXTURES.ALL_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            FS.readFileSync.mockReturnValue(FIXTURES.JSON_MAP);

            let generator = new Generator();
            generator.generate();

            expect(generate).toHaveBeenCalled();
        });
    });
});
