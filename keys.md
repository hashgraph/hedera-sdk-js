# Keys

The SDK currently suppports Ed25519 key system. 

| **Method** | Type | Description |
| :--- | :---: | :--- |
| `Ed25519PrivateKey.generate()` | [Ed25519PrivateKey](https://github.com/hashgraph/hedera-sdk-java/blob/master/src/main/java/com/hedera/hashgraph/sdk/crypto/ed25519/Ed25519PrivateKey.java) | Generates a Ed25519 private key |
| `<newKey>.getPublicKey()` | [Ed25519PublicKey](https://github.com/hashgraph/hedera-sdk-java/blob/master/src/main/java/com/hedera/hashgraph/sdk/crypto/ed25519/Ed25519PublicKey.java) | Gets the corresponding public key to the previously generated private key |

## Example <a id="example"></a>

