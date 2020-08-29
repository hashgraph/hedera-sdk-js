module.exports = {
    parserOptions: {
        tsconfigRootDir: __dirname,
    },
    rules: {
        // false positives for jsdoc types
        "@typescript-eslint/explicit-module-boundary-types": "off"
    }
};
