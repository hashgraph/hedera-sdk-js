import {
    AccountAllowanceApproveTransaction,
    AccountBalanceQuery,
    AccountCreateTransaction,
    AccountUpdateTransaction,
    Hbar,
    NftId,
    AccountInfoQuery,
    PrivateKey,
    Status,
    TokenAssociateTransaction,
    TokenCreateTransaction,
    TokenMintTransaction,
    TokenType,
    TransactionId,
    TransferTransaction,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("TokenAssociate", function () {
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new({ balance: 1000 });
    });

    it("should be executable", async function () {
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;
        const key = PrivateKey.generateED25519();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const account = (await response.getReceipt(env.client)).accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setDecimals(3)
                    .setInitialSupply(1000000)
                    .setTreasuryAccountId(operatorId)
                    .setAdminKey(operatorKey)
                    .setKycKey(operatorKey)
                    .setFreezeKey(operatorKey)
                    .setWipeKey(operatorKey)
                    .setSupplyKey(operatorKey)
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        await (
            await (
                await new TokenAssociateTransaction()
                    .setTokenIds([token])
                    .setAccountId(account)
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);

        const balances = await new AccountBalanceQuery()
            .setAccountId(account)
            .execute(env.client);

        expect(balances.tokens.get(token).toInt()).to.be.equal(0);

        const info = await new AccountInfoQuery()
            .setAccountId(account)
            .execute(env.client);

        const relationship = info.tokenRelationships.get(token);

        expect(relationship).to.be.not.null;
        expect(relationship.tokenId.toString()).to.be.equal(token.toString());
        expect(relationship.balance.toInt()).to.be.equal(0);
        expect(relationship.isKycGranted).to.be.false;
        expect(relationship.isFrozen).to.be.false;
    });

    it("should be executable even when no token IDs are set", async function () {
        const operatorId = env.operatorId;

        await (
            await new TokenAssociateTransaction()
                .setAccountId(operatorId)
                .execute(env.client)
        ).getReceipt(env.client);
    });

    it("should error when account ID is not set", async function () {
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setDecimals(3)
            .setInitialSupply(1000000)
            .setTreasuryAccountId(operatorId)
            .setAdminKey(operatorKey)
            .setKycKey(operatorKey)
            .setFreezeKey(operatorKey)
            .setWipeKey(operatorKey)
            .setSupplyKey(operatorKey)
            .setFreezeDefault(false)
            .execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        let err = false;

        try {
            await (
                await new TokenAssociateTransaction()
                    .setTokenIds([token])
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidAccountId);
        }

        if (!err) {
            throw new Error("token association did not error");
        }
    });

    describe("Max Auto Associations", function () {
        let receiverKey, receiverId;
        const TOKEN_SUPPLY = 100,
            TRANSFER_AMOUNT = 10;

        beforeEach(async function () {
            receiverKey = PrivateKey.generateECDSA();
            const receiverAccountCreateTx = await new AccountCreateTransaction()
                .setKey(receiverKey)
                .freezeWith(env.client)
                .sign(receiverKey);
            receiverId = (
                await (
                    await receiverAccountCreateTx.execute(env.client)
                ).getReceipt(env.client)
            ).accountId;
        });

        describe("Limited Auto Associations", function () {
            it("should revert FT transfer when no auto associations left", async function () {
                // update account to have one auto association
                const accountUpdateTx = await new AccountUpdateTransaction()
                    .setAccountId(receiverId)
                    .setMaxAutomaticTokenAssociations(1)
                    .freezeWith(env.client)
                    .sign(receiverKey);

                await (
                    await accountUpdateTx.execute(env.client)
                ).getReceipt(env.client);

                const tokenCreateTransaction =
                    await new TokenCreateTransaction()
                        .setTokenType(TokenType.FungibleCommon)
                        .setTokenName("FFFFF")
                        .setTokenSymbol("ffff")
                        .setInitialSupply(TOKEN_SUPPLY)
                        .setTreasuryAccountId(env.operatorId)
                        .setAdminKey(env.operatorKey)
                        .setFreezeKey(env.operatorKey)
                        .setWipeKey(env.operatorKey)
                        .setSupplyKey(env.operatorKey)
                        .execute(env.client);

                const { tokenId } = await tokenCreateTransaction.getReceipt(
                    env.client,
                );

                const tokenCreateTransaction2 =
                    await new TokenCreateTransaction()
                        .setTokenType(TokenType.FungibleCommon)
                        .setTokenName("FFFFF")
                        .setTokenSymbol("ffff")
                        .setInitialSupply(TOKEN_SUPPLY)
                        .setTreasuryAccountId(env.operatorId)
                        .setAdminKey(env.operatorKey)
                        .setFreezeKey(env.operatorKey)
                        .setWipeKey(env.operatorKey)
                        .setSupplyKey(env.operatorKey)
                        .execute(env.client);

                const { tokenId: tokenId2 } =
                    await tokenCreateTransaction2.getReceipt(env.client);

                const sendTokenToReceiverTx = await new TransferTransaction()
                    .addTokenTransfer(tokenId, env.operatorId, -TRANSFER_AMOUNT)
                    .addTokenTransfer(tokenId, receiverId, TRANSFER_AMOUNT)
                    .execute(env.client);

                await sendTokenToReceiverTx.getReceipt(env.client);

                const sendTokenToReceiverTx2 = await new TransferTransaction()
                    .addTokenTransfer(
                        tokenId2,
                        env.operatorId,
                        -TRANSFER_AMOUNT,
                    )
                    .addTokenTransfer(tokenId2, receiverId, TRANSFER_AMOUNT)
                    .freezeWith(env.client)
                    .execute(env.client);

                let err = false;

                try {
                    await sendTokenToReceiverTx2.getReceipt(env.client);
                } catch (error) {
                    err = error
                        .toString()
                        .includes(Status.NoRemainingAutomaticAssociations);
                }

                if (!err) {
                    throw new Error(
                        "Token transfer did not error with NO_REMAINING_AUTOMATIC_ASSOCIATIONS",
                    );
                }
            });

            it("should revert NFTs transfer when no auto associations left", async function () {
                const accountUpdateTx = await new AccountUpdateTransaction()
                    .setAccountId(receiverId)
                    .setMaxAutomaticTokenAssociations(1)
                    .freezeWith(env.client)
                    .sign(receiverKey);

                await (
                    await accountUpdateTx.execute(env.client)
                ).getReceipt(env.client);

                // create token 1
                const tokenCreateTransaction =
                    await new TokenCreateTransaction()
                        .setTokenType(TokenType.NonFungibleUnique)
                        .setTokenName("FFFFF")
                        .setTokenSymbol("ffff")
                        .setTreasuryAccountId(env.operatorId)
                        .setAdminKey(env.operatorKey)
                        .setSupplyKey(env.operatorKey)
                        .execute(env.client);

                const { tokenId } = await tokenCreateTransaction.getReceipt(
                    env.client,
                );

                // mint a token in token 1
                const tokenMintSignedTransaction =
                    await new TokenMintTransaction()
                        .setTokenId(tokenId)
                        .setMetadata([Buffer.from("-")])
                        .execute(env.client);

                const { serials } = await tokenMintSignedTransaction.getReceipt(
                    env.client,
                );

                // transfer the token to receiver

                const transferTxSign = await new TransferTransaction()
                    .addNftTransfer(
                        tokenId,
                        serials[0],
                        env.operatorId,
                        receiverId,
                    )
                    .execute(env.client);

                await transferTxSign.getReceipt(env.client);

                // create token 2
                const tokenCreateTransaction2 =
                    await new TokenCreateTransaction()
                        .setTokenType(TokenType.NonFungibleUnique)
                        .setTokenName("FFFFF")
                        .setTokenSymbol("ffff")
                        .setTreasuryAccountId(env.operatorId)
                        .setAdminKey(env.operatorKey)
                        .setSupplyKey(env.operatorKey)
                        .execute(env.client);

                const { tokenId: tokenId2 } =
                    await tokenCreateTransaction2.getReceipt(env.client);

                // mint token 2
                const tokenMintSignedTransaction2 =
                    await new TokenMintTransaction()
                        .setTokenId(tokenId2)
                        .addMetadata(Buffer.from("-"))
                        .execute(env.client);

                const serials2 = (
                    await tokenMintSignedTransaction2.getReceipt(env.client)
                ).serials;

                let err = false;

                try {
                    const transferToken2Response =
                        await new TransferTransaction()
                            .addNftTransfer(
                                tokenId2,
                                serials2[0],
                                env.operatorId,
                                receiverId,
                            )
                            .execute(env.client);

                    await transferToken2Response.getReceipt(env.client);
                } catch (error) {
                    err = error
                        .toString()
                        .includes(Status.NoRemainingAutomaticAssociations);
                }

                if (!err) {
                    throw new Error(
                        "Token transfer did not error with NO_REMAINING_AUTOMATIC_ASSOCIATIONS",
                    );
                }
            });

            it("should contain sent balance when transfering FT to account with manual token association", async function () {
                const tokenCreateTransaction =
                    await new TokenCreateTransaction()
                        .setTokenType(TokenType.FungibleCommon)
                        .setTokenName("FFFFF")
                        .setTokenSymbol("ffff")
                        .setInitialSupply(TOKEN_SUPPLY)
                        .setTreasuryAccountId(env.operatorId)
                        .setAdminKey(env.operatorKey)
                        .setFreezeKey(env.operatorKey)
                        .setWipeKey(env.operatorKey)
                        .setSupplyKey(env.operatorKey)
                        .execute(env.client);

                const { tokenId } = await tokenCreateTransaction.getReceipt(
                    env.client,
                );

                const tokenAssociateTransaction =
                    await new TokenAssociateTransaction()
                        .setAccountId(receiverId)
                        .setTokenIds([tokenId])
                        .freezeWith(env.client)
                        .sign(receiverKey);

                await (
                    await tokenAssociateTransaction.execute(env.client)
                ).getReceipt(env.client);

                const sendTokenToReceiverTx = await new TransferTransaction()
                    .addTokenTransfer(tokenId, env.operatorId, -TRANSFER_AMOUNT)
                    .addTokenTransfer(tokenId, receiverId, TRANSFER_AMOUNT)
                    .execute(env.client);

                await sendTokenToReceiverTx.getReceipt(env.client);

                const tokenBalance = await new AccountBalanceQuery()
                    .setAccountId(receiverId)
                    .execute(env.client);

                expect(tokenBalance.tokens.get(tokenId).toInt()).to.be.equal(
                    TRANSFER_AMOUNT,
                );
            });

            it("should contain sent balance when transfering NFT to account with manual token association", async function () {
                const tokenCreateTransaction =
                    await new TokenCreateTransaction()
                        .setTokenType(TokenType.NonFungibleUnique)
                        .setTokenName("FFFFF")
                        .setTokenSymbol("ffff")
                        .setTreasuryAccountId(env.operatorId)
                        .setAdminKey(env.operatorKey)
                        .setSupplyKey(env.operatorKey)
                        .execute(env.client);

                const { tokenId } = await tokenCreateTransaction.getReceipt(
                    env.client,
                );

                const tokenAssociateTransaction =
                    await new TokenAssociateTransaction()
                        .setAccountId(receiverId)
                        .setTokenIds([tokenId])
                        .freezeWith(env.client)
                        .sign(receiverKey);

                await (
                    await tokenAssociateTransaction.execute(env.client)
                ).getReceipt(env.client);

                const tokenMintTx = await new TokenMintTransaction()
                    .setTokenId(tokenId)
                    .setMetadata([Buffer.from("-")])
                    .freezeWith(env.client)
                    .sign(env.operatorKey);

                const { serials } = await (
                    await tokenMintTx.execute(env.client)
                ).getReceipt(env.client);

                const sendTokenToReceiverTx = await new TransferTransaction()
                    .addNftTransfer(
                        tokenId,
                        serials[0],
                        env.operatorId,
                        receiverId,
                    )
                    .execute(env.client);

                await sendTokenToReceiverTx.getReceipt(env.client);

                const tokenBalance = await new AccountBalanceQuery()
                    .setAccountId(receiverId)
                    .execute(env.client);

                expect(tokenBalance.tokens.get(tokenId).toInt()).to.be.equal(1);
            });
        });

        describe("Unlimited Auto Associations", function () {
            it("receiver should contain FTs when transfering to account with unlimited auto associations", async function () {
                const tokenCreateResponse = await new TokenCreateTransaction()
                    .setTokenType(TokenType.FungibleCommon)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setInitialSupply(TOKEN_SUPPLY)
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .execute(env.client);

                const { tokenId } = await tokenCreateResponse.getReceipt(
                    env.client,
                );

                const tokenCreateResponse2 = await new TokenCreateTransaction()
                    .setTokenType(TokenType.FungibleCommon)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setInitialSupply(TOKEN_SUPPLY)
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .execute(env.client);

                const { tokenId: tokenId2 } =
                    await tokenCreateResponse2.getReceipt(env.client);

                const updateUnlimitedAutomaticAssociations =
                    await new AccountUpdateTransaction()
                        .setAccountId(receiverId)
                        .setMaxAutomaticTokenAssociations(-1)
                        .freezeWith(env.client)
                        .sign(receiverKey);

                await (
                    await updateUnlimitedAutomaticAssociations.execute(
                        env.client,
                    )
                ).getReceipt(env.client);

                const tokenTransferResponse = await new TransferTransaction()
                    .addTokenTransfer(tokenId, env.operatorId, -TRANSFER_AMOUNT)
                    .addTokenTransfer(tokenId, receiverId, TRANSFER_AMOUNT)
                    .execute(env.client);

                await tokenTransferResponse.getReceipt(env.client);

                const tokenTransferResponse2 = await new TransferTransaction()
                    .addTokenTransfer(
                        tokenId2,
                        env.operatorId,
                        -TRANSFER_AMOUNT,
                    )
                    .addTokenTransfer(tokenId2, receiverId, TRANSFER_AMOUNT)
                    .execute(env.client);

                await tokenTransferResponse2.getReceipt(env.client);

                const newTokenBalance = (
                    await new AccountBalanceQuery()
                        .setAccountId(receiverId)
                        .execute(env.client)
                ).tokens.get(tokenId);

                const newTokenBalance2 = (
                    await new AccountBalanceQuery()
                        .setAccountId(receiverId)
                        .execute(env.client)
                ).tokens.get(tokenId2);

                expect(newTokenBalance.toInt()).to.equal(TRANSFER_AMOUNT);
                expect(newTokenBalance2.toInt()).to.equal(TRANSFER_AMOUNT);
            });

            it("receiver should contain NFTs when transfering to account with unlimited auto associations", async function () {
                const tokenCreateResponse = await new TokenCreateTransaction()
                    .setTokenType(TokenType.NonFungibleUnique)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .execute(env.client);

                const { tokenId } = await tokenCreateResponse.getReceipt(
                    env.client,
                );

                const tokenCreateResponse2 = await new TokenCreateTransaction()
                    .setTokenType(TokenType.NonFungibleUnique)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .execute(env.client);

                const { tokenId: tokenId2 } =
                    await tokenCreateResponse2.getReceipt(env.client);

                const mintTokenTx = await new TokenMintTransaction()
                    .setTokenId(tokenId)
                    .setMetadata([Buffer.from("-")])
                    .execute(env.client);

                const { serials } = await mintTokenTx.getReceipt(env.client);

                const mintTokenTx2 = await new TokenMintTransaction()
                    .setTokenId(tokenId2)
                    .setMetadata([Buffer.from("-")])
                    .execute(env.client);

                await mintTokenTx2.getReceipt(env.client);

                const updateUnlimitedAutomaticAssociations =
                    await new AccountUpdateTransaction()
                        .setAccountId(receiverId)
                        .setMaxAutomaticTokenAssociations(-1)
                        .freezeWith(env.client)
                        .sign(receiverKey);

                await (
                    await updateUnlimitedAutomaticAssociations.execute(
                        env.client,
                    )
                ).getReceipt(env.client);

                const tokenTransferResponse = await new TransferTransaction()
                    .addNftTransfer(
                        tokenId,
                        serials[0],
                        env.operatorId,
                        receiverId,
                    )
                    .execute(env.client);

                await tokenTransferResponse.getReceipt(env.client);

                const tokenTransferResponse2 = await new TransferTransaction()
                    .addNftTransfer(tokenId2, 1, env.operatorId, receiverId)
                    .execute(env.client);

                await tokenTransferResponse2.getReceipt(env.client);

                const newTokenBalance = (
                    await new AccountBalanceQuery()
                        .setAccountId(receiverId)
                        .execute(env.client)
                ).tokens.get(tokenId);

                const newTokenBalance2 = (
                    await new AccountBalanceQuery()
                        .setAccountId(receiverId)
                        .execute(env.client)
                ).tokens.get(tokenId2);

                expect(newTokenBalance.toInt()).to.equal(1);
                expect(newTokenBalance2.toInt()).to.equal(1);
            });

            it("receiver should have token balance even if it has given allowance to spender", async function () {
                const spenderKey = PrivateKey.generateECDSA();
                const spenderAccountCreateTx =
                    await new AccountCreateTransaction()
                        .setKey(spenderKey)
                        .setMaxAutomaticTokenAssociations(-1)
                        .setInitialBalance(new Hbar(1))
                        .execute(env.client);

                const spenderId = (
                    await spenderAccountCreateTx.getReceipt(env.client)
                ).accountId;

                const unlimitedAutoAssociationReceiverTx =
                    await new AccountUpdateTransaction()
                        .setAccountId(receiverId)
                        .setMaxAutomaticTokenAssociations(-1)
                        .freezeWith(env.client)
                        .sign(receiverKey);

                await (
                    await unlimitedAutoAssociationReceiverTx.execute(env.client)
                ).getReceipt(env.client);

                const tokenCreateResponse = await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setInitialSupply(TOKEN_SUPPLY)
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .execute(env.client);

                const { tokenId } = await tokenCreateResponse.getReceipt(
                    env.client,
                );

                const tokenAllowanceTx =
                    await new AccountAllowanceApproveTransaction()
                        .approveTokenAllowance(
                            tokenId,
                            env.operatorId,
                            spenderId,
                            TRANSFER_AMOUNT,
                        )
                        .execute(env.client);

                await tokenAllowanceTx.getReceipt(env.client);

                const onBehalfOfTransactionId =
                    TransactionId.generate(spenderId);
                const tokenTransferApprovedSupply =
                    await new TransferTransaction()
                        .setTransactionId(onBehalfOfTransactionId)
                        .addApprovedTokenTransfer(
                            tokenId,
                            env.operatorId,
                            -TRANSFER_AMOUNT,
                        )
                        .addTokenTransfer(tokenId, receiverId, TRANSFER_AMOUNT)
                        .freezeWith(env.client)
                        .sign(spenderKey);

                await (
                    await tokenTransferApprovedSupply.execute(env.client)
                ).getReceipt(env.client);

                const tokenBalanceReceiver = await new AccountBalanceQuery()
                    .setAccountId(receiverId)
                    .execute(env.client);

                const tokenBalanceSpender = await new AccountBalanceQuery()
                    .setAccountId(spenderId)
                    .execute(env.client);

                const tokenBalanceTreasury = await new AccountBalanceQuery()
                    .setAccountId(env.operatorId)
                    .execute(env.client);

                expect(
                    tokenBalanceReceiver.tokens.get(tokenId).toInt(),
                ).to.equal(TRANSFER_AMOUNT);

                expect(tokenBalanceSpender.tokens.get(tokenId)).to.equal(null);

                expect(
                    tokenBalanceTreasury.tokens.get(tokenId).toInt(),
                ).to.equal(TOKEN_SUPPLY - TRANSFER_AMOUNT);
            });

            it("receiver should have nft even if it has given allowance to spender", async function () {
                const spenderKey = PrivateKey.generateECDSA();

                const unlimitedAutoAssociationReceiverTx =
                    await new AccountUpdateTransaction()
                        .setAccountId(receiverId)
                        .setMaxAutomaticTokenAssociations(-1)
                        .freezeWith(env.client)
                        .sign(receiverKey);

                await (
                    await unlimitedAutoAssociationReceiverTx.execute(env.client)
                ).getReceipt(env.client);

                const spenderAccountCreateTx =
                    await new AccountCreateTransaction()
                        .setKey(spenderKey)
                        .setInitialBalance(new Hbar(1))
                        .setMaxAutomaticTokenAssociations(-1)
                        .execute(env.client);

                const spenderId = (
                    await spenderAccountCreateTx.getReceipt(env.client)
                ).accountId;

                const tokenCreateResponse = await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTokenType(TokenType.NonFungibleUnique)
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .execute(env.client);

                const { tokenId } = await tokenCreateResponse.getReceipt(
                    env.client,
                );

                await (
                    await new TokenMintTransaction()
                        .setTokenId(tokenId)
                        .setMetadata([Buffer.from("-")])
                        .execute(env.client)
                ).getReceipt(env.client);

                const nftId = new NftId(tokenId, 1);
                const nftAllowanceTx =
                    await new AccountAllowanceApproveTransaction()
                        .approveTokenNftAllowance(
                            nftId,
                            env.operatorId,
                            spenderId,
                        )
                        .execute(env.client);

                await nftAllowanceTx.getReceipt(env.client);

                // Generate TransactionId from spender's account id in order
                // for the transaction to be to be executed on behalf of the spender
                const onBehalfOfTransactionId =
                    TransactionId.generate(spenderId);

                const nftTransferToReceiver = await new TransferTransaction()
                    .addApprovedNftTransfer(nftId, env.operatorId, receiverId)
                    .setTransactionId(onBehalfOfTransactionId)
                    .freezeWith(env.client)
                    .sign(spenderKey);

                await (
                    await nftTransferToReceiver.execute(env.client)
                ).getReceipt(env.client);

                const tokenBalanceReceiver = await new AccountBalanceQuery()
                    .setAccountId(receiverId)
                    .execute(env.client);

                const tokenBalanceSpender = await new AccountBalanceQuery()
                    .setAccountId(spenderId)
                    .execute(env.client);

                const tokenBalanceTreasury = await new AccountBalanceQuery()
                    .setAccountId(env.operatorId)
                    .execute(env.client);

                expect(
                    tokenBalanceReceiver.tokens.get(tokenId).toInt(),
                ).to.equal(1);

                expect(tokenBalanceSpender.tokens.get(tokenId)).to.equal(null);

                expect(
                    tokenBalanceTreasury.tokens.get(tokenId).toInt(),
                ).to.equal(0);
            });

            it("receiver with unlimited auto associations should have FTs with decimal when sender transfers FTs", async function () {
                const tokenCreateResponse = await new TokenCreateTransaction()
                    .setTokenType(TokenType.FungibleCommon)
                    .setTokenName("FFFFFFF")
                    .setTokenSymbol("fff")
                    .setDecimals(3)
                    .setInitialSupply(TOKEN_SUPPLY)
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .execute(env.client);

                const { tokenId } = await tokenCreateResponse.getReceipt(
                    env.client,
                );

                const receiverKey = PrivateKey.generateECDSA();
                const receiverAccountResponse =
                    await new AccountCreateTransaction()
                        .setKey(receiverKey)
                        .setMaxAutomaticTokenAssociations(-1)
                        .setInitialBalance(new Hbar(1))
                        .execute(env.client);

                const { accountId: receiverAccountId } =
                    await receiverAccountResponse.getReceipt(env.client);

                await (
                    await new TokenAssociateTransaction()
                        .setAccountId(receiverAccountId)
                        .setTokenIds([tokenId])
                        .freezeWith(env.client)
                        .sign(receiverKey)
                ).execute(env.client);

                const tokenTransferResponse = await new TransferTransaction()
                    .addTokenTransfer(tokenId, env.operatorId, -TRANSFER_AMOUNT)
                    .addTokenTransfer(
                        tokenId,
                        receiverAccountId,
                        TRANSFER_AMOUNT,
                    )
                    .execute(env.client);

                await tokenTransferResponse.getReceipt(env.client);

                const receiverBalance = (
                    await new AccountBalanceQuery()
                        .setAccountId(receiverAccountId)
                        .execute(env.client)
                ).tokens
                    .get(tokenId)
                    .toInt();

                expect(receiverBalance).to.equal(TRANSFER_AMOUNT);
            });

            it("should revert when auto association is set to less than -1", async function () {
                let err = false;

                try {
                    const accountUpdateTx = await new AccountUpdateTransaction()
                        .setAccountId(receiverId)
                        .setMaxAutomaticTokenAssociations(-2)
                        .freezeWith(env.client)
                        .sign(receiverKey);
                    await (
                        await accountUpdateTx.execute(env.client)
                    ).getReceipt(env.client);
                } catch (error) {
                    err = error
                        .toString()
                        .includes(Status.InvalidMaxAutoAssociations);
                }

                if (!err) {
                    throw new Error("Token association did not error");
                }

                try {
                    const key = PrivateKey.generateECDSA();
                    const accountCreateInvalidAutoAssociation =
                        await new AccountCreateTransaction()
                            .setKey(key)
                            .setMaxAutomaticTokenAssociations(-2)
                            .execute(env.client);

                    await accountCreateInvalidAutoAssociation.getReceipt(
                        env.client,
                    );
                } catch (error) {
                    err = error
                        .toString()
                        .includes(Status.InvalidMaxAutoAssociations);
                }

                if (!err) {
                    throw new Error("Token association did not error");
                }
            });
        });
    });

    after(async function () {
        await env.close();
    });
});
