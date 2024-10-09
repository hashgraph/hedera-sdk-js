import {
    AccountId,
    TokenCreateTransaction,
    TokenDeleteTransaction,
    TokenSupplyType,
    TokenType,
} from "@hashgraph/sdk";

import { sdk } from "../sdk_data";

import { DEFAULT_GRPC_DEADLINE } from "../utils/constants/config";
import { getKeyFromString } from "../utils/key";

import { applyCommonTransactionParams } from "../params/common-tx-params";
import { CreateTokenParams, DeleteTokenParams } from "../params/token";

import { TokenResponse } from "../response/token";

export const createToken = async ({
    name,
    symbol,
    decimals,
    initialSupply,
    treasuryAccountId,
    adminKey,
    kycKey,
    freezeKey,
    wipeKey,
    supplyKey,
    freezeDefault,
    expirationTime,
    autoRenewPeriod,
    memo,
    tokenType,
    supplyType,
    maxSupply,
    feeScheduleKey,
    customFees,
    pauseKey,
    metadata,
    metadataKey,
    commonTransactionParams,
}: CreateTokenParams): Promise<TokenResponse> => {
    let transaction = new TokenCreateTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

    if (name != null) {
        transaction.setTokenName(name);
    }

    if (symbol != null) {
        transaction.setTokenSymbol(symbol);
    }

    if (decimals != null) {
        transaction.setDecimals(decimals);
    }

    if (initialSupply != null) {
        transaction.setInitialSupply(initialSupply);
    }

    if (treasuryAccountId != null) {
        transaction.setTreasuryAccountId(
            AccountId.fromString(treasuryAccountId),
        );
    }

    if (adminKey != null) {
        transaction.setAdminKey(getKeyFromString(adminKey));
    }

    if (kycKey != null) {
        transaction.setKycKey(getKeyFromString(kycKey));
    }

    if (freezeKey != null) {
        transaction.setFreezeKey(getKeyFromString(freezeKey));
    }

    if (wipeKey != null) {
        transaction.setWipeKey(getKeyFromString(wipeKey));
    }

    if (supplyKey != null) {
        transaction.setSupplyKey(getKeyFromString(supplyKey));
    }

    if (freezeDefault != null) {
        transaction.setFreezeDefault(freezeDefault);
    }

    if (expirationTime != null) {
        const expirationTimeInSeconds = new Date(expirationTime * 1000);
        transaction.setExpirationTime(expirationTimeInSeconds);
    }

    if (autoRenewPeriod != null) {
        transaction.setAutoRenewPeriod(autoRenewPeriod);
    }

    if (memo != null) {
        transaction.setTokenMemo(memo);
    }

    if (tokenType != null) {
        transaction.setTokenType(TokenType[tokenType]);
    }

    if (supplyType != null) {
        transaction.setSupplyType(TokenSupplyType[supplyType]);
    }

    if (maxSupply != null) {
        transaction.setMaxSupply(maxSupply);
    }

    if (feeScheduleKey != null) {
        transaction.setFeeScheduleKey(getKeyFromString(feeScheduleKey));
    }

    if (customFees != null && customFees.length > 0) {
        transaction.setCustomFees(customFees);
    }

    if (pauseKey != null) {
        transaction.setPauseKey(getKeyFromString(pauseKey));
    }

    if (metadata != null) {
        transaction.setMetadata(Buffer.from(metadata, "hex"));
    }

    if (metadataKey != null) {
        transaction.setMetadataKey(getKeyFromString(metadataKey));
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
        tokenId: receipt.tokenId.toString(),
        status: receipt.status.toString(),
    };
};

export const deleteToken = async ({
    tokenId,
    commonTransactionParams,
}: DeleteTokenParams): Promise<TokenResponse> => {
    let transaction = new TokenDeleteTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

    if (tokenId != null) {
        transaction.setTokenId(tokenId);
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
