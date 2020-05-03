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
        "plugin:node/recommended",
        "plugin:mocha/recommended",
        "plugin:chai-expect/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.eslint.json"],
        ecmaVersion: 2020,
        sourceType: "module",
    },
    plugins: ["@typescript-eslint"],
    rules: {
        // does not handle return types being annotated in a type comment
        "@typescript-eslint/explicit-function-return-type": "off",
        // babel takes care of this
        "node/no-unsupported-features/es-syntax": "off",
        // opt-out of providing descriptions at the start
        // FIXME: turn these rules back on
        "jsdoc/require-returns-description": "off",
        "jsdoc/require-param-description": "off",
    },
};
