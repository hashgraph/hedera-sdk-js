import { expect } from "chai";
import * as hashgraph from "@hashgraph/sdk";
// eslint-disable-next-line node/no-extraneous-import
import axios from "axios";

const instance = axios.create({
    baseURL: "http://127.0.0.1:5551/api/v1",
});

/**
 * @type {hashgraph.Transaction[]}
 */
const TRANSACTIONS = [
    // new hashgraph.AccountAllowanceApproveTransaction(),
    // new hashgraph.AccountAllowanceDeleteTransaction(),
    // new hashgraph.AccountCreateTransaction(),
    // new hashgraph.AccountDeleteTransaction(),
    // new hashgraph.AccountUpdateTransaction(),
    // new hashgraph.ContractCreateTransaction(),
    // new hashgraph.ContractDeleteTransaction(),
    // new hashgraph.ContractExecuteTransaction(),
    // new hashgraph.ContractUpdateTransaction(),
    // new hashgraph.EthereumTransaction(),
    // new hashgraph.FileAppendTransaction(),
    // new hashgraph.FileCreateTransaction(),
    // new hashgraph.FileDeleteTransaction(),
    // new hashgraph.FileUpdateTransaction(),
    // new hashgraph.FreezeTransaction(),
    // new hashgraph.LiveHashAddTransaction(),
    // new hashgraph.LiveHashDeleteTransaction(),
    // new hashgraph.ScheduleCreateTransaction(),
    // new hashgraph.ScheduleDeleteTransaction(),
    // new hashgraph.ScheduleSignTransaction(),
    // new hashgraph.SystemDeleteTransaction(),
    // new hashgraph.SystemUndeleteTransaction(),
    // new hashgraph.TokenAssociateTransaction(),
    // new hashgraph.TokenBurnTransaction(),
    // new hashgraph.TokenCreateTransaction(),
    // new hashgraph.TokenDeleteTransaction(),
    // new hashgraph.TokenDissociateTransaction(),
    // new hashgraph.TokenFeeScheduleUpdateTransaction(),
    // new hashgraph.TokenFreezeTransaction(),
    // new hashgraph.TokenGrantKycTransaction(),
    // new hashgraph.TokenMintTransaction(),
    // new hashgraph.TokenPauseTransaction(),
    // new hashgraph.TokenRevokeKycTransaction(),
    // new hashgraph.TokenUnfreezeTransaction(),
    // new hashgraph.TokenUnpauseTransaction(),
    // new hashgraph.TokenUpdateTransaction(),
    // new hashgraph.TokenWipeTransaction(),
    // new hashgraph.TopicCreateTransaction(),
    // new hashgraph.TopicDeleteTransaction(),
    // new hashgraph.TopicMessageSubmitTransaction(),
    // new hashgraph.TopicUpdateTransaction(),
    new hashgraph.TransferTransaction(),
];

/**
 * @type {hashgraph.Query<*>[]}
 */
const QUERIES = [
    // new hashgraph.AccountBalanceQuery(),
    // new hashgraph.AccountInfoQuery(),
    // new hashgraph.AccountRecordsQuery(),
    // new hashgraph.AccountStakersQuery(),
    // new hashgraph.ContractByteCodeQuery(),
    // new hashgraph.ContractCallQuery(),
    // new hashgraph.ContractInfoQuery(),
    // new hashgraph.FileContentsQuery(),
    // new hashgraph.FileInfoQuery(),
    // new hashgraph.LiveHashQuery(),
    // new hashgraph.NetworkVersionInfoQuery(),
    // new hashgraph.ScheduleInfoQuery(),
    // new hashgraph.TokenInfoQuery(),
    // new hashgraph.TokenNftInfoQuery(),
    // new hashgraph.TopicInfoQuery(),
    // new hashgraph.TransactionReceiptQuery(),
    // new hashgraph.TransactionRecordQuery(),
];

/**
 * @type {hashgraph.Executable<*, *, *>[]}
 */
const REQUESTS = [...TRANSACTIONS, ...QUERIES];

/**
 * @typedef {object} ExpectClause
 * @property {string} name
 * @property {boolean} condition
 * @property {?Error} error
 */

/**
 * @param {hashgraph.Signer} signer
 * @param {() => void} callback
 * @param {hashgraph.Transaction[]} transactions
 * @returns {TestDeclaration[]}
 */
function createTestFreezeWithSigner(signer, callback, transactions) {
    const tests = [];

    for (let i = 0; i < transactions.length; i++) {
        tests.push({
            name: `${transactions[i].constructor.name}: freezeWithSigner`,
            fn: async function () {
                const promise = transactions[i].freezeWithSigner(signer);
                callback();
                transactions[i] = await promise;

                const transaction = transactions[i];
                expect(transaction.nodeAccountIds).to.not.be.null;

                const nodeAccountIds = (
                    transaction.nodeAccountIds != null
                        ? transaction.nodeAccountIds
                        : []
                ).map((id) => id.toString());
                const expectedNodeAccountIds = Object.values(
                    signer.getNetwork()
                ).map((nodeAccountId) => nodeAccountId.toString());

                // This may seem backwards, but the goal is to check if each member of `nodeAccountIds`
                // exists within the entire network `expectedNodeAccountIds`. This could be a small subset
                // or the entire network
                expect(expectedNodeAccountIds).to.have.members(nodeAccountIds);

                const transactionId = transaction.transactionId;

                expect(transactionId).to.not.be.null;

                const accountId = /** @type {hashgraph.TransactionId} */ (
                    transactionId
                ).accountId;
                expect(accountId).to.not.be.null;
                expect(
                    /** @type {hashgraph.AccountId} */ (accountId).toString()
                ).to.be.equal(signer.getAccountId().toString());
            },
        });
    }

    return tests;
}

