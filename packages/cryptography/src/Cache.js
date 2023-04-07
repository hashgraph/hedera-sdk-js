/**
 * @typedef {import("./PrivateKey.js").default} PrivateKey
 * @typedef {import("./Ed25519PrivateKey.js").default} Ed25519PrivateKey
 * @typedef {import("./EcdsaPrivateKey.js").default} EcdsaPrivateKey
 * @typedef {import("./Mnemonic.js").default} Mnemonic
 */

const CACHE = {
    /** @type {((key: Ed25519PrivateKey | EcdsaPrivateKey) => PrivateKey) | null} */
    privateKeyConstructor: null,

    /** @type {((bytes: Uint8Array) => PrivateKey) | null} */
    privateKeyFromBytes: null,

    /** @type {((words: string) => Mnemonic) | null} */
    mnemonicFromString: null,
};

export default CACHE;
