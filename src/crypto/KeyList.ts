import { PublicKey } from "./PublicKey";
import * as proto from "../generated/basic_types_pb";

export class KeyList {
    private readonly _keys: proto.Key[] = [];

    public add(key: PublicKey): this {
        this._keys.push(key._toProtoKey());
        return this;
    }

    public addAll(...keys: PublicKey[]): this {
        this._keys.push(...keys.map((key) => key._toProtoKey()));
        return this;
    }

    /* eslint-disable-next-line @typescript-eslint/member-naming */
    public _toProtoKey(): proto.Key {
        const keyList = new proto.KeyList();
        keyList.setKeysList(this._keys);

        const protoKey = new proto.Key();
        protoKey.setKeylist(keyList);

        return protoKey;
    }
}
