import { PublicKey } from "@hashgraph/cryptography";
import ObjectMap from "../ObjectMap.js";

/**
 * @augments {ObjectMap<PublicKey, Uint8Array>}
 */
export default class SignatureMap extends ObjectMap {
    constructor() {
        super((s) => PublicKey.fromString(s));
    }

    /**
     * @param {import("./Transaction.js").default} transaction
     * @returns {SignatureMap}
     */
    static _fromTransaction(transaction) {
        const signatures = new SignatureMap();

        if (transaction._nodeIds.length == 0) {
            return signatures;
        }

        const sigPairs =
            transaction._transactions[0].sigMap != null
                ? transaction._transactions[0].sigMap.sigPair != null
                    ? transaction._transactions[0].sigMap.sigPair
                    : []
                : [];

        for (const sigPair of sigPairs) {
            if (sigPair.pubKeyPrefix != null && sigPair.ed25519 != null) {
                signatures._set(
                    PublicKey.fromBytes(sigPair.pubKeyPrefix),
                    sigPair.ed25519
                );
            }
        }

        return signatures;
    }
}
