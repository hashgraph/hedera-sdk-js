import { PrivateKey, PublicKey, KeyList, Key } from "@hiero-ledger/sdk";
import { proto } from "@hiero-ledger/proto";

import { AccountKey } from "./enums/account-key";
import { asn1DecodeStringDer } from "../utils/asn1-decoder";

import { KeyGenerationResponse } from "../response/key";
import { Asn1DecodedKeyResponse } from "../response/asn1-decode";

import { invalidParamError } from "./invalid-param-error";
import { KeyGenerationParams } from "../params/key";

const getKeyFromString = (
    keyString: string,
): PublicKey | PrivateKey | Key | null => {
    const decodedKey = asn1DecodeStringDer(keyString);

    if (decodedKey.isKeyListHex) {
        return getKeyFromKeyListHex(keyString);
    }

    try {
        if (decodedKey.isPublicKey) {
            return getPublicKeyFromString(decodedKey, keyString);
        }
        return getPrivateKeyFromString(decodedKey, keyString);
    } catch (error) {
        console.error("Error parsing key: ", error);
        return null;
    }
};

const getPublicKeyFromString = (
    decodedKey: Asn1DecodedKeyResponse,
    keyString: string,
): PublicKey | null => {
    if (decodedKey.keyTypes.includes("ecdsa")) {
        return PublicKey.fromStringECDSA(keyString);
    } else if (decodedKey.keyTypes.includes("ed25519")) {
        return PublicKey.fromStringED25519(keyString);
    }
    return null;
};

const getPrivateKeyFromString = (
    decodedKey: Asn1DecodedKeyResponse,
    keyString: string,
): PrivateKey | null => {
    if (decodedKey.keyTypes.includes("ecdsa")) {
        return PrivateKey.fromStringECDSA(keyString);
    } else if (decodedKey.keyTypes.includes("ed25519")) {
        return PrivateKey.fromStringED25519(keyString);
    }
    return null;
};

const getKeyFromKeyListHex = (keyString: string): KeyList => {
    try {
        const byteArray = Buffer.from(keyString, "hex");

        // Tell the two messages apart by their first tag: a KeyList starts with
        // `keys` (field 1, length-delimited, 0x0a), a ThresholdKey with
        // `threshold` (field 1, varint, 0x08) or `keys` (field 2) when it is 0.
        // Decoding as a KeyList first does not fail on ThresholdKey bytes:
        // newer protobufjs decoders skip the field and return an empty KeyList.
        if (byteArray.length === 0 || byteArray[0] === 0x0a) {
            return KeyList.__fromProtobufKeyList(
                proto.KeyList.decode(byteArray),
            );
        }

        return KeyList.__fromProtobufThresoldKey(
            proto.ThresholdKey.decode(byteArray),
        );
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

const getEvmAddressFromKey = (
    fromKey: string,
    response: KeyGenerationResponse,
): KeyGenerationResponse => {
    const key = getKeyFromString(fromKey);
    if (key instanceof PublicKey) {
        return {
            key: key.toEvmAddress(),
            privateKeys: response.privateKeys,
        };
    } else if (key instanceof PrivateKey) {
        return {
            key: key.publicKey.toEvmAddress(),
            privateKeys: response.privateKeys,
        };
    }

    // If Key neither PublicKey nor PrivateKey
    return invalidParamError<KeyGenerationResponse>(
        "fromKey for evmAddress is not ECDSAsecp256k1",
    );
};

const getKeyPairFromParams = (
    params: KeyGenerationParams,
): { privateKey: PrivateKey; publicKey: PublicKey } => {
    if (params.fromKey) {
        const pk =
            params.type === AccountKey.ED25519_PUBLIC_KEY
                ? PrivateKey.fromStringED25519(params.fromKey)
                : PrivateKey.fromStringECDSA(params.fromKey);
        return { privateKey: pk, publicKey: pk.publicKey };
    } else {
        const pk =
            params.type === AccountKey.ED25519_PUBLIC_KEY
                ? PrivateKey.generateED25519()
                : PrivateKey.generateECDSA();
        return { privateKey: pk, publicKey: pk.publicKey };
    }
};

export {
    getKeyFromString,
    isHexKeyList,
    convertToKeyListHex,
    getKeyFromKeyListHex,
    getEvmAddressFromKey,
    getKeyPairFromParams,
};
