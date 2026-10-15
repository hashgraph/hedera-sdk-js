import {
    FileInfo,
    FileId,
    Timestamp,
    KeyList,
    LedgerId,
    PrivateKey,
} from "../../src/index.js";
import Long from "long";

describe("FileInfo", function () {
    describe("_fromProtobuf", function () {
        it("should map all fields from protobuf", function () {
            const publicKey = PrivateKey.generateED25519().publicKey;
            const proto = {
                fileID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    fileNum: Long.fromNumber(123),
                },
                size: Long.fromNumber(1024),
                expirationTime: {
                    seconds: Long.fromNumber(1700000000),
                    nanos: 500000000,
                },
                deleted: true,
                keys: {
                    keys: [publicKey._toProtobufKey()],
                },
                memo: "test memo",
                ledgerId: LedgerId.TESTNET.toBytes(),
            };

            const fileInfo = FileInfo._fromProtobuf(proto);

            expect(fileInfo.fileId.toString()).to.equal("0.0.123");
            expect(fileInfo.size.toNumber()).to.equal(1024);
            expect(fileInfo.expirationTime.seconds.toNumber()).to.equal(
                1700000000,
            );
            expect(fileInfo.expirationTime.nanos.toNumber()).to.equal(
                500000000,
            );
            expect(fileInfo.isDeleted).to.equal(true);
            expect(fileInfo.keys.toArray().length).to.equal(1);
            expect(fileInfo.fileMemo).to.equal("test memo");
            expect(fileInfo.ledgerId).to.not.be.null;
        });

        it("should convert plain number size to Long", function () {
            const proto = {
                fileID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    fileNum: Long.fromNumber(123),
                },
                size: 2048,
                expirationTime: {
                    seconds: Long.fromNumber(1700000000),
                    nanos: 0,
                },
                deleted: false,
            };

            const fileInfo = FileInfo._fromProtobuf(proto);

            expect(fileInfo.size).to.be.instanceOf(Long);
            expect(fileInfo.size.toNumber()).to.equal(2048);
        });

        it("should handle missing keys with empty KeyList", function () {
            const proto = {
                fileID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    fileNum: Long.fromNumber(123),
                },
                size: Long.fromNumber(512),
                expirationTime: {
                    seconds: Long.fromNumber(1700000000),
                    nanos: 0,
                },
                deleted: false,
            };

            const fileInfo = FileInfo._fromProtobuf(proto);

            expect(fileInfo.keys).to.be.instanceOf(KeyList);
            expect(fileInfo.keys.toArray().length).to.equal(0);
        });

        it("should handle missing memo with empty string", function () {
            const proto = {
                fileID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    fileNum: Long.fromNumber(123),
                },
                size: Long.fromNumber(512),
                expirationTime: {
                    seconds: Long.fromNumber(1700000000),
                    nanos: 0,
                },
                deleted: false,
            };

            const fileInfo = FileInfo._fromProtobuf(proto);

            expect(fileInfo.fileMemo).to.equal("");
        });

        it("should handle missing ledgerId with null", function () {
            const proto = {
                fileID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    fileNum: Long.fromNumber(123),
                },
                size: Long.fromNumber(512),
                expirationTime: {
                    seconds: Long.fromNumber(1700000000),
                    nanos: 0,
                },
                deleted: false,
            };

            const fileInfo = FileInfo._fromProtobuf(proto);

            expect(fileInfo.ledgerId).to.be.null;
        });
    });

    describe("toBytes and fromBytes round-trip", function () {
        it("should preserve fileId through round-trip", function () {
            const publicKey = PrivateKey.generateED25519().publicKey;
            const proto = {
                fileID: {
                    shardNum: Long.fromNumber(1),
                    realmNum: Long.fromNumber(2),
                    fileNum: Long.fromNumber(456),
                },
                size: Long.fromNumber(2048),
                expirationTime: {
                    seconds: Long.fromNumber(1700000000),
                    nanos: 123456789,
                },
                deleted: false,
                keys: {
                    keys: [publicKey._toProtobufKey()],
                },
                memo: "round-trip test",
                ledgerId: LedgerId.TESTNET.toBytes(),
            };

            const original = FileInfo._fromProtobuf(proto);
            const bytes = original.toBytes();
            const restored = FileInfo.fromBytes(bytes);

            expect(restored.fileId.toString()).to.equal(
                original.fileId.toString(),
            );
        });

        it("should preserve size through round-trip", function () {
            const proto = {
                fileID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    fileNum: Long.fromNumber(789),
                },
                size: Long.fromNumber(4096),
                expirationTime: {
                    seconds: Long.fromNumber(1700000000),
                    nanos: 0,
                },
                deleted: false,
            };

            const original = FileInfo._fromProtobuf(proto);
            const bytes = original.toBytes();
            const restored = FileInfo.fromBytes(bytes);

            expect(restored.size.toNumber()).to.equal(original.size.toNumber());
        });

        it("should preserve expirationTime through round-trip", function () {
            const proto = {
                fileID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    fileNum: Long.fromNumber(999),
                },
                size: Long.fromNumber(1024),
                expirationTime: {
                    seconds: Long.fromNumber(1750000000),
                    nanos: 987654321,
                },
                deleted: false,
            };

            const original = FileInfo._fromProtobuf(proto);
            const bytes = original.toBytes();
            const restored = FileInfo.fromBytes(bytes);

            expect(restored.expirationTime.seconds.toNumber()).to.equal(
                original.expirationTime.seconds.toNumber(),
            );
            expect(restored.expirationTime.nanos.toNumber()).to.equal(
                original.expirationTime.nanos.toNumber(),
            );
        });

        it("should preserve deleted flag through round-trip", function () {
            const proto = {
                fileID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    fileNum: Long.fromNumber(111),
                },
                size: Long.fromNumber(512),
                expirationTime: {
                    seconds: Long.fromNumber(1700000000),
                    nanos: 0,
                },
                deleted: true,
            };

            const original = FileInfo._fromProtobuf(proto);
            const bytes = original.toBytes();
            const restored = FileInfo.fromBytes(bytes);

            expect(restored.isDeleted).to.equal(original.isDeleted);
        });

        it("should preserve keys through round-trip", function () {
            const publicKey = PrivateKey.generateED25519().publicKey;
            const proto = {
                fileID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    fileNum: Long.fromNumber(222),
                },
                size: Long.fromNumber(1024),
                expirationTime: {
                    seconds: Long.fromNumber(1700000000),
                    nanos: 0,
                },
                deleted: false,
                keys: {
                    keys: [publicKey._toProtobufKey()],
                },
            };

            const original = FileInfo._fromProtobuf(proto);
            const bytes = original.toBytes();
            const restored = FileInfo.fromBytes(bytes);

            expect(restored.keys.toArray().length).to.equal(
                original.keys.toArray().length,
            );
        });

        it("should preserve memo through round-trip", function () {
            const proto = {
                fileID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    fileNum: Long.fromNumber(333),
                },
                size: Long.fromNumber(2048),
                expirationTime: {
                    seconds: Long.fromNumber(1700000000),
                    nanos: 0,
                },
                deleted: false,
                memo: "important file memo",
            };

            const original = FileInfo._fromProtobuf(proto);
            const bytes = original.toBytes();
            const restored = FileInfo.fromBytes(bytes);

            expect(restored.fileMemo).to.equal(original.fileMemo);
        });

        it("should preserve ledgerId when set through round-trip", function () {
            const proto = {
                fileID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    fileNum: Long.fromNumber(444),
                },
                size: Long.fromNumber(1024),
                expirationTime: {
                    seconds: Long.fromNumber(1700000000),
                    nanos: 0,
                },
                deleted: false,
                ledgerId: LedgerId.TESTNET.toBytes(),
            };

            const original = FileInfo._fromProtobuf(proto);
            const bytes = original.toBytes();
            const restored = FileInfo.fromBytes(bytes);

            expect(restored.ledgerId).to.not.be.null;
            expect(restored.ledgerId.toString()).to.equal(
                LedgerId.TESTNET.toString(),
            );
        });
    });

    describe("object frozen", function () {
        it("should be frozen after construction", function () {
            const proto = {
                fileID: {
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    fileNum: Long.fromNumber(555),
                },
                size: Long.fromNumber(1024),
                expirationTime: {
                    seconds: Long.fromNumber(1700000000),
                    nanos: 0,
                },
                deleted: false,
            };

            const fileInfo = FileInfo._fromProtobuf(proto);

            expect(Object.isFrozen(fileInfo)).to.be.true;
        });
    });
});
