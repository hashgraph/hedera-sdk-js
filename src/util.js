import proto from "@hashgraph/proto";
import { Key, PublicKey, KeyList, PrivateKey } from "@hashgraph/cryptography";

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
 * @param {proto.IKey} key
 * @returns {Key}
 */
export function _fromProtoKey(key) {
    if (key.ed25519) {
        // @ts-ignore
        return new PublicKey(key.ed25519);
    }

    // TODO: Update ContractId to extend Key?
    // if (key.contractID) {
    //     return ContractId._fromProtobuf(requireNonNull(key.contractID));
    // }

    if (key.thresholdKey) {
        const tk = key.thresholdKey;
        // @ts-ignore
        return KeyList.withThreshold(tk.threshold).push(
            // @ts-ignore
            ..._fromProtoKeyList(tk.keys)
        );
    }

    if (key.keyList) {
        // @ts-ignore
        return new KeyList().push(..._fromProtoKeyList(key.keyList));
    }

    throw new Error(`not implemented key case: ${JSON.stringify(key)}`);
}

/**
 * @param {proto.IKeyList} keys
 * @returns {Key[]}
 */
export function _fromProtoKeyList(keys) {
    // @ts-ignore
    return keys.keys.map(_fromProtoKey);
}
