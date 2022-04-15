import axios from "axios";
import {
    AccountBalance,
    AccountInfo,
    AccountInfoQuery,
    AccountBalanceQuery,
    AccountRecordsQuery,
    Executable,
    LedgerId,
    SignerSignature,
    AccountId,
    TransactionId,
    TransactionReceipt,
    TransactionResponse,
    PublicKey,
    Key,
    Transaction,
    TransactionRecord,
} from "@hashgraph/sdk";

/**
 * @typedef {import("@hashgraph/sdk").Signer} Signer
 * @typedef {import("@hashgraph/sdk").Provider} Provider
 * @typedef {import("@hashgraph/sdk").TransactionResponseJSON} TransactionResponseJSON
 */

/**
 * @typedef {object} LocalProviderResponse
 * @property {string} response
 */

/**
 * @implements {Provider}
 */
export class LocalProvider {
    /**
     * @param {LedgerId?} ledgerId
     * @param {{[key: string]: string}} network
     * @param {string[]} mirrorNetwork
     */
    constructor(ledgerId, network, mirrorNetwork) {
        this.ledgerId = ledgerId;
        this.network = network;
        this.mirrorNetwork = mirrorNetwork;
    }

    /**
     * @returns {LedgerId?}
     */
    getLedgerId() {
        return this.ledgerId;
    }

    /**
     * @returns {{[key: string]: string}}
     */
    getNetwork() {
        return this.network;
    }

    /**
     * @returns {string[]}
     */
    getMirrorNetwork() {
        return this.mirrorNetwork;
    }

    /**
     * @param {AccountId | string} accountId
     * @returns {Promise<AccountBalance>}
     */
    async getAccountBalance(accountId) {
        /** @type {LocalProviderResponse} */
        const response = await axios.post("/account/balance", {
            accountId: accountId.toString(),
        });
        return AccountBalance.fromBytes(Buffer.from(response.response));
    }

    /**
     * @param {AccountId | string} accountId
     * @returns {Promise<AccountInfo>}
     */
    getAccountInfo(accountId) {
        throw new Error("not implemented");
    }

    /**
     * @param {AccountId | string} accountId
     * @returns {Promise<TransactionRecord[]>}
     */
    getAccountRecords(accountId) {
        throw new Error("not implemented");
    }

    /**
     * @param {TransactionId | string} transactionId
     * @returns {Promise<TransactionReceipt>}
     */
    getTransactionReceipt(transactionId) {
        throw new Error("not implemented");
    }

    /**
     * @param {TransactionResponse} response
     * @returns {Promise<TransactionReceipt>}
     */
    waitForReceipt(response) {
        throw new Error("not implemented");
    }

    /**
     * @template RequestT
     * @template ResponseT
     * @template OutputT
     * @param {Executable<RequestT, ResponseT, OutputT>} request
     * @returns {Promise<OutputT>}
     */
    async sendRequest(request) {
        const body = JSON.stringify({
            request: Buffer.from(request.toBytes()).toString("hex"),
        });
        /** @type {{ response: string } | TransactionResponseJSON} */
        const response = await axios.post("/request", { method: "POST", body });

        if (Object.prototype.hasOwnProperty.call(response, "response")) {
            const inner = /** @type {{response: string}} */ (response).response;
            const bytes = Buffer.from(inner, "hex");

            switch (request.constructor.name) {
                case "AccountBalanceQuery":
                    // @ts-ignore
                    return AccountBalance.fromBytes(bytes);
                case "AccountInfoQuery":
                    // @ts-ignore
                    return AccountInfo.fromBytes(bytes);
                case "TransactionReceipt":
                    // @ts-ignore
                    return TransactionReceipt.fromBytes(bytes);
                default:
                    throw new Error(
                        `unrecognzied request time ${request.constructor.name}`
                    );
            }
        } else {
            // @ts-ignore
            return TransactionResponse.fromJSON(response);
        }
    }
}

/**
 * @implements {Signer}
 */
export class LocalSigner {
    /**
     * @param {AccountId} accountId
     * @param {PublicKey} publicKey
     * @param {Provider} provider
     */
    constructor(accountId, publicKey, provider) {
        this.accountId = accountId;
        this.publicKey = publicKey;
        this.provider = provider;
    }

