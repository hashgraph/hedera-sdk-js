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

If the network is not specified, it defaults to the following public testnet proxy:

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

## Advanced

| Method | Type | Description |
| :--- | :--- | :--- |
| `setOperator(<account, privateKey>)` | AccountId, ED25519PrivateKey | Modify the operator account ID and private key of the client object |
| `setmaxTransactionFee(<amount>)` | Hbar | Set the default minimum fee for a transaction |
| `setMaxQueryPayment(<maxPayment>)` | Hbar | The maximum automatic payment for a query in tinybar |
| `maxTransactionFee()` |  | Get the the current maximum transaction fee from the client object |
| `maxQueryPayment()` |  | Get the maximum query payment from the client object |
| `_getOperatorKey()` |  | Returns the private key of the operator account from the client object |
| `_getOperatorAccountId()` | \`\` | Returns the account ID from the client object |



