import proto from "@hashgraph/proto";
import { Key, PublicKey, KeyList, PrivateKey } from "@hashgraph/cryptography";

// TODO: Remove _ prefix on functions. They are private if we don't export them. We don't need to _ prefix as well.

/**
 * @param {Key} key
 * @returns {proto.IKey}
 */
export function _toProtoKey(key) {
    if (key instanceof PrivateKey) {
        key = key.publicKey;
    }

    if (key instanceof PublicKey) {
        return {
            ed25519: key.toBytes(),
        };
    }

    throw new Error("toProtoKey: unsupported KeyList");
}

/**
 * @param {KeyList} list
 * @returns {proto.IKeyList}
 */
export function _toProtoKeyList(list) {
    const keys = [];

    for (const key of list) {
        keys.push(_toProtoKey(key));
    }

    return {
        keys,
    };
}

/**
 * @param {proto.IKey} key
 * @returns {Key}
 */
export function _fromProtoKey(key) {
    if (key.ed25519) {
        return new PublicKey(key.ed25519);
    }

    // TODO: Update ContractId to extend Key?
    // if (key.contractID) {
    //     return ContractId._fromProtobuf(requireNonNull(key.contractID));
    // }

    if (key.thresholdKey) {
        const tk = key.thresholdKey;
        return KeyList.withThreshold(tk.threshold ?? 0).push(
            ..._fromProtoKeyList(/** @type {proto.IKeyList} */ (tk.keys))
        );
    }

    if (key.keyList) {
        return new KeyList().push(..._fromProtoKeyList(key.keyList));
    }

    throw new Error(`not implemented key case: ${JSON.stringify(key)}`);
}

/**
 * @param {proto.IKeyList} keys
 * @returns {KeyList}
 */
export function _fromProtoKeyList(keys) {
    return new KeyList().push(
        ...(keys.keys ?? []).map((key) => _fromProtoKey(key))
    );
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
