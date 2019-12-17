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

You can find testnet and mainnet network details by logging into your Hedera portal. On mainnet, you can also request the contents of the most current address book file.

* **Node ID:** The account ID of the node submitting the transaction to the network
* **Node Address:** The network address of the node submitting the transaction to the network



The network information provided \(testnet address: 0.testnet.hedera.com:50211

```javascript
    const client = new Client({
        network: { "0.testnet.hedera.com:50211": "0.0.3" },
        operator: {
            account: operatorAccount,
            privateKey: operatorPrivateKey
        }
    });
```

