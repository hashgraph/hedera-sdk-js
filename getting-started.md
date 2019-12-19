# Getting Started

## Background

Hedera is the public ledger built on the lightning fast hasghraph consensus algorithm. You can use Hedera like you would a blockchain; send cryptocurrency, run smart contracts, even store files!

We’re getting close to availability of Hedera’s JavaScript SDK, which will make it even easier to build applications. In this post I’ll show you how you can get your environment setup and start using Hedera Hashgraph with Node.js, one of the most popular environments in the world.

## Step 1: Create an Account

In order to use the Hedera Public Testnet you’ll need an Account. You can get one by signing up on portal.hedera.com, or maybe a friend who already is on the public testnet can create one for you.

## Step 2: Set up node.js environment

In this simple example, we’ll create the bare minimum node.js environment we’re going to need.

If you already have a node environment set up that you’d like to use, skip to step 3.

> Note: The following steps assume you’re working in the mac terminal

2.1. Ceate a new directory for our example & move into it.

`mkdir hello-hedera-js-sdk && cd hello-hedera-js-sdk`

2.2. Initialize a node.js project in this new directory.

`npm init`

Note: you can just say “yes” to all of the defaults and/or plugin what makes sense. It’s an example!

Here’s mine for reference.

```javascript
{
  "name": "hello-hedera-js-sdk",
  "version": "1.0.0",
  "description": "A hello world project for the Hedera Hashgraph JavaScript SDK",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Cooper Kunz",
  "license": "Apache-2.0"
}
```

2.3. Switch environments, and open your directory in a suitable text editor of your choosing.

I personally really like VS Code if you haven’t checked it out recently!

2.4. Create your `.env` file in the root of your directory.

Now you can add the following information, provided from your [Hedera Portal](https://portal.hedera.com/) Account.

```text
ACCOUNT_ID=YOUR-TESTNET-ACCOUNT-ID
PRIVATE_KEY=YOUR-TESTNET-PRIVATE-KEY
```

> Don’t have an account yet? [Sign up here](https://portal.hedera.com/).

2.4. Create an index.js file in the ‘root’ of your directory.

You can just add this to the file, so we can make sure you have node configured properly.

`console.log("hello node.js!");`

2.5. Test out your node.js installation.

Switch environments back over to your terminal.

You should be able to run `node -v` to get your current version.

Presuming you’re all setup with node, running `node index.js` should output `hello node.js!`

If you don’t get an appropriate response, you may need to install node.

## Step 3: Install the Hedera Hashgraph JS SDK <a id="step-3"></a>

Now that you have your node environment setup, we can get started with Hedera’s JS SDK!

> View Hedera Hashgraph’s JavaScript SDK here

Install it with your favorite package manager.

```text
// install Hedera's JS SDK with NPM
npm install --save @hashgraph/sdk

// Install with Yarn
yarn add @hashgraph/sdk
```

You’ll also likely want to install `dotenv` with your favorite package manager.

This will allow our node environment to use your keys & Account ID we saved earlier.

```text
// install with NPM
npm install dotenv

// Install with Yarn
yarn add dotenv
```

## Step 4: Finally, the fun part

Now we will go through some simple examples you can do!

3.1. Example 1: Checking your balance

Update your **index.js** with the following examples.

Note: there are inline comments to help you understand what’s going on!

```javascript
// Allow access to our .env
require("dotenv").config();

// Import the Hedera Hashgraph JS SDK
const { Client } = require("@hashgraph/sdk");

// Grab our private key from our .env
const privateKey = process.env.PRIVATE_KEY;

// If we weren't able to grab it, we should throw a new error
if (!privateKey) {
  throw new Error("missing env var OPERATOR_KEY");
}

// Create our connection to the Hedera network
// The Hedera JS SDK makes this reallyyy easy!
const client = new Client({
  operator: {
    // Note: here we pass in our account ID from our .env
    account: { shard: 0, realm: 0, account: process.env.ACCOUNT_ID },
    privateKey
  }
});

// Hedera is an asynchronous environment :)
(async function() {

  // Attempt to get and display the balance of our account
  var currentBalance = (await client.getAccountBalance()).toString();
  console.log("account balance:", currentBalance);
})();
```

Copy and paste this into your **index.js**, and if everything is setup successfully, we can now run it! 

Switch back to your terminal and run `node index.js` again.

If successful, within a few seconds we should see something like `account balance: 100500005000`

> Congratulations! You’ve submitted your first query with Hedera’s JS SDK.

3.2. Example 2: Transferring hbar

```javascript
// Allow access to our .env
require("dotenv").config();

// Import the Hedera Hashgraph JS SDK
const { Client } = require("@hashgraph/sdk");

// Grab our private key from our .env
const privateKey = process.env.PRIVATE_KEY;

// If we weren't able to grab it, we should throw a new error 
if (!privateKey) {
  throw new Error("missing env var OPERATOR_KEY");
}

// Create our connection to the Hedera network
// The Hedera JS SDK makes this reallyyy easy!
const client = new Client({
  operator: {
    // Note: here we pass in our account ID from our .env
    account: { shard: 0, realm: 0, account: process.env.ACCOUNT_ID },
    privateKey
  }
});

(async function() {
    console.log("balance before transfer:", (await client.getAccountBalance()).toString());
    await client.transferCryptoTo({ shard: 0, realm: 0, account: 3 }, 10000);
    console.log("balance after transfer:", (await client.getAccountBalance()).toString());
}());
```

> Congratulations! You’ve submitted your first transaction with Hedera’s JS SDK.

This is the end of my brief getting started example. You have now:

* Created a Hedera Testnet Account
* Setup the Hedera JS SDK in a node environment
* Submit your first transaction and queries!

Want to keep learning about Hedera development? Here’s some resources.

* [Documentation](https://docs.hedera.com/)
* [JS SDK examples](https://github.com/hashgraph/hedera-sdk-js/tree/master/examples)
* [Express.js example project](https://github.com/Cooper-Kunz/hedera-express-js-example)

Is there anything else you’d like a tutorial about? Let me know on [twitter]().

