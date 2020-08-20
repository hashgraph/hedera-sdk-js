module.exports = {
  root: true,
  parser: "@babel/eslint-parser",
  env: {
    node: true,
  },
  extends: [
    "@launchbadge/eslint-config"
  ],
  rules: {
    "no-mixed-operators": 0,
    "no-await-in-loop": 0,
    "no-useless-constructor": 0
  }
};
