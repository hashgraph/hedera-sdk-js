module.exports = {
    root: true,
    env: {
        browser: true,
        mocha: true,
        node: true,
        es6: true,
    },
    parser: "@babel/eslint-parser",
    extends: [
        "eslint:recommended",
        "plugin:mocha/recommended",
        "plugin:chai-expect/recommended",
    ],
    globals: {
        expect: "readonly",
    },
};
