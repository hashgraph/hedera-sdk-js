import PublicKey from "./PublicKey";

export default class KeyList {
    constructor() {
        /**
         * @type number[]
         */
        this._keys = []
    }

    /**
     * @param {PublicKey} key
     * @returns {KeyList}
     */
    add(key) {
        // this._keys.push(key._toProtoKey());
        return this;
    }

    /**
     * @param {PublicKey[]} keys
     * @returns {KeyList}
     */
    addAll(...keys) {
        // this._keys.push(...keys.map((key) => key._toProtoKey()));
        return this;
    }

    // /* eslint-disable-next-line @typescript-eslint/member-naming */
    // _toProtoKey(): proto.Key {
    //     const keyList = new proto.KeyList();
    //     keyList.setKeysList(this._keys);

    //     const protoKey = new proto.Key();
    //     protoKey.setKeylist(keyList);

    //     return protoKey;
    // }
}

