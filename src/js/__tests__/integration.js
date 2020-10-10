import { execSync } from 'child_process';

describe('# integration test', () => {
    beforeEach(() => {
        execSync('rm -rf testoutput');
        execSync('mkdir testoutput');
        execSync('git init', { cwd: 'testoutput' });
        execSync('git config user.email "you@example.com"', {
            cwd: 'testoutput'
        });
        execSync('git config user.name "Your Namer"', { cwd: 'testoutput' });
        execSync('git commit --allow-empty -m "Empty commit."', {
            cwd: 'testoutput'
        });
    });

    it('## should print help options', () => {
        const output = execSync('./dist/sgen.min.js -h').toString();
        expect(output).toMatchSnapshot();
    });

    it('## should error out when downstream generator not found', () => {
        expect(() =>
            execSync(
                './dist/sgen.min.js -m src/test/fixture/map.json -d src/test/fixture/design.js -e src/test/fixture -o testoutput -g some-generator -s'
            )
        ).toThrow();
    });

    it('## should generate design', () => {
        let output = execSync(
            './dist/sgen.min.js -m src/test/fixture/map.json -d src/test/fixture/design.js -e src/test/fixture -o testoutput -s'
        ).toString();
        output = output
            .replace(
                /warn: Please cherrypick changes from master-sgen-generated from .*/,
                ''
            )
            .replace(/info: git cherry-pick .*/, '');
        expect(output).toMatchSnapshot();
    });

    it('## should generate design with merge', () => {
        let output = execSync(
            './dist/sgen.min.js -m src/test/fixture/map.json -d src/test/fixture/design.js -e src/test/fixture -o testoutput -s'
        ).toString();
        output = output
            .replace(
                /warn: Please cherrypick changes from master-sgen-generated from .*/,
                ''
            )
            .replace(/info: git cherry-pick .*/, '');
        expect(output).toMatchSnapshot();

        execSync('echo "some change" >> cella', { cwd: 'testoutput' });
        execSync('git add cella', { cwd: 'testoutput' });
        execSync('git commit -m Test', { cwd: 'testoutput' });

        output = execSync(
            './dist/sgen.min.js -m src/test/fixture/map.json -d src/test/fixture/design.js -e src/test/fixture -o testoutput -s'
        ).toString();
        output = output
            .replace(
                /warn: Please cherrypick changes from master-sgen-generated from .*/,
                ''
            )
            .replace(/info: git cherry-pick .*/, '');
        expect(output).toMatchSnapshot();

        execSync('git checkout master-sgen-generated', { cwd: 'testoutput' });
        execSync('echo "some other change" >> cellb', { cwd: 'testoutput' });
        execSync('git add cellb', { cwd: 'testoutput' });

        execSync('git commit -m Test1', { cwd: 'testoutput' });
        execSync('git checkout master', { cwd: 'testoutput' });

        output = execSync(
            './dist/sgen.min.js -m src/test/fixture/map.json -d src/test/fixture/design.js -e src/test/fixture -o testoutput -s'
        ).toString();
        output = output.replace(
            /warn: Please cherrypick changes from master-sgen-generated from .*/,
            ''
        );
        output = output.replace(/info: git cherry-pick .*/, '');
        expect(output).toMatchSnapshot();
    });
});
