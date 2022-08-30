/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

import AccountId from "./account/AccountId.js";
import PublicKey from "./PublicKey.js";
import * as hex from "./encoding/hex.js";
import ajv from "./Ajv.js";

/**
 * @typedef {object} SignerSignatureJSON
 * @property {string} publicKey
 * @property {string} signature
 * @property {string} accountId
 */

const validate = ajv.compile({
    type: "object",
    properties: {
        publicKey: { type: "string", format: "PublicKey" },
        signature: { type: "string", format: "Hex" },
        accountId: { type: "string", format: "AccountId" },
    },
    required: ["publicKey", "signature", "accountId"],
    additionalProperties: false,
});

export default class SignerSignature {
    /**
     * @param {object} props
     * @param {PublicKey} props.publicKey
     * @param {Uint8Array} props.signature
     * @param {AccountId} props.accountId
     */
    constructor(props) {
        this.publicKey = props.publicKey;
        this.signature = props.signature;
        this.accountId = props.accountId;
    }

    /**
     * @param {any} obj
     * @returns {obj is SignerSignature}
     */
    static isSignerSignature(obj) {
        return validate(obj);
    }

    /**
     * @param {SignerSignatureJSON} json
     * @returns {SignerSignature}
     */
    static fromJSON(json) {
        return new SignerSignature({
            publicKey: PublicKey.fromString(json.publicKey),
            signature: hex.decode(json.signature),
            accountId: AccountId.fromString(json.accountId),
        });
    }

    /**
     * @returns {SignerSignatureJSON}
     */
    toJSON() {
        return {
            publicKey: this.publicKey.toStringDer(),
            signature: hex.encode(this.signature),
            accountId: this.accountId.toString(),
        };
    }
}