/**
 * @param {hashgraph.Signer} signer
 * @param {() => void} callback
 * @param {hashgraph.Transaction[]} transactions
 * @returns {TestDeclaration[]}
 */
function createTestSignWithSigner(signer, callback, transactions) {
    const tests = [];

    for (let i = 0; i < transactions.length; i++) {
        tests.push({
            name: `${transactions[i].constructor.name}: signWithSigner`,
            fn: async function () {
                const promise = transactions[i].signWithSigner(signer);
                callback();
                transactions[i] = await promise;

                const transaction = transactions[i];

                const signatures = await transaction.getSignaturesAsync();
                for (const [, nodeSignatures] of signatures) {
                    for (const [publicKey] of nodeSignatures) {
                        expect(publicKey.verifyTransaction(transaction)).to.be
                            .true;
                    }
                }

                const key =
                    signer.getAccountKey != null
                        ? signer.getAccountKey()
                        : null;
                if (key != null && key instanceof hashgraph.PublicKey) {
                    expect(key.verifyTransaction(transaction)).to.be.true;
                }
            },
        });
    }

    return tests;
}

/**
 * @template RequestT
 * @template ResponseT
 * @template OutputT
 * @param {hashgraph.Signer} signer
 * @param {() => void} callback
 * @param {hashgraph.Executable<RequestT, ResponseT, OutputT>[]} requests
 * @returns {TestDeclaration[]}
 */
function createTestExecuteWithSigner(signer, callback, requests) {
    const tests = [];

    for (const request of requests) {
        tests.push({
            name: `${request.constructor.name}: executeWithSigner`,
            fn: async function () {
                try {
                    const promise = request.executeWithSigner(signer);
                    callback();
                    const response = await promise;
                } catch (error) {
                    if (error instanceof hashgraph.StatusError) {
                        // Do nothing;
                    } else {
                        // Might be a good idea to expect this to not be error?
                        throw error;
                    }
                }

                if (request instanceof hashgraph.Transaction) {
                    expect(request.transactionId).to.not.be.null;
                    const transactionId =
                        /** @type {hashgraph.TransactionId} */ (
                            request.transactionId
                        );
                    expect(transactionId.accountId).to.not.be.null;
                    const accountId = /** @type {hashgraph.AccountId} */ (
                        transactionId.accountId
                    );
                    const validStart = /** @type {hashgraph.Timestamp} */ (
                        transactionId.validStart
                    );

                    const mirrorTransactionId = `${accountId.toString()}-${validStart
                        .toString()
                        .replace(".", "-")}`;

                    // eslint-disable-next-line no-constant-condition
                    for (let i = 0; i < 5; i++) {
                        try {
                            // 200 OK means we found our transaction on the mirror node
                            await instance.get(
                                `/transactions/${mirrorTransactionId}`
                            )

                            break;
                        } catch (error) {
                            if (
                                /** @type {Error} */ (error)
                                    .toString()
                                    .includes("404")
                            ) {
                                await new Promise((resolve) =>
                                    setTimeout(resolve, 2000)
                                );
                                continue;
                            } else {
                                throw error;
                            }
                        }
                    }
                }
            },
        });
    }

    return tests;
}

/**
 * @typedef {object} TestDeclaration
 * @property {string} name
 * @property {() => void | Promise<void>} fn
 */

/**
 * @param {hashgraph.Signer} signer
 * @param {() => void} callback
 * @returns {TestDeclaration[]}
 */
export function createTckTests(signer, callback) {
    const freezeWithSignerTests = createTestFreezeWithSigner(
        signer,
        callback,
        TRANSACTIONS
    );
    const signWithSignerTests = createTestSignWithSigner(
        signer,
        callback,
        TRANSACTIONS
    );

    const executeWithSignerTests = createTestExecuteWithSigner(
        signer,
        callback,
        REQUESTS
    );

    return [
        {
            name: "has signer set at global scope",
            fn: function () {
                expect(signer).to.be.not.undefined;
            },
        },
        {
            name: "is using local hedera network",
            fn: function () {
                const network = signer.getNetwork();

                expect(Object.keys(network).length).to.be.equal(1);
                expect(network["127.0.0.1:50211"].toString()).to.be.equal(
                    "0.0.3"
                );

                const mirrorNetwork = signer.getMirrorNetwork();
                expect(mirrorNetwork).to.deep.equal(["127.0.0.1:5600"]);
            },
        },
        ...freezeWithSignerTests,
        ...signWithSignerTests,
        ...executeWithSignerTests,
    ];
}
