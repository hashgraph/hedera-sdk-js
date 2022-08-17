import axios from "axios";
import * as hashgraph from "@hashgraph/sdk";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv);

ajv.addFormat("TransactionResponseJSON", {
    validate: (/** @type {string} */ data) =>
        typeof data !== "string" ||
        !hashgraph.TransactionResponse.isTransactionResponseJSON(data),
});

ajv.addFormat("Hex", {
    validate: (/** @type {string} */ data) =>
        typeof data !== "string" || Buffer.from(data, "hex").length !== 0,
});

ajv.addFormat("Error", {
    validate: (/** @type {string} */ data) =>
        typeof data === "string" ||
        (typeof data === "string" &&
            hashgraph.StatusError.isStatusErrorJSON(data)),
});

const validateResponse = ajv.compile({
    type: "object",
    properties: {
        response: { type: "string" },
        error: { type: "string", format: "Error" },
    },
    additionalProperties: false,
});

const instance = axios.create({
    baseURL: "http://127.0.0.1:3000/",
});

/**
 * @template RequestT
 * @template ResponseT
 * @template OutputT
 * @typedef {import("@hashgraph/sdk").Executable<RequestT, ResponseT, OutputT>} Executable<RequestT, ResponseT, OutputT>
 */

/**
 * @typedef {import("@hashgraph/sdk").Signer} Signer
 * @typedef {import("@hashgraph/sdk").Provider} Provider
 * @typedef {import("@hashgraph/sdk").TransactionResponseJSON} TransactionResponseJSON
 * @typedef {import("@hashgraph/sdk").Key} Key
 * @typedef {import("@hashgraph/sdk").SignerSignature} SignerSignature
 * @typedef {import("@hashgraph/sdk").TransactionRecord} TransactionRecord
 * @typedef {import("@hashgraph/sdk").StatusErrorJSON} StatusErrorJSON
 */

/**
 * @typedef {object} LocalProviderResponse
 * @property {string} response
 * @property {string | undefined} error
 */

/**
 * @typedef {object} CallResponse
 * @property {(string | StatusErrorJSON)=} error
 * @property {string=} response
 */

/**
 * @implements {Provider}
 */
export class SimpleRestProvider {
    /**
     * @param {hashgraph.LedgerId?} ledgerId
     * @param {{[key: string]: string}} network
     * @param {string[]} mirrorNetwork
     */
    constructor(ledgerId, network, mirrorNetwork) {
        this.ledgerId = ledgerId;
        this.network = network;
        this.mirrorNetwork = mirrorNetwork;
    }

    /**
     * @returns {hashgraph.LedgerId?}
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
     * @param {hashgraph.AccountId | string} accountId
     * @returns {Promise<hashgraph.AccountBalance>}
     */
    getAccountBalance(accountId) {
        return this.call(
            new hashgraph.AccountBalanceQuery().setAccountId(accountId)
        );
    }

    /**
     * @param {hashgraph.AccountId | string} accountId
     * @returns {Promise<hashgraph.AccountInfo>}
     */
    async getAccountInfo(accountId) {
        return this.call(
            new hashgraph.AccountInfoQuery().setAccountId(accountId)
        );
    }

    /**
     * @param {hashgraph.AccountId | string} accountId
     * @returns {Promise<hashgraph.TransactionRecord[]>}
     */
    getAccountRecords(accountId) {
        return this.call(
            new hashgraph.AccountRecordsQuery().setAccountId(accountId)
        );
    }

    /**
     * @param {hashgraph.TransactionId | string} transactionId
     * @returns {Promise<hashgraph.TransactionReceipt>}
     */
    getTransactionReceipt(transactionId) {
        return this.call(
            new hashgraph.TransactionReceiptQuery().setTransactionId(
                transactionId
            )
        );
    }

    /**
     * @param {hashgraph.TransactionResponse} response
     * @returns {Promise<hashgraph.TransactionReceipt>}
     */
    waitForReceipt(response) {
        return this.call(
            new hashgraph.TransactionReceiptQuery().setTransactionId(
                response.transactionId
            )
        );
    }

    /**
     * @template RequestT
     * @template ResponseT
     * @template OutputT
     * @param {Executable<RequestT, ResponseT, OutputT>} request
     * @returns {Promise<OutputT>}
     */
    async call(request) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const bytes = Buffer.from(request.toBytes()).toString("hex");

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let response = (
            await instance.post("/request", {
                type:
                    request instanceof hashgraph.Transaction
                        ? "Transaction"
                        : "Query",
                transaction:
                    request instanceof hashgraph.Transaction
                        ? bytes
                        : undefined,
                query:
                    request instanceof hashgraph.Transaction
                        ? undefined
                        : bytes,
            })
        ).data;

        if (!validateResponse(response)) {
            throw new Error(
                `Failed to validate response: ${JSON.stringify(
                    validateResponse.errors
                )}`
            );
        }

        const callResponse = /** @type {CallResponse} */ (response);

        if (callResponse.error != null) {
            throw hashgraph.StatusError.isStatusErrorJSON(callResponse.error)
                ? hashgraph.StatusError.fromJSON(callResponse.error)
                : new Error(callResponse.error);
        }

        return request._deserializeResponse(
            Buffer.from(/** @type {string} */ (callResponse.response), "hex")
        );
    }
}