    /**
     * @param {AccountId | string | undefined} accountId
     * @returns {Promise<LocalSigner>}
     */
    static async connect(accountId) {
        /**
         * @type {{ accountId: string, publicKey: string, ledgerId: string, network: {[key: string]: string}, mirrorNetwork: string[], error: string | undefined }}
         */
        const response = await axios.post("/login", {
            accountId: accountId != null ? accountId.toString() : null,
        });

        if (response.error != null) {
            throw new Error(response.error);
        }

        const id = AccountId.fromString(response.accountId);
        const publicKey = PublicKey.fromString(response.publicKey);
        const ledgerId = LedgerId.fromString(response.ledgerId);
        const provider = new LocalProvider(
            ledgerId,
            response.network,
            response.mirrorNetwork
        );

        return new LocalSigner(id, publicKey, provider);
    }

    /**
     * @returns {Provider=}
     */
    getProvider() {
        return this.provider;
    }

    /**
     * @abstract
     * @returns {AccountId}
     */
    getAccountId() {
        return this.accountId;
    }

    /**
     * @returns {Key}
     */
    getAccountKey() {
        return this.publicKey;
    }

    /**
     * @returns {LedgerId?}
     */
    getLedgerId() {
        return this.provider == null ? null : this.provider.getLedgerId();
    }

    /**
     * @abstract
     * @returns {{[key: string]: (string | AccountId)}}
     */
    getNetwork() {
        return this.provider == null ? {} : this.provider.getNetwork();
    }

    /**
     * @abstract
     * @returns {string[]}
     */
    getMirrorNetwork() {
        return this.provider == null ? [] : this.provider.getMirrorNetwork();
    }

    /**
     * @param {Uint8Array[]} messages
     * @returns {Promise<SignerSignature[]>}
     */
    sign(messages) {
        throw new Error("not implemented");
    }

    /**
     * @returns {Promise<AccountBalance>}
     */
    getAccountBalance() {
        return this.sendRequest(
            new AccountBalanceQuery().setAccountId(this.accountId)
        );
    }

    /**
     * @abstract
     * @returns {Promise<AccountInfo>}
     */
    getAccountInfo() {
        return this.sendRequest(
            new AccountInfoQuery().setAccountId(this.accountId)
        );
    }

    /**
     * @abstract
     * @returns {Promise<TransactionRecord[]>}
     */
    getAccountRecords() {
        return this.sendRequest(
            new AccountRecordsQuery().setAccountId(this.accountId)
        );
    }

    /**
     * @param {Transaction} transaction
     * @returns {Promise<Transaction>}
     */
    async signTransaction(transaction) {
        /** @type {LocalProviderResponse} */
        const response = await axios.post("/sign", {
            transaction: Buffer.from(transaction.toBytes()).toString("hex"),
        });
        return Transaction.fromBytes(Buffer.from(response.response, "hex"));
    }

    /**
     * @param {Transaction} transaction
     * @returns {Promise<Transaction>}
     */
    checkTransaction(transaction) {
        const transactionId = transaction.transactionId;
        if (
            transactionId.accountId != null &&
            transactionId.accountId.compare(this.accountId) != 0
        ) {
            throw new Error(
                "transaction's ID constructed with a different account ID"
            );
        }

        if (this.provider == null) {
            return Promise.resolve(transaction);
        }

        const nodeAccountIds = (
            transaction.nodeAccountIds != null ? transaction.nodeAccountIds : []
        ).map((nodeAccountId) => nodeAccountId.toString());
        const network = Object.values(this.provider.getNetwork()).map(
            (nodeAccountId) => nodeAccountId.toString()
        );

        if (
            !nodeAccountIds.reduce(
                (previous, current) => previous && network.includes(current),
                true
            )
        ) {
            throw new Error(
                "Transaction already set node account IDs to values not within the current network"
            );
        }

        return Promise.resolve(transaction);
    }

    /**
     * @param {Transaction} transaction
     * @returns {Promise<Transaction>}
     */
    populateTransaction(transaction) {
        throw new Error("not implemented");
    }

    /**
     * @template RequestT
     * @template ResponseT
     * @template OutputT
     * @param {Executable<RequestT, ResponseT, OutputT>} request
     * @returns {Promise<OutputT>}
     */
    sendRequest(request) {
        if (this.provider == null) {
            throw new Error(
                "cannot send request with an wallet that doesn't contain a provider"
            );
        }

        return this.provider.sendRequest(request);
    }
}
