module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "@launchbadge/eslint-config",
    "@launchbadge/eslint-config/browser",
    "@launchbadge/eslint-config/typescript"
  ],
  rules: {
    "no-mixed-operators": 0,
    "no-await-in-loop": 0,
    "no-useless-constructor": 0
  }
};
