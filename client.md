---
description: Creating a client
---

# Client

You will need the following pieces of information to construct your Hedera client. 

**User Information**

The operator is the user paying for the transactions fees.  

* **Operator ID:** The account ID of the user paying for the transaction/query fees
* **Operator key:** The private key of the user paying for the transaction/query fees

**Network Information**

The SDK provides points to a public free proxy to the Hedera **public testnet**. The node ID and node address the proxy points to are:

* **Node ID**: `0.0.3`
* **Node Address**: `0.testnet.hedera.com:50211`

### Example

```javascript
import {Client} from "@hashgraph/sdk";

const client = new Client({ 
    // this key defaults to this url, a public free proxy to the Hedera public testnet
    // generously hosted by MyHederaWallet.com
    network: { "https://grpc-web.myhederawallet.com": "0.0.3" },
    operator: {
        // the account which signs transactions and query payments by default
        account: { shard: 0, realm: 0, account: ___ },
        // the private key used to sign the transactions, either encoded as a string
        // or as an `Ed25519PrivateKey` type 
        privateKey: "..."
    },
});
```

