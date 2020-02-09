const { Client } = require("@hashgraph/sdk");

const TestnetClient = Client.forTestnet();
TestnetClient.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

module.exports = TestnetClient; // Now you can import this into other JS files to use!

// Usage above is intended for release versions greater than v1.1
// Usage below is intended for release versions below v1.1

//
// const { Client } = require(“@hashgraph/sdk”);
// const TestnetClient = new Client({
//   network: { “0.testnet.hedera.com:50211”: “0.0.3" },
//   operator: {
//     account: process.env.OPERATOR_ID,
//     privateKey: process.env.OPERATOR_KEY
//   }
// });
// module.exports = TestnetClient;
//
