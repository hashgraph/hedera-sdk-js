import {
    AccountId,
    Hbar,
    PrivateKey,
    Timestamp,
    Transaction,
    TransactionId,
    Query,
    AccountAllowanceApproveTransaction,
    AccountAllowanceDeleteTransaction,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    AccountUpdateTransaction,
    ContractCreateTransaction,
    ContractDeleteTransaction,
    ContractExecuteTransaction,
    ContractUpdateTransaction,
    EthereumTransaction,
    FileAppendTransaction,
    FileCreateTransaction,
    FileDeleteTransaction,
    FileUpdateTransaction,
    FreezeTransaction,
    LiveHashAddTransaction,
    LiveHashDeleteTransaction,
    // ScheduleCreateTransaction,
    ScheduleDeleteTransaction,
    ScheduleSignTransaction,
    SystemDeleteTransaction,
    SystemUndeleteTransaction,
    TokenAssociateTransaction,
    TokenBurnTransaction,
    TokenCreateTransaction,
    TokenDeleteTransaction,
    TokenDissociateTransaction,
    TokenFeeScheduleUpdateTransaction,
    TokenFreezeTransaction,
    TokenGrantKycTransaction,
    TokenMintTransaction,
    TokenPauseTransaction,
    TokenRevokeKycTransaction,
    TokenUnfreezeTransaction,
    TokenUnpauseTransaction,
    TokenUpdateTransaction,
    TokenWipeTransaction,
    TopicCreateTransaction,
    TopicDeleteTransaction,
    TopicMessageSubmitTransaction,
    TopicUpdateTransaction,
    TransferTransaction,
    AccountBalanceQuery,
    AccountInfoQuery,
    AccountRecordsQuery,
    AccountStakersQuery,
    ContractByteCodeQuery,
    ContractCallQuery,
    ContractInfoQuery,
    FileContentsQuery,
    FileInfoQuery,
    LiveHashQuery,
    NetworkVersionInfoQuery,
    ScheduleInfoQuery,
    TokenInfoQuery,
    TokenNftInfoQuery,
    TopicInfoQuery,
    TransactionReceiptQuery,
    TransactionRecordQuery,
} from "../../src/index.js";
import ObjectMap from "../../src/ObjectMap.js";
import * as hex from "../../src/encoding/hex.js";
import Client from "../../src/client/NodeClient.js";
import * as HashgraphProto from "@hashgraph/proto";
import Long from "long";

/**
 * @type {hashgraph.Transaction[]}
 */
const TRANSACTIONS = [
    new AccountAllowanceApproveTransaction(),
    new AccountAllowanceDeleteTransaction(),
    new AccountCreateTransaction(),
    new AccountDeleteTransaction(),
    new AccountUpdateTransaction(),
    new ContractCreateTransaction(),
    new ContractDeleteTransaction(),
    new ContractExecuteTransaction(),
    new ContractUpdateTransaction(),
    new EthereumTransaction(),
    new FileAppendTransaction(),
    new FileCreateTransaction(),
    new FileDeleteTransaction(),
    new FileUpdateTransaction(),
    new FreezeTransaction(),
    new LiveHashAddTransaction(),
    new LiveHashDeleteTransaction(),
    // new ScheduleCreateTransaction(),
    new ScheduleDeleteTransaction(),
    new ScheduleSignTransaction(),
    new SystemDeleteTransaction(),
    new SystemUndeleteTransaction(),
    new TokenAssociateTransaction(),
    new TokenBurnTransaction(),
    new TokenCreateTransaction(),
    new TokenDeleteTransaction(),
    new TokenDissociateTransaction(),
    new TokenFeeScheduleUpdateTransaction(),
    new TokenFreezeTransaction(),
    new TokenGrantKycTransaction(),
    new TokenMintTransaction(),
    new TokenPauseTransaction(),
    new TokenRevokeKycTransaction(),
    new TokenUnfreezeTransaction(),
    new TokenUnpauseTransaction(),
    new TokenUpdateTransaction(),
    new TokenWipeTransaction(),
    new TopicCreateTransaction(),
    new TopicDeleteTransaction(),
    new TopicMessageSubmitTransaction(),
    new TopicUpdateTransaction(),
    new TransferTransaction(),
];

/**
 * @type {hashgraph.Query<*>[]}
 */
const QUERIES = [
    new AccountBalanceQuery(),
    new AccountInfoQuery(),
    new AccountRecordsQuery(),
    new AccountStakersQuery(),
    new ContractByteCodeQuery(),
    new ContractCallQuery(),
    new ContractInfoQuery(),
    new FileContentsQuery(),
    new FileInfoQuery(),
    new LiveHashQuery(),
    new NetworkVersionInfoQuery(),
    new ScheduleInfoQuery(),
    new TokenInfoQuery(),
    new TokenNftInfoQuery(),
    new TopicInfoQuery(),
    new TransactionReceiptQuery(),
    new TransactionRecordQuery(),
];

/**
 * @type {hashgraph.Executable<*, *, *>[]}
 */
