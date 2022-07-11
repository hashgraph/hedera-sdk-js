import * as hashgraph from "@hashgraph/sdk";

/**
 * @type {hashgraph.Transaction[]}
 */
const TRANSACTIONS = [
    new hashgraph.AccountAllowanceApproveTransaction(),
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
    // new hashgraph.TransferTransaction(),
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
 * @param {hashgraph.Transaction[]} transactions
 * @param {ExpectClause[]} expects
 * @param {() => void} callback
 */
async function testFreezeWithSigner(signer, transactions, expects, callback) {
    for (let i = 0; i < transactions.length; i++) {
        const promise = transactions[i].freezeWithSigner(signer);
        callback();
        transactions[i] = await promise;
    }

    for (const transaction of transactions) {
        /** @type {boolean} */
        let condition =
            transaction.nodeAccountIds != null &&
            transaction.nodeAccountIds.length !== 0;

        const nodeAccountIds = (
            transaction.nodeAccountIds != null ? transaction.nodeAccountIds : []
        ).map((/** @type {hashgraph.AccountId | string} */ nodeAccountId) =>
            nodeAccountId.toString()
        );
        const network = Object.values(signer.getNetwork()).map(
            (nodeAccountId) => nodeAccountId.toString()
        );

        condition =
            condition &&
            nodeAccountIds.reduce(
                (
                    /** @type {boolean} */ previous,
                    /** @type {string} */ current
                ) => previous && network.includes(current),
                true
            );

        expects.push({
            name: `${transaction.constructor.name}.nodeAccountIds should be set`,
            condition,
            error: null,
        });

        condition = transaction.transactionId != null;
        expects.push({
            name: `${transaction.constructor.name}.transactionId should be set`,
            condition,
            error: null,
        });

        if (transaction.transactionId == null) {
            continue;
        }

        condition = transaction.transactionId.accountId != null;
        expects.push({
            name: `${transaction.constructor.name}.transactionId.accountId should be set`,
            condition,
            error: null,
        });

        if (transaction.transactionId.accountId == null) {
            continue;
        }

        expects.push({
            name: `${transaction.constructor.name}.transactionId should be set to same value as signer`,
            condition:
                transaction.transactionId.accountId.toString() ===
                signer.getAccountId().toString(),
            error: null,
        });
    }
}

/**
 * @param {hashgraph.Signer} signer
 * @param {hashgraph.Transaction[]} transactions
 * @param {ExpectClause[]} expects
 * @param {() => void} callback
 */
async function testSignWithSigner(signer, transactions, expects, callback) {
    for (let i = 0; i < transactions.length; i++) {
        const promise = transactions[i].signWithSigner(signer);
        callback();
        transactions[i] = await promise;
    }

    outer: for (const transaction of transactions) {
        const signatures = await transaction.getSignaturesAsync();
        for (const [, nodeSignatures] of signatures) {
            let condition = true;
            for (const [publicKey] of nodeSignatures) {
                condition =
                    condition && publicKey.verifyTransaction(transaction);
                if (!condition) {
                    expects.push({
                        name: `${transaction.constructor.name}: All signatures should verify`,
                        condition,
                        error: null,
                    });
                    break outer;
                }
            }
        }
    }
}

/**
 * @template RequestT
 * @template ResponseT
 * @template OutputT
 * @param {hashgraph.Signer} signer
 * @param {hashgraph.Executable<RequestT, ResponseT, OutputT>[]} requests
 * @param {ExpectClause[]} expects
 * @param {() => void} callback
 */
async function testExecuteWithSigner(signer, requests, expects, callback) {
    for (const request of requests) {
        let condition = true;
        /** @type {?Error} */
        let error = null;
        try {
            const promise = request.executeWithSigner(signer);
            callback();
            await promise;
        } catch (err) {
            if (typeof err === "string") {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const e = /** @type {Error} */ (
                    JSON.parse(/** @type {string} */ (err))
                );
                // A status error indicates we've hit an actual network
                condition = /** @type {Error} */ (e).name === "StatusError";
                error = /** @type {Error} */ (e);
            }
        }

        expects.push({
            name: `${request.constructor.name}: can execute request`,
            condition,
            error,
        });
    }
}

/**
 * @param {hashgraph.Signer} signer
 * @param {() => void} callback
 * @returns {Promise<ExpectClause[]>}
 */
export async function test(signer, callback) {
    /** @type {ExpectClause[]} */
    const expects = [];

    try {
        await testFreezeWithSigner(signer, TRANSACTIONS, expects, callback);
        await testSignWithSigner(signer, TRANSACTIONS, expects, callback);
        await testExecuteWithSigner(signer, REQUESTS, expects, callback);
    } catch (err) {
        expects.push({
            name: /** @type {Error} */ (err).toString(),
            condition: false,
            error: /** @type {Error} */ (err),
        });
    }

    return expects;
}
