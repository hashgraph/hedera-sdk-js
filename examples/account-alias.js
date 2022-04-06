import {
    Client,
    PrivateKey,
    PublicKey,
    Hbar,
    AccountId,
    AccountBalanceQuery,
    AccountInfoQuery,
    TransferTransaction,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    let client;

    try {
        // Defaults the operator account ID and key such that all generated transactions will be paid for
        // by this account and be signed by this key
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    } catch (error) {
        throw new Error(
            "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    /*
     * Hedera supports a form of lazy account creation.
     *
     * You can "create" an account by generating a private key, and then deriving the public key,
     * without any need to interact with the Hedera network.  The public key more or less acts as the user's
     * account ID.  This public key is an account's aliasKey: a public key that aliases (or will eventually alias)
     * to a Hedera account.
     *
     * An AccountId takes one of two forms: a normal AccountId with a null aliasKey member takes the form 0.0.123,
     * while an account ID with a non-null aliasKey member takes the form
     * 0.0.302a300506032b6570032100114e6abc371b82dab5c15ea149f02d34a012087b163516dd70f44acafabf7777
     * Note the prefix of "0.0." indicating the shard and realm.  Also note that the aliasKey is stringified
     * as a hex-encoded ASN1 DER representation of the key.
     *
     * An AccountId with an aliasKey can be used just like a normal AccountId for the purposes of queries and
     * transactions, however most queries and transactions involving such an AccountId won't work until Hbar has
     * been transferred to the aliasKey account.
     *
     * There is no record in the Hedera network of an account associated with a given aliasKey
     * until an amount of Hbar is transferred to the account.  The moment that Hbar is transferred to that aliasKey
     * AccountId is the moment that that account actually begins to exist in the Hedera ledger.
     */

    console.log('"Creating" a new account');

    const privateKey = PrivateKey.generateED25519();
    const publicKey = privateKey.publicKey;

    // Assuming that the target shard and realm are known.
    // For now they are virtually always 0 and 0.
    const aliasAccountId = publicKey.toAccountId(0, 0);

    console.log(`New account ID: ${aliasAccountId.toString()}`);
    console.log(`Just the aliasKey: ${aliasAccountId.aliasKey.toString()}`);

    /*
     * Note that no queries or transactions have taken place yet.
     * This account "creation" process is entirely local.
     *
     * AccountId.fromString() can construct an AccountId with an aliasKey.
     * It expects a string of the form 0.0.123 in the case of a normal AccountId, or of the form
     * 0.0.302a300506032b6570032100114e6abc371b82dab5c15ea149f02d34a012087b163516dd70f44acafabf7777
     * in the case of an AccountId with aliasKey.  Note the prefix of "0.0." to indicate the shard and realm.
     *
     * If the shard and realm are known, you may use PublicKey.fromString().toAccountId() to construct the
     * aliasKey AccountId
     */

    AccountId.fromString(
        "0.0.302a300506032b6570032100114e6abc371b82dab5c15ea149f02d34a012087b163516dd70f44acafabf7777"
    );

    PublicKey.fromString(
        "302a300506032b6570032100114e6abc371b82dab5c15ea149f02d34a012087b163516dd70f44acafabf7777"
    ).toAccountId(0, 0);

    console.log("Transferring some Hbar to the new account");
    await (
        await new TransferTransaction()
            .addHbarTransfer(client.operatorAccountId, new Hbar(10).negated())
            .addHbarTransfer(aliasAccountId, new Hbar(10))
            .execute(client)
    ).getReceipt(client);

    const balance = await new AccountBalanceQuery()
        .setAccountId(aliasAccountId)
        .execute(client);

    console.log(`Balances of the new account: ${balance.toString()}`);

    const info = await new AccountInfoQuery()
        .setAccountId(aliasAccountId)
        .execute(client);

    console.log(`Info about the new account: ${info.toString()}`);

    /*
     * Note that once an account exists in the ledger, it is assigned a normal AccountId, which can be retrieved
     * via an AccountInfoQuery.
     *
     * Users may continue to refer to the account by its aliasKey AccountId, but they may also
     * now refer to it by its normal AccountId
     */

    console.log(`The normal account ID: ${info.accountId.toString()}`);
    console.log(`The alias key: ${info.aliasKey.toString()}`);

    console.log("Example complete!");
    client.close();
}

void main();
