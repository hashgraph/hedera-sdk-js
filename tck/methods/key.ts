import { PrivateKey, PublicKey, KeyList, Key } from "@hashgraph/sdk";
import { proto } from "@hashgraph/proto";

import { asn1DecodeStringDer } from "../utils/asn1-decoder";
import { invalidParamError } from "../utils/invalid-param-error";

import { AccountKey } from "../enums/account-key";

import {
    AccountKeyGenerationParams,
    AccountKeyGenerationResponse,
} from "../models/account-key";

const generateKey = async (
    params: AccountKeyGenerationParams,
): Promise<AccountKeyGenerationResponse> => {
    if (
        params.fromKey &&
        ![
            AccountKey.ED25519_PUBLIC_KEY,
            AccountKey.ECDSA_SECP256K1_PUBLIC_KEY,
            AccountKey.EVM_ADDRESS,
        ].includes(params.type as AccountKey)
    ) {
        return invalidParamError<AccountKeyGenerationResponse>(
            "fromKey should only be provided for specific public key types or EVM address",
        );
    }

    if (params.threshold && params.type !== AccountKey.THRESHOLD_KEY) {
        return invalidParamError<AccountKeyGenerationResponse>(
            "threshold should only be provided for thresholdKey types",
        );
    }

    if (
        params.keys &&
        ![AccountKey.KEY_LIST, AccountKey.THRESHOLD_KEY].includes(
            params.type as AccountKey,
        )
    ) {
        return invalidParamError<AccountKeyGenerationResponse>(
            "keys should only be provided for keyList or thresholdKey types",
        );
    }

    if (
        (params.type === AccountKey.THRESHOLD_KEY ||
            params.type === AccountKey.KEY_LIST) &&
        !params.keys
    ) {
        return invalidParamError<AccountKeyGenerationResponse>(
            "keys list is required for generating a KeyList type",
        );
    }

    if (params.type === AccountKey.THRESHOLD_KEY && params.threshold === 0) {
        return invalidParamError<AccountKeyGenerationResponse>(
            "threshold is required for generating a ThresholdKey type",
        );
    }

    const response: AccountKeyGenerationResponse = {
        key: "",
        privateKeys: [],
    };

    try {
        const { key, privateKeys } = await processKeyRecursively(
            params,
            response,
            false,
        );

        response.key = key;
        response.privateKeys = privateKeys;
    } catch (error) {
        return invalidParamError<AccountKeyGenerationResponse>(error.message);
    }

    return response;
};

const processKeyRecursively = async (
    params: AccountKeyGenerationParams,
    response: AccountKeyGenerationResponse,
    isList: boolean,
): Promise<AccountKeyGenerationResponse> => {
    switch (params.type) {
        case AccountKey.ED25519_PRIVATE_KEY:
            const ed25519PrivateKey = PrivateKey.generateED25519();
            if (isList)
                response.privateKeys.push(ed25519PrivateKey.toStringDer());
            return {
                key: ed25519PrivateKey.toStringDer(),
                privateKeys: response.privateKeys,
            };

        case AccountKey.ECDSA_SECP256K1_PRIVATE_KEY:
            const ecdsaPrivateKey = PrivateKey.generateECDSA();
            if (isList)
                response.privateKeys.push(ecdsaPrivateKey.toStringDer());
            return {
                key: ecdsaPrivateKey.toStringDer(),
                privateKeys: response.privateKeys,
            };

        case AccountKey.ED25519_PUBLIC_KEY:
        case AccountKey.ECDSA_SECP256K1_PUBLIC_KEY:
            let publicKey: string;
            let privateKey: string;

            if (params.fromKey) {
                if (params.type === AccountKey.ED25519_PUBLIC_KEY) {
                    const pk = PrivateKey.fromStringED25519(params.fromKey);
                    privateKey = pk.toStringDer();
                    publicKey = pk.publicKey.toStringDer();
                } else {
                    const pk = PrivateKey.fromStringECDSA(params.fromKey);
                    privateKey = pk.toStringDer();
                    publicKey = pk.publicKey.toStringDer();
                }
                if (isList) {
                    response.privateKeys.push(privateKey);
                }

                return { key: publicKey, privateKeys: response.privateKeys };
            }

            if (params.type === AccountKey.ED25519_PUBLIC_KEY) {
                const pk = PrivateKey.generateED25519();
                privateKey = pk.toStringDer();
                publicKey = pk.publicKey.toStringDer();
            } else {
                const pk = PrivateKey.generateECDSA();
                privateKey = pk.toStringDer();
                publicKey = pk.publicKey.toStringDer();
            }

            if (isList) {
                response.privateKeys.push(privateKey);
            }

            return { key: publicKey, privateKeys: response.privateKeys };

        case AccountKey.KEY_LIST:
        case AccountKey.THRESHOLD_KEY:
            const keyList = new KeyList();

            for (const keyParam of params.keys!) {
                const { key: keyStr } = await processKeyRecursively(
                    keyParam,
                    response,
                    true,
                );
                const key = getKeyFromString(keyStr);
                if (key) {
                    keyList.push(key);
                }
            }
            if (params.type === AccountKey.THRESHOLD_KEY) {
                keyList.setThreshold(params.threshold!);
            }

            return {
                key: convertToKeyListHex(keyList) || "",
                privateKeys: response.privateKeys,
            };

        case AccountKey.EVM_ADDRESS:
            if (params.fromKey) {
                try {
                    const key = getKeyFromString(params.fromKey);
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
                    } else {
                        return invalidParamError<AccountKeyGenerationResponse>(
                            "fromKey for evmAddress is not ECDSAsecp256k1",
                        );
                    }
                } catch (error) {
                    return invalidParamError<AccountKeyGenerationResponse>(
                        error.message,
                    );
                }
            }
            try {
                const privateKey = PrivateKey.generateECDSA();
                return {
                    key: privateKey.publicKey.toEvmAddress(),
                    privateKeys: [privateKey.toStringDer()],
                };
            } catch (error) {
                return invalidParamError<AccountKeyGenerationResponse>(
                    error.message,
                );
            }

        default:
            return invalidParamError<AccountKeyGenerationResponse>(
                "key type not recognized",
            );
    }
};

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
            console.error("Failed to decode as KeyList:", keyListError);
        }

        // Attempt to decode as ThresholdKey
        try {
            decodedThresholdKey = proto.ThresholdKey.decode(byteArray);
        } catch (thresholdKeyError) {
            console.error(
                "Failed to decode as ThresholdKey:",
                thresholdKeyError,
            );
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

export { generateKey, getKeyFromString, isHexKeyList };
