import { expect } from "chai";

import { AccountId } from "../../src/exports.js";

import Client from "../../src/client/NodeClient.js";

describe("ChecksumValidation", function () {
    it("should parse mainnet ID with checksum {0.0.123-vfmkw}", function () {
        const accountId = AccountId.fromString("0.0.123-vfmkw");

        expect(accountId.num.toNumber()).to.eql(123);
        expect(accountId.realm.toNumber()).to.eql(0);
        expect(accountId.shard.toNumber()).to.eql(0);

        expect(accountId.toStringWithChecksum(Client.forMainnet())).to.be.eql(
            "0.0.123-vfmkw"
        );
    });

    it("should parse testnet ID with checksum {0.0.123-rmkyk}", function () {
        const accountId = AccountId.fromString("0.0.123-rmkyk");

        expect(accountId.num.toNumber()).to.eql(123);
        expect(accountId.realm.toNumber()).to.eql(0);
        expect(accountId.shard.toNumber()).to.eql(0);

        expect(accountId.toStringWithChecksum(Client.forTestnet())).to.be.eql(
            "0.0.123-rmkyk"
        );
    });

    it("should parse previewnet ID with checksum {0.0.123-ntjly}", function () {
        const accountId = AccountId.fromString("0.0.123-ntjly");

        expect(accountId.num.toNumber()).to.eql(123);
        expect(accountId.realm.toNumber()).to.eql(0);
        expect(accountId.shard.toNumber()).to.eql(0);

        expect(
            accountId.toStringWithChecksum(Client.forPreviewnet())
        ).to.be.eql("0.0.123-ntjly");
    });
});
