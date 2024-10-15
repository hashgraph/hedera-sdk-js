import {
    AccountId,
    CustomFee,
    CustomFixedFee,
    CustomFractionalFee,
    CustomRoyaltyFee,
    Timestamp,
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

import Long from "long";

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
        transaction.setExpirationTime(new Date(Number(expirationTime) * 1000));
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
        if (tokenType === "ft") {
            transaction.setTokenType(TokenType.FungibleCommon);
        } else if (tokenType === "nft") {
            transaction.setTokenType(TokenType.NonFungibleUnique);
        } else {
            throw new Error(`Invalid token type: ${tokenType}`);
        }
    }

    if (supplyType != null) {
        if (supplyType === "finite") {
            transaction.setSupplyType(TokenSupplyType.Finite);
        } else if (supplyType === "infinite") {
            transaction.setSupplyType(TokenSupplyType.Infinite);
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
                    .setAllCollectorsAreExempt(customFee.feeCollectorsExempt);

                fixedFee.setDenominatingTokenId(
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
                    let fallbackFee = new CustomFixedFee().setAmount(
                        Long.fromString(
                            customFee.royaltyFee.fallbackFee.amount,
                        ),
                    );

                    fallbackFee.setDenominatingTokenId(
                        customFee.royaltyFee.fallbackFee.denominatingTokenId,
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
