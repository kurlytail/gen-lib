module.exports = {
    extends: ['eslint:recommended', 'plugin:jest/recommended', 'prettier'],
    plugins: ['babel', 'flowtype'],
    parser: 'babel-eslint',
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true,
        jest: true
    },
    rules: {
        'comma-dangle': ['error', 'never'],
        indent: ['error', 4, { SwitchCase: 1 }],
        'no-nested-ternary': ['error'],
        'linebreak-style': ['error', 'unix'],
        'no-unused-vars': ['warn'],
        'no-console': 2,
        'no-redeclare': 'warn',
        quotes: ['error', 'single', { avoidEscape: true }],
        semi: ['error', 'always'],
        'generator-star-spacing': ['error', { before: true, after: false }],
        'flowtype/boolean-style': [2, 'boolean'],
        'flowtype/define-flow-type': 1,
        'flowtype/delimiter-dangle': [2, 'never'],
        'flowtype/generic-spacing': [2, 'never'],
        'flowtype/no-primitive-constructor-types': 2,
        'flowtype/no-types-missing-file-annotation': 2,
        'flowtype/no-weak-types': 2,
        'flowtype/object-type-delimiter': [2, 'comma'],
        'flowtype/require-parameter-type': 2,
        'flowtype/require-return-type': [
            2,
            'always',
            {
                annotateUndefined: 'never'
            }
        ],
        'flowtype/require-valid-file-annotation': 2,
        'flowtype/semi': [2, 'always'],
        'flowtype/space-after-type-colon': [2, 'always'],
        'flowtype/space-before-generic-bracket': [2, 'never'],
        'flowtype/space-before-type-colon': [2, 'never'],
        'flowtype/type-id-match': [2, '^([A-Z][a-z0-9]+)+Type$'],
        'flowtype/union-intersection-spacing': [2, 'always'],
        'flowtype/use-flow-type': 1,
        'flowtype/valid-syntax': 1
    },
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 6
    },
    settings: {
        propWrapperFunctions: ['forbidExtraProps'],
        'import/resolver': {
            'babel-module': {
                extensions: ['.js']
            }
        },
        flowtype: {
            onlyFilesWithFlowAnnotation: true
        }
    },
    "globals": {
        app: "readonly"
    }
};
