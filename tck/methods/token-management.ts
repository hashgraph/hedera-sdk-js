import {
    AccountId,
    TokenAssociateTransaction,
    TokenPauseTransaction,
    TokenUnpauseTransaction,
    TokenDissociateTransaction,
    TokenFreezeTransaction,
    TokenUnfreezeTransaction,
    TokenGrantKycTransaction,
    TokenRevokeKycTransaction,
    TokenMintTransaction,
    TokenBurnTransaction,
    Client,
    Transaction,
} from "@hashgraph/sdk";
import Long from "long";

import { sdk } from "../sdk_data";

import { DEFAULT_GRPC_DEADLINE } from "../utils/constants/config";

import { applyCommonTransactionParams } from "../params/common-tx-params";
import {
    AssociateDisassociateTokenParams,
    PauseUnPauseTokenParams,
    FreezeUnfreezeTokenParams,
    GrantRevokeTokenKycParams,
    BurnTokenParams,
    MintTokenParams,
} from "../params/token";

import {
    TokenBurnResponse,
    TokenMintResponse,
    TokenResponse,
} from "../response/token";

const executeTransaction = async (transaction: Transaction, client: Client) => {
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    return { status: receipt.status.toString() };
};

const configureTransaction = (
    transaction: any,
    params: any,
    client: Client,
) => {
    if (params.tokenId != null) {
        transaction.setTokenId(params.tokenId);
    }

    if (params.accountId != null && transaction.setAccountId) {
        transaction.setAccountId(AccountId.fromString(params.accountId));
    }

    if (params.tokenIds != null) {
        transaction.setTokenIds(params.tokenIds);
    }

    if (params.amount != null) {
        transaction.setAmount(Long.fromString(params.amount));
    }

    if (params.metadata != null) {
        const allMetadata = params.metadata.map((metadataValue: string) =>
            Buffer.from(metadataValue, "hex"),
        );
        transaction.setMetadata(allMetadata);
    }

    if (params.serialNumbers != null) {
        const allSerialNumbers = params.serialNumbers.map(
            (serialNumber: string) => Long.fromString(serialNumber),
        );
        transaction.setSerials(allSerialNumbers);
    }

    if (params.commonTransactionParams != null) {
        applyCommonTransactionParams(
            params.commonTransactionParams,
            transaction,
            client,
        );
    }

    transaction.setGrpcDeadline(DEFAULT_GRPC_DEADLINE);
};

export const associateToken = async (
    params: AssociateDisassociateTokenParams,
): Promise<TokenResponse> => {
    const transaction = new TokenAssociateTransaction();
    configureTransaction(transaction, params, sdk.getClient());

    return await executeTransaction(transaction, sdk.getClient());
};

export const dissociateToken = async (
    params: AssociateDisassociateTokenParams,
): Promise<TokenResponse> => {
    const transaction = new TokenDissociateTransaction();
    configureTransaction(transaction, params, sdk.getClient());

    return await executeTransaction(transaction, sdk.getClient());
};

export const pauseToken = async (
    params: PauseUnPauseTokenParams,
): Promise<TokenResponse> => {
    const transaction = new TokenPauseTransaction();
    configureTransaction(transaction, params, sdk.getClient());

    return await executeTransaction(transaction, sdk.getClient());
};

export const unpauseToken = async (
    params: PauseUnPauseTokenParams,
): Promise<TokenResponse> => {
    const transaction = new TokenUnpauseTransaction();
    configureTransaction(transaction, params, sdk.getClient());

    return await executeTransaction(transaction, sdk.getClient());
};

export const freezeToken = async (
    params: FreezeUnfreezeTokenParams,
): Promise<TokenResponse> => {
    const transaction = new TokenFreezeTransaction();
    configureTransaction(transaction, params, sdk.getClient());

    return await executeTransaction(transaction, sdk.getClient());
};

export const unfreezeToken = async (
    params: FreezeUnfreezeTokenParams,
): Promise<TokenResponse> => {
    const transaction = new TokenUnfreezeTransaction();
    configureTransaction(transaction, params, sdk.getClient());

    return await executeTransaction(transaction, sdk.getClient());
};

export const grantTokenKyc = async (
    params: GrantRevokeTokenKycParams,
): Promise<TokenResponse> => {
    const transaction = new TokenGrantKycTransaction();
    configureTransaction(transaction, params, sdk.getClient());
    const receipt = await executeTransaction(transaction, sdk.getClient());
    return { status: receipt.status.toString() };
};

export const revokeTokenKyc = async (
    params: GrantRevokeTokenKycParams,
): Promise<TokenResponse> => {
    const transaction = new TokenRevokeKycTransaction();
    configureTransaction(transaction, params, sdk.getClient());

    return await executeTransaction(transaction, sdk.getClient());
};

export const mintToken = async (
    params: MintTokenParams,
): Promise<TokenMintResponse> => {
    const transaction = new TokenMintTransaction();
    configureTransaction(transaction, params, sdk.getClient());

    const txResponse = await transaction.execute(sdk.getClient());
    const receipt = await txResponse.getReceipt(sdk.getClient());

    return {
        status: receipt.status.toString(),
        newTotalSupply: receipt.totalSupply.toString(),
        serialNumbers: receipt.serials.map((serial) => serial.toString()),
    };
};

export const burnToken = async (
    params: BurnTokenParams,
): Promise<TokenBurnResponse> => {
    const transaction = new TokenBurnTransaction();
    configureTransaction(transaction, params, sdk.getClient());

    const txResponse = await transaction.execute(sdk.getClient());
    const receipt = await txResponse.getReceipt(sdk.getClient());

    return {
        status: receipt.status.toString(),
        newTotalSupply: receipt.totalSupply.toString(),
    };
};
