import { execSync } from 'child_process';

describe('# integration test', () => {
    beforeEach(() => {
        execSync('rm -rf testoutput');
    });

    it('## should print help options', () => {
        const output = execSync('babel-node -- ./src/js/sgen.js -h').toString();
        expect(output).toMatchSnapshot();
    });

    it('## should generate design', () => {
        const output = execSync(
            'babel-node -- ./src/js/sgen.js -m src/test/fixture/map.json -d src/test/fixture/design.js -e src/test/fixture -o testoutput'
        ).toString();
        expect(output).toMatchSnapshot();
    });

    it('## should generate design with merge', () => {
        let output = execSync(
            'babel-node -- ./src/js/sgen.js -m src/test/fixture/map.json -d src/test/fixture/design.js -e src/test/fixture -o testoutput --overwrite=merge'
        ).toString();
        expect(output).toMatchSnapshot();
        output = execSync(
            'babel-node -- ./src/js/sgen.js -m src/test/fixture/map.json -d src/test/fixture/design.js -e src/test/fixture -o testoutput --overwrite=merge'
        ).toString();
        expect(output).toMatchSnapshot();
    });
});
