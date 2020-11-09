import AccountId from "../account/AccountId.js";
import ObjectMap from "../ObjectMap.js";

/**
 * @augments {ObjectMap<AccountId, Long>}
 */
export default class TokenTransferAccountMap extends ObjectMap {
    constructor() {
        super((s) => AccountId.fromString(s));
    }
}
