const { Ed25519PrivateKey } = require("@hashgraph/sdk");

const pemString = "-----BEGIN PRIVATE KEY-----\n" +
"MC4CAQAwBQYDK2VwBCIEINtIS4KOZLLY8SzjwKDpOguMznrxu485yXcyOUSCU44Q\n" +
"-----END PRIVATE KEY-----\n";

const testKeyStr = "302e020100300506032b657004220420db484b828e64b2d8f12ce3c0a0e93a0b8cce7af1bb8f39c97732394482538e10";

function main() {
    const key = Ed25519PrivateKey.fromPem(pemString);
    console.log(key.toString());
    console.log(testKeyStr);
    console.log("MATCHES:", key.toString() === testKeyStr);
}

main();
