import AccountId from "../account/AccountId.js";
import proto from "@hashgraph/proto";
import * as sha384 from "../cryptography/sha384.js";
import ObjectMap from "../ObjectMap.js";

/**
 * @augments {ObjectMap<AccountId, Uint8Array>}
 */
export default class TransactionHashMap extends ObjectMap {
    constructor() {
        super((s) => AccountId.fromString(s));
    }

    /**
     * @param {import("./Transaction.js").default} transaction
     * @returns {Promise<TransactionHashMap>}
     */
    static async _fromTransaction(transaction) {
        const hashes = new TransactionHashMap();

        for (let i = 0; i < transaction._nodeIds.length; i++) {
            const nodeAccountId = transaction._nodeIds[i];
            const tx = transaction._transactions[i];
            const hash = await sha384.digest(
                proto.Transaction.encode(tx).ldelim().finish()
            );

            hashes._set(nodeAccountId, hash);
        }

        return hashes;
    }
}
