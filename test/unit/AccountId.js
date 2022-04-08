import { expect } from "chai";

import { AccountId, PublicKey } from "../../src/index.js";

import BigNumber from "bignumber.js";

describe("AccountId", function () {
    it("constructors", function () {
        expect(new AccountId(3).toString()).to.be.equal("0.0.3");
        expect(new AccountId(1, 2, 3).toString()).to.be.equal("1.2.3");
        expect(
            new AccountId({
                shard: 1,
                realm: 2,
                num: 3,
            }).toString()
        ).to.be.equal("1.2.3");
        expect(
            new AccountId(
                1,
                2,
                0,
                PublicKey.fromString(
                    "302a300506032b657003210008d5a4eebdb9b8451b64d8ad1ff502b493590e513e5e9c9f810dd3258f298542"
                )
            ).toString()
        ).to.be.equal(
            "1.2.302a300506032b657003210008d5a4eebdb9b8451b64d8ad1ff502b493590e513e5e9c9f810dd3258f298542"
        );
        expect(AccountId.fromString("1.2.3").toString()).to.be.equal("1.2.3");
        expect(
            AccountId.fromString(
                "1.2.302a300506032b657003210008d5a4eebdb9b8451b64d8ad1ff502b493590e513e5e9c9f810dd3258f298542"
            ).toString()
        ).to.be.equal(
            "1.2.302a300506032b657003210008d5a4eebdb9b8451b64d8ad1ff502b493590e513e5e9c9f810dd3258f298542"
        );
    });

    it("should construct from (shard, realm, num)", function () {
        const accountId = new AccountId(10, 50, 25050);

        expect(accountId.num.toNumber()).to.eql(25050);
        expect(accountId.realm.toNumber()).to.eql(50);
        expect(accountId.shard.toNumber()).to.eql(10);
    });

    it("should construct from (0, 0, 0)", function () {
        const accountId = new AccountId(0, 0, 0);

        expect(accountId.num.toNumber()).to.eql(0);
        expect(accountId.realm.toNumber()).to.eql(0);
        expect(accountId.shard.toNumber()).to.eql(0);
    });

    it("should construct from (num)", function () {
        const accountId = new AccountId(25050);

        expect(accountId.num.toNumber()).to.eql(25050);
        expect(accountId.realm.toNumber()).to.eql(0);
        expect(accountId.shard.toNumber()).to.eql(0);
    });

    it("should parse {shard}.{realm}.{num}", function () {
        const accountId = AccountId.fromString("10.50.25050");

        expect(accountId.num.toNumber()).to.eql(25050);
        expect(accountId.realm.toNumber()).to.eql(50);
        expect(accountId.shard.toNumber()).to.eql(10);
    });

    it("should parse 0.0.0", function () {
        const accountId = AccountId.fromString("0.0.0");

        expect(accountId.num.toNumber()).to.eql(0);
        expect(accountId.realm.toNumber()).to.eql(0);
        expect(accountId.shard.toNumber()).to.eql(0);
    });

    it("should parse {num}", function () {
        const accountId = AccountId.fromString("25050");

        expect(accountId.num.toNumber()).to.eql(25050);
        expect(accountId.realm.toNumber()).to.eql(0);
        expect(accountId.shard.toNumber()).to.eql(0);
    });

    it("should error with invalid string", function () {
        let err = false;

        try {
            AccountId.fromString("asdfasf");
        } catch {
            err = true;
        }

        try {
            AccountId.fromString(" .0.1");
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error("`AccountId.fromString()` did not error");
        }

        try {
            AccountId.fromString("");
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error("`AccountId.fromString()` did not error");
        }

        try {
            AccountId.fromString("0.0");
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error("`AccountId.fromString()` did not error");
        }

        try {
            AccountId.fromString("0.0.");
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error("`AccountId.fromString()` did not error");
        }

        try {
            AccountId.fromString("0.0.a");
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error("`AccountId.fromString()` did not error");
        }

        try {
            AccountId.fromString("0.0.-a");
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error("`AccountId.fromString()` did not error");
        }
    });

    it("should error when string negative numbers are directly passed to constructor", function () {
        let err = false;

        try {
            AccountId.fromString("0.0.-1");
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error(
                "`AccountId.constructor` with negative numbers did not error"
            );
        }

        try {
            AccountId.fromString("-1.-1.-1");
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error(
                "`AccountId.constructor` with negative numbers did not error"
            );
        }

        try {
            new AccountId(0, 0, -1);
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error(
                "`AccountId.constructor` with negative numbers did not error"
            );
        }

        try {
            new AccountId(-1, -1, -1);
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error(
                "`AccountId.constructor` with negative numbers did not error"
            );
        }

        try {
            new AccountId(-1);
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error(
                "`AccountId.constructor` with negative numbers did not error"
            );
        }

        try {
            new AccountId(new BigNumber(-1));
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error(
                "`AccountId.constructor` with negative numbers did not error"
            );
        }

        try {
            new AccountId(
                new BigNumber(-1),
                new BigNumber(-1),
                new BigNumber(-1)
            );
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error(
                "`AccountId.constructor` with negative numbers did not error"
            );
        }
    });
});
