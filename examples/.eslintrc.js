module.exports = {
  // don't inherit eslint configs from the root eslint since that covers typescript
  root: true,
  env: {
    node: true,
    browser: true
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:compat/recommended",
    "plugin:unicorn/recommended",
  ],
  settings: {
    "import/extensions": [".js", ".ts"],
    "import/resolver": {
      webpack: {},
    }
  },
  rules: {
    // Managed through prettier
    indent: "off",

    // Broken in eslint@6.x
    // See https://github.com/benmosher/eslint-plugin-import/issues/1341
    "import/named": "off",

    // Require Object Literal Shorthand Syntax
    // https://eslint.org/docs/rules/object-shorthand
    "object-shorthand": ["error", "always"],

    // This often has false positives?
    "require-atomic-updates": "warn",

    // Unicorn
    "unicorn/filename-case": "off",
    "unicorn/prevent-abbreviations": "off",

    // FIXME: remove in bignumber.js PR
    "compat/compat": "warn",

    // Typescript
    "no-var": "error",
    "prefer-const": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
  }
};
