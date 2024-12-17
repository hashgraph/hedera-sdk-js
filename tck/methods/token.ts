import {
    AccountId,
    CustomFixedFee,
    CustomFractionalFee,
    CustomRoyaltyFee,
    Timestamp,
    TokenCreateTransaction,
    TokenDeleteTransaction,
    TokenUpdateTransaction,
    TokenFeeScheduleUpdateTransaction,
    TokenAssociateTransaction,
    TokenPauseTransaction,
    TokenUnpauseTransaction,
    TokenDissociateTransaction,
    TokenFreezeTransaction,
    TokenUnfreezeTransaction,
    TokenGrantKycTransaction,
    TokenRevokeKycTransaction,
    TokenMintTransaction,
} from "@hashgraph/sdk";
import Long from "long";

import { sdk } from "../sdk_data";

import { DEFAULT_GRPC_DEADLINE } from "../utils/constants/config";
import { getKeyFromString } from "../utils/key";

import { applyCommonTransactionParams } from "../params/common-tx-params";
import {
    CreateTokenParams,
    DeleteTokenParams,
    UpdateTokenParams,
    UpdateTokenFeeScheduleParams,
    AssociateDisassociateTokenParams,
    PauseUnPauseTokenParams,
    FreezeUnfreezeTokenParams,
    GrantRevokeTokenKycParams,
    MintTokenParams,
} from "../params/token";

