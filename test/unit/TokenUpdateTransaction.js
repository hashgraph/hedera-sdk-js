import {
    PrivateKey,
    TokenUpdateTransaction,
    TransactionId,
    AccountId,
    Timestamp,
    TokenKeyValidation,
} from "../../src/index.js";
import Long from "long";

describe("TokenUpdateTransaction", function () {
    it("encodes to correct protobuf", function () {
        const key1 = PrivateKey.fromStringDer(
            "302e020100300506032b6570042204205fc37fbd55631722b7ab5ec8e31696f6d3f818a15c5258a1529de7d4a1def6e2",
        );
        const key2 = PrivateKey.fromStringDer(
            "302e020100300506032b657004220420b5e15b70109fe6e11d1d6d06b20d27b494aa05a28a8bc84c627d9be66e179391",
        );
        const key3 = PrivateKey.fromStringDer(
            "302e020100300506032b6570042204202b5dc9915d5b6829592f4562a3d099e7b1bdd48da347e351da8d31cd41653016",
        );
        const key4 = PrivateKey.fromStringDer(
            "302e020100300506032b6570042204205a8571fe4badbc6bd76f03170f5ec4bdc69f2edb93f133477d0ef8f9e17a0f3a",
        );
        const key5 = PrivateKey.fromStringDer(
            "302e020100300506032b65700422042081c36f46db2bc4e7d993a23718a158c9fffa96719d7e72b3823d8bc9b973d596",
        );
        const key6 = PrivateKey.fromStringDer(
            "302e020100300506032b657004220420ff498f69b92ea43a0a8fd6e4a7036e5f8b5f23e527b0443bc309cc4ff5b75303",
        );
        const key7 = PrivateKey.fromStringDer(
            "302e020100300506032b657004220420542b4d4a318a1ae5f91071f34c8d900b1150e83d15fe71d22b8581e1203f99ad",
        );
        const key8 = PrivateKey.fromStringDer(
            "302e020100300506032b6570042204205447805ce906170817e2bd4e26f4ea1fd5bbc38a2532c7f66b7d7a24f60ee9d5",
        );
        const metadata = new Uint8Array([1, 2, 3, 4, 5]);
        const autoRenewAccountId = new AccountId(10);
        const treasuryAccountId = new AccountId(11);

        const transaction = new TokenUpdateTransaction()
            .setTransactionId(
                TransactionId.withValidStart(
                    new AccountId(1),
                    new Timestamp(2, 3),
                ),
            )
            .setTokenName("name")
            .setTokenSymbol("symbol")
            .setTokenMemo("memo")
            .setTreasuryAccountId(treasuryAccountId)
            .setAutoRenewAccountId(autoRenewAccountId)
            .setAdminKey(key1)
            .setKycKey(key2)
            .setFreezeKey(key3)
            .setPauseKey(key4)
            .setWipeKey(key5)
            .setSupplyKey(key6)
            .setFeeScheduleKey(key7)
            .setMetadata(metadata)
            .setMetadataKey(key8)
            .setNodeAccountIds([new AccountId(4)])
            .setTokenId("0.0.5")
            .setTransactionMemo("random memo")
            .freeze();

        const protobuf = transaction._makeTransactionBody();

        expect(protobuf).to.deep.include({
            tokenUpdate: {
                token: {
                    tokenNum: Long.fromNumber(5),
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                },
                name: "name",
                symbol: "symbol",
                memo: {
                    value: "memo",
                },
                autoRenewAccount: autoRenewAccountId._toProtobuf(),
                autoRenewPeriod: null,
                expiry: null,
                treasury: treasuryAccountId._toProtobuf(),
                keyVerificationMode:
                    TokenKeyValidation.FullValidation.valueOf(),
                adminKey: {
                    ed25519: key1.publicKey.toBytesRaw(),
                },
                kycKey: {
                    ed25519: key2.publicKey.toBytesRaw(),
                },
                freezeKey: {
                    ed25519: key3.publicKey.toBytesRaw(),
                },
                pauseKey: {
                    ed25519: key4.publicKey.toBytesRaw(),
                },
                wipeKey: {
                    ed25519: key5.publicKey.toBytesRaw(),
                },
                supplyKey: {
                    ed25519: key6.publicKey.toBytesRaw(),
                },
                feeScheduleKey: {
                    ed25519: key7.publicKey.toBytesRaw(),
                },
                metadata: {
                    value: metadata,
                },
                metadataKey: {
                    ed25519: key8.publicKey.toBytesRaw(),
                },
            },
            transactionFee: Long.fromNumber(200000000),
            memo: "random memo",
            transactionID: {
                accountID: {
                    accountNum: Long.fromNumber(1),
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    alias: null,
                },
                transactionValidStart: {
                    seconds: Long.fromNumber(2),
                    nanos: 3,
                },
                scheduled: false,
                nonce: null,
            },
            nodeAccountID: null,
            transactionValidDuration: {
                seconds: Long.fromNumber(120),
            },
        });
    });

    it("all properties should be equal to their initial values", async function () {
        const tx = new TokenUpdateTransaction();
        const tx2 = TokenUpdateTransaction.fromBytes(tx.toBytes());

        expect(tx.tokenId).to.be.null;
        expect(tx.tokenName).to.be.null;
        expect(tx.tokenSymbol).to.be.null;
        expect(tx.treasuryAccountId).to.be.null;
        expect(tx.adminKey).to.be.null;
        expect(tx.kycKey).to.be.null;
        expect(tx.freezeKey).to.be.null;
        expect(tx.wipeKey).to.be.null;
        expect(tx.supplyKey).to.be.null;
        expect(tx.autoRenewAccountId).to.be.null;
        expect(tx.expirationTime).to.be.null;
        expect(tx.autoRenewPeriod).to.be.null;
        expect(tx.tokenMemo).to.be.null;
        expect(tx.feeScheduleKey).to.be.null;
        expect(tx.pauseKey).to.be.null;
        expect(tx.metadata).to.be.null;

        expect(tx2.tokenId).to.be.null;
        expect(tx2.tokenName).to.be.null;
        expect(tx2.tokenSymbol).to.be.null;
        expect(tx2.treasuryAccountId).to.be.null;
        expect(tx2.adminKey).to.be.null;
        expect(tx2.kycKey).to.be.null;
        expect(tx2.freezeKey).to.be.null;
        expect(tx2.wipeKey).to.be.null;
        expect(tx2.supplyKey).to.be.null;
        expect(tx2.autoRenewAccountId).to.be.null;
        expect(tx2.expirationTime).to.be.null;
        expect(tx2.autoRenewPeriod).to.be.null;
        expect(tx2.tokenMemo).to.be.null;
        expect(tx2.feeScheduleKey).to.be.null;
        expect(tx2.pauseKey).to.be.null;
        expect(tx2.metadata).to.be.null;
    });
});
