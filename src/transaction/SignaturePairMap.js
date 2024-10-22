import ObjectMap from "../ObjectMap.js";
import PublicKey from "../PublicKey.js";

/**
 * @augments {ObjectMap<PublicKey, Uint8Array>}
 */
export default class SignaturePairMap extends ObjectMap {
    constructor() {
        super((s) => PublicKey.fromString(s));
    }

    /**
     * @param {import("@hashgraph/proto").proto.ISignatureMap} sigMap
     * @returns {SignaturePairMap}
     */
    static _fromTransactionSigMap(sigMap) {
        const signatures = new SignaturePairMap();

        const sigPairs = sigMap.sigPair != null ? sigMap.sigPair : [];

        console.log(sigMap);
        for (const sigPair of sigPairs) {
            if (sigPair.pubKeyPrefix != null) {
                if (sigPair.ed25519 != null) {
                    signatures._set(
                        PublicKey.fromBytesED25519(sigPair.pubKeyPrefix),
                        sigPair.ed25519,
                    );
                } else if (sigPair.ECDSASecp256k1 != null) {
                    signatures._set(
                        PublicKey.fromBytesECDSA(sigPair.pubKeyPrefix),
                        sigPair.ECDSASecp256k1,
                    );
                }
            }
        }

        return signatures;
    }
}
