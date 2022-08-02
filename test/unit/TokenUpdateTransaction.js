import {
    PrivateKey,
    TokenUpdateTransaction,
    TransactionId,
    AccountId,
    Timestamp,
} from "../../src/index.js";
import Long from "long";

describe("TokenUpdateTransaction", function () {
    it("encodes to correct protobuf", function () {
        const key1 = PrivateKey.fromString("302e020100300506032b6570042204205fc37fbd55631722b7ab5ec8e31696f6d3f818a15c5258a1529de7d4a1def6e2");
        const key2 = PrivateKey.fromString("302e020100300506032b657004220420b5e15b70109fe6e11d1d6d06b20d27b494aa05a28a8bc84c627d9be66e179391");
        const key3 = PrivateKey.fromString("302e020100300506032b6570042204202b5dc9915d5b6829592f4562a3d099e7b1bdd48da347e351da8d31cd41653016");
        const key4 = PrivateKey.fromString("302e020100300506032b6570042204205a8571fe4badbc6bd76f03170f5ec4bdc69f2edb93f133477d0ef8f9e17a0f3a");
        const key5 = PrivateKey.fromString("302e020100300506032b65700422042081c36f46db2bc4e7d993a23718a158c9fffa96719d7e72b3823d8bc9b973d596");
        const key6 = PrivateKey.fromString("302e020100300506032b657004220420ff498f69b92ea43a0a8fd6e4a7036e5f8b5f23e527b0443bc309cc4ff5b75303");
        const key7 = PrivateKey.fromString("302e020100300506032b657004220420542b4d4a318a1ae5f91071f34c8d900b1150e83d15fe71d22b8581e1203f99ad");
        const autoRenewAccountId = new AccountId(10);
        const treasuryAccountId = new AccountId(11);

        const transaction = new TokenUpdateTransaction()
            .setTransactionId(
                TransactionId.withValidStart(
                    new AccountId(1),
                    new Timestamp(2, 3)
                )
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
});
