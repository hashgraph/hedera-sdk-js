module.exports = {
  // don't inherit eslint configs from the root eslint since that covers typescript
  root: true,
  env: {
    node: true,
  },
  extends: [
    "@launchbadge/eslint-config",
  ],
  rules: {
    // we use process.env to get the operator private key in examples
    "no-process-env": "off"
  }
};
