import {
    Client,
    PrivateKey,
    AccountId,
    NftId,
    TokenId,
    Hbar,
    TransactionId,
    TokenType,
    TokenSupplyType,
    TransferTransaction,
    TransactionResponse,
    TokenCreateTransaction,
    TokenMintTransaction,
    TokenAssociateTransaction,
    AccountCreateTransaction,
    AccountAllowanceApproveTransaction,
    AccountAllowanceDeleteTransaction,
} from "@hashgraph/sdk";

import dotenv from "dotenv";
dotenv.config();

/*
Example for HIP-336.

### Show functionalities around approve/delete an allowance for:
1. single NFT serial numbers
2. all serial numbers at once
3. delegating spender obligations

Note that the concept around the ERC standard that Hedera implements in regards
to the allowances for NFTs does not allow users to:

1. approve allowance for all serials in a NFT collection, then remove allowance for individual serial of the NFT
2. approve allowance for individual serial of the NFT, then remove allowance for all serials in the NFT collection

*/

async function main() {
    if (process.env.OPERATOR_ID == null || process.env.OPERATOR_KEY == null) {
        throw new Error(
            "Environment variables OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    // Example 1
    console.log(
        `\nExample 1: Approve/delete allowances for single serial numbers`
    );

    const CID = [
        "QmNPCiNA3Dsu3K5FxDPMG5Q3fZRwVTg14EXA92uqEeSRXn",
        "QmZ4dgAgt8owvnULxnKxNe8YqpavtVCXmc1Lt2XajFpJs9",
        "QmPzY5GxevjyfMUF5vEAjtyRoigzWp47MiKAtLBduLMC1T",
    ];

    let nftCreateTx = new TokenCreateTransaction()
        .setTokenName("NFT Token")
        .setTokenSymbol("NFTT")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setMaxSupply(CID.length)
        .setTreasuryAccountId(operatorId)
        .setSupplyType(TokenSupplyType.Finite)
        .setAdminKey(operatorKey)
        .setSupplyKey(operatorKey)
        .freezeWith(client);

    // Sign the transaction with the operator key
    let nftCreateTxSign = await nftCreateTx.sign(operatorKey);
    // Submit the transaction to the Hedera network
    let nftCreateSubmit = await nftCreateTxSign.execute(client);
    // Get transaction receipt information
    let nftCreateRx = await nftCreateSubmit.getReceipt(client);
    let nftTokenId = nftCreateRx.tokenId;
    console.log(`Created NFT with token id: ${nftTokenId.toString()}`);

    const nftCollection = [];
    for (var i = 0; i < CID.length; i++) {
        nftCollection[i] = await (
            await tokenMinterFcn(CID[i], nftTokenId)
        ).getReceipt(client);
        console.log(
            `Created NFT ${nftTokenId.toString()} with serial: ${nftCollection[
                i
            ].serials[0].toString()}`
        );
    }

    // Create `spender` account
    const spenderKey = PrivateKey.generateECDSA();
    const createSpenderTx = await new AccountCreateTransaction()
        .setKey(spenderKey)
        .setInitialBalance(new Hbar(2))
        .execute(client);

    const spenderAccountId = (await createSpenderTx.getReceipt(client))
        .accountId;
    console.log(`spenderAccountId: ${spenderAccountId.toString()}`);

    // Create `receiver` account
    const receiverKey = PrivateKey.generateECDSA();
    const createReceiverTx = await new AccountCreateTransaction()
        .setKey(receiverKey)
        .setInitialBalance(new Hbar(2))
        .execute(client);
    const receiverAccountId = (await createReceiverTx.getReceipt(client))
        .accountId;
    console.log(`receiverAccountId: ${receiverAccountId.toString()}`);

    // Associate the `spender` with the NFT
    const spenderAssociateTx = new TokenAssociateTransaction()
        .setAccountId(spenderAccountId)
        .setTokenIds([nftTokenId])
        .freezeWith(client);

    const spenderSignAssociateTx = await spenderAssociateTx.sign(spenderKey);
    const spenderExecuteAssociateTx = await spenderSignAssociateTx.execute(
        client
    );

    const spenderAssociateReceipt = await spenderExecuteAssociateTx.getReceipt(
        client
    );
    console.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Spender associate TX status: ${spenderAssociateReceipt.status}`
    );

    // Associate the `receiver` with the NFT
    const receiverAssociateTx = new TokenAssociateTransaction()
        .setAccountId(receiverAccountId)
        .setTokenIds([nftTokenId])
        .freezeWith(client);

    const receiverSignAssociateTx = await receiverAssociateTx.sign(receiverKey);
    const receiverExecuteAssociateTx = await receiverSignAssociateTx.execute(
        client
    );

    const receiverAssociateReceipt =
        await receiverExecuteAssociateTx.getReceipt(client);
    console.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Receiver associate TX status: ${receiverAssociateReceipt.status}`
    );

    const nft1 = new NftId(nftTokenId, 1);
    const nft2 = new NftId(nftTokenId, 2);

    // Give `spender` allowance only for NFT with serial 1
    const receiverApproveTx = new AccountAllowanceApproveTransaction()
        .approveTokenNftAllowance(nft1, operatorId, spenderAccountId)
        .approveTokenNftAllowance(nft2, operatorId, spenderAccountId);

    const approveRx = await receiverApproveTx.execute(client);
    const approveReceipt = await approveRx.getReceipt(client);
    console.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Approve spender allowance for serials 1 and 2 - status: ${approveReceipt.status}`
    );

    // Generate TransactionId from spender's account id in order
    // for the transaction to be to be executed on behalf of the spender
    const onBehalfOfTransactionId = TransactionId.generate(spenderAccountId);

    // Sending NFT with serial number 1
    // `Spender` has an allowance to send, should end up with `SUCCESS`
    const approvedSendTx = new TransferTransaction()
        .addApprovedNftTransfer(nft1, operatorId, receiverAccountId)
        .setTransactionId(onBehalfOfTransactionId)
        .freezeWith(client);

    const approvedSendSigned = await approvedSendTx.sign(spenderKey);
    const approvedSendSubmit = await approvedSendSigned.execute(client);
    const approvedSendRx = await approvedSendSubmit.getReceipt(client);
    console.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Transfer serial 1 on behalf of the spender status: ${approvedSendRx.status}`
    );

    // Remove `spender's` allowance for serial 2
    const accountDeleteAllowanceTx =
        new AccountAllowanceDeleteTransaction().deleteAllTokenNftAllowances(
            nft2,
            operatorId
        );
    const deleteTx = await accountDeleteAllowanceTx.execute(client);
    const deleteAllowanceReceipt = await deleteTx.getReceipt(client);
    console.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Remove spender's allowance for serial 2 - status: ${deleteAllowanceReceipt.status}`
    );

    const onBehalfOfTransactionId2 = TransactionId.generate(spenderAccountId);

    // Sending NFT with serial number 2
    // `Spender` does not have an allowance to send serial 2, should end up with `SPENDER_DOES_NOT_HAVE_ALLOWANCE`
    const approvedSendTx2 = new TransferTransaction()
        .addApprovedNftTransfer(nft2, operatorId, receiverAccountId)
        .setTransactionId(onBehalfOfTransactionId2)
        .freezeWith(client);

    const approvedSendSigned2 = await approvedSendTx2.sign(spenderKey);

    try {
        const approvedSendSubmit2 = await approvedSendSigned2.execute(client);
        await approvedSendSubmit2.getReceipt(client);
    } catch (error) {
        console.log(
            // @ts-ignore
            //eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `Transfer serial 2 on behalf of the spender - status: ${error.status}`
        );
    }

    // Example 2
    console.log(
        `\nExample 2: Approve/delete allowances for ALL serial numbers at once`
    );

    const CID2 = [
        "QmNPCiNA3Dsu3K5FxDPMG5Q3fZRwVTg14EXA92uqEeSRXn",
        "QmZ4dgAgt8owvnULxnKxNe8YqpavtVCXmc1Lt2XajFpJs9",
        "QmPzY5GxevjyfMUF5vEAjtyRoigzWp47MiKAtLBduLMC1T",
    ];

    let nftCreateTx2 = new TokenCreateTransaction()
        .setTokenName("NFT Token")
        .setTokenSymbol("NFTT")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setMaxSupply(CID2.length)
        .setTreasuryAccountId(operatorId)
        .setSupplyType(TokenSupplyType.Finite)
        .setAdminKey(operatorKey)
        .setSupplyKey(operatorKey)
        .freezeWith(client);

    // Sign the transaction with the operator key
    let nftCreateTxSign2 = await nftCreateTx2.sign(operatorKey);
    // Submit the transaction to the Hedera network
    let nftCreateSubmit2 = await nftCreateTxSign2.execute(client);
    // Get transaction receipt information
    let nftCreateRx2 = await nftCreateSubmit2.getReceipt(client);
    let nftTokenId2 = nftCreateRx2.tokenId;
    console.log(`Created NFT with token id: ${nftTokenId2.toString()}`);

    const nftCollection2 = [];
    for (let i = 0; i < CID2.length; i++) {
        nftCollection2[i] = await (
            await tokenMinterFcn(CID2[i], nftTokenId2)
        ).getReceipt(client);
        console.log(
            `Created NFT ${nftTokenId2.toString()} with serial: ${nftCollection2[
                i
            ].serials[0].toString()}`
        );
    }

    // Create `spender` account
    const spenderKey2 = PrivateKey.generateECDSA();
    const createSpenderTx2 = await new AccountCreateTransaction()
        .setKey(spenderKey2)
        .setInitialBalance(new Hbar(2))
        .execute(client);

    const spenderAccountId2 = (await createSpenderTx2.getReceipt(client))
        .accountId;
    console.log(`spenderAccountId2: ${spenderAccountId2.toString()}`);

    // Create `receiver` account
    const receiverKey2 = PrivateKey.generateECDSA();
    const createReceiverTx2 = await new AccountCreateTransaction()
        .setKey(receiverKey2)
        .setInitialBalance(new Hbar(2))
        .execute(client);
    const receiverAccountId2 = (await createReceiverTx2.getReceipt(client))
        .accountId;
    console.log(`receiverAccountId2: ${receiverAccountId2.toString()}`);

    // Associate the `spender` with the NFT
    const spenderAssociateTx2 = new TokenAssociateTransaction()
        .setAccountId(spenderAccountId2)
        .setTokenIds([nftTokenId2])
        .freezeWith(client);

    const spenderSignAssociateTx2 = await spenderAssociateTx2.sign(spenderKey2);
    const spenderExecuteAssociateTx2 = await spenderSignAssociateTx2.execute(
        client
    );

    const spenderAssociateReceipt2 =
        await spenderExecuteAssociateTx2.getReceipt(client);
    console.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Spender associate TX status: ${spenderAssociateReceipt2.status}`
    );

    // Associate the `receiver` with the NFT
    const receiverAssociateTx2 = new TokenAssociateTransaction()
        .setAccountId(receiverAccountId2)
        .setTokenIds([nftTokenId2])
        .freezeWith(client);

    const receiverSignAssociateTx2 = await receiverAssociateTx2.sign(
        receiverKey2
    );
    const receiverExecuteAssociateTx2 = await receiverSignAssociateTx2.execute(
        client
    );

    const receiverAssociateReceipt2 =
        await receiverExecuteAssociateTx2.getReceipt(client);
    console.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Receiver associate TX status: ${receiverAssociateReceipt2.status}`
    );

    const example2Nft1 = new NftId(nftTokenId2, 1);
    const example2Nft2 = new NftId(nftTokenId2, 2);
    const example2Nft3 = new NftId(nftTokenId2, 3);

    // Give `spender` allowance only for NFT with serial 1
    const receiverApproveTx2 =
        new AccountAllowanceApproveTransaction().approveTokenNftAllowanceAllSerials(
            nftTokenId2,
            operatorId,
            spenderAccountId2
        );

    const approveRx2 = await receiverApproveTx2.execute(client);
    const approveReceipt2 = await approveRx2.getReceipt(client);
    console.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Approve spender allowance for all serials - status: ${approveReceipt2.status}`
    );

    // Create `delegate spender` account
    const delegateSpenderKey = PrivateKey.generateECDSA();
    const createDelegateSpenderTx = await new AccountCreateTransaction()
        .setKey(delegateSpenderKey)
        .setInitialBalance(new Hbar(2))
        .execute(client);

    const delegateSpenderAccountId = (
        await createDelegateSpenderTx.getReceipt(client)
    ).accountId;
    console.log(
        `delegateSpenderAccountId: ${delegateSpenderAccountId.toString()}`
    );

    // Give `delegateSpender` allowance for NFT with serial number 3 on behalf of `spender` account which has `approveForAll` rights
    const spenderClient = Client.forTestnet().setOperator(
        spenderAccountId2,
        spenderKey2
    );
    const delegateSpenderAllowance = new AccountAllowanceApproveTransaction()
        .approveTokenNftAllowanceWithDelegatingSpender(
            example2Nft3,
            operatorId,
            delegateSpenderAccountId,
            spenderAccountId2
        )
        .freezeWith(spenderClient);

    const approveDelegateSpender = await delegateSpenderAllowance.execute(
        spenderClient
    );
    const approveDelegateAllowanceReceipt =
        await approveDelegateSpender.getReceipt(spenderClient);
    console.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Approve delegated spender allowance for serial 3 - status: ${approveDelegateAllowanceReceipt.status}`
    );

    // Generate TransactionId from spender's account id in order
    // for the transaction to be to be executed on behalf of the spender
    const delegatedOnBehalfOfTxId = TransactionId.generate(
        delegateSpenderAccountId
    );

    // Sending NFT with serial number 1
    // `Delegated spender` has an allowance to send serial 3, should end up with `SUCCESS`
    const delegatedSendTx = new TransferTransaction()
        .addApprovedNftTransfer(example2Nft3, operatorId, receiverAccountId2)
        .setTransactionId(delegatedOnBehalfOfTxId)
        .freezeWith(client);

    const delegatedSendSigned = await delegatedSendTx.sign(delegateSpenderKey);
    const delegatedSendSubmit = await delegatedSendSigned.execute(client);
    const delegatedSendRx = await delegatedSendSubmit.getReceipt(client);
    console.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Transfer serial 3 on behalf of the delegated spender status: ${delegatedSendRx.status}`
    );

    // Generate TransactionId from spender's account id in order
    // for the transaction to be to be executed on behalf of the spender
    const onBehalfOfTransactionId3 = TransactionId.generate(spenderAccountId2);

    // Sending NFT with serial number 1
    // `Spender` has an allowance to send serial 1, should end up with `SUCCESS`
    const approvedSendTx3 = new TransferTransaction()
        .addApprovedNftTransfer(example2Nft1, operatorId, receiverAccountId2)
        .setTransactionId(onBehalfOfTransactionId3)
        .freezeWith(client);

    const approvedSendSigned3 = await approvedSendTx3.sign(spenderKey2);
    const approvedSendSubmit3 = await approvedSendSigned3.execute(client);
    const approvedSendRx3 = await approvedSendSubmit3.getReceipt(client);
    console.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Transfer serial 1 on behalf of the spender status: ${approvedSendRx3.status}`
    );

    // Remove `spender's` allowance for ALL serials
    const accountDeleteAllowanceTx2 =
        new AccountAllowanceApproveTransaction().deleteTokenNftAllowanceAllSerials(
            nftTokenId2,
            operatorId,
            spenderAccountId2
        );

    const deleteTx2 = await accountDeleteAllowanceTx2.execute(client);
    const deleteAllowanceReceipt2 = await deleteTx2.getReceipt(client);
    console.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Remove spender's allowance for ALL serials - status: ${deleteAllowanceReceipt2.status}`
    );

    // Generate TransactionId from spender's account id in order
    // for the transaction to be to be executed on behalf of the spender
    const onBehalfOfTransactionId4 = TransactionId.generate(spenderAccountId2);

    // Sending NFT with serial number 2
    // `Spender` does not have an allowance to send serial 2, should end up with `SPENDER_DOES_NOT_HAVE_ALLOWANCE`
    const approvedSendTx4 = new TransferTransaction()
        .addApprovedNftTransfer(example2Nft2, operatorId, receiverAccountId2)
        .setTransactionId(onBehalfOfTransactionId4)
        .freezeWith(client);

    const approvedSendSigned4 = await approvedSendTx4.sign(spenderKey2);
    try {
        const approvedSendSubmit4 = await approvedSendSigned4.execute(client);
        await approvedSendSubmit4.getReceipt(client);
    } catch (error) {
        console.log(
            // @ts-ignore
            //eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
            `Transfer serial 2 on behalf of the spender status: ${error.status}`
        );
    }

    /**
     * TOKEN MINTER FUNCTION
     *
     * @param {string} CID
     * @param {TokenId} nftTokenId
     * @returns {Promise<TransactionResponse>}
     */
    async function tokenMinterFcn(CID, nftTokenId) {
        const mintTx = new TokenMintTransaction()
            .setTokenId(nftTokenId)
            .setMetadata([Buffer.from(CID)])
            .freezeWith(client);
        let mintTxSign = await mintTx.sign(operatorKey);
        return await mintTxSign.execute(client);
    }
}

void main();
