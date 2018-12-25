import parseOptions from './options';
import getDesign from './design';
import FS from 'fs';

class Generator {
    constructor(design = undefined, map = undefined, options = undefined) {
        this._options = options ? options : parseOptions();
        // Load design files
        let rawDesign = this.options.designs.reduce((design, designFile) => {
            const designJSON = FS.readFileSync(designFile);
            return { ...design, ...designJSON };
        }, {});

        // merge input design
        rawDesign = design ? { ...rawDesign, ...design } : rawDesign;

        // Normalize design
        this._design = getDesign(rawDesign);

        // Load map files
        this._map = this.options.maps.reduce((map, mapFile) => {
            const newMap = FS.readFileSync(mapFile);
            return { ...map, ...newMap };
        }, {});

        // merge maps
        this._map = map ? { ...this._map, ...map } : this._map;

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

    generate() {}
}

export default Generator;
