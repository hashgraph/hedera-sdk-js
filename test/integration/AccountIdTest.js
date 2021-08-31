import { AccountId, TokenId } from "../src/exports.js";
import IntegrationTestEnv, { Client } from "./client/index.js";

describe("AccountId", function () {
    it("should generate checksum for account ID", function () {
        const client = Client.forMainnet();
        const accountId = new AccountId(123);

        expect(accountId.num.toNumber()).to.eql(123);
        expect(accountId.realm.toNumber()).to.eql(0);
        expect(accountId.shard.toNumber()).to.eql(0);

        expect(accountId.toStringWithChecksum(client)).to.be.eql(
            "0.0.123-vfmkw"
        );
    });

    it("should generate checksum for token ID", function () {
        const client = Client.forMainnet();
        const tokenId = new TokenId(123);

        expect(tokenId.num.toNumber()).to.eql(123);
        expect(tokenId.realm.toNumber()).to.eql(0);
        expect(tokenId.shard.toNumber()).to.eql(0);

        expect(tokenId.toStringWithChecksum(client)).to.be.eql("0.0.123-vfmkw");
    });

    it("should parse previewnet ID with checksum {0.0.123-ghaha}", function () {
        let err = false;

        try {
            AccountId.fromString("0.0.123-ghaha").validateChecksum(
                IntegrationTestEnv.forMainnet()
            );
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error("entity parsing did not err");
        }
    });
});
