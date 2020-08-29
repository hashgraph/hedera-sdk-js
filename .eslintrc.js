module.exports = {
    root: true,
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:jsdoc/recommended",
        "plugin:import/errors",
        "plugin:import/typescript",
        "plugin:node/recommended"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
        ecmaVersion: 2020,
        sourceType: "module",
        warnOnUnsupportedTypeScriptVersion: false
    },
    plugins: ["@typescript-eslint"],
    rules: {
        // does not handle return types being annotated in a type comment
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",

        // opt-out of providing descriptions at the start
        // FIXME: turn these rules back on
        "jsdoc/require-returns-description": "off",
        "jsdoc/require-param-description": "off"
    },
};
