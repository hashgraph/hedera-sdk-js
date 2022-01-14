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

        for (let i = 0; i < transaction._nodeAccountIds.length; i++) {
            const sigMap = transaction._signedTransactions.get(i).sigMap;

            if (sigMap != null) {
                signatures._set(
                    transaction._nodeAccountIds.list[i],
                    NodeAccountIdSignatureMap._fromTransactionSigMap(sigMap)
                );
            }
        }

        return signatures;
    }
}
