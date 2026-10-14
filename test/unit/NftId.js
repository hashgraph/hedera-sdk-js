import { NftId, TokenId } from "../../src/index.js";
import Long from "long";

describe("NftId", function () {
    describe("constructor", function () {
        it("should convert number serial to Long", function () {
            const tokenId = new TokenId(0, 0, 123);
            const nftId = new NftId(tokenId, 45);

            expect(nftId.tokenId).to.eql(tokenId);
            expect(nftId.serial).to.be.instanceOf(Long);
            expect(nftId.serial.toNumber()).to.equal(45);
        });

        it("should keep Long serial as Long", function () {
            const tokenId = new TokenId(0, 0, 123);
            const serial = Long.fromNumber(45);
            const nftId = new NftId(tokenId, serial);

            expect(nftId.tokenId).to.eql(tokenId);
            expect(nftId.serial).to.equal(serial);
            expect(nftId.serial.toNumber()).to.equal(45);
        });
    });

    describe("fromString", function () {
        it("should parse NFT ID with / separator", function () {
            const nftId = NftId.fromString("0.0.123/45");

            expect(nftId.tokenId.toString()).to.equal("0.0.123");
            expect(nftId.serial.toNumber()).to.equal(45);
        });

        it("should parse NFT ID with @ separator", function () {
            const nftId = NftId.fromString("0.0.123@45");

            expect(nftId.tokenId.toString()).to.equal("0.0.123");
            expect(nftId.serial.toNumber()).to.equal(45);
        });

        it("should parse token ID with checksum", function () {
            const nftId = NftId.fromString("0.0.123-abcde/45");

            expect(nftId.tokenId.shard.toNumber()).to.equal(0);
            expect(nftId.tokenId.realm.toNumber()).to.equal(0);
            expect(nftId.tokenId.num.toNumber()).to.equal(123);
            expect(nftId.serial.toNumber()).to.equal(45);
        });

        it("should parse serial with leading zeros", function () {
            const nftId = NftId.fromString("0.0.123/045");

            expect(nftId.tokenId.toString()).to.equal("0.0.123");
            expect(nftId.serial.toNumber()).to.equal(45);
        });

        it("should throw error for missing separator", function () {
            expect(() => NftId.fromString("0.0.123")).to.throw(
                "invalid format for NftId: use [token]/[serial] or [token]@[serial]",
            );
        });

        it("should throw error for serial with letters", function () {
            expect(() => NftId.fromString("0.0.123/abc")).to.throw(
                "invalid format for NftId: use [token]/[serial] or [token]@[serial]",
            );
        });

        it("should throw error for negative serial", function () {
            expect(() => NftId.fromString("0.0.123/-1")).to.throw(
                "invalid format for NftId: use [token]/[serial] or [token]@[serial]",
            );
        });

        it("should throw error for multiple slashes", function () {
            expect(() => NftId.fromString("0.0.123/45/6")).to.throw(
                "invalid format for NftId: use [token]/[serial] or [token]@[serial]",
            );
        });

        it("should throw error for mixed separators", function () {
            expect(() => NftId.fromString("0.0.123/45@6")).to.throw(
                "invalid format for NftId: use [token]/[serial] or [token]@[serial]",
            );
        });

        it("should throw error for empty token with /", function () {
            expect(() => NftId.fromString("/45")).to.throw(
                "invalid format for NftId: use [token]/[serial] or [token]@[serial]",
            );
        });

        it("should throw error for empty serial with /", function () {
            expect(() => NftId.fromString("0.0.123/")).to.throw(
                "invalid format for NftId: use [token]/[serial] or [token]@[serial]",
            );
        });

        it("should throw error for empty token with @", function () {
            expect(() => NftId.fromString("@45")).to.throw(
                "invalid format for NftId: use [token]/[serial] or [token]@[serial]",
            );
        });

        it("should throw error for empty serial with @", function () {
            expect(() => NftId.fromString("0.0.123@")).to.throw(
                "invalid format for NftId: use [token]/[serial] or [token]@[serial]",
            );
        });

        it("should throw error for serial with decimal point", function () {
            expect(() => NftId.fromString("0.0.123/45.6")).to.throw(
                "invalid format for NftId: use [token]/[serial] or [token]@[serial]",
            );
        });

        it("should throw error for serial with spaces", function () {
            expect(() => NftId.fromString("0.0.123/4 5")).to.throw(
                "invalid format for NftId: use [token]/[serial] or [token]@[serial]",
            );
        });
    });

    describe("toString", function () {
        it("should always use / separator", function () {
            const nftId1 = NftId.fromString("0.0.123/45");
            expect(nftId1.toString()).to.equal("0.0.123/45");

            const nftId2 = NftId.fromString("0.0.123@45");
            expect(nftId2.toString()).to.equal("0.0.123/45");
        });
    });

    describe("toBytes and fromBytes", function () {
        it("should preserve token ID and serial through round-trip", function () {
            const original = new NftId(new TokenId(0, 0, 123), 45);
            const bytes = original.toBytes();
            const restored = NftId.fromBytes(bytes);

            expect(restored.tokenId.toString()).to.equal(
                original.tokenId.toString(),
            );
            expect(restored.serial.toNumber()).to.equal(
                original.serial.toNumber(),
            );
        });
    });

    describe("_fromProtobuf", function () {
        it("should handle missing serialNumber as 0", function () {
            const proto = {
                token_ID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    tokenNum: Long.fromNumber(123),
                },
            };

            const nftId = NftId._fromProtobuf(proto);

            expect(nftId.tokenId.toString()).to.equal("0.0.123");
            expect(nftId.serial.toNumber()).to.equal(0);
        });

        it("should handle present serialNumber", function () {
            const proto = {
                token_ID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    tokenNum: Long.fromNumber(123),
                },
                serialNumber: Long.fromNumber(45),
            };

            const nftId = NftId._fromProtobuf(proto);

            expect(nftId.tokenId.toString()).to.equal("0.0.123");
            expect(nftId.serial.toNumber()).to.equal(45);
        });
    });
});
