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

        execSync('echo "some change" >> cella', { cwd: 'testoutput' });
        execSync('git add cella', { cwd: 'testoutput' });
        execSync('git commit -m Test', { cwd: 'testoutput' });

        output = execSync(
            'babel-node -- ./src/js/sgen.js -m src/test/fixture/map.json -d src/test/fixture/design.js -e src/test/fixture -o testoutput --overwrite=merge'
        ).toString();
        expect(output).toMatchSnapshot();

        execSync('git checkout master-sgen-generated', { cwd: 'testoutput' });
        execSync('echo "some other change" >> cellb', { cwd: 'testoutput' });
        execSync('git add cellb', { cwd: 'testoutput' });
        execSync('git commit -m Test1', { cwd: 'testoutput' });
        execSync('git checkout master', { cwd: 'testoutput' });

        output = execSync(
            'babel-node -- ./src/js/sgen.js -m src/test/fixture/map.json -d src/test/fixture/design.js -e src/test/fixture -o testoutput --overwrite=merge'
        ).toString();
        expect(output).toMatchSnapshot();
    });
});
