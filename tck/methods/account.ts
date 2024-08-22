import {
    AccountCreateTransaction,
    Hbar,
    AccountId,
    TransactionResponse,
    TransactionReceipt,
} from "@hashgraph/sdk";

import { sdk } from "../sdk_data";
import { getKeyFromString } from "../utils/key";
import { applyCommonTransactionParams } from "../utils/common-tx-params";
import {
    CreateAccountParams,
    CreateAccountResponse,
} from "../models/account-methods";

export const createAccount = async ({
    key,
    initialBalance,
    receiverSignatureRequired,
    maxAutoTokenAssociations,
    commonTransactionParams,
    stakedAccountId,
    stakedNodeId,
    declineStakingReward,
    memo,
    autoRenewPeriod,
    alias,
}: CreateAccountParams): Promise<CreateAccountResponse> => {
    let transaction = new AccountCreateTransaction().setGrpcDeadline(30000);

    if (key != null) {
        transaction.setKey(getKeyFromString(key));
    }

    if (initialBalance != null) {
        transaction.setInitialBalance(Hbar.fromTinybars(initialBalance));
    }

    if (receiverSignatureRequired != null) {
        transaction.setReceiverSignatureRequired(receiverSignatureRequired);
    }

    if (maxAutoTokenAssociations != null) {
        transaction.setMaxAutomaticTokenAssociations(maxAutoTokenAssociations);
    }

    if (stakedAccountId != null) {
        const accountId = AccountId.fromString(stakedAccountId);

        transaction.setStakedAccountId(accountId);
    }

    if (stakedNodeId != null) {
        transaction.setStakedNodeId(stakedNodeId);
    }

    if (declineStakingReward != null) {
        transaction.setDeclineStakingReward(declineStakingReward);
    }

    if (memo != null) {
        transaction.setAccountMemo(memo);
    }

    if (autoRenewPeriod != null) {
        transaction.setAutoRenewPeriod(autoRenewPeriod);
    }

    if (alias != null) {
        transaction.setAlias(alias);
    }

    if (commonTransactionParams != null) {
        applyCommonTransactionParams(
            commonTransactionParams,
            transaction,
            sdk.getClient(),
        );
    }

    // Sign the transaction with the client operator private key if not already signed and submit to a Hedera network
    let txResponse: TransactionResponse;
    try {
        txResponse = await transaction.execute(sdk.getClient());
    } catch (error) {
        throw new Error(error);
    }

    // Get the receipt of the transaction
    let receipt: TransactionReceipt;
    try {
        receipt = await txResponse.getReceipt(sdk.getClient());
    } catch (error) {
        throw new Error(error);
    }

    return {
        accountId: receipt.accountId.toString(),
        status: receipt.status.toString(),
    };
};
