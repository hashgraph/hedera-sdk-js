import {
    AccountCreateTransaction,
    Hbar,
    AccountId,
    AccountUpdateTransaction,
    AccountDeleteTransaction,
    Timestamp,
    AccountAllowanceApproveTransaction,
    TokenId,
    NftId,
} from "@hashgraph/sdk";
import Long from "long";

import { sdk } from "../sdk_data";
import { AccountResponse } from "../response/account";

import { getKeyFromString } from "../utils/key";
import { DEFAULT_GRPC_DEADLINE } from "../utils/constants/config";

import {
    AccountAllowanceApproveParams,
    CreateAccountParams,
    DeleteAccountParams,
    UpdateAccountParams,
} from "../params/account";
import { applyCommonTransactionParams } from "../params/common-tx-params";
import { AllowanceParams } from "../params/allowance";

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
}: CreateAccountParams): Promise<AccountResponse> => {
    let transaction = new AccountCreateTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

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
        transaction.setStakedNodeId(Long.fromString(stakedNodeId));
    }

    if (declineStakingReward != null) {
        transaction.setDeclineStakingReward(declineStakingReward);
    }

    if (memo != null) {
        transaction.setAccountMemo(memo);
    }

    if (autoRenewPeriod != null) {
        transaction.setAutoRenewPeriod(Long.fromString(autoRenewPeriod));
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

    const txResponse = await transaction.execute(sdk.getClient());
    const receipt = await txResponse.getReceipt(sdk.getClient());

    return {
        accountId: receipt.accountId.toString(),
        status: receipt.status.toString(),
    };
};

export const updateAccount = async ({
    accountId,
    key,
    autoRenewPeriod,
    expirationTime,
    receiverSignatureRequired,
    memo,
    maxAutoTokenAssociations,
    stakedAccountId,
    stakedNodeId,
    declineStakingReward,
    commonTransactionParams,
}: UpdateAccountParams): Promise<AccountResponse> => {
    let transaction = new AccountUpdateTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

    if (accountId != null) {
        transaction.setAccountId(accountId);
    }

    if (key != null) {
        transaction.setKey(getKeyFromString(key));
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
        transaction.setStakedNodeId(Long.fromString(stakedNodeId));
    }

    if (expirationTime != null) {
        transaction.setExpirationTime(
            new Timestamp(Long.fromString(expirationTime), 0),
        );
    }

    if (declineStakingReward != null) {
        transaction.setDeclineStakingReward(declineStakingReward);
    }

    if (memo != null) {
        transaction.setAccountMemo(memo);
    }

    if (autoRenewPeriod != null) {
        transaction.setAutoRenewPeriod(Long.fromString(autoRenewPeriod));
    }

    if (commonTransactionParams != null) {
        applyCommonTransactionParams(
            commonTransactionParams,
            transaction,
            sdk.getClient(),
        );
    }

    const txResponse = await transaction.execute(sdk.getClient());
    const receipt = await txResponse.getReceipt(sdk.getClient());

    return {
        status: receipt.status.toString(),
    };
};

export const deleteAccount = async ({
    deleteAccountId,
    transferAccountId,
    commonTransactionParams,
}: DeleteAccountParams): Promise<AccountResponse> => {
    let transaction = new AccountDeleteTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

    if (deleteAccountId != null) {
        transaction.setAccountId(AccountId.fromString(deleteAccountId));
    }

    if (transferAccountId != null) {
        transaction.setTransferAccountId(
            AccountId.fromString(transferAccountId),
        );
    }

    if (commonTransactionParams != null) {
        applyCommonTransactionParams(
            commonTransactionParams,
            transaction,
            sdk.getClient(),
        );
    }

    const txResponse = await transaction.execute(sdk.getClient());
    const receipt = await txResponse.getReceipt(sdk.getClient());

    return {
        status: receipt.status.toString(),
    };
};

export const approveAllowance = async ({
    allowances,
    commonTransactionParams,
}: AccountAllowanceApproveParams): Promise<AccountResponse> => {
    const transaction = new AccountAllowanceApproveTransaction();
    transaction.setGrpcDeadline(DEFAULT_GRPC_DEADLINE);

    const allowance: AllowanceParams = allowances[0];
    const owner = AccountId.fromString(allowance.ownerAccountId);
    const spender = AccountId.fromString(allowance.spenderAccountId);

    if (allowance.hbar != null) {
        transaction.approveHbarAllowance(
            owner,
            spender,
            Hbar.fromTinybars(allowance.hbar.amount),
        );
    } else if (allowance.token != null) {
        transaction.approveTokenAllowance(
            TokenId.fromString(allowance.token.tokenId),
            owner,
            spender,
            Long.fromString(allowance.token.amount),
        );
    } else {
        if (allowance.nft?.serialNumbers != null) {
            for (const serialNumber of allowance.nft.serialNumbers) {
                transaction.approveTokenNftAllowance(
                    new NftId(
                        TokenId.fromString(allowance.nft?.tokenId),
                        Long.fromString(serialNumber),
                    ),
                    owner,
                    spender,
                );
            }
        } else {
            if (allowance.nft?.approveForAll != null) {
                transaction.approveTokenNftAllowanceAllSerials(
                    TokenId.fromString(allowance.nft?.tokenId),
                    owner,
                    spender,
                );
            } else {
                transaction.deleteTokenNftAllowanceAllSerials(
                    TokenId.fromString(allowance.nft?.tokenId),
                    owner,
                    spender,
                );
            }
        }
    }

    if (commonTransactionParams != null) {
        applyCommonTransactionParams(
            commonTransactionParams,
            transaction,
            sdk.getClient(),
        );
    }

    const txResponse = await transaction.execute(sdk.getClient());
    const receipt = await txResponse.getReceipt(sdk.getClient());

    return {
        status: receipt.status.toString(),
    };
};
