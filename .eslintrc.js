module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'airbnb-base',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        indent: ['error', 4],
        'no-unused-vars': ['warn', { vars: 'local', args: 'none' }],
        'no-plusplus': 0,
        'max-len': ['warn', 180],
        'one-var': 0,
        'no-console': 'off',
        'arrow-body-style': 'off',
        'class-methods-use-this': 'off',
    },
};
