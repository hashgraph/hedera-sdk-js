module.exports = {
    env: {
        jest: true
    },
    extends: ["plugin:jest/all"],
    rules: {
        "jest/prefer-expect-assertions": "warn",
        "jest/lowercase-name": [
            "error",
            {
                ignore: ["describe"]
            }
        ]
    }
};
