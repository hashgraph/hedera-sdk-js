# Keys

The SDK currently suppports Ed25519 key system. 

| **Method** | Type | Description |
| :--- | :---: | :--- |
| `Ed25519PrivateKey.generate()` | Ed25519PrivateKey | Generates a new Ed25519 random private key |
| `<newKey>.publicKey()` | Ed25519PublicKey | Gets the corresponding public key to the previously generated private key |

## Example <a id="example"></a>

```javascript
const {Ed25519PrivateKey}= require('@hashgraph/sdk');

async function main() {

    const privateKey = await Ed25519PrivateKey.generate();
    const key = privateKey.publicKey;
    
    console.log(`private = ${privateKey.toString()}`);
    console.log(`public = ${key.toString()}`);
    }
    
main();
```

