import { expect } from "chai";

import { PrivateKey } from "../../src/index.js";
import * as hex from "../../src/encoding/hex.js";

const RAW_KEY =
    "302e020100300506032b657004220420a7bd8982bb05415bbc1e2dc2ae6aced66cba5eb871a4afd1579f8620b8c00d37";

describe("Ed25519PrivateKey", function () {
    it("generate should return  object", function () {
        PrivateKey.generateED25519();
    });

    it("generateAsync should return  object", async function () {
        await PrivateKey.generateED25519Async();
    });

    it("fromStringRaw and fromStringDer work", function () {
        PrivateKey.fromString(
            hex.encode(PrivateKey.fromStringED25519(RAW_KEY).toBytesDer())
        );
    });

    it("public key from a private key", function () {
        expect(
            PrivateKey.fromStringED25519(RAW_KEY).publicKey.toStringRaw()
        ).to.be.equal(
            "b0c169d4e4b6b70f5a6d7beecd892e009390e1a113821f5d761b21725c39ac91"
        );
    });

    it("SLIP10 test vector 1", async function () {
        // generate master PrivateKey with 'fromSeedED25519' and child key derivation
        // and test them against the provided constants which are always the source of truth
        // source - https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-1-for-ed25519

        const TEST1 =
            "2b4be7f19ee27bbf30c667b642d5f4aa69fd169872f8fc3059c08ebae2eb19e7";
        const TEST2 =
            "68e0fe46dfb67e368c75379acec591dad19df3cde26e63b93a8e704f1dade7a3";
        const TEST3 =
            "b1d0bad404bf35da785a64ca1ac54b2617211d2777696fbffaf208f746ae84f2";
        const TEST4 =
            "92a5b23c0b8a99e37d07df3fb9966917f5d06e02ddbd909c7e184371463e9fc9";
        const TEST5 =
            "30d1dc7e5fc04c31219ab25a27ae00b50f6fd66622f6e9c913253d6511d1e662";
        const TEST6 =
            "8f94d394a8e8fd6b1bc2f3f49f5c47e385281d5c17e65324b0f62483e37e8793";


        const seed = hex.decode("000102030405060708090a0b0c0d0e0f");

        // Chain m
        const key1 = await PrivateKey.fromSeedED25519(seed);
        expect(key1.toStringRaw()).to.be.equal(TEST1);
        console.log(`key1: ${key1.chainCode}`);

        // Chain m/0'
        const key2 = await key1.derive(0);
        expect(key2.toStringRaw()).to.be.equal(TEST2);

        // Chain m/0'/1'
        const key3 = await key2.derive(1);
        expect(key3.toStringRaw()).to.be.equal(TEST3);

        // Chain m/0'/1'/2'
        const key4 = await key3.derive(2);
        expect(key4.toStringRaw()).to.be.equal(TEST4);

        // Chain m/0'/1'/2'/2'
        const key5 = await key4.derive(2);
        expect(key5.toStringRaw()).to.be.equal(TEST5);

        // Chain m/0'/1'/2'/2'/1000000000'
        const key6 = await key5.derive(1000000000);
        expect(key6.toStringRaw()).to.be.equal(TEST6);
    });

    it("SLIP10 test vector 2", async function () {
        // generate master PrivateKey with 'fromSeedED25519' and child key derivation
        // and test them against the provided constants which are always the source of truth
        // source - https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-2-for-ed25519
        
        var TEST1 =
            "171cb88b1b3c1db25add599712e36245d75bc65a1a5c9e18d76f9f2b1eab4012";
        var TEST2 =
            "1559eb2bbec5790b0c65d8693e4d0875b1747f4970ae8b650486ed7470845635";
        var TEST3 =
            "ea4f5bfe8694d8bb74b7b59404632fd5968b774ed545e810de9c32a4fb4192f4";
        var TEST4 =
            "3757c7577170179c7868353ada796c839135b3d30554bbb74a4b1e4a5a58505c";
        var TEST5 =
            "5837736c89570de861ebc173b1086da4f505d4adb387c6a1b1342d5e4ac9ec72";
        var TEST6 =
            "551d333177df541ad876a60ea71f00447931c0a9da16f227c11ea080d7391b8d";

        var seed = hex.decode(
            "fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542"
        );


        // Chain m
        var key1 = await PrivateKey.fromSeedED25519(seed);
        expect(key1.toStringRaw()).to.be.equal(TEST1);

        // Chain m/0'
        var key2 = await key1.derive(0);
        expect(key2.toStringRaw()).to.be.equal(TEST2);

        // Chain m/0'/2147483647'
        var key3 = await key2.derive(2147483647);
        expect(key3.toStringRaw()).to.be.equal(TEST3);

        // Chain m/0'/2147483647'/1'
        var key4 = await key3.derive(1);
        expect(key4.toStringRaw()).to.be.equal(TEST4);

        // Chain m/0'/2147483647'/1'/2147483646'
        var key5 = await key4.derive(2147483646);
        expect(key5.toStringRaw()).to.be.equal(TEST5);

        // Chain m/0'/2147483647'/1'/2147483646'/2'
        var key6 = await key5.derive(2);
        expect(key6.toStringRaw()).to.be.equal(TEST6);
    });
    
    it("BIP32 test vector 1", async function () {
        // generate master PrivateKey with 'fromSeedECDSA' and child key derivation
        // and test them against the provided constants which are always the source of truth
        // source - https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#test-vector-1
        
        var TEST1 =
            "xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi";
        var TEST2 =
            "xprv9uHRZZhk6KAJC1avXpDAp4MDc3sQKNxDiPvvkX8Br5ngLNv1TxvUxt4cV1rGL5hj6KCesnDYUhd7oWgT11eZG7XnxHrnYeSvkzY7d2bhkJ7";
        var TEST3 =
            "xprv9wTYmMFdV23N2TdNG573QoEsfRrWKQgWeibmLntzniatZvR9BmLnvSxqu53Kw1UmYPxLgboyZQaXwTCg8MSY3H2EU4pWcQDnRnrVA1xe8fs";
        var TEST4 =
            "xprv9z4pot5VBttmtdRTWfWQmoH1taj2axGVzFqSb8C9xaxKymcFzXBDptWmT7FwuEzG3ryjH4ktypQSAewRiNMjANTtpgP4mLTj34bhnZX7UiM";
        var TEST5 =
            "xprvA2JDeKCSNNZky6uBCviVfJSKyQ1mDYahRjijr5idH2WwLsEd4Hsb2Tyh8RfQMuPh7f7RtyzTtdrbdqqsunu5Mm3wDvUAKRHSC34sJ7in334";
        var TEST6 =
            "xprvA41z7zogVVwxVSgdKUHDy1SKmdb533PjDz7J6N6mV6uS3ze1ai8FHa8kmHScGpWmj4WggLyQjgPie1rFSruoUihUZREPSL39UNdE3BBDu76";

        var seed = hex.decode(
            "000102030405060708090a0b0c0d0e0f"
        );


        // Chain m
        var key1 = await PrivateKey.generate(seed);
        //var key1 = await PrivateKey.fromSeedECDSA(seed);
        console.log(`key1: ${key1}`);

        expect(key1.toStringRaw()).to.be.equal(TEST1);

        // Chain m/0'
        var key2 = await key1.derive(0);
        expect(key2.toStringRaw()).to.be.equal(TEST2);

        // Chain m/0'/2147483647'
        var key3 = await key2.derive(2147483647);
        expect(key3.toStringRaw()).to.be.equal(TEST3);

        // Chain m/0'/2147483647'/1'
        var key4 = await key3.derive(1);
        expect(key4.toStringRaw()).to.be.equal(TEST4);

        // Chain m/0'/2147483647'/1'/2147483646'
        var key5 = await key4.derive(2147483646);
        expect(key5.toStringRaw()).to.be.equal(TEST5);

        // Chain m/0'/2147483647'/1'/2147483646'/2'
        var key6 = await key5.derive(2);
        expect(key6.toStringRaw()).to.be.equal(TEST6);
    });
});
