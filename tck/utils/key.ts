import { PrivateKey, PublicKey, KeyList, Key } from "@hashgraph/sdk";
import { proto } from "@hashgraph/proto";

import { asn1DecodeStringDer } from "../utils/asn1-decoder";

const getKeyFromString = (
    keyString: string,
): PublicKey | PrivateKey | Key | null => {
    const decodedKey = asn1DecodeStringDer(keyString);

    if (decodedKey.isKeyListHex) {
        return getKeyFromKeyListHex(keyString);
    }

    try {
        if (decodedKey.isPublicKey) {
            if (decodedKey.keyTypes.includes("ecdsa")) {
                return PublicKey.fromStringECDSA(keyString);
            } else if (decodedKey.keyTypes.includes("ed25519")) {
                return PublicKey.fromStringED25519(keyString);
            }
        } else {
            if (decodedKey.keyTypes.includes("ecdsa")) {
                return PrivateKey.fromStringECDSA(keyString);
            } else if (decodedKey.keyTypes.includes("ed25519")) {
                return PrivateKey.fromStringED25519(keyString);
            }
        }
    } catch (error) {
        console.error("Error parsing key: ", error);
        return null;
    }

    return null;
};

const getKeyFromKeyListHex = (keyString: string): KeyList => {
    try {
        const byteArray = Buffer.from(keyString, "hex");

        let decodedKeyList: proto.KeyList;
        let decodedThresholdKey: proto.ThresholdKey;

        // Attempt to decode as KeyList
        try {
            decodedKeyList = proto.KeyList.decode(byteArray);
        } catch (keyListError) {
            // Expected that this may fail if it's not a KeyList
        }

        // Attempt to decode as ThresholdKey
        try {
            decodedThresholdKey = proto.ThresholdKey.decode(byteArray);
        } catch (thresholdKeyError) {
            // Expected that this may fail if it's not a ThresholdKey
        }

        try {
            return KeyList.__fromProtobufKeyList(decodedKeyList);
        } catch (error) {
            return KeyList.__fromProtobufThresoldKey(decodedThresholdKey);
        }
    } catch (error) {
        throw new Error(error);
    }
};

const convertToKeyListHex = (keyList: KeyList): string => {
    try {
        const protoKey = keyList._toProtobufKey();

        let binaryData: Uint8Array;

        if (keyList.threshold === null) {
            binaryData = proto.KeyList.encode(protoKey.keyList).finish();
        } else {
            binaryData = proto.ThresholdKey.encode(
                protoKey.thresholdKey,
            ).finish();
        }

        return Buffer.from(binaryData).toString("hex");
    } catch (error) {
        return null;
    }
};

const isHexKeyList = (hexString: string): boolean => {
    try {
        const binaryData = Buffer.from(hexString, "hex");
        const decodedData = proto.KeyList.decode(binaryData);

        return !!decodedData.keys && Array.isArray(decodedData.keys);
    } catch (error) {
        return false;
    }
};

export {
    getKeyFromString,
    isHexKeyList,
    convertToKeyListHex,
    getKeyFromKeyListHex,
};
