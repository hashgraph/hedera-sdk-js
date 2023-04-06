import { expect } from "chai";

import { PrivateKey } from "../../src/index.js";
import * as hex from "../../src/encoding/hex.js";
import * as bip32 from "../../packages/cryptography/src/primitive/bip32.js";

const RAW_KEY =
    "8776c6b831a1b61ac10dac0304a2843de4716f54b1919bb91a2685d0fe3f3048";

describe("EcdsaPrivateKey", function () {
    it("generate should return  object", function () {
        PrivateKey.generateECDSA();
    });

    it("generateAsync should return  object", async function () {
        await PrivateKey.generateECDSAAsync();
    });

    it("fromStringRaw and fromStringDer work", function () {
        PrivateKey.fromString(
            hex.encode(PrivateKey.fromStringECDSA(RAW_KEY).toBytesDer())
        );
    });

    it("public key fro a private key", function () {
        expect(
            PrivateKey.fromStringECDSA(RAW_KEY).publicKey.toStringRaw()
        ).to.be.equal(
            "02703a9370b0443be6ae7c507b0aec81a55e94e4a863b9655360bd65358caa6588"
        );
    });

    it("SLIP10 test vector 1", async function () {
        this.timeout(5000);
        // generate master PrivateKey with 'fromSeedECDSAsecp256k1()' and child key derivation
        // and test them against the provided constants which are always the source of truth
        // source - https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-1-for-secp256k1

        const CHAIN_CODE1 =
            "873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508";
        const PRIVATE_KEY1 =
            "e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35";
        const PUBLIC_KEY1 =
            "0339a36013301597daef41fbe593a02cc513d0b55527ec2df1050e2e8ff49c85c2";

        const CHAIN_CODE2 =
            "47fdacbd0f1097043b78c63c20c34ef4ed9a111d980047ad16282c7ae6236141";
        const PRIVATE_KEY2 =
            "edb2e14f9ee77d26dd93b4ecede8d16ed408ce149b6cd80b0715a2d911a0afea";
        const PUBLIC_KEY2 =
            "035a784662a4a20a65bf6aab9ae98a6c068a81c52e4b032c0fb5400c706cfccc56";

        const CHAIN_CODE3 =
            "2a7857631386ba23dacac34180dd1983734e444fdbf774041578e9b6adb37c19";
        const PRIVATE_KEY3 =
            "3c6cb8d0f6a264c91ea8b5030fadaa8e538b020f0a387421a12de9319dc93368";
        const PUBLIC_KEY3 =
            "03501e454bf00751f24b1b489aa925215d66af2234e3891c3b21a52bedb3cd711c";

        const CHAIN_CODE4 =
            "04466b9cc8e161e966409ca52986c584f07e9dc81f735db683c3ff6ec7b1503f";
        const PRIVATE_KEY4 =
            "cbce0d719ecf7431d88e6a89fa1483e02e35092af60c042b1df2ff59fa424dca";
        const PUBLIC_KEY4 =
            "0357bfe1e341d01c69fe5654309956cbea516822fba8a601743a012a7896ee8dc2";

        const CHAIN_CODE5 =
            "cfb71883f01676f587d023cc53a35bc7f88f724b1f8c2892ac1275ac822a3edd";
        const PRIVATE_KEY5 =
            "0f479245fb19a38a1954c5c7c0ebab2f9bdfd96a17563ef28a6a4b1a2a764ef4";
        const PUBLIC_KEY5 =
            "02e8445082a72f29b75ca48748a914df60622a609cacfce8ed0e35804560741d29";

        const CHAIN_CODE6 =
            "c783e67b921d2beb8f6b389cc646d7263b4145701dadd2161548a8b078e65e9e";
        const PRIVATE_KEY6 =
            "471b76e389e528d6de6d816857e012c5455051cad6660850e58372a6c3e6e7c8";
        const PUBLIC_KEY6 =
            "022a471424da5e657499d1ff51cb43c47481a03b1e77f951fe64cec9f5a48f7011";

        const seed = hex.decode("000102030405060708090a0b0c0d0e0f");

        // Chain m
        const key1 = await PrivateKey.fromSeedECDSAsecp256k1(seed);
        expect(hex.encode(key1.chainCode)).to.be.equal(CHAIN_CODE1);
        expect(key1.toStringRaw()).to.be.equal(PRIVATE_KEY1);
        expect(PUBLIC_KEY1).to.contain(key1.publicKey.toStringRaw());

        // Chain m/0'
        const key2 = await key1.derive(bip32.toHardenedIndex(0));
        expect(hex.encode(key2.chainCode)).to.be.equal(CHAIN_CODE2);
        expect(key2.toStringRaw()).to.be.equal(PRIVATE_KEY2);
        expect(PUBLIC_KEY2).to.contain(key2.publicKey.toStringRaw());

        // Chain m/0'/1
        const key3 = await key2.derive(1);
        expect(hex.encode(key3.chainCode)).to.be.equal(CHAIN_CODE3);
        expect(key3.toStringRaw()).to.be.equal(PRIVATE_KEY3);
        expect(PUBLIC_KEY3).to.contain(key3.publicKey.toStringRaw());

        // Chain m/0'/1/2'
        const key4 = await key3.derive(bip32.toHardenedIndex(2));
        expect(hex.encode(key4.chainCode)).to.be.equal(CHAIN_CODE4);
        expect(key4.toStringRaw()).to.be.equal(PRIVATE_KEY4);
        expect(PUBLIC_KEY4).to.contain(key4.publicKey.toStringRaw());

        // Chain m/0'/1/2'/2
        const key5 = await key4.derive(2);
        expect(hex.encode(key5.chainCode)).to.be.equal(CHAIN_CODE5);
        expect(key5.toStringRaw()).to.be.equal(PRIVATE_KEY5);
        expect(PUBLIC_KEY5).to.contain(key5.publicKey.toStringRaw());

        // Chain m/0'/1/2'/2/1000000000
        const key6 = await key5.derive(1000000000);
        expect(hex.encode(key6.chainCode)).to.be.equal(CHAIN_CODE6);
        expect(key6.toStringRaw()).to.be.equal(PRIVATE_KEY6);
        expect(PUBLIC_KEY6).to.contain(key6.publicKey.toStringRaw());
    });

    it("SLIP10 test vector 2", async function () {
        // generate master PrivateKey with 'fromSeedECDSAsecp256k1()' and child key derivation
        // and test them against the provided constants which are always the source of truth
        // source - https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-2-for-secp256k1

        const CHAIN_CODE1 =
            "60499f801b896d83179a4374aeb7822aaeaceaa0db1f85ee3e904c4defbd9689";
        const PRIVATE_KEY1 =
            "4b03d6fc340455b363f51020ad3ecca4f0850280cf436c70c727923f6db46c3e";
        const PUBLIC_KEY1 =
            "03cbcaa9c98c877a26977d00825c956a238e8dddfbd322cce4f74b0b5bd6ace4a7";

        const CHAIN_CODE2 =
            "f0909affaa7ee7abe5dd4e100598d4dc53cd709d5a5c2cac40e7412f232f7c9c";
        const PRIVATE_KEY2 =
            "abe74a98f6c7eabee0428f53798f0ab8aa1bd37873999041703c742f15ac7e1e";
        const PUBLIC_KEY2 =
            "02fc9e5af0ac8d9b3cecfe2a888e2117ba3d089d8585886c9c826b6b22a98d12ea";

        const CHAIN_CODE3 =
            "be17a268474a6bb9c61e1d720cf6215e2a88c5406c4aee7b38547f585c9a37d9";
        const PRIVATE_KEY3 =
            "877c779ad9687164e9c2f4f0f4ff0340814392330693ce95a58fe18fd52e6e93";
        const PUBLIC_KEY3 =
            "03c01e7425647bdefa82b12d9bad5e3e6865bee0502694b94ca58b666abc0a5c3b";

        const CHAIN_CODE4 =
            "f366f48f1ea9f2d1d3fe958c95ca84ea18e4c4ddb9366c336c927eb246fb38cb";
        const PRIVATE_KEY4 =
            "704addf544a06e5ee4bea37098463c23613da32020d604506da8c0518e1da4b7";
        const PUBLIC_KEY4 =
            "03a7d1d856deb74c508e05031f9895dab54626251b3806e16b4bd12e781a7df5b9";

        const CHAIN_CODE5 =
            "637807030d55d01f9a0cb3a7839515d796bd07706386a6eddf06cc29a65a0e29";
        const PRIVATE_KEY5 =
            "f1c7c871a54a804afe328b4c83a1c33b8e5ff48f5087273f04efa83b247d6a2d";
        const PUBLIC_KEY5 =
            "02d2b36900396c9282fa14628566582f206a5dd0bcc8d5e892611806cafb0301f0";

        const CHAIN_CODE6 =
            "9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271";
        const PRIVATE_KEY6 =
            "bb7d39bdb83ecf58f2fd82b6d918341cbef428661ef01ab97c28a4842125ac23";
        const PUBLIC_KEY6 =
            "024d902e1a2fc7a8755ab5b694c575fce742c48d9ff192e63df5193e4c7afe1f9c";

        const seed = hex.decode(
            "fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542"
        );

        // Chain m
        const key1 = await PrivateKey.fromSeedECDSAsecp256k1(seed);
        expect(hex.encode(key1.chainCode)).to.be.equal(CHAIN_CODE1);
        expect(key1.toStringRaw()).to.be.equal(PRIVATE_KEY1);
        expect(PUBLIC_KEY1).to.contain(key1.publicKey.toStringRaw());

        // Chain m/0
        const key2 = await key1.derive(0);
        expect(hex.encode(key2.chainCode)).to.be.equal(CHAIN_CODE2);
        expect(key2.toStringRaw()).to.be.equal(PRIVATE_KEY2);
        expect(PUBLIC_KEY2).to.contain(key2.publicKey.toStringRaw());

        // Chain m/0/2147483647'
        const key3 = await key2.derive(bip32.toHardenedIndex(2147483647));
        expect(hex.encode(key3.chainCode)).to.be.equal(CHAIN_CODE3);
        expect(key3.toStringRaw()).to.be.equal(PRIVATE_KEY3);
        expect(PUBLIC_KEY3).to.contain(key3.publicKey.toStringRaw());

        // Chain m/0/2147483647'/1
        const key4 = await key3.derive(1);
        expect(hex.encode(key4.chainCode)).to.be.equal(CHAIN_CODE4);
        expect(key4.toStringRaw()).to.be.equal(PRIVATE_KEY4);
        expect(PUBLIC_KEY4).to.contain(key4.publicKey.toStringRaw());

        // Chain m/0/2147483647'/1/2147483646'
        const key5 = await key4.derive(bip32.toHardenedIndex(2147483646));
        expect(hex.encode(key5.chainCode)).to.be.equal(CHAIN_CODE5);
        expect(key5.toStringRaw()).to.be.equal(PRIVATE_KEY5);
        expect(PUBLIC_KEY5).to.contain(key5.publicKey.toStringRaw());

        // Chain m/0/2147483647'/1/2147483646'/2
        const key6 = await key5.derive(2);
        expect(hex.encode(key6.chainCode)).to.be.equal(CHAIN_CODE6);
        expect(key6.toStringRaw()).to.be.equal(PRIVATE_KEY6);
        expect(PUBLIC_KEY6).to.contain(key6.publicKey.toStringRaw());
    });
});
