import CACHE from "./Cache.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IKey} proto.IKey
 */

export default class Key {
    /**
     * @internal
     * @abstract
     * @returns {proto.IKey}
     */
    // eslint-disable-next-line jsdoc/require-returns-check
    _toProtobufKey() {
        throw new Error("not implemented");
    }

    /**
     * @internal
     * @param {proto.IKey} key
     * @returns {Key}
     */
    static _fromProtobufKey(key) {
        if (key.contractID != null) {
            if (CACHE.contractId == null) {
                throw new Error(
                    "`ContractId` was not loaded before decoding `Key`"
                );
            }

            return CACHE.contractId(key.contractID);
        }

        if (key.delegatableContractId != null) {
            if (CACHE.contractId == null) {
                throw new Error(
                    "`ContractId` was not loaded before decoding `Key`"
                );
            }

            return CACHE.contractId(key.delegatableContractId);
        }

        if (key.ed25519 != null && key.ed25519.byteLength > 0) {
            if (CACHE.publicKeyED25519 == null) {
                throw new Error(
                    "`PublicKey` was not loaded before decoding `Key`"
                );
            }

            return CACHE.publicKeyED25519(key.ed25519);
        }

        if (key.ECDSASecp256k1 != null && key.ECDSASecp256k1.byteLength > 0) {
            if (CACHE.publicKeyECDSA == null) {
                throw new Error(
                    "`PublicKey` was not loaded before decoding `Key`"
                );
            }

            return CACHE.publicKeyECDSA(key.ECDSASecp256k1);
        }

        if (key.thresholdKey != null && key.thresholdKey.threshold != null) {
            if (CACHE.thresholdKey == null) {
                throw new Error(
                    "`PublicKey` was not loaded before decoding `Key`"
                );
            }

            return CACHE.thresholdKey(key.thresholdKey);
        }

        if (key.keyList != null) {
            if (CACHE.keyList == null) {
                throw new Error(
                    "`PublicKey` was not loaded before decoding `Key`"
                );
            }

            return CACHE.keyList(key.keyList);
        }

        throw new Error(
            `(BUG) keyFromProtobuf: not implemented key case: ${JSON.stringify(
                key
            )}`
        );
    }
}
