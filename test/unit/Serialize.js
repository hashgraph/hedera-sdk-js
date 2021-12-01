import { expect } from "chai";
import {
    AccountId,
    Hbar,
    PrivateKey,
    Timestamp,
    Transaction,
    TransactionId,
    TransferTransaction,
} from "../src/exports.js";

const PRIVATE_KEY1 =
    "302e020100300506032b657004220420ba0cc58a039afe36f3bd1f1c4ef44750268b35b5388dcae326752816da33be3f";
const PRIVATE_KEY2 =
    "302e020100300506032b6570042204202421c0faec4b8cb59214ed6c46e351637678d5b5cff811fd9855fa25b98519b6";
const SERIALIZED =
    "0ac8022ac5020a740a130a080880d4818e061000120708001000189a0512060800100018071880c2d72f2202087832225472616e73616374696f6e202864652973657269616c697a6174696f6e207465737472280a260a110a080800100018c0c4071091a6afa5f8020a110a080800100018f1f7271092a6afa5f80212cc010a640a20d6868558baa9c23e2308ccc75a0f11176727a16cbb1e8312c2eb727cc517b1c91a4065953badd76ceccbefa03de68034d87295da494c16bfdb4f42ce2259d6aee507cf623b89931f564741aa96a776f339709e7ee9eb5cb6ccd83cba2d588c87d9030a640a2036d767d5857eaf6a665886103f434464cd06ce56f00bf6b6b67ca0906350aea11a405f4d536e6b1b7bc00c1d30f34ac3f3e9d8fac471509f86d1bb7a5343d52564559da3cb69a2f2f069541891e8ea367a12c605c6fdcd2c719b058299112ecd0004";

const params = {
    nodeId: AccountId.fromString("0.0.7"),
    operatorId: AccountId.fromString("0.0.666"),
    senderId: AccountId.fromString("0.0.123456"),
    recipientId: AccountId.fromString("0.0.654321"),
    validStart: Timestamp.fromDate(new Date(1640000000000)),
    amount: Hbar.fromTinybars("50505050505"),
    fee: Hbar.fromTinybars("100000000"),
    memo: "Transaction (de)serialization test",
};

const serialize = (tx) => tx.toBytes().toString("hex");
const deserialize = (s) => Transaction.fromBytes(Buffer.from(s, "hex"));
const sign = (tx, privateKeyHex) =>
    PrivateKey.fromBytes(Buffer.from(privateKeyHex, "hex")).signTransaction(tx);

const buildTx = (params) => {
    const transactionId = TransactionId.withValidStart(
        params.operatorId,
        params.validStart
    );
    const unbuiltTx = new TransferTransaction()
        .setMaxTransactionFee(params.fee)
        .setTransactionId(transactionId)
        .setNodeAccountIds([params.nodeId])
        .setTransactionMemo(params.memo)
        .addHbarTransfer(params.senderId, params.amount.negated())
        .addHbarTransfer(params.recipientId, params.amount);
    return unbuiltTx.freeze();
};

describe("Mix signing and serialization", function () {
    it("Sign then serialize", function () {
        const tx = buildTx(params);
        sign(tx, PRIVATE_KEY1);
        sign(tx, PRIVATE_KEY2);
        const serialized = serialize(tx);
        expect(serialized).equals(SERIALIZED);
    });
    it("Call serialize before signing without using it", function () {
        const tx = buildTx(params);
        serialize(tx);
        sign(tx, PRIVATE_KEY1);
        sign(tx, PRIVATE_KEY2);
        const serialized = serialize(tx);
        expect(serialized).equals(SERIALIZED);
    });
    it("Call serialize between signing without using it", function () {
        const tx = buildTx(params);
        sign(tx, PRIVATE_KEY1);
        serialize(tx);
        sign(tx, PRIVATE_KEY2);
        const serialized = serialize(tx);
        expect(serialized).equals(SERIALIZED);
    });
    it("Serialize, deserialize then sign", function () {
        let tx = buildTx(params);
        tx = deserialize(serialize(tx));
        sign(tx, PRIVATE_KEY1);
        sign(tx, PRIVATE_KEY2);
        const serialized = serialize(tx);
        expect(serialized).equals(SERIALIZED);
    });
    it("Sign, serialize, deserialize then sign again", function () {
        let tx = buildTx(params);
        sign(tx, PRIVATE_KEY1);
        tx = deserialize(serialize(tx));
        sign(tx, PRIVATE_KEY2);
        const serialized = serialize(tx);
        expect(serialized).equals(SERIALIZED);
    });
    it("Sign then serialize, deserialize", function () {
        let tx = buildTx(params);
        sign(tx, PRIVATE_KEY1);
        sign(tx, PRIVATE_KEY2);
        tx = deserialize(serialize(tx));
        const serialized = serialize(tx);
        expect(serialized).equals(SERIALIZED);
    });
});
