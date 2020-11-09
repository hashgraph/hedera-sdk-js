import AccountId from "./account/AccountId.js";
import ObjectMap from "./ObjectMap.js";

/**
 * @augments {ObjectMap<AccountId, Uint8Array>}
 */
export default class BytesMap extends ObjectMap {
    constructor() {
        super((s) => AccountId.fromString(s));
    }
}
