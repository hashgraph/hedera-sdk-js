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

        const CHAIN_CODE1 =
            "90046a93de5380a72b5e45010748567d5ea02bbf6522f979e05c0d8d8ca9fffb";
        const PRIVATE_KEY1 =
            "2b4be7f19ee27bbf30c667b642d5f4aa69fd169872f8fc3059c08ebae2eb19e7";
        const PUBLIC_KEY1 =
            "00a4b2856bfec510abab89753fac1ac0e1112364e7d250545963f135f2a33188ed";

        const CHAIN_CODE2 =
            "8b59aa11380b624e81507a27fedda59fea6d0b779a778918a2fd3590e16e9c69";
        const PRIVATE_KEY2 =
            "68e0fe46dfb67e368c75379acec591dad19df3cde26e63b93a8e704f1dade7a3";
        const PUBLIC_KEY2 =
            "008c8a13df77a28f3445213a0f432fde644acaa215fc72dcdf300d5efaa85d350c";

        const CHAIN_CODE3 =
            "a320425f77d1b5c2505a6b1b27382b37368ee640e3557c315416801243552f14";
        const PRIVATE_KEY3 =
            "b1d0bad404bf35da785a64ca1ac54b2617211d2777696fbffaf208f746ae84f2";
        const PUBLIC_KEY3 =
            "001932a5270f335bed617d5b935c80aedb1a35bd9fc1e31acafd5372c30f5c1187";

        const CHAIN_CODE4 =
            "2e69929e00b5ab250f49c3fb1c12f252de4fed2c1db88387094a0f8c4c9ccd6c";
        const PRIVATE_KEY4 =
            "92a5b23c0b8a99e37d07df3fb9966917f5d06e02ddbd909c7e184371463e9fc9";
        const PUBLIC_KEY4 =
            "00ae98736566d30ed0e9d2f4486a64bc95740d89c7db33f52121f8ea8f76ff0fc1";

        const CHAIN_CODE5 =
            "8f6d87f93d750e0efccda017d662a1b31a266e4a6f5993b15f5c1f07f74dd5cc";
        const PRIVATE_KEY5 =
            "30d1dc7e5fc04c31219ab25a27ae00b50f6fd66622f6e9c913253d6511d1e662";
        const PUBLIC_KEY5 =
            "008abae2d66361c879b900d204ad2cc4984fa2aa344dd7ddc46007329ac76c429c";

        const CHAIN_CODE6 =
            "68789923a0cac2cd5a29172a475fe9e0fb14cd6adb5ad98a3fa70333e7afa230";
        const PRIVATE_KEY6 =
            "8f94d394a8e8fd6b1bc2f3f49f5c47e385281d5c17e65324b0f62483e37e8793";
        const PUBLIC_KEY6 =
            "003c24da049451555d51a7014a37337aa4e12d41e485abccfa46b47dfb2af54b7a";

        const seed = hex.decode("000102030405060708090a0b0c0d0e0f");

        // Chain m
        const key1 = await PrivateKey.fromSeedED25519(seed);
        expect(hex.encode(key1.chainCode)).to.be.equal(CHAIN_CODE1);
        expect(key1.toStringRaw()).to.be.equal(PRIVATE_KEY1);
        expect(PUBLIC_KEY1).to.contain(key1.publicKey.toStringRaw());

        // Chain m/0'
        const key2 = await key1.derive(0);
        expect(hex.encode(key2.chainCode)).to.be.equal(CHAIN_CODE2);
        expect(key2.toStringRaw()).to.be.equal(PRIVATE_KEY2);
        expect(PUBLIC_KEY2).to.contain(key2.publicKey.toStringRaw());

        // Chain m/0'/1'
        const key3 = await key2.derive(1);
        expect(hex.encode(key3.chainCode)).to.be.equal(CHAIN_CODE3);
        expect(key3.toStringRaw()).to.be.equal(PRIVATE_KEY3);
        expect(PUBLIC_KEY3).to.contain(key3.publicKey.toStringRaw());

        // Chain m/0'/1'/2'
        const key4 = await key3.derive(2);
        expect(hex.encode(key4.chainCode)).to.be.equal(CHAIN_CODE4);
        expect(key4.toStringRaw()).to.be.equal(PRIVATE_KEY4);
        expect(PUBLIC_KEY4).to.contain(key4.publicKey.toStringRaw());

        // Chain m/0'/1'/2'/2'
        const key5 = await key4.derive(2);
        expect(hex.encode(key5.chainCode)).to.be.equal(CHAIN_CODE5);
        expect(key5.toStringRaw()).to.be.equal(PRIVATE_KEY5);
        expect(PUBLIC_KEY5).to.contain(key5.publicKey.toStringRaw());

        // Chain m/0'/1'/2'/2'/1000000000'
        const key6 = await key5.derive(1000000000);
        expect(hex.encode(key6.chainCode)).to.be.equal(CHAIN_CODE6);
        expect(key6.toStringRaw()).to.be.equal(PRIVATE_KEY6);
        expect(PUBLIC_KEY6).to.contain(key6.publicKey.toStringRaw());
    });

    it("SLIP10 test vector 2", async function () {
        // generate master PrivateKey with 'fromSeedED25519' and child key derivation
        // and test them against the provided constants which are always the source of truth
        // source - https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-2-for-ed25519

        const CHAIN_CODE1 =
            "ef70a74db9c3a5af931b5fe73ed8e1a53464133654fd55e7a66f8570b8e33c3b";
        const PRIVATE_KEY1 =
            "171cb88b1b3c1db25add599712e36245d75bc65a1a5c9e18d76f9f2b1eab4012";
        const PUBLIC_KEY1 =
            "008fe9693f8fa62a4305a140b9764c5ee01e455963744fe18204b4fb948249308a";

        const CHAIN_CODE2 =
            "0b78a3226f915c082bf118f83618a618ab6dec793752624cbeb622acb562862d";
        const PRIVATE_KEY2 =
            "1559eb2bbec5790b0c65d8693e4d0875b1747f4970ae8b650486ed7470845635";
        const PUBLIC_KEY2 =
            "0086fab68dcb57aa196c77c5f264f215a112c22a912c10d123b0d03c3c28ef1037";

        const CHAIN_CODE3 =
            "138f0b2551bcafeca6ff2aa88ba8ed0ed8de070841f0c4ef0165df8181eaad7f";
        const PRIVATE_KEY3 =
            "ea4f5bfe8694d8bb74b7b59404632fd5968b774ed545e810de9c32a4fb4192f4";
        const PUBLIC_KEY3 =
            "005ba3b9ac6e90e83effcd25ac4e58a1365a9e35a3d3ae5eb07b9e4d90bcf7506d";

        const CHAIN_CODE4 =
            "73bd9fff1cfbde33a1b846c27085f711c0fe2d66fd32e139d3ebc28e5a4a6b90";
        const PRIVATE_KEY4 =
            "3757c7577170179c7868353ada796c839135b3d30554bbb74a4b1e4a5a58505c";
        const PUBLIC_KEY4 =
            "002e66aa57069c86cc18249aecf5cb5a9cebbfd6fadeab056254763874a9352b45";

        const CHAIN_CODE5 =
            "0902fe8a29f9140480a00ef244bd183e8a13288e4412d8389d140aac1794825a";
        const PRIVATE_KEY5 =
            "5837736c89570de861ebc173b1086da4f505d4adb387c6a1b1342d5e4ac9ec72";
        const PUBLIC_KEY5 =
            "00e33c0f7d81d843c572275f287498e8d408654fdf0d1e065b84e2e6f157aab09b";

        const CHAIN_CODE6 =
            "5d70af781f3a37b829f0d060924d5e960bdc02e85423494afc0b1a41bbe196d4";
        const PRIVATE_KEY6 =
            "551d333177df541ad876a60ea71f00447931c0a9da16f227c11ea080d7391b8d";
        const PUBLIC_KEY6 =
            "0047150c75db263559a70d5778bf36abbab30fb061ad69f69ece61a72b0cfa4fc0";

        const seed = hex.decode(
            "fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542"
        );

        // Chain m
        const key1 = await PrivateKey.fromSeedED25519(seed);
        expect(hex.encode(key1.chainCode)).to.be.equal(CHAIN_CODE1);
        expect(key1.toStringRaw()).to.be.equal(PRIVATE_KEY1);
        expect(PUBLIC_KEY1).to.contain(key1.publicKey.toStringRaw());

        // Chain m/0'
        const key2 = await key1.derive(0);
        expect(hex.encode(key2.chainCode)).to.be.equal(CHAIN_CODE2);
        expect(key2.toStringRaw()).to.be.equal(PRIVATE_KEY2);
        expect(PUBLIC_KEY2).to.contain(key2.publicKey.toStringRaw());

        // Chain m/0'/2147483647'
        const key3 = await key2.derive(2147483647);
        expect(hex.encode(key3.chainCode)).to.be.equal(CHAIN_CODE3);
        expect(key3.toStringRaw()).to.be.equal(PRIVATE_KEY3);
        expect(PUBLIC_KEY3).to.contain(key3.publicKey.toStringRaw());

        // Chain m/0'/2147483647'/1'
        const key4 = await key3.derive(1);
        expect(hex.encode(key4.chainCode)).to.be.equal(CHAIN_CODE4);
        expect(key4.toStringRaw()).to.be.equal(PRIVATE_KEY4);
        expect(PUBLIC_KEY4).to.contain(key4.publicKey.toStringRaw());

        // Chain m/0'/2147483647'/1'/2147483646'
        const key5 = await key4.derive(2147483646);
        expect(hex.encode(key5.chainCode)).to.be.equal(CHAIN_CODE5);
        expect(key5.toStringRaw()).to.be.equal(PRIVATE_KEY5);
        expect(PUBLIC_KEY5).to.contain(key5.publicKey.toStringRaw());

        // Chain m/0'/2147483647'/1'/2147483646'/2'
        const key6 = await key5.derive(2);
        expect(hex.encode(key6.chainCode)).to.be.equal(CHAIN_CODE6);
        expect(key6.toStringRaw()).to.be.equal(PRIVATE_KEY6);
        expect(PUBLIC_KEY6).to.contain(key6.publicKey.toStringRaw());
    });
});
