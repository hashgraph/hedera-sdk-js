import {PublicKey} from "./PublicKey";
import {Key, KeyList, ThresholdKey as ThresholdKeyProto} from "../generated/BasicTypes_pb";

export class ThresholdKey implements PublicKey {
    private readonly threshold: number;
    private readonly keys: Key[] = [];

    public constructor(threshold: number) {
        this.threshold = threshold;
    }

    public add(key: PublicKey): this {
        this.keys.push(key.toProtoKey());
        return this;
    }

    public addAll(...keys: PublicKey[]): this {
        this.keys.push(...keys.map((key) => key.toProtoKey()));
        return this;
    }

    public toProtoKey(): Key {
        if (this.keys.length === 0) {
            throw new Error("ThresholdKey must have at least one key");
        }

        if (this.threshold > this.keys.length) {
            throw new Error('ThresholdKey must have at least as many keys as threshold: '
                + `${this.threshold}; # of keys currently: ${this.keys.length}`);
        }

        const keyList = new KeyList();
        keyList.setKeysList(this.keys);

        const thresholdKey = new ThresholdKeyProto();
        thresholdKey.setThreshold(this.threshold);
        thresholdKey.setKeys(keyList);

        const protoKey = new Key();
        protoKey.setThresholdkey(thresholdKey);

        return protoKey;
    }
}