import * as nacl from "tweetnacl";
import {Key} from "../generated/BasicTypes_pb";
import {decodeHex, ed25519PubKeyPrefix, encodeHex} from "./util";
import {PublicKey} from "./PublicKey";

export class Ed25519PublicKey implements PublicKey {
    private readonly keyData: Uint8Array;
    private asStringRaw?: string;

    public constructor(keyData: Uint8Array) {
        if (keyData.length !== nacl.sign.publicKeyLength) {
            throw new Error('invalid public key');
        }

        this.keyData = keyData;
    }

    public static fromString(keyStr: string): Ed25519PublicKey {
        switch (keyStr.length) {
            case 64: { // raw public key
                const newKey = new Ed25519PublicKey(decodeHex(keyStr));
                newKey.asStringRaw = keyStr;
                return newKey;
            }
            case 88: // DER encoded public key
                if (keyStr.startsWith(ed25519PubKeyPrefix)) {
                    const rawKey = keyStr.slice(24);
                    const newKey = new Ed25519PublicKey(decodeHex(rawKey));
                    newKey.asStringRaw = rawKey;
                    return newKey;
                }
                break;
            default:
        }

        throw new Error("invalid public key: " + keyStr);
    }

    public toBytes(): Uint8Array {
        return this.keyData.slice();
    }

    public toString(raw = false): string {
        if (!this.asStringRaw) {
            this.asStringRaw = encodeHex(this.keyData);
        }

        return (raw ? '' : ed25519PubKeyPrefix) + this.asStringRaw;
    }

    public toProtoKey(): Key {
        const key = new Key();
        // copy the key bytes so they can't modify them through this object
        key.setEd25519(this.toBytes());
        return key;
    }
}
