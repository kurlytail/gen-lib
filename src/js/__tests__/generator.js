import parseOptions from '../options';
import getDesign from '../design';
import FS from 'fs';

import Generator from '../generator';

jest.mock('../options');
jest.mock('../design');
jest.mock('fs');

const FIXTURES = {
    NO_OPTIONS: {
        maps: [],
        designs: []
    },

    MAP_ONLY_OPTIONS: {
        maps: ['a', 'b'],
        designs: []
    },

    DESIGN_ONLY_OPTIONS: {
        maps: [],
        designs: ['aa', 'bb']
    },

    ALL_OPTIONS: {
        maps: ['a', 'b'],
        designs: ['aa', 'bb']
    },

    MAP: {
        a: 'a',
        b: 'b'
    },

    DESIGN: {
        aa: 'aa',
        bb: 'bb'
    },

    EMPTY: {}
};

describe('# Generator', () => {
    describe('## constructor', () => {
        afterEach(() => {
            parseOptions.mockReset();
            getDesign.mockReset();
            FS.readFileSync.mockReset();
        });

        it('### should throw an error when no maps or no designs', () => {
            parseOptions.mockReturnValue(FIXTURES.NO_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.EMPTY);
            expect(() => new Generator()).toThrowErrorMatchingSnapshot();
        });

        it('### should throw an error when no maps', () => {
            parseOptions.mockReturnValue(FIXTURES.DESIGN_ONLY_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            expect(() => new Generator()).toThrowErrorMatchingSnapshot();
            expect(() => new Generator(FIXTURES.DESIGN, undefined)).toThrowErrorMatchingSnapshot();
        });

        it('### should throw an error when no designs', () => {
            parseOptions.mockReturnValue(FIXTURES.MAP_ONLY_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.EMPTY);
            FS.readFileSync.mockReturnValue(FIXTURES.MAP);
            expect(() => new Generator()).toThrowErrorMatchingSnapshot();
            expect(() => new Generator(undefined, FIXTURES.MAP)).toThrowErrorMatchingSnapshot();
        });

        it('### should construct when parsed options present', () => {
            parseOptions.mockReturnValue(FIXTURES.ALL_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            FS.readFileSync.mockReturnValue(FIXTURES.MAP);
            let generator = new Generator();
            expect(generator).toMatchSnapshot();
        });

        it('### should construct when mixed options present - design as argument', () => {
            parseOptions.mockReturnValue(FIXTURES.MAP_ONLY_OPTIONS);
            FS.readFileSync.mockReturnValue(FIXTURES.MAP);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            let generator = new Generator(FIXTURES.DESIGN);
            expect(generator).toMatchSnapshot();
        });

        it('### should construct when mixed options present - map as argument', () => {
            parseOptions.mockReturnValue(FIXTURES.DESIGN_ONLY_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            let generator = new Generator(undefined, FIXTURES.MAP);
            expect(generator).toMatchSnapshot();
        });
    });
});
