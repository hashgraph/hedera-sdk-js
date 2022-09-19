import * as hashgraph from "@hashgraph/sdk";
import ContractHelper from "./ContractHelper.js";
import contract from "./precompile-example/PrecompileExample.json" assert { type: "json" };
import dotenv from "dotenv";

dotenv.config();

async function main() {
    if (process.env.OPERATOR_ID == null || process.env.OPERATOR_KEY == null) {
        throw new Error(
            "Environment variables OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    const wallet = new hashgraph.Wallet(
        process.env.OPERATOR_ID,
        process.env.OPERATOR_KEY,
        new hashgraph.LocalProvider()
    );

    const alicePrivateKey = hashgraph.PrivateKey.generateED25519();
    const alicePublicKey = alicePrivateKey.publicKey;

    let transaction = await new hashgraph.AccountCreateTransaction()
        .setKey(alicePublicKey)
        .setInitialBalance(hashgraph.Hbar.fromTinybars(1000))
        .freezeWithSigner(wallet);
    transaction = await transaction.signWithSigner(wallet);

    let response = await transaction.executeWithSigner(wallet);
    const aliceAccountId = (await response.getReceiptWithSigner(wallet))
        .accountId;

    // Instantiate ContractHelper

    // The contract bytecode is located on the `object` field
    const contractBytecode = /** @type {string} */ (contract.object);

    const contractHelper = await ContractHelper.init(
        contractBytecode,
        new hashgraph.ContractFunctionParameters()
            .addAddress(wallet.getAccountId().toSolidityAddress())
            .addAddress(aliceAccountId.toSolidityAddress()),
        wallet
    );

    // Configure steps in ContracHelper

    contractHelper
        .setResultValidatorForStep(0, (contractFunctionResult) => {
            const bytes = Buffer.from(contractFunctionResult.getBytes32(0));
            console.log(
                `getPseudoRandomSeed() returned ${bytes.toString("hex")}`
            );
            return true;
        })
        .setPayableAmountForStep(1, new hashgraph.Hbar(20))
        // step 3 associates Alice with the token, which requires Alice's signature
        .addSignerForStep(3, alicePrivateKey)
        .addSignerForStep(5, alicePrivateKey)
        .setParameterSupplierForStep(11, () => {
            return (
                new hashgraph.ContractFunctionParameters()
                    // when contracts work with a public key, they handle the raw bytes of the public key
                    .addBytes(alicePublicKey.toBytesRaw())
            );
        })
        .setPayableAmountForStep(11, new hashgraph.Hbar(40))
        // Because we're setting the adminKey for the created NFT token to Alice's key,
        // Alice must sign the ContractExecuteTransaction.
        .addSignerForStep(11, alicePrivateKey)
        // and Alice must sign for minting because her key is the supply key.
        .addSignerForStep(12, alicePrivateKey)
        .setParameterSupplierForStep(12, () => {
            return (
                new hashgraph.ContractFunctionParameters()
                    // add three metadatas
                    .addBytesArray([
                        new Uint8Array([0x01b]),
                        new Uint8Array([0x02b]),
                        new Uint8Array([0x03b]),
                    ])
            );
        }) // and alice must sign to become associated with the token.
        .addSignerForStep(13, alicePrivateKey)
        // Alice must sign to burn the token because her key is the supply key
        .addSignerForStep(16, alicePrivateKey);

    // step 0 tests pseudo random number generator (PRNG)
    // step 1 creates a fungible token
    // step 2 mints it
    // step 3 associates Alice with it
    // step 4 transfers it to Alice.
    // step 5 approves an allowance of the fungible token with operator as the owner and Alice as the spender [NOT WORKING]
    // steps 6 - 10 test misc functions on the fungible token (see PrecompileExample.sol for details).
    // step 11 creates an NFT token with a custom fee, and with the admin and supply set to Alice's key
    // step 12 mints some NFTs
    // step 13 associates Alice with the NFT token
    // step 14 transfers some NFTs to Alice
    // step 15 approves an NFT allowance with operator as the owner and Alice as the spender [NOT WORKING]
    // step 16 burn some NFTs

    await contractHelper.executeSteps(
        /* from step */ 0,
        /* to step */ 16,
        wallet
    );

    console.log("All steps completed with valid results.");
}

void main();
