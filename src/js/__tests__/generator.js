import parseOptions from '../options';
import getDesign from '../design';
import FS from 'fs';
import generate from '../generate';

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
            expect(() => new Generator()).toThrowErrorMatchingSnapshot();
            expect(() => new Generator(FIXTURES.DESIGN, undefined)).toThrowErrorMatchingSnapshot();
        });

        it('### should throw an error when no design', () => {
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

    describe('## generate', () => {
        it('### should call generate function', () => {
            parseOptions.mockReturnValue(FIXTURES.ALL_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            FS.readFileSync.mockReturnValue(FIXTURES.MAP);

            let generator = new Generator();
            generator.generate();

            expect(generate).toHaveBeenCalled();
        });
    });
});
