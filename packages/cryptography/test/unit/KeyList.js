import PrivateKey from "../../src/PrivateKey.js";
import KeyList from "../../src/KeyList.js";

describe("KeyList", function () {
    this.timeout(15000);

    it("KeyList.toString()", async function () {
        const privateKeySigner1 = await PrivateKey.generate();
        const publicKey1 = privateKeySigner1.publicKey;

        const privateKeySigner2 = await PrivateKey.generate();
        const publicKey2 = privateKeySigner2.publicKey;

        const privateKeySigner3 = await PrivateKey.generate();
        const publicKey3 = privateKeySigner3.publicKey;

        console.log("Public key 1 " + publicKey1);
        console.log("Public key 2 " + publicKey2);
        console.log("Public key 3 " + publicKey3);

        const publicKeyList = [];

        publicKeyList.push(publicKey1);
        publicKeyList.push(publicKey2);
        publicKeyList.push(publicKey3);

        console.log("The public key list is " + publicKeyList);

        const keys = new KeyList(publicKeyList);

        console.log("The KeyList is " + keys);
    });
});
