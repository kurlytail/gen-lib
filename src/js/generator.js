import Options from './options';
import getDesign from './design';
import FS from 'fs';
import { generate } from './generate';
import PATH from 'path';
import lodash from 'lodash';

class Generator {
    constructor(design = undefined, map = undefined, overrideOptions = undefined) {
        this._options = new Options(process.argv.slice(2), overrideOptions);

        // Load design files
        let rawDesign = this.options.design.reduce((design, designFile) => {
            const designJSON = JSON.parse(FS.readFileSync(designFile));
            return { ...design, ...designJSON };
        }, {});

        // merge input design
        rawDesign = design ? { ...rawDesign, ...design } : rawDesign;

        // Normalize design
        this._design = getDesign(rawDesign);

        // Load map files
        this._map = this.options.map.reduce((map, mapFile) => {
            let newMap = FS.readFileSync(mapFile);
            newMap = JSON.parse(lodash.template(newMap)(this.design));

            // Fixup all file names to global names
            newMap = Object.entries(newMap).reduce((map, [fileName, templateDescription]) => {
                const templateFile = templateDescription.template;
                let template = PATH.relative(PATH.resolve('./'), PATH.resolve(PATH.dirname(mapFile), templateFile));
                if (PATH.isAbsolute(templateFile)) template = templateFile;
                map[fileName] = { ...templateDescription, template };
                return map;
            }, {});

            return { ...map, ...newMap };
        }, {});

        // merge maps
        this._map = map ? { ...this.map, ...map } : this.map;

        if (Object.keys(this.map).length === 0) {
            throw new Error('No maps found');
        }

        if (Object.keys(this.design).length === 0) {
            throw new Error('No designs found');
        }
    }

    get design() {
        return this._design;
    }

    get map() {
        return this._map;
    }

    get options() {
        return this._options;
    }

    generate() {
        return generate(this.design, this.map, this.options);
    }
}

export default Generator;
