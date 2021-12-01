import crypto from "crypto";

/**
 * @typedef {import("../EcdsaPrivateKey.js").KeyPair} KeyPair
 */

const options = {
    namedCurve: "secp256k1",
    publicKeyEncoding: {
        type: "spki",
        format: "der",
    },
    privateKeyEncoding: {
        type: "pkcs8",
        format: "der",
    },
};

/**
 * @returns {KeyPair}
 */
export function generate() {
    const result = crypto.generateKeyPairSync("ec", options);

    return {
        publicKey: result.publicKey.export(),
        privateKey: result.privateKey.export(),
    };
}

/**
 * @returns {Promise<KeyPair>}
 */
export function generateAsync() {
    return new Promise((resolve, reject) =>
        crypto.generateKeyPair("ec", options, (err, publicKey, privateKey) => {
            if (err != null) {
                reject(err);
            }

            resolve({
                publicKey: publicKey.export(),
                privateKey: privateKey.export(),
            });
        })
    );
}

/**
 * @param {Uint8Array} data
 * @returns {KeyPair}
 */
export function fromBytes(data) {
    const privateKey = crypto
        .createPrivateKey({
            type: "sec1",
            format: "der",
            key: Buffer.from(data),
        })
        .export();

    const publicKey = crypto.createPublicKey(privateKey).export();

    return {
        publicKey,
        privateKey,
    };
}
