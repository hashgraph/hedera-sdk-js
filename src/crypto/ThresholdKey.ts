import { PublicKey } from "./PublicKey";
import { Key, KeyList, ThresholdKey as ThresholdKeyProto } from "../generated/BasicTypes_pb";

export class ThresholdKey implements PublicKey {
    private readonly _threshold: number;
    private readonly _keys: Key[] = [];

    public constructor(threshold: number) {
        this._threshold = threshold;
    }

    public add(key: PublicKey): this {
        this._keys.push(key._toProtoKey());
        return this;
    }

    public addAll(...keys: PublicKey[]): this {
        this._keys.push(...keys.map((key) => key._toProtoKey()));
        return this;
    }

    public _toProtoKey(): Key {
        if (this._keys.length === 0) {
            throw new Error("ThresholdKey must have at least one key");
        }

        if (this._threshold > this._keys.length) {
            throw new Error("ThresholdKey must have at least as many keys as threshold: " +
                `${this._threshold}; # of keys currently: ${this._keys.length}`);
        }

        const keyList = new KeyList();
        keyList.setKeysList(this._keys);

        const thresholdKey = new ThresholdKeyProto();
        thresholdKey.setThreshold(this._threshold);
        thresholdKey.setKeys(keyList);

        const protoKey = new Key();
        protoKey.setThresholdkey(thresholdKey);

        return protoKey;
    }
}
