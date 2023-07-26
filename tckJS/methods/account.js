const {
    AccountInfoQuery,
    AccountCreateTransaction,
    PublicKey,
    Hbar,
    AccountUpdateTransaction,
    AccountDeleteTransaction,
    TransferTransaction,
    PrivateKey
} = require("@hashgraph/sdk");
const {sdk} = require("../sdk_data");
const LosslessJSON = require('lossless-json');

module.exports = {
    createAccountFromAlias: async ({
                                       operator_id,
                                       aliasAccountId,
                                       initialBalance
                                   }) => {
        //Create the transfer to an alias account
        const alias_id = JSON.parse(aliasAccountId)
        const response = await new TransferTransaction()
            .addHbarTransfer(operator_id, new Hbar(initialBalance).negated())
            .addHbarTransfer(alias_id, new Hbar(initialBalance))
            .execute(sdk.getClient())
        return await response.getReceipt(sdk.getClient())
    },

    /**
     * Create account
     *
     * @param publicKey required
     * @param initialBalance optional
     * @param receiverSignatureRequired optional
     * @param maxAutomaticTokenAssociations optional
     * @param stakedAccountId optional
     * @param stakedNodeId optional
     * @param declineStakingReward optional
     * @param accountMemo optional
     * @param privateKey optional (used for signing)
     * @param autoRenewPeriod optional
     * @returns {Promise<any>}
     */
    createAccount: async ({
                              publicKey,
                              initialBalance,
                              receiverSignatureRequired,
                              maxAutomaticTokenAssociations,
                              stakedAccountId,
                              stakedNodeId,
                              declineStakingReward,
                              accountMemo,
                              privateKey,
                              autoRenewPeriod
                          }) => {
        //Create the transaction
        let transaction = new AccountCreateTransaction();

        if (publicKey != null) transaction.setKey(PublicKey.fromString(publicKey))
        if (initialBalance != null) transaction.setInitialBalance(Hbar.fromTinybars(LosslessJSON.parse('{"long":' + initialBalance + '}').long))
        if (receiverSignatureRequired != null) transaction.setReceiverSignatureRequired(receiverSignatureRequired)
        if (maxAutomaticTokenAssociations != null) transaction.setMaxAutomaticTokenAssociations(maxAutomaticTokenAssociations)
        if (stakedAccountId != null) transaction.setStakedAccountId(stakedAccountId)
        if (stakedNodeId != null) transaction.setStakedNodeId(stakedNodeId)
        if (declineStakingReward != null) transaction.setDeclineStakingReward(declineStakingReward)
        if (accountMemo != null) transaction.setAccountMemo(accountMemo)
        if (autoRenewPeriod != null) transaction.setAutoRenewPeriod(autoRenewPeriod)
        if (privateKey != null) {
            //Sign the transaction with the private key
            transaction.freezeWith(sdk.getClient())
            transaction = await transaction.sign(PrivateKey.fromString(privateKey));
        }
        //Sign the transaction with the client operator private key if not already signed and submit to a Hedera network
        const txResponse = await transaction.execute(sdk.getClient());
        //Get the receipt of the transaction
        let receipt = await txResponse.getReceipt(sdk.getClient());
        return {
            accountId: receipt.accountId.toString(),
            status: receipt.status.toString()
        }
    },
    getAccountInfo: async ({accountId}) => {
        //Create the account info query
        const query = new AccountInfoQuery().setAccountId(accountId);
        //Sign with client operator private key and submit the query to a Hedera network and return account info
        let accountInfo = await query.execute(sdk.getClient());
        // return only basic account info (keeps parity with java rpc)
        return {
            accountId: accountInfo.accountId,
            balance: accountInfo.balance.toString(),
            key: accountInfo.key,
            accountMemo: accountInfo.accountMemo,
            maxAutomaticTokenAssociations: accountInfo.maxAutomaticTokenAssociations,
            autoRenewPeriod: accountInfo.autoRenewPeriod
        }
    },
    updateAccountKey: async ({accountId, newPublicKey, oldPrivateKey, newPrivateKey}) => {
        // update the key on the account
        // Create the transaction to replace the key on the account
        const transaction = new AccountUpdateTransaction()
            .setAccountId(accountId)
            .setKey(PublicKey.fromString(newPublicKey))
            .freezeWith(sdk.getClient());

        //Sign the transaction with the old key and new key
        const signTx = await (await transaction
            .sign(PrivateKey.fromString(oldPrivateKey)))
            .sign(PrivateKey.fromString(newPrivateKey));

        // Sign the transaction with the client operator private key and submit to a Hedera network
        const txResponse = await signTx.execute(sdk.getClient());
        //Request the receipt of the transaction
        const receipt = await txResponse.getReceipt(sdk.getClient());
        //Get the transaction consensus status
        return {
            status: receipt.status.toString()
        };
    },
    updateAccountMemo: async ({accountId, key, memo}) => {

        // update the account memo field
        // Create the transaction to update the memo on the account
        const transaction = new AccountUpdateTransaction()
            .setAccountId(accountId)
            .setAccountMemo(memo)
            .freezeWith(sdk.getClient());

        //Sign the transaction with key
        const signTx = await (transaction.sign(PrivateKey.fromString(key)));
        // Sign the transaction with the client operator private key and submit to a Hedera network
        const txResponse = await signTx.execute(sdk.getClient());
        //Request the receipt of the transaction
        const receipt = await txResponse.getReceipt(sdk.getClient());
        //Get the transaction consensus status
        return {
            status: receipt.status.toString()
        };
    },
    deleteAccount: async ({accountId, accountKey, recipientId}) => {
        const transaction = await new AccountDeleteTransaction()
            .setAccountId(accountId)
            .setTransferAccountId(recipientId)
            .freezeWith(sdk.getClient());

        //Sign the transaction with the account key
        const signTx = await transaction.sign(PrivateKey.fromString(accountKey));
        //Sign with the client operator private key and submit to a Hedera network
        const txResponse = await signTx.execute(sdk.getClient());
        //Request the receipt of the transaction and get consensus status
        const receipt = await txResponse.getReceipt(sdk.getClient());
        return {
            status: receipt.status.toString()
        };
    }
};
