import NodeAccountIdSignatureMap from "./NodeAccountIdSignatureMap.js";
import ObjectMap from "../ObjectMap.js";
import AccountId from "../account/AccountId.js";

/**
 * @augments {ObjectMap<AccountId, NodeAccountIdSignatureMap>}
 */
export default class SignatureMap extends ObjectMap {
    constructor() {
        super((s) => AccountId.fromString(s));
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

        for (let i = 0; i < transaction._nodeIds.length; i++) {
            const sigMap = transaction._transactions[i].sigMap;
            if (sigMap != null) {
                signatures._set(
                    transaction._nodeIds[i],
                    NodeAccountIdSignatureMap._fromTransactionSigMap(sigMap)
                );
            }
        }

        return signatures;
    }
}
