module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/typescript",
    "plugin:compat/recommended",
    "plugin:unicorn/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parserOptions: {
    parser: "@typescript-eslint/parser"
  },
  settings: {
    "import/extensions": [".js", ".ts"],
    "import/resolver": {
      webpack: {},
      typescript: {
        alwaysTryTypes: true
      }
    }
  },
  rules: {
    // Managed through prettier
    indent: "off",

    "no-console": "error",
    "no-debugger": "error",

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

    // Typescript
    "no-var": "error",
    "prefer-const": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/array-type": "error",
    "@typescript-eslint/ban-types": "error",
    "@typescript-eslint/camelcase": "error",
    "@typescript-eslint/class-name-casing": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-member-accessibility": "error",
    "@typescript-eslint/interface-name-prefix": "error",
    "@typescript-eslint/member-delimiter-style": "error",
    "@typescript-eslint/no-array-constructor": "error",
    "@typescript-eslint/no-empty-interface": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-parameter-properties": "error",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-use-before-define": "error",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/type-annotation-spacing": "error"
  }
};
