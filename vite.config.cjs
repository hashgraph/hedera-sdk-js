module.exports = {
    server: {
        hmr: false,
        force: true,
    },
    envDir: "./",
    build: {
        polyfillDynamicImport: false,
    },
    optimizeDeps: {
        entries: [
            "./test/unit/AccountId.js",
            "./test/unit/Hbar.js",
            "./test/unit/keccak256.js",
            "./test/unit/Transaction.js",
            "./test/unit/TransactionId.js",
            "./test/integration/AccountBalanceIntegrationTest.js",
            "./test/integration/ClientIntegrationTest.js",
            "./test/integration/TokenCreateIntegrationTest.js",
            "./test/integration/TransactionIntegrationTest.js",
            "./test/integration/TransactionResponseTest.js",
        ],
    },
    resolve: {
        alias: {
            // redirect src/ to src/browser
            // note that this is NOT needed when consuming this package as the browser field in package.json
            // will take care of this
            "../../src/index.js": "../../src/browser.js",
            "../src/index.js": "../src/browser.js",
            "../../../src/encoding/hex.js": "../../../src/encoding/hex.browser.js",
            "../../src/encoding/hex.js": "../../src/encoding/hex.browser.js",
            "../src/encoding/hex.js": "../src/encoding/hex.browser.js",
            "src/encoding/hex.js": "src/encoding/hex.browser.js",
            "../encoding/hex.js": "../encoding/hex.browser.js",
            "./encoding/hex.js": "./encoding/hex.browser.js",
            "../src/encoding/utf8.js": "../src/encoding/utf8.browser.js",
            "../../src/encoding/utf8.js": "../../src/encoding/utf8.browser.js",
            "../encoding/utf8.js": "../encoding/utf8.browser.js",
            "../src/cryptography/sha384.js": "../src/cryptography/sha384.browser.js",
            "../cryptography/sha384.js": "../cryptography/sha384.browser.js",
            "./client/NodeIntegrationTestEnv.js": "./client/WebIntegrationTestEnv.js",
            "../integration/client/NodeIntegrationTestEnv.js": "../integration/client/WebIntegrationTestEnv.js",
            "../../src/client/NodeClient.js": "../../src/client/WebClient.js",
        },
    },
};