import { TokenResponse } from "../response/token";
import { supplyTypeMap, tokenTypeMap } from "../utils/constants/properties";

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
    autoRenewAccountId,
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
        transaction.setInitialSupply(Long.fromString(initialSupply));
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
        transaction.setExpirationTime(
            new Timestamp(Long.fromString(expirationTime), 0),
        );
    }

    if (autoRenewAccountId != null) {
        transaction.setAutoRenewAccountId(
            AccountId.fromString(autoRenewAccountId),
        );
    }

    if (autoRenewPeriod != null) {
        transaction.setAutoRenewPeriod(Long.fromString(autoRenewPeriod));
    }

    if (memo != null) {
        transaction.setTokenMemo(memo);
    }

    if (tokenType != null) {
        const selectedTokenType = tokenTypeMap[tokenType];
        if (selectedTokenType) {
            transaction.setTokenType(selectedTokenType);
        } else {
            throw new Error(`Invalid token type: ${tokenType}`);
        }
    }

    if (supplyType != null) {
        const selectedSupplyType = supplyTypeMap[supplyType];
        if (selectedSupplyType) {
            transaction.setSupplyType(selectedSupplyType);
        } else {
            throw new Error(`Invalid supply type: ${supplyType}`);
        }
    }

    if (maxSupply != null) {
        transaction.setMaxSupply(Long.fromString(maxSupply));
    }

    if (feeScheduleKey != null) {
        transaction.setFeeScheduleKey(getKeyFromString(feeScheduleKey));
    }

    if (customFees != null && customFees.length > 0) {
        let customFeeList = [];

        customFees.forEach((customFee: Record<string, any>) => {
            // Set fixed fees
            if (customFee.fixedFee) {
                let fixedFee = new CustomFixedFee()
                    .setAmount(Long.fromString(customFee.fixedFee.amount))
                    .setFeeCollectorAccountId(
                        AccountId.fromString(customFee.feeCollectorAccountId),
                    )
                    .setAllCollectorsAreExempt(customFee.feeCollectorsExempt)
                    .setDenominatingTokenId(
                        customFee.fixedFee.denominatingTokenId,
                    );

                customFeeList.push(fixedFee);
            }

            // Set fractional fees
            if (customFee.fractionalFee) {
                let fractionalFee = new CustomFractionalFee()
                    .setNumerator(
                        Long.fromString(customFee.fractionalFee.numerator),
                    )
                    .setDenominator(
                        Long.fromString(customFee.fractionalFee.denominator),
                    )
                    .setMin(
                        Long.fromString(customFee.fractionalFee.minimumAmount),
                    )
                    .setMax(
                        Long.fromString(customFee.fractionalFee.maximumAmount),
                    )
                    .setFeeCollectorAccountId(
                        AccountId.fromString(customFee.feeCollectorAccountId),
                    )
                    .setAllCollectorsAreExempt(customFee.feeCollectorsExempt);

                customFeeList.push(fractionalFee);
            }

            // Set royalty fees
            if (customFee.royaltyFee) {
                let royaltyFee = new CustomRoyaltyFee()
                    .setNumerator(
                        Long.fromString(customFee.royaltyFee.numerator),
                    )
                    .setDenominator(
                        Long.fromString(customFee.royaltyFee.denominator),
                    )
                    .setFeeCollectorAccountId(
                        AccountId.fromString(customFee.feeCollectorAccountId),
                    )
                    .setAllCollectorsAreExempt(customFee.feeCollectorsExempt);

                if (customFee.royaltyFee.fallbackFee) {
                    let fallbackFee = new CustomFixedFee()
                        .setAmount(
                            Long.fromString(
                                customFee.royaltyFee.fallbackFee.amount,
                            ),
                        )
                        .setDenominatingTokenId(
                            customFee.royaltyFee.fallbackFee
                                .denominatingTokenId,
                        );

                    royaltyFee.setFallbackFee(fallbackFee);
                }

                customFeeList.push(royaltyFee);
            }
        });

        transaction.setCustomFees(customFeeList);
    }

    if (pauseKey != null) {
        transaction.setPauseKey(getKeyFromString(pauseKey));
    }

    if (metadata != null) {
        transaction.setMetadata(Buffer.from(metadata, "utf8"));
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

export const updateToken = async ({
    tokenId,
    symbol,
    name,
    treasuryAccountId,
    adminKey,
    kycKey,
    freezeKey,
    wipeKey,
    supplyKey,
    autoRenewAccountId,
    autoRenewPeriod,
    expirationTime,
    memo,
    feeScheduleKey,
    pauseKey,
    metadata,
    metadataKey,
    commonTransactionParams,
}: UpdateTokenParams): Promise<TokenResponse> => {
    let transaction = new TokenUpdateTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

    if (tokenId != null) {
        transaction.setTokenId(tokenId);
    }

    if (symbol != null) {
        transaction.setTokenSymbol(symbol);
    }

    if (name != null) {
        transaction.setTokenName(name);
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

    if (autoRenewAccountId != null) {
        transaction.setAutoRenewAccountId(
            AccountId.fromString(autoRenewAccountId),
        );
    }

    if (autoRenewPeriod != null) {
        transaction.setAutoRenewPeriod(Long.fromString(autoRenewPeriod));
    }

    if (expirationTime != null) {
        transaction.setExpirationTime(new Date(Number(expirationTime) * 1000));
    }

    if (memo != null) {
        transaction.setTokenMemo(memo);
    }

    if (feeScheduleKey != null) {
        transaction.setFeeScheduleKey(getKeyFromString(feeScheduleKey));
    }

    if (pauseKey != null) {
        transaction.setPauseKey(getKeyFromString(pauseKey));
    }

    if (metadata != null) {
        transaction.setMetadata(Buffer.from(metadata, "utf8"));
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

export const updateTokenFeeSchedule = async ({
    tokenId,
    customFees,
    commonTransactionParams,
}: UpdateTokenFeeScheduleParams): Promise<TokenResponse> => {
    let transaction = new TokenFeeScheduleUpdateTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

    if (tokenId != null) {
        transaction.setTokenId(tokenId);
    }

    if (customFees != null && customFees.length > 0) {
        let customFeeList = [];

        customFees.forEach((customFee: Record<string, any>) => {
            // Set fixed fees
            if (customFee.fixedFee) {
                let fixedFee = new CustomFixedFee()
                    .setAmount(Long.fromString(customFee.fixedFee.amount))
                    .setFeeCollectorAccountId(
                        AccountId.fromString(customFee.feeCollectorAccountId),
                    )
                    .setAllCollectorsAreExempt(customFee.feeCollectorsExempt)
                    .setDenominatingTokenId(
                        customFee.fixedFee.denominatingTokenId,
                    );

                customFeeList.push(fixedFee);
            }

            // Set fractional fees
            if (customFee.fractionalFee) {
                let fractionalFee = new CustomFractionalFee()
                    .setNumerator(
                        Long.fromString(customFee.fractionalFee.numerator),
                    )
                    .setDenominator(
                        Long.fromString(customFee.fractionalFee.denominator),
                    )
                    .setMin(
                        Long.fromString(customFee.fractionalFee.minimumAmount),
                    )
                    .setMax(
                        Long.fromString(customFee.fractionalFee.maximumAmount),
                    )
                    .setFeeCollectorAccountId(
                        AccountId.fromString(customFee.feeCollectorAccountId),
                    )
                    .setAllCollectorsAreExempt(customFee.feeCollectorsExempt);

                customFeeList.push(fractionalFee);
            }

            // Set royalty fees
            if (customFee.royaltyFee) {
                let royaltyFee = new CustomRoyaltyFee()
                    .setNumerator(
                        Long.fromString(customFee.royaltyFee.numerator),
                    )
                    .setDenominator(
                        Long.fromString(customFee.royaltyFee.denominator),
                    )
                    .setFeeCollectorAccountId(
                        AccountId.fromString(customFee.feeCollectorAccountId),
                    )
                    .setAllCollectorsAreExempt(customFee.feeCollectorsExempt);

                if (customFee.royaltyFee.fallbackFee) {
                    console.log(customFee.royaltyFee.fallbackFee.amount);

                    let fallbackFee = new CustomFixedFee()
                        .setAmount(
                            Long.fromString(
                                customFee.royaltyFee.fallbackFee.amount,
                            ),
                        )
                        .setDenominatingTokenId(
                            customFee.royaltyFee.fallbackFee
                                .denominatingTokenId,
                        );

                    royaltyFee.setFallbackFee(fallbackFee);
                }

                customFeeList.push(royaltyFee);
            }
        });

        transaction.setCustomFees(customFeeList);
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

export const associateToken = async ({
    accountId,
    tokenIds,
    commonTransactionParams,
}: AssociateDisassociateTokenParams): Promise<TokenResponse> => {
    let transaction = new TokenAssociateTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

    if (accountId != null) {
        transaction.setAccountId(AccountId.fromString(accountId));
    }

    if (tokenIds != null) {
        transaction.setTokenIds(tokenIds);
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

export const dissociateToken = async ({
    accountId,
    tokenIds,
    commonTransactionParams,
}: AssociateDisassociateTokenParams): Promise<TokenResponse> => {
    let transaction = new TokenDissociateTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

    if (accountId != null) {
        transaction.setAccountId(AccountId.fromString(accountId));
    }

    if (tokenIds != null) {
        transaction.setTokenIds(tokenIds);
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

export const pauseToken = async ({
    tokenId,
    commonTransactionParams,
}: PauseUnPauseTokenParams): Promise<TokenResponse> => {
    const transaction = new TokenPauseTransaction().setGrpcDeadline(
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

export const unpauseToken = async ({
    tokenId,
    commonTransactionParams,
}: PauseUnPauseTokenParams): Promise<TokenResponse> => {
    const transaction = new TokenUnpauseTransaction().setGrpcDeadline(
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

export const freezeToken = async ({
    tokenId,
    accountId,
    commonTransactionParams,
}: FreezeUnfreezeTokenParams): Promise<TokenResponse> => {
    const transaction = new TokenFreezeTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

    if (tokenId != null) {
        transaction.setTokenId(tokenId);
    }

    if (accountId != null) {
        transaction.setAccountId(AccountId.fromString(accountId));
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

export const unfreezeToken = async ({
    tokenId,
    accountId,
    commonTransactionParams,
}: FreezeUnfreezeTokenParams): Promise<TokenResponse> => {
    const transaction = new TokenUnfreezeTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

    if (tokenId != null) {
        transaction.setTokenId(tokenId);
    }

    if (accountId != null) {
        transaction.setAccountId(AccountId.fromString(accountId));
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

export const grantTokenKyc = async ({
    tokenId,
    accountId,
    commonTransactionParams,
}: GrantRevokeTokenKycParams): Promise<TokenResponse> => {
    const transaction = new TokenGrantKycTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

    if (tokenId != null) {
        transaction.setTokenId(tokenId);
    }

    if (accountId != null) {
        transaction.setAccountId(AccountId.fromString(accountId));
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

export const revokeTokenKyc = async ({
    tokenId,
    accountId,
    commonTransactionParams,
}: GrantRevokeTokenKycParams): Promise<TokenResponse> => {
    const transaction = new TokenRevokeKycTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

    if (tokenId != null) {
        transaction.setTokenId(tokenId);
    }

    if (accountId != null) {
        transaction.setAccountId(AccountId.fromString(accountId));
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

export const mintToken = async ({
    tokenId,
    amount,
    metadata,
    commonTransactionParams,
}: MintTokenParams): Promise<TokenResponse> => {
    const transaction = new TokenMintTransaction().setGrpcDeadline(
        DEFAULT_GRPC_DEADLINE,
    );

    if (tokenId != null) {
        transaction.setTokenId(tokenId);
    }

    if (amount != null) {
        transaction.setAmount(Long.fromString(amount));
    }

    if (metadata != null) {
        transaction.setMetadata([Buffer.from(metadata[0], "utf8")]);
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
