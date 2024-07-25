/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
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
import {
    AccountId,
    NftId,
    TokenRejectTransaction,
    TokenDissociateTransaction,
    TokenId,
    Transaction,
    TransactionResponse,
} from "../exports.js";

/**
 * @typedef {import("../PrivateKey.js").default} PrivateKey
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../Signer.js").Signer} Signer
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 *
 */

/**
 * Reject undesired token(s) and dissociate in a single flow.
 */
export default class TokenRejectFlow {
    constructor() {
        /**
         * @private
         * @type {AccountId | string | null}
         * */
        this._ownerId = null;

        /**
         * @private
         * @type {TokenId[]}
         */
        this._tokenIds = [];

        /**
         * @private
         * @type {NftId[]}
         * */
        this._nftIds = [];

        /**
         * @private
         * @type { Client | null }
         */
        this._freezeWithClient = null;

        /**
         * @private
         * @type {PrivateKey | null}
         */
        this._signPrivateKey = null;

        /**
         * @private
         * @type {import("../SignerSignature.js").PublicKey | null}
         */
        this._signPublicKey = null;

        /**
         * @private
         * @type {*}}
         */
        this._transactionSigner = null;
    }

    /**
     *
     * @param {AccountId | string} ownerId
     * @returns {this}
     */
    setOwnerId(ownerId) {
        this.requireNotFrozen();
        this._ownerId =
            ownerId instanceof AccountId
                ? ownerId
                : AccountId.fromString(ownerId);
        return this;
    }

    /**
     * @returns { AccountId | string | null}
     */
    get ownerId() {
        return this._ownerId;
    }

    /**
     *
     * @param {TokenId[]} ids
     * @returns {this}
     */
    setTokenIds(ids) {
        this.requireNotFrozen();
        this._tokenIds = ids;
        return this;
    }

    /**
     *
     * @param {TokenId} id
     * @returns {this}
     */
    addTokenId(id) {
        this.requireNotFrozen();
        this._tokenIds.push(id);
        return this;
    }

    /**
     *
     * @returns {TokenId[]}
     */
    get tokenIds() {
        return this._tokenIds;
    }

    /**
     *
     * @param {NftId[]} ids
     * @returns {this}
     */
    setNftIds(ids) {
        this.requireNotFrozen();
        this._nftIds = ids;
        return this;
    }

    /**
     *
     * @param {NftId} id
     * @returns {this}
     */
    addNftId(id) {
        this.requireNotFrozen();
        this._nftIds.push(id);
        return this;
    }

    /**
     *
     * @returns {NftId[]}
     */
    get nftIds() {
        return this._nftIds;
    }

    /**
     *
     * @param {PrivateKey} privateKey
     * @returns {this}
     */
    sign(privateKey) {
        this._signPrivateKey = privateKey;
        this._signPublicKey = null;
        this._transactionSigner = null;
        return this;
    }

    /**
     *
     * @param {import("../SignerSignature.js").PublicKey} publicKey
     * @param {import("../Signer.js").Signer} signer
     * @returns {this}
     */
    signWith(publicKey, signer) {
        this._signPublicKey = publicKey;
        this._transactionSigner = signer;
        this._signPrivateKey = null;
        return this;
    }

    /**
     * @param {Client} client
     */
    signWithOperator(client) {
        const operator = client.getOperator();
        if (operator == null) {
            throw new Error("Client operator must be set");
        }
        this._signPublicKey = operator.publicKey;
        this._transactionSigner = operator.transactionSigner;
        this._signPrivateKey = null;
        return this;
    }

    /**
     * @private
     * @param {Transaction} transaction
     */
    fillOutTransaction(transaction) {
        if (this._freezeWithClient) {
            transaction.freezeWith(this._freezeWithClient);
        }
        if (this._signPrivateKey) {
            transaction.sign(this._signPrivateKey);
        } else if (this._signPublicKey && this._transactionSigner) {
            transaction.signWith(this._signPublicKey, this._transactionSigner);
        }
    }
    /**
     *
     * @param {Client} client
     * @returns
     */
    freezeWith(client) {
        this._freezeWithClient = client;
        return this;
    }

    /**
     * @param {Client} client
     * @returns {Promise<TransactionResponse>}
     */
    async execute(client) {
        const tokenRejectTxn = await new TokenRejectTransaction()
            .setTokenIds(this.tokenIds)
            .setNftIds(this.nftIds);

        if (this.ownerId) {
            tokenRejectTxn.setOwnerId(this.ownerId);
        }

        this.fillOutTransaction(tokenRejectTxn);

        // get token id of nft and remove duplicates
        const nftTokenIds = [
            ...new Set(this.nftIds.map((nftId) => nftId.tokenId)),
        ];
        const tokenDissociateTxn =
            await new TokenDissociateTransaction().setTokenIds([
                ...this.tokenIds,
                ...nftTokenIds,
            ]);

        if (this.ownerId != null) {
            tokenDissociateTxn.setAccountId(this.ownerId);
        }

        this.fillOutTransaction(tokenDissociateTxn);

        const tokenRejectResponse = await tokenRejectTxn.execute(client);
        await tokenRejectResponse.getReceipt(client);

        const tokenDissociateResponse =
            await tokenDissociateTxn.execute(client);
        await tokenDissociateResponse.getReceipt(client);

        return tokenRejectResponse;
    }

    requireNotFrozen() {
        if (this._freezeWithClient != null) {
            throw new Error(
                "Transaction is already frozen and cannot be modified",
            );
        }
    }
}
