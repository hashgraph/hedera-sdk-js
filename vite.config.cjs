// read in .env if present
require("dotenv").config();

module.exports = {
    alias: {
        // redirect src/ to src/browser
        // note that this is NOT needed when consuming this package as the browser field in package.json
        // will take care of this
        "../src/index.js": "../src/browser.js",
        "./client/index.js": "./client/browser.js",
    },
    env: {
        // forward OPERATOR_KEY and OPERATOR_ID as VITE_ prefixed
        VITE_OPERATOR_KEY: process.env.OPERATOR_KEY,
        VITE_OPERATOR_ID: process.env.OPERATOR_ID,
    },
};
