import {
    Client,
    AccountCreateTransaction,
    Hbar,
    AccountId,
    KeyList,
    TransferTransaction,
    Transaction,
} from "@hashgraph/sdk";

import PublicKey from "../src/PublicKey.js";
import PrivateKey from "../src/PrivateKey.js";

import dotenv from "dotenv";

dotenv.config();

/** @type {PrivateKey | undefined} */
let user1Key;

/** @type {PrivateKey | undefined} */
let user2Key;

async function main() {
    if (
        process.env.OPERATOR_ID == null ||
        process.env.OPERATOR_KEY == null ||
        process.env.HEDERA_NETWORK == null
    ) {
        throw new Error(
            "Environment variables OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required.",
        );
    }

    const client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
        AccountId.fromString(process.env.OPERATOR_ID),
        PrivateKey.fromStringDer(process.env.OPERATOR_KEY),
    );

    const ecdsaKey = PrivateKey.generateECDSA();
    const ed25519Key = PrivateKey.generateED25519();

    const decodedKey = asn1DecodeStringDer(ecdsaKey.publicKey.toStringDer());

    // console.log(PublicKey.fromString(ed25519Key.publicKey.toStringDer()));

    // console.log(ed25519Key.publicKey.toStringDer());

    // const testKeys = {
    //     ecdsa: ecdsaKey.publicKey.toStringDer(),
    //     ed25519: ed25519Key.publicKey.toStringDer(),
    //     rsa: "30820122300d06092a864886f70d01010105000382010f003082010a0282010100cba5f88d62b1d2a3d15c74b2f2ba634ed4b79d13aeb050bfbbd4c69b610d297482e92eede3b4f9a2424e0d7e91b215408bd817bc4b880b61d14e88d2891d0c9a27aef22752e7d98f10737756b5a3a98e0259b5710a55e9c3abdc368f811e5db07f8168a2e96dc0887c989c14ff4a65e827da172fd3e221e9d6100bf89077e748b0a271a924eb80ad3cd08f0c73600ff95eebb767b06c823c01f8451e777790c102f589f92f3aeeaaa9d34ef2f6f99dd00bd6f61a6e2ac789f45407942970a4f2afbc36202ac6f646db077aa78f12d68cc15e5bc1eb66caec8163c1776e1296b4047d7c3d8f40c78dc92e37472a9e1953112dc396cfbf0609ce7e1a6efe8881050203010001",
    //     // blowfish: "your-blowfish-hex-key",
    //     // twofish: "your-twofish-hex-key",
    //     // des: "your-des-hex-key",
    //     // tripledes: "your-tripledes-hex-key",
    // };

    // for (const [type, hexKey] of Object.entries(testKeys)) {
    //     console.log(`Testing ${type} key:`);
    //     try {
    //         const result = PublicKey.fromString(hexKey);
    //         console.log(result); // Should print details or errors if key type is unsupported
    //     } catch (error) {
    //         console.error(`Error processing ${type} key:`, error);
    //     }
    // }

    // console.log(`private key for user 1= ${user1Key.toString()}`);
    // console.log(`public key for user 1= ${user1Key.publicKey.toString()}`);
    // console.log(`private key for user 2= ${user2Key.toString()}`);
    // console.log(`public key for user 2= ${user2Key.publicKey.toString()}`);

    // // create a multi-sig account
    // const keyList = new KeyList([user1Key, user2Key]);

    // const createAccountTransaction = new AccountCreateTransaction()
    //     .setInitialBalance(new Hbar(2)) // 5 h
    //     .setKey(keyList);

    // const response = await createAccountTransaction.execute(client);

    // let receipt = await response.getReceipt(client);

    // console.log(`account id = ${receipt.accountId.toString()}`);

    // // create a transfer from new account to 0.0.3
    // const transferTransaction = new TransferTransaction()
    //     .setNodeAccountIds([new AccountId(3)])
    //     .addHbarTransfer(receipt.accountId, -1)
    //     .addHbarTransfer("0.0.3", 1)
    //     .freezeWith(client);

    // // convert transaction to bytes to send to signatories
    // const transactionBytes = transferTransaction.toBytes();
    // const transactionToExecute = Transaction.fromBytes(transactionBytes);

    // // ask users to sign and return signature
    // const user1Signature = user1Signs(transactionBytes);
    // const user2Signature = user2Signs(transactionBytes);

    // try {
    //     // recreate the transaction from bytes
    //     await transactionToExecute.signWithOperator(client);
    //     transactionToExecute.addSignature(user1Key.publicKey, user1Signature);
    //     transactionToExecute.addSignature(user2Key.publicKey, user2Signature);

    //     const result = await transactionToExecute.execute(client);
    //     receipt = await result.getReceipt(client);
    //     console.log(`Status: ${receipt.status.toString()}`);
    // } catch (error) {
    //     console.error(error);
    // }

    client.close();
}

/**
 * @param {Uint8Array} transactionBytes
 * @returns {Uint8Array}
 */
function user1Signs(transactionBytes) {
    const transaction = Transaction.fromBytes(transactionBytes);
    return user1Key.signTransaction(transaction);
}

/**
 * @param {Uint8Array} transactionBytes
 * @returns {Uint8Array}
 */
function user2Signs(transactionBytes) {
    const transaction = Transaction.fromBytes(transactionBytes);
    return user2Key.signTransaction(transaction);
}

void main();

/**
 * Class representing an ASN.1 decoder.
 */
