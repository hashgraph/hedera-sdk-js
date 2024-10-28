/* eslint-disable mocha/no-setup-in-describe */

import {
    AccountCreateTransaction,
    AccountId,
    FileCreateTransaction,
    Hbar,
    HbarUnit,
    PrivateKey,
    Timestamp,
    Transaction,
    TransactionId,
} from "../../src/index.js";
import * as hex from "../../src/encoding/hex.js";
import Client from "../../src/client/NodeClient.js";
import * as HashgraphProto from "@hashgraph/proto";
import Long from "long";
import BigNumber from "bignumber.js";
import SignatureMap from "../../src/transaction/SignatureMap.js";

describe("Transaction", function () {
    it("toBytes", async function () {
        const key = PrivateKey.fromStringDer(
            "302e020100300506032b657004220420a58d361e61756ee809686255fda09bacb846ea8aa589c67ac39cfbcf82dd511c",
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
            transaction.toBytes(),
        );
        const transactionFromBytesToBytes = hex.encode(
            transactionFromBytes.toBytes(),
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
                .toString(),
        ).to.be.equal(new Hbar(1).negated().toTinybars().toString());
        expect(
            transaction.hbarTransfers
                .get(new AccountId(476267))
                .toTinybars()
                .toString(),
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

        const sigMap = transaction.getSignatures();
        expect(sigMap.size).to.be.equal(1);

        for (const [nodeAccountId, nodeSignatures] of sigMap) {
            const transactionSignatures = nodeSignatures.get(
                transaction.transactionId,
            );
            expect(nodeAccountId.toString()).equals("0.0.6");
            expect(transactionSignatures.size).to.be.equal(2);
            expect(transactionSignatures.get(key1.publicKey)).to.not.be.null;
            expect(transactionSignatures.get(key2.publicKey)).to.not.be.null;

            for (const [publicKey] of transactionSignatures) {
                expect(publicKey.verifyTransaction(transaction)).to.be.true;
            }
        }
    });

    it("sets max transaction fee", async function () {
        const nodeAccountId = new AccountId(3);
        const client = Client.forTestnet({
            scheduleNetworkUpdate: false,
        }).setDefaultMaxTransactionFee(Hbar.fromTinybars(1));

        const transaction = new FileCreateTransaction()
            .setNodeAccountIds([nodeAccountId])
            .setTransactionId(TransactionId.generate(nodeAccountId))
            .setContents("Hello world")
            .freezeWith(client);

        expect(transaction.maxTransactionFee.toTinybars().toInt()).to.be.equal(
            1,
        );
    });

    it("fromBytes fails when bodies differ", function () {
        const key1 = PrivateKey.fromStringDer(
            "302e020100300506032b657004220420a58d361e61756ee809686255fda09bacb846ea8aa589c67ac39cfbcf82dd511c",
        );
        const key2 = PrivateKey.fromStringDer(
            "302e020100300506032b657004220420a58d361e61756ee809686255fda09bacb846ea8aa589c67ac39cfbcf82dd511d",
        );

        const transactionID = TransactionId.withValidStart(
            new AccountId(9),
            new Timestamp(10, 11),
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
                "transaction successfully built from invalid bytes",
            );
        }
    });

    describe("balance must be the same before and after serialization/deserialization", function () {
        // Declare float number
        const FLOAT_NUMBER = 8.02341424;

        // Declare integer number from float number
        const INTEGER_NUMBER = Math.floor(FLOAT_NUMBER);

        // Declare diffrent number types
        const NUMBERS = {
            INTEGER: INTEGER_NUMBER,
            FLOAT: FLOAT_NUMBER,
        };
        const NUMBER_TYPES = Object.keys(NUMBERS);

        // Loop through different numbers
        NUMBER_TYPES.forEach((number_type) => {
            // Declare number
            const number = NUMBERS[number_type];
            const isNumberInteger = Number.isInteger(number);

            describe(`when ${number_type.toLowerCase()} number of ${number} is passed:`, function () {
                // Declare different types of parameter
                const PARAMETERS = {
                    STRING: `${number}`,
                    NUMBER: number,
                    LONG_NUMBER: Long.fromValue(number),
                    BIG_NUMBER: new BigNumber(number),
                    ...(isNumberInteger && {
                        HBAR: (unit) => Hbar.fromString(`${number}`, unit),
                    }),
                };
                const PARAMETERS_TYPES = Object.keys(PARAMETERS);

                // Loop through different parameter types
                PARAMETERS_TYPES.forEach((parameter_type) => {
                    // Declare parameter
                    const parameter = PARAMETERS[parameter_type];

                    // If the parameter is instance of Hbar then pass the unit
                    if (typeof parameter == "function") {
                        // Declare different units
                        const UNITS_NAMES = Object.keys(HbarUnit);
                        // Loop through different units
                        UNITS_NAMES.forEach((unit) => {
                            it(`as ${parameter_type
                                .split("_")
                                .join(" ")
                                .toLowerCase()} in ${unit}`, function () {
                                // Create transaction
                                const transaction =
                                    new AccountCreateTransaction();

                                // Set initial balance
                                transaction.setInitialBalance(
                                    parameter(HbarUnit[unit]),
                                );

                                // Serialize transaction
                                const transactionBytes = transaction.toBytes();

                                // Deserialize transaction
                                const transactionFromBytes =
                                    Transaction.fromBytes(transactionBytes);

                                // Compare balance before and after serialization/deserialization
                                expect(
                                    transaction.initialBalance.toString(
                                        HbarUnit[unit],
                                    ),
                                ).to.be.equal(
                                    transactionFromBytes.initialBalance.toString(
                                        HbarUnit[unit],
                                    ),
                                );
                            });
                        });
                    } else {
                        it(`as ${parameter_type
                            .split("_")
                            .join(" ")
                            .toLowerCase()}`, function () {
                            // Create transaction
                            const transaction = new AccountCreateTransaction();

                            // Set initial balance
                            transaction.setInitialBalance(parameter);

                            // Serialize transaction
                            const transactionBytes = transaction.toBytes();

                            // Deserialize transaction
                            const transactionFromBytes =
                                Transaction.fromBytes(transactionBytes);

                            // Compare balance before and after serialization/deserialization
                            expect(
                                transaction.initialBalance.toString(
                                    HbarUnit.Hbar,
                                ),
                            ).to.be.equal(
                                transactionFromBytes.initialBalance.toString(
                                    HbarUnit.Hbar,
                                ),
                            );
                        });
                    }
                });
            });
        });
    });

    describe("addSignature tests", function () {
        let transaction, nodeAccountIds, account, txId;

        beforeEach(function () {
            account = PrivateKey.generateED25519();
            nodeAccountIds = [new AccountId(3), new AccountId(4)];
            txId = TransactionId.generate(nodeAccountIds[0]);

            transaction = new AccountCreateTransaction()
                .setKey(account.publicKey)
                .setNodeAccountIds(nodeAccountIds)
                .setTransactionId(txId)
                .freeze();
        });

        it("should add a single signature when one transaction is present", async function () {
            const sigMap = new SignatureMap();
            const pubKey = account.publicKey;

            const signaturesArray = [];
            for (const tx of transaction._signedTransactions.list) {
                //                const sig = op.sign(txChunk.bodyBytes);
                const txBody = HashgraphProto.proto.TransactionBody.decode(
                    tx.bodyBytes,
                );
                const txId = TransactionId._fromProtobuf(txBody.transactionID);
                const nodeAccountId = AccountId._fromProtobuf(
                    txBody.nodeAccountID,
                );
                const sig = account.sign(tx.bodyBytes);
                sigMap.addSignature(nodeAccountId, txId, pubKey, sig);
                signaturesArray.push(sig);
            }

            transaction.addSignature(pubKey, sigMap);

            const sigPairMap = transaction
                .getSignatures()
                .getFlatSignatureList();

            expect(sigPairMap.length).to.equal(
                transaction._signedTransactions.length,
            );

            /*
             This works because the order of the signatures in the sigPairMap
             is the same as the order of the signatures in the transaction.
            */
            for (const sigPair of sigPairMap) {
                expect(sigPair.get(pubKey)).to.equal(signaturesArray.shift());
            }
        });
    });

    describe("Transaction removeSignature/removeAllSignatures methods", function () {
        let key1, key2, key3;
        let transaction, transactionId, nodeAccountId;

        beforeEach(async function () {
            const account = AccountId.fromString("0.0.1004");
            const validStart = new Timestamp(1451, 590);
            transactionId = new TransactionId(account, validStart);
            nodeAccountId = new AccountId(3);

            key1 = PrivateKey.generateED25519();
            key2 = PrivateKey.generateED25519();
            key3 = PrivateKey.generateED25519();

            transaction = new AccountCreateTransaction()
                .setInitialBalance(new Hbar(2))
                .setTransactionId(transactionId)
                .setNodeAccountIds([nodeAccountId])
                .freeze();
        });

        const signAndAddSignatures = (transaction, ...keys) => {
            for (const key of keys) {
                const sigMap = createSigmap(transaction, key);
                transaction.addSignature(key.publicKey, sigMap);
            }

            return transaction.getSignatures();
        };

        const createSigmap = (transaction, key) => {
            const sigMap = new SignatureMap();
            for (const tx of transaction._signedTransactions.list) {
                const txBody = HashgraphProto.proto.TransactionBody.decode(
                    tx.bodyBytes,
                );
                const txId = TransactionId._fromProtobuf(txBody.transactionID);
                const nodeAccountId = AccountId._fromProtobuf(
                    txBody.nodeAccountID,
                );
                const sig = key.sign(tx.bodyBytes);

                sigMap.addSignature(nodeAccountId, txId, key.publicKey, sig);
            }
            return sigMap;
        };

        it("should remove a specific signature", function () {
            // Sign the transaction with multiple keys
            signAndAddSignatures(transaction, key1);

            // console.log(transaction);

            //Check if the transaction internal tracking of signer public keys is correct
            expect(transaction._signerPublicKeys.size).to.equal(1);
            expect(transaction._publicKeys.length).to.equal(1);
            expect(transaction._transactionSigners.length).to.equal(1);

            // Ensure all signatures are present before removal
            const signaturesBefore = transaction
                .getSignatures()
                .getFlatSignatureList();

            expect(signaturesBefore.length).to.equal(1);

            // Remove one signature
            transaction.removeSignature(key1.publicKey);

            //Check if the transaction is frozen
            expect(transaction.isFrozen()).to.be.true;

            //Check if the transaction internal tracking of signer public keys is correct
            expect(transaction._signerPublicKeys.size).to.equal(0);
            expect(transaction._publicKeys.length).to.equal(0);
            expect(transaction._transactionSigners.length).to.equal(0);

            // Ensure the specific signature has been removed
            const signaturesAfter = transaction.getSignatures();
            expect(
                signaturesAfter
                    .get(new AccountId(3))
                    .get(transaction.transactionId).size,
            ).to.equal(0);
        });

        it("should clear all signatures", function () {
            // Sign the transaction with multiple keys
            signAndAddSignatures(transaction, key1, key2, key3);

            // Ensure all signatures are present before clearing
            const signaturesBefore = transaction.getSignatures();
            expect(
                signaturesBefore
                    .get(new AccountId(3))
                    .get(transaction.transactionId).size,
            ).to.equal(3);

            // Clear all signatures
            transaction.removeAllSignatures();

            //Check if the transaction is frozen
            expect(transaction.isFrozen()).to.be.true;

            //Check if the transaction internal tracking of signer public keys is cleared
            expect(transaction._signerPublicKeys.size).to.equal(0);
            expect(transaction._publicKeys.length).to.equal(0);
            expect(transaction._transactionSigners.length).to.equal(0);

            // Ensure all signatures have been cleared
            const signaturesAfter = transaction.getSignatures();
            expect(
                signaturesAfter
                    .get(new AccountId(3))
                    .get(transaction.transactionId).size,
            ).to.equal(0);
        });

        it("should not remove a non-existing signature", function () {
            // Sign the transaction with multiple keys
            signAndAddSignatures(transaction, key1, key2);

            // Attempt to remove a non-existing signature
            expect(() => {
                transaction.removeSignature(key3.publicKey);
            }).to.throw("The public key has not signed this transaction");

            // Ensure signatures are not affected
            const signaturesAfter = transaction
                .getSignatures()
                .get(new AccountId(3))
                .get(transaction.transactionId);
            expect(signaturesAfter.size).to.equal(2);
        });

        it("should clear and re-sign after all signatures are cleared", function () {
            // Sign the transaction with multiple keys
            signAndAddSignatures(transaction, key1, key2);

            // Ensure all signatures are present before clearing
            const signaturesBefore = transaction
                .getSignatures()
                .get(new AccountId(3))
                .get(transaction.transactionId);
            expect(signaturesBefore.size).to.equal(2);

            // Clear all signatures
            transaction.removeAllSignatures();

            // Ensure all signatures have been cleared
            const signaturesAfterClear = transaction
                .getSignatures()
                .get(new AccountId(3))
                .get(transaction.transactionId);
            expect(signaturesAfterClear.size).to.equal(0);

            // Re-sign the transaction with a different key
            const signature3 = key3.signTransaction(transaction);
            transaction.addSignature(key3.publicKey, signature3);

            // Ensure only one signature exists after re-signing
            const signaturesAfterResign = transaction.getSignatures();
            expect(signaturesAfterResign.get(new AccountId(3)).size).to.equal(
                1,
            );
        });

        it("should return the removed signature in Uint8Array format when removing a specific signature", function () {
            // Sign the transaction with multiple keys
            signAndAddSignatures(transaction, key1);

            // Remove one signature and capture the returned value
            const removedSignatures = transaction.removeSignature(
                key1.publicKey,
            );

            // Check the format of the returned value
            expect(removedSignatures).to.be.an("array");
            expect(removedSignatures.length).to.equal(1);
            expect(removedSignatures[0]).to.be.instanceOf(Uint8Array);
        });

        it("should return all removed signatures in the expected Map format when clearing all signatures", function () {
            // Sign the transaction with multiple keys
            signAndAddSignatures(transaction, key1, key2, key3);

            // Clear all signatures and capture the returned Map
            const removedSignatures = transaction.removeAllSignatures();

            // Check the format of the returned value
            expect(removedSignatures).to.be.instanceOf(Map);

            // Check if the Map contains keys using the toString() method
            const key1Exists = Array.from(removedSignatures.keys()).some(
                (key) => key.toString() === key1.publicKey.toString(),
            );
            const key2Exists = Array.from(removedSignatures.keys()).some(
                (key) => key.toString() === key2.publicKey.toString(),
            );
            const key3Exists = Array.from(removedSignatures.keys()).some(
                (key) => key.toString() === key3.publicKey.toString(),
            );

            // Assert that all keys exist
            expect(key1Exists).to.be.true;
            expect(key2Exists).to.be.true;
            expect(key3Exists).to.be.true;

            // Retrieve values using the keys and convert them to strings for comparison
            const signaturesArray1 = removedSignatures.get(
                Array.from(removedSignatures.keys()).find(
                    (key) => key.toString() === key1.publicKey.toString(),
                ),
            );

            const signaturesArray2 = removedSignatures.get(
                Array.from(removedSignatures.keys()).find(
                    (key) => key.toString() === key2.publicKey.toString(),
                ),
            );

            const signaturesArray3 = removedSignatures.get(
                Array.from(removedSignatures.keys()).find(
                    (key) => key.toString() === key3.publicKey.toString(),
                ),
            );

            // Validate that the retrieved arrays are present
            expect(signaturesArray1).to.be.an("array").that.is.not.empty;
            expect(signaturesArray2).to.be.an("array").that.is.not.empty;
            expect(signaturesArray3).to.be.an("array").that.is.not.empty;

            // Ensure the removed signatures are in the expected format
            [signaturesArray1, signaturesArray2, signaturesArray3].forEach(
                (signaturesArray) => {
                    signaturesArray.forEach((sig) => {
                        expect(sig).to.be.instanceOf(Uint8Array);
                    });
                },
            );
        });

        it("should return an empty object when no signatures are present", function () {
            expect(transaction._signerPublicKeys.size).to.equal(0);

            // Clear all signatures and capture the returned value
            const removedSignatures = transaction.removeAllSignatures();

            // Check the format of the returned value
            expect(removedSignatures).to.be.instanceOf(Map);
            expect(Object.keys(removedSignatures)).to.have.lengthOf(0);
        });

        it("should return an empty Map if transaction.sigMap is undefined", function () {
            transaction._signedTransactions.list = [1];

            const result = transaction.removeAllSignatures();
            expect(result).to.be.instanceOf(Map);
            expect(result.size).to.equal(0);
        });

        it("should return an empty Map if sigPair.pubKeyPrefix is undefined", function () {
            transaction._signedTransactions.list[0].sigMap = { sigPair: [1] };

            const result = transaction.removeAllSignatures();
            expect(result).to.be.instanceOf(Map);
            expect(result.size).to.equal(0);
        });
    });
});