const REQUESTS = [...TRANSACTIONS, ...QUERIES];

describe("Transaction", function () {
    it("toBytes", async function () {
        const key = PrivateKey.fromString(
            "302e020100300506032b657004220420a58d361e61756ee809686255fda09bacb846ea8aa589c67ac39cfbcf82dd511c"
        );
        const account = AccountId.fromString("0.0.1004");
        const validStart = new Timestamp(1451, 590);
        const transactionId = new TransactionId(account, validStart);

        const hexBytes =
            "0adb012ad8010a6e0a130a0608ab0b10ce0412070800100018ec0718001206080010001803188084af5f2202087832005a440a2212206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc4830ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012660a640a206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc481a406f7b1823defed495205f67504243abd623bef1eb9dc4053b879b5e25fff382814172d0676464a6a5b7adfc7968ae8af236ac91fd751d632c0412b5f77431930d0adb012ad8010a6e0a130a0608ab0b10ce0412070800100018ec0718001206080010001804188084af5f2202087832005a440a2212206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc4830ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012660a640a206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc481a408d3fb2b8da90457cc447771361b0e27f784b70664604a5490a135595a69f2bbf2fd725a703174999d25f6f295cd58f116210dffefb94703c34fc8107be0a7908";

        const transaction = await new AccountCreateTransaction()
            .setKey(key)
            .setNodeAccountIds([new AccountId(3), new AccountId(4)])
            .setTransactionId(transactionId)
            .freeze()
            .sign(key);

        const transactionBytesHex = hex.encode(transaction.toBytes());
        expect(transactionBytesHex).to.eql(hexBytes);

        const transactionFromBytes = Transaction.fromBytes(
            transaction.toBytes()
        );
        const transactionFromBytesToBytes = hex.encode(
            transactionFromBytes.toBytes()
        );

        expect(transactionFromBytesToBytes).to.eql(hexBytes);
    });

    it("getTransactionHash", async function () {
        const hexHash =
            "c0a5795719f786f055d30c5881ea56165560cb6ab0615fc627d93dc7d4b6674b281dd826c4984aa868c97bd8bbf92178";

        const hexBytes =
            "0ad8012ad5010a6b0a130a0608ab0b10ce0412070800100018ec0718001206080010001803188084af5f2202087832005a410a2212206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc4830ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0312660a640a206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc481a40adf8af54cee6bdd27d7fc40c992bb120daffad9a808aaf7900d44dae61313615b9cc692710bd1e872985ceecebcd7d75b662eb7a6a2853f53c8bac7bb9ec30020ad8012ad5010a6b0a130a0608ab0b10ce0412070800100018ec0718001206080010001804188084af5f2202087832005a410a2212206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc4830ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0312660a640a206e0433faf04e8a674a114ed04d27bd43b0549a2ed69c9709a5a2058922c0cc481a40e9eeb92c37b44f6a1ee51ff573034cd8393066409575e758f99a13124adb897c0b354e23e949558898f7c4f0be59ddf4603f408247ccf9f003408df860d8070b";

        const transaction = Transaction.fromBytes(hex.decode(hexBytes));

        const hash = await transaction.getTransactionHash();

        expect(hexHash).to.be.equal(hex.encode(hash));
    });

    it("can decode raw protobuf transaction bytes", async function () {
        const hexBytes =
            "1acc010a640a2046fe5013b6f6fc796c3e65ec10d2a10d03c07188fc3de13d46caad6b8ec4dfb81a4045f1186be5746c9783f68cb71d6a71becd3ffb024906b855ac1fa3a2601273d41b58446e5d6a0aaf421c229885f9e70417353fab2ce6e9d8e7b162e9944e19020a640a20f102e75ff7dc3d72c9b7075bb246fcc54e714c59714814011e8f4b922d2a6f0a1a40f2e5f061349ab03fa21075020c75cf876d80498ae4bac767f35941b8e3c393b0e0a886ede328e44c1df7028ea1474722f2dcd493812d04db339480909076a10122500a180a0c08a1cc98830610c092d09e0312080800100018e4881d120608001000180418b293072202087872240a220a0f0a080800100018e4881d10ff83af5f0a0f0a080800100018eb881d108084af5f";

        const transaction = Transaction.fromBytes(hex.decode(hexBytes));

        expect(
            transaction.hbarTransfers
                .get(new AccountId(476260))
                .toTinybars()
                .toString()
        ).to.be.equal(new Hbar(1).negated().toTinybars().toString());
        expect(
            transaction.hbarTransfers
                .get(new AccountId(476267))
                .toTinybars()
                .toString()
        ).to.be.equal(new Hbar(1).toTinybars().toString());
    });

    it("sign", async function () {
        const key1 = PrivateKey.generateED25519();
        const key2 = PrivateKey.generateECDSA();

        const transaction = new AccountCreateTransaction()
            .setNodeAccountIds([new AccountId(6)])
            .setTransactionId(TransactionId.generate(new AccountId(7)))
            .freeze();

        await transaction.sign(key1);
        await transaction.sign(key2);

        expect(key1.publicKey.verifyTransaction(transaction)).to.be.true;
        expect(key2.publicKey.verifyTransaction(transaction)).to.be.true;

        const signatures = transaction.getSignatures();
        expect(signatures.size).to.be.equal(1);

        for (const [nodeAccountId, nodeSignatures] of signatures) {
            expect(nodeAccountId.toString()).equals("0.0.6");

            expect(nodeSignatures.size).to.be.equal(2);
            for (const [publicKey] of nodeSignatures) {
                expect(publicKey.verifyTransaction(transaction)).to.be.true;
            }
        }
    });

    it("sets max transaction fee", async function () {
        const nodeAccountId = new AccountId(3);
        const client = Client.forTestnet().setMaxTransactionFee(
            Hbar.fromTinybars(1)
        );

        const transaction = new FileCreateTransaction()
            .setNodeAccountIds([nodeAccountId])
            .setTransactionId(TransactionId.generate(nodeAccountId))
            .setContents("Hello world")
            .freezeWith(client);

        expect(transaction.maxTransactionFee.toTinybars().toInt()).to.be.equal(
            1
        );
    });

    it("fromBytes fails when bodies differ", function () {
        const key1 = PrivateKey.fromString(
            "302e020100300506032b657004220420a58d361e61756ee809686255fda09bacb846ea8aa589c67ac39cfbcf82dd511c"
        );
        const key2 = PrivateKey.fromString(
            "302e020100300506032b657004220420a58d361e61756ee809686255fda09bacb846ea8aa589c67ac39cfbcf82dd511d"
        );

        const transactionID = TransactionId.withValidStart(
            new AccountId(9),
            new Timestamp(10, 11)
        );
        const nodeAccountID1 = new AccountId(3);
        const nodeAccountID2 = new AccountId(4);

        /** @type {proto.ITransactionBody} */
        const body1 = {
            transactionID: transactionID._toProtobuf(),
            nodeAccountID: nodeAccountID1._toProtobuf(),
            transactionFee: Long.fromNumber(1),
            transactionValidDuration: { seconds: 120 },
            cryptoCreateAccount: {
                key: key1.publicKey._toProtobufKey(),
            },
        };

        /** @type {proto.ITransactionBody} */
        const body2 = {
            transactionID: transactionID._toProtobuf(),
            nodeAccountID: nodeAccountID2._toProtobuf(),
            transactionFee: Long.fromNumber(1),
            transactionValidDuration: { seconds: 120 },
            cryptoCreateAccount: {
                key: key2.publicKey._toProtobufKey(),
            },
        };

        const bodyBytes1 =
            HashgraphProto.proto.TransactionBody.encode(body1).finish();
        const bodyBytes2 =
            HashgraphProto.proto.TransactionBody.encode(body2).finish();

        const signedTransaction1 =
            HashgraphProto.proto.SignedTransaction.encode({
                bodyBytes: bodyBytes1,
            }).finish();
        const signedTransaction2 =
            HashgraphProto.proto.SignedTransaction.encode({
                bodyBytes: bodyBytes2,
            }).finish();

        const transaction1 = { signedTransactionBytes: signedTransaction1 };
        const transaction2 = { signedTransactionBytes: signedTransaction2 };

        const list = HashgraphProto.proto.TransactionList.encode({
            transactionList: [transaction1, transaction2],
        }).finish();

        let err = false;

        try {
            Transaction.fromBytes(list);
        } catch (error) {
            err =
                error.toString() ===
                "Error: failed to validate transaction bodies";
        }

        if (!err) {
            throw new Error(
                "transaction successfully built from invalid bytes"
            );
        }
    });

    it("can serialize and deserialize all requests", function() {
        const transactionId = TransactionId.generate(new AccountId(4));
        for (const request of REQUESTS) {
            /** @type {Executable<*, *, *>} */
            let req;

            if (request instanceof Transaction) {
                const bytes = /** @type {Transaction} */ (request)
                    .setTransactionId(transactionId)
                    .setNodeAccountIds([new AccountId(3)])
                    .freeze()
                    .toBytes();
                req = Transaction.fromBytes(bytes);
            } else {
                const bytes = request.toBytes();
                req = Query.fromBytes(bytes);
            }

            expect(request.constructor.name).to.be.equal(req.constructor.name);

            let proto = request;

            while (proto != null) {
                const properties = Object.getOwnPropertyNames(Object.getPrototypeOf(req));

                for (const property of properties) {
                    if (property.startsWith("_")) {
                        continue;
                    }

                    const requestProperty = request[property];
                    const reqProperty = req[property];

                    if (requestProperty instanceof ObjectMap) {
                        expect(/** @type {ObjectMap<*, *> */(requestProperty).compare(reqProperty)).to.be.true;
                    } else {
                        expect(request[property]).to.deep.equal(req[property], `${request.constructor.name} doesn't match property ${property}`);
                    }
                }

                proto = proto.__proto__;
            }
        }
    });
});