/**
 * @implements {Signer}
 */
export class SimpleRestSigner {
    /**
     * @param {hashgraph.AccountId} accountId
     * @param {hashgraph.PublicKey} publicKey
     * @param {Provider} provider
     */
    constructor(accountId, publicKey, provider) {
        this.accountId = accountId;
        this.publicKey = publicKey;
        this.provider = provider;
    }

    /**
     * @param {(hashgraph.AccountId | string)=} accountId
     * @returns {Promise<SimpleRestSigner>}
     */
    static async connect(accountId) {
        /**
         * @type {{ accountId: string, publicKey: string, ledgerId: string, network: {[key: string]: string}, mirrorNetwork: string[], error: string | undefined }}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response = (
            await instance.post("/login", {
                accountId: accountId != null ? accountId.toString() : null,
            })
        ).data;

        if (response.error != null) {
            throw new Error(response.error);
        }

        const id = hashgraph.AccountId.fromString(response.accountId);
        const publicKey = hashgraph.PublicKey.fromString(response.publicKey);
        const ledgerId = hashgraph.LedgerId.fromString(response.ledgerId);
        const provider = new SimpleRestProvider(
            ledgerId,
            response.network,
            response.mirrorNetwork
        );

        return new SimpleRestSigner(id, publicKey, provider);
    }

    /**
     * @returns {Provider=}
     */
    getProvider() {
        return this.provider;
    }

    /**
     * @abstract
     * @returns {hashgraph.AccountId}
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
     * @returns {hashgraph.LedgerId?}
     */
    getLedgerId() {
        return this.provider == null ? null : this.provider.getLedgerId();
    }

    /**
     * @abstract
     * @returns {{[key: string]: (string | hashgraph.AccountId)}}
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sign(messages) {
        return Promise.reject(new Error("not implemented"));
    }

    /**
     * @returns {Promise<hashgraph.AccountBalance>}
     */
    getAccountBalance() {
        return this.call(
            new hashgraph.AccountBalanceQuery().setAccountId(this.accountId)
        );
    }

    /**
     * @abstract
     * @returns {Promise<hashgraph.AccountInfo>}
     */
    getAccountInfo() {
        return this.call(
            new hashgraph.AccountInfoQuery().setAccountId(this.accountId)
        );
    }

    /**
     * @abstract
     * @returns {Promise<TransactionRecord[]>}
     */
    getAccountRecords() {
        return this.call(
            new hashgraph.AccountRecordsQuery().setAccountId(this.accountId)
        );
    }

    /**
     * @template {hashgraph.Transaction} T
     * @param {T} transaction
     * @returns {Promise<T>}
     */
    async signTransaction(transaction) {
        /** @type {LocalProviderResponse} */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response = (
            await instance.post("/sign", {
                request: Buffer.from(transaction.toBytes()).toString("hex"),
            })
        ).data;

        if (Object.prototype.hasOwnProperty.call(response, "error")) {
            throw new Error(/** @type {{ error: string }} */ (response).error);
        }

        return /** @type {T} */ (
            hashgraph.Transaction.fromBytes(
                Buffer.from(response.response, "hex")
            )
        );
    }

    /**
     * @template {hashgraph.Transaction} T
     * @param {T} transaction
     * @returns {Promise<T>}
     */
    checkTransaction(transaction) {
        const transactionId = transaction.transactionId;
        if (
            transactionId != null &&
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
     * @template {hashgraph.Transaction} T
     * @param {T} transaction
     * @returns {Promise<T>}
     */
    populateTransaction(transaction) {
        transaction.setTransactionId(
            hashgraph.TransactionId.generate(this.accountId)
        );
        const network = Object.values(this.provider.getNetwork()).map(
            (nodeAccountId) =>
                typeof nodeAccountId === "string"
                    ? hashgraph.AccountId.fromString(nodeAccountId)
                    : new hashgraph.AccountId(nodeAccountId)
        );
        transaction.setNodeAccountIds(network);
        return Promise.resolve(transaction);
    }

    /**
     * @template RequestT
     * @template ResponseT
     * @template OutputT
     * @param {Executable<RequestT, ResponseT, OutputT>} request
     * @returns {Promise<OutputT>}
     */
    call(request) {
        if (this.provider == null) {
            throw new Error(
                "cannot send request with an wallet that doesn't contain a provider"
            );
        }

        return this.provider.call(request);
    }
}

/**
 *
 */
async function main() {
    const signer = await SimpleRestSigner.connect();

    // Free query
    const balance = await signer.getAccountBalance();
    console.log(`balance: ${balance.hbars.toString()}`);

    // Paid query
    const info = await signer.getAccountInfo();
    console.log(`key: ${info.key.toString()}`);

    // Transaction
    const transaction = await new hashgraph.TransferTransaction()
        .addHbarTransfer("0.0.3", hashgraph.Hbar.fromTinybars(1))
        .addHbarTransfer(
            signer.accountId,
            hashgraph.Hbar.fromTinybars(1).negated()
        )
        .freezeWithSigner(signer);
    const response = await transaction.executeWithSigner(signer);
    const hash = Buffer.from(response.transactionHash).toString("hex");
    console.log(`hash: ${hash}`);
}

void main();
