module.exports = {
  // don't inherit eslint configs from the root eslint since that covers typescript
  root: true,
  env: {
    node: true,
  },
  extends: [
    "@launchbadge/eslint-config",
  ],
};
