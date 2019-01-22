import Options from '../options';
import getDesign from '../design';
import FS from 'fs';
import { generate } from '../generate';
import ExtensionBuilder from '../extension-builder';
import logger from '../logger';
import NodeGit from 'nodegit';

import Generator from '../generator';

jest.mock('../options');
jest.mock('../design');
jest.mock('fs');
jest.mock('../generate');
jest.mock('../extension-builder');
jest.mock('../logger');

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
        design: ['aa', 'bb'],
        output: 'output'
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
        "<%=design.cc%>": {
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
            Options.mockReset();
            getDesign.mockReset();
            generate.mockReset();
            FS.readFileSync.mockReset();
        });

        it('### should throw an error when no map or no design', () => {
            Options.mockImplementation(() => FIXTURES.NO_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.EMPTY);
            expect(() => new Generator()).toThrowErrorMatchingSnapshot();
        });

        it('### should throw an error when no map', () => {
            Options.mockImplementation(() => FIXTURES.DESIGN_ONLY_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            FS.readFileSync.mockReturnValue(FIXTURES.JSON_MAP);
            expect(() => new Generator()).toThrowErrorMatchingSnapshot();
            expect(() => new Generator(FIXTURES.DESIGN, undefined)).toThrowErrorMatchingSnapshot();
        });

        it('### should throw an error when no design', () => {
            Options.mockImplementation(() => FIXTURES.MAP_ONLY_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.EMPTY);
            FS.readFileSync.mockReturnValue(FIXTURES.JSON_MAP);
            expect(() => new Generator()).toThrowErrorMatchingSnapshot();
            expect(() => new Generator(undefined, FIXTURES.MAP)).toThrowErrorMatchingSnapshot();
        });

        it('### should construct when parsed options present', () => {
            Options.mockImplementation(() => FIXTURES.ALL_OPTIONS);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            FS.readFileSync.mockReturnValue(FIXTURES.JSON_MAP);
            let generator = new Generator();
            expect(generator).toMatchSnapshot();
        });

        it('### should construct when mixed options present - design as argument', () => {
            Options.mockImplementation(() => FIXTURES.MAP_ONLY_OPTIONS);
            FS.readFileSync.mockReturnValue(FIXTURES.JSON_MAP);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            let generator = new Generator(FIXTURES.DESIGN);
            expect(generator).toMatchSnapshot();
        });

        it('### should construct when mixed options present - map as argument', () => {
            Options.mockImplementation(() => FIXTURES.DESIGN_ONLY_OPTIONS);
            FS.readFileSync.mockReturnValue(FIXTURES.JSON_MAP);
            getDesign.mockReturnValue(FIXTURES.DESIGN);
            let generator = new Generator(undefined, FIXTURES.MAP);
            expect(generator).toMatchSnapshot();
        });

        it('### should construct when mixed options present - template map as argument', () => {
            Options.mockImplementation(() => FIXTURES.ALL_OPTIONS);
            FS.readFileSync.mockReturnValue(FIXTURES.TEMPLATE_MAP);
            getDesign.mockReturnValue(FIXTURES.TEMPLATE_DESIGN);
            let generator = new Generator();
            expect(generator).toMatchSnapshot();
        });
    });

    /*    describe('## _initializeRepository', () => {
        afterEach(() => {
            Options.mockReset();
            FS.existsSync.mockReset();
            NodeGit.Repository.init.mockReset();
            NodeGit.Repository.open.mockReset();
            NodeGit.Branch.lookup.mockReset();
            NodeGit.Branch.create.mockReset();
        });

        it('### should call git init if repo does not exist', async () => {
            Options.mockImplementation(() => FIXTURES.ALL_OPTIONS);
            FS.existsSync.mockReturnValue(false);

            let generator = new Generator();
            await generator._initializeRepository();

            expect(NodeGit.Repository.init).toHaveBeenCalled();
            expect(NodeGit.Branch.lookup).toHaveBeenCalled();
            expect(NodeGit.Branch.create).toHaveBeenCalled();
        });

        it('### should call git open if repo exists', async () => {
            Options.mockImplementation(() => FIXTURES.ALL_OPTIONS);
            FS.existsSync.mockReturnValue(true);

            let generator = new Generator();
            await generator._initializeRepository();

            expect(NodeGit.Repository.open).toHaveBeenCalled();
            expect(NodeGit.Branch.lookup).toHaveBeenCalled();
            expect(NodeGit.Branch.create).toHaveBeenCalled();
        });
    });
*/
});
