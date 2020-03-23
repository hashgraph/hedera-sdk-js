import * as nacl from "tweetnacl";
import { Key } from "../generated/BasicTypes_pb";
import { ed25519PubKeyPrefix } from "./util";
import { PublicKey } from "./PublicKey";
import { BadKeyError } from "../errors/BadKeyError";
import * as hex from "@stablelib/hex";

export class Ed25519PublicKey implements PublicKey {
    private readonly _keyData: Uint8Array;
    private _asStringRaw?: string;

    private constructor(keyData: Uint8Array) {
        if (keyData.length !== nacl.sign.publicKeyLength) {
            throw new BadKeyError();
        }

        this._keyData = keyData;
    }

    public static fromBytes(keyData: Uint8Array): Ed25519PublicKey {
        return new Ed25519PublicKey(keyData);
    }

    public static fromString(keyStr: string): Ed25519PublicKey {
        switch (keyStr.length) {
            case 64: { // raw public key
                const newKey = new Ed25519PublicKey(hex.decode(keyStr));
                newKey._asStringRaw = keyStr;
                return newKey;
            }
            case 88: // DER encoded public key
                if (keyStr.startsWith(ed25519PubKeyPrefix)) {
                    const rawKey = keyStr.slice(24);
                    const newKey = new Ed25519PublicKey(hex.decode(rawKey));
                    newKey._asStringRaw = rawKey;
                    return newKey;
                }
                break;
            default:
        }

        throw new BadKeyError();
    }

    public toBytes(): Uint8Array {
        return this._keyData.slice();
    }

    public toString(raw = false): string {
        if (this._asStringRaw == null) {
            this._asStringRaw = hex.encode(this._keyData, true);
        }

        return (raw ? "" : ed25519PubKeyPrefix) + this._asStringRaw;
    }

    /* eslint-disable-next-line @typescript-eslint/member-naming */
    public _toProtoKey(): Key {
        const key = new Key();
        // copy the key bytes so they can't modify them through this object
        key.setEd25519(this.toBytes());
        return key;
    }

    // INTERNAL API
    public _bytesEqual(bytes: Uint8Array): boolean {
        return this._keyData === bytes;
    }
}
