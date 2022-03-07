import { expect } from "chai";
import EthTxInfo from "../../src/contract/EthTxInfo.js";

const expectedAddress = "a94f5374fce5edbc8e2a8697c15331677e6ebf0b";
const expectedPubKey = Buffer.from(
    "033a514176466fa815ed481ffad09110a2d344f6c9b78c1d14afc351c3a51be33d",
    "hex"
);
const RAW_TX_TYPE_0 =
    "f864012f83018000947e3a9eaf9bcc39e2ffa38eb30bf7a93feacbc18180827653820277a0f9fbff985d374be4a55f296915002eec11ac96f1ce2df183adf992baa9390b2fa00c1e867cc960d9c74ec2e6a662b7908ec4c8cc9f3091e886bcefbeb2290fb792";
const RAW_TX_TYPE_2 =
    "02f87082012a022f2f83018000947e3a9eaf9bcc39e2ffa38eb30bf7a93feacbc181880de0b6b3a764000083123456c001a0df48f2efd10421811de2bfb125ab75b2d3c44139c4642837fb1fccce911fd479a01aaf7ae92bee896651dfc9d99ae422a296bf5d9f1ca49b2d96d82b79eb112d66";

describe("EthTxInfo", function () {
    it("should parse an EIP1559 TX", function () {
        const actualInfo = EthTxInfo.from(RAW_TX_TYPE_2);

        expect(actualInfo.transaction).to.eql(RAW_TX_TYPE_2);
        expect(actualInfo.chainId).to.eql(Buffer.from("012a", "hex"));
        expect(actualInfo.nonce).to.eql(2);
        expect(actualInfo.maxPriortyFee).to.eql(47n);
        expect(actualInfo.maxGasFee).to.eql(47n);
        expect(actualInfo.gasPrice).to.eql(0n);
        expect(actualInfo.gasLimit).to.eql(98304);
        expect(actualInfo.amount).to.eql(1000000000000000000n);
        expect(actualInfo.callData).to.eql(Buffer.from("123456", "hex"));
        expect(actualInfo.callDataStart).to.eql(44);
        expect(actualInfo.callDataLength).to.eql(3);
        expect(actualInfo.recId).to.eql(1);
        expect(actualInfo.r).to.eql(
            Buffer.from(
                "df48f2efd10421811de2bfb125ab75b2d3c44139c4642837fb1fccce911fd479",
                "hex"
            )
        );
        expect(actualInfo.s).to.eql(
            Buffer.from(
                "1aaf7ae92bee896651dfc9d99ae422a296bf5d9f1ca49b2d96d82b79eb112d66",
                "hex"
            )
        );
        expect(actualInfo.senderPubKey).to.eql(expectedPubKey);
    });

    it("should parse a frontier TX", function () {
        const actualInfo = EthTxInfo.from(RAW_TX_TYPE_0);

        expect(actualInfo.transaction).to.eql(RAW_TX_TYPE_0);
        expect(actualInfo.chainId).to.eql(Buffer.from("012a", "hex"));
        expect(actualInfo.nonce).to.eql(1);
        expect(actualInfo.maxPriortyFee).to.eql(0n);
        expect(actualInfo.maxGasFee).to.eql(0n);
        expect(actualInfo.gasPrice).to.eql(47n);
        expect(actualInfo.gasLimit).to.eql(98304);
        expect(actualInfo.amount).to.eql(0n);
        expect(actualInfo.callData).to.eql(Buffer.from("7653", "hex"));
        expect(actualInfo.callDataStart).to.eql(31);
        expect(actualInfo.callDataLength).to.eql(2);
        expect(actualInfo.recId).to.eql(0);
        expect(actualInfo.r).to.eql(
            Buffer.from(
                "f9fbff985d374be4a55f296915002eec11ac96f1ce2df183adf992baa9390b2f",
                "hex"
            )
        );
        expect(actualInfo.s).to.eql(
            Buffer.from(
                "0c1e867cc960d9c74ec2e6a662b7908ec4c8cc9f3091e886bcefbeb2290fb792",
                "hex"
            )
        );
        expect(actualInfo.senderPubKey).to.eql(expectedPubKey);
        expect(actualInfo.senderAddress.toString("hex")).to.eql(
            expectedAddress
        );
    });
});
