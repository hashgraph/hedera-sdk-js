import {
    AccountCreateTransaction,
    AccountBalanceQuery,
    AccountInfoQuery,
    TokenAssociateTransaction,
    TokenDissociateTransaction,
    TokenCreateTransaction,
    Hbar,
    Status,
    PrivateKey,
} from "../src/exports.js";
import newClient from "./client/index.js";

describe("TokenDissociate", function () {
    it("should be executable", async function () {
        this.timeout(20000);

        const client = await newClient(true);
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(2))
            .execute(client);

        const account = (await response.getReceipt(client)).accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds([response.nodeId])
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
                    .execute(client)
            ).getReceipt(client)
        ).tokenId;

        await (
            await (
                await new TokenAssociateTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setTokenIds([token])
                    .setAccountId(account)
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);

        let balances = await new AccountBalanceQuery()
            .setNodeAccountIds([response.nodeId])
            .setAccountId(account)
            .execute(client);

        expect(balances.tokens.get(token).toInt()).to.be.equal(0);

        let info = await new AccountInfoQuery()
            .setNodeAccountIds([response.nodeId])
            .setAccountId(account)
            .execute(client);

        const relationship = info.tokenRelationships.get(token);

        expect(relationship).to.be.not.null;
        expect(relationship.tokenId.toString()).to.be.equal(token.toString());
        expect(relationship.balance.toInt()).to.be.equal(0);
        expect(relationship.isKycGranted).to.be.false;
        expect(relationship.isFrozen).to.be.false;

        await (
            await (
                await new TokenDissociateTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setTokenIds([token])
                    .setAccountId(account)
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);

        balances = await new AccountBalanceQuery()
            .setNodeAccountIds([response.nodeId])
            .setAccountId(account)
            .execute(client);

        expect(balances.tokens.get(token)).to.be.null;

        info = await new AccountInfoQuery()
            .setNodeAccountIds([response.nodeId])
            .setAccountId(account)
            .execute(client);

        expect(info.tokenRelationships.get(token)).to.be.null;
    });

    it("should be executable even when no token IDs are set", async function () {
        this.timeout(10000);

        const client = await newClient(true);
        const operatorId = client.operatorAccountId;

        await (
            await new TokenDissociateTransaction()
                .setAccountId(operatorId)
                .execute(client)
        ).getReceipt(client);
    });

    it("should error when account ID is not set", async function () {
        this.timeout(10000);

        const client = await newClient(true);
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;

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
            .execute(client);

        const token = (await response.getReceipt(client)).tokenId;

        let err = false;

        try {
            await (
                await new TokenDissociateTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setTokenIds([token])
                    .execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidAccountId);
        }

        if (!err) {
            throw new Error("token association did not error");
        }
    });
});