class ASN1Decoder {
    /**
     * Creates an ASN.1 decoder instance.
     * @param {ArrayBuffer | Uint8Array} data - The ASN.1 encoded data to decode.
     */
    constructor(data) {
        /**
         * The data to be decoded.
         * @type {Uint8Array}
         */
        this.data = new Uint8Array(data);

        /**
         * The current position in the data.
         * @type {number}
         */
        this.pos = 0;

        /**
         * The list of decoded Object Identifiers (OIDs).
         * @type {string[]}
         */
        this.oids = [];

        /**
         * A map of known OID values to their string representations.
         * @type {Object.<string, string>}
         */
        this.oidMap = {
            "1.3.132.0.10": "ecdsa",
            "1.3.101.112": "ed25519",
            "1.2.840.10045.2.1": "pubkey",
        };

        /**
         * A flag indicating if the decoded data is a public key.
         * @type {boolean}
         */
        this.isPublicKey = false;
    }

    /**
     * Reads the length of the current ASN.1 data element.
     * @returns {number} The length of the data element.
     */
    readLength() {
        let length = this.data[this.pos++];
        if (length & 0x80) {
            let numBytes = length & 0x7f;
            length = 0;
            for (let i = 0; i < numBytes; i++) {
                length = (length << 8) | this.data[this.pos++];
            }
        }
        return length;
    }

    /**
     * Reads the type of the current ASN.1 data element.
     * @returns {number} The type of the data element.
     */
    readType() {
        return this.data[this.pos++];
    }

    /**
     * Reads an INTEGER ASN.1 data element.
     * @returns {Object} An object containing the decoded integer.
     */
    readInteger() {
        let length = this.readLength();
        let value = 0;
        for (let i = 0; i < length; i++) {
            value = (value << 8) | this.data[this.pos++];
        }
        return { integer: value };
    }

    /**
     * Reads an OCTET STRING ASN.1 data element.
     * @returns {Object} An object containing the decoded private key.
     */
    readOctetString() {
        let length = this.readLength();
        let value = this.data.slice(this.pos, this.pos + length);
        this.pos += length;
        return { pkey: value };
    }

    /**
     * Reads a BIT STRING ASN.1 data element.
     * @returns {Object} An object containing the number of unused bits and the public key.
     */
    readBitString() {
        let length = this.readLength();
        let unusedBits = this.data[this.pos++];
        let value = this.data.slice(this.pos, this.pos + length - 1);
        this.pos += length - 1;
        this.isPublicKey = true;
        return { unusedBits, pubkey: value };
    }

    /**
     * Reads an OBJECT IDENTIFIER (OID) ASN.1 data element.
     * @returns {Object} An object containing the decoded OID as a string.
     */
    readObjectIdentifier() {
        let length = this.readLength();
        let endPos = this.pos + length;
        let oid = [];
        let value = 0;

        let firstByte = this.data[this.pos++];
        oid.push(Math.floor(firstByte / 40));
        oid.push(firstByte % 40);

        while (this.pos < endPos) {
            let byte = this.data[this.pos++];
            value = (value << 7) | (byte & 0x7f);
            if (!(byte & 0x80)) {
                oid.push(value);
                value = 0;
            }
        }

        let oidStr = oid.join(".");
        this.oids.push(oidStr);
        return { oid: oidStr };
    }

    /**
     * Returns the list of decoded OIDs.
     * @returns {string[]} The list of decoded OIDs.
     */
    getOids() {
        return this.oids;
    }

    /**
     * Returns the list of key types associated with the decoded OIDs.
     * @returns {string[]} The list of key types.
     */
    getOidKeyTypes() {
        return this.oids.map((oid) => this.oidMap[oid] || "unknown");
    }

    /**
     * Reads a SEQUENCE ASN.1 data element.
     * @returns {Array<string>} An array of decoded items.
     */
    readSequence() {
        let length = this.readLength();
        let endPos = this.pos + length;
        let items = [];
        while (this.pos < endPos) {
            items.push(this.read());
        }
        return items;
    }

    /**
     * Decodes the next ASN.1 data element based on its type.
     * @returns {*} The decoded data element.
     * @throws {Error} Throws an error if the type is unsupported.
     */
    read() {
        let type = this.readType();
        switch (type) {
            case 0x02:
                return this.readInteger();
            case 0x03:
                return this.readBitString();
            case 0x04:
                return this.readOctetString();
            case 0x06:
                return this.readObjectIdentifier();
            case 0x30:
            case 0xa0:
            case 0xa1:
                return this.readSequence();
            default:
                throw new Error("Unsupported type: " + type);
        }
    }

    /**
     * Checks if the decoded data is a public key.
     * @returns {boolean} True if the data is a public key, otherwise false.
     */
    isPublicKeyType() {
        return this.isPublicKey;
    }
}

/**
 * Decodes an ASN.1 encoded key from a hexadecimal string.
 * @param {string} keyString - The hexadecimal string representing the ASN.1 encoded key.
 * @returns {{ keyTypes: string[], isPublicKey: boolean }} An object containing the key types and whether it is a public key.
 */

const asn1DecodeStringDer = (keyString) => {
    const signerData = Uint8Array.from(Buffer.from(keyString, "hex"));
    const decoder = new ASN1Decoder(signerData);

    decoder.read();

    const keyTypes = decoder.getOidKeyTypes();
    const isPublicKey = decoder.isPublicKeyType();

    return {
        keyTypes,
        isPublicKey,
    };
};
