module.exports = {
    env: {
        jest: true
    },
    extends: ["plugin:jest/all"],
    rules: {
        // @abonander: this seems redundant to me;
        // eslint will complain if a test doesn't contain assertions
        "jest/prefer-expect-assertions": "off",
        "jest/lowercase-name": [
            "error",
            {
                ignore: ["describe"]
            }
        ],
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    }
};
