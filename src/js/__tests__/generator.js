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
        maps: [{ a: 'a', b: 'b' }, { c: 'c', d: 'd' }]
    },

    DESIGN_ONLY_OPTIONS: {
        designs: [{ aa: 'aa', bb: 'bb' }, { cc: 'cc', dd: 'dd' }]
    },

    ALL_OPTIONS: {
        maps: [{ a: 'a', b: 'b' }, { c: 'c', d: 'd' }],
        designs: [{ aa: 'aa', bb: 'bb' }, { cc: 'cc', dd: 'dd' }]
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
    });
});
