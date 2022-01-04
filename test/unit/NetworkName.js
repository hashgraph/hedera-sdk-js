import NetworkName from "../src/NetworkName.js";
import LedgerId from "../src/LedgerId.js";

describe("NetworkName", function () {
    it("toBytes", function () {
        let networkName = new NetworkName("mainnet");
        expect(networkName.toBytes()).to.eql(new Uint8Array([0]));

        networkName = new NetworkName("testnet");
        expect(networkName.toBytes()).to.eql(new Uint8Array([1]));

        networkName = new NetworkName("previewnet");
        expect(networkName.toBytes()).to.eql(new Uint8Array([2]));

        networkName = new NetworkName("other");
        expect(networkName.toBytes()).to.eql(new Uint8Array([3]));
    });

    it("fromBytes", function () {
        let networkName = NetworkName.fromBytes(new Uint8Array([0]));
        expect(networkName.toString()).to.eql("mainnet");

        networkName = NetworkName.fromBytes(new Uint8Array([1]));
        expect(networkName.toString()).to.eql("testnet");

        networkName = NetworkName.fromBytes(new Uint8Array([2]));
        expect(networkName.toString()).to.eql("previewnet");

        networkName = NetworkName.fromBytes(new Uint8Array([3]));
        expect(networkName.toString()).to.eql("other");
    });

    it("fromString", function () {
        let networkName = NetworkName.fromString("mainnet");
        expect(networkName.toString()).to.eql("mainnet");

        networkName = NetworkName.fromString("testnet");
        expect(networkName.toString()).to.eql("testnet");

        networkName = NetworkName.fromString("previewnet");
        expect(networkName.toString()).to.eql("previewnet");

        networkName = NetworkName.fromString("other");
        expect(networkName.toString()).to.eql("other");
    });

    it("toName", function () {
        expect(NetworkName.toName(0)).to.eql("mainnet");
        expect(NetworkName.toName("0")).to.eql("mainnet");
        expect(NetworkName.toName(new LedgerId(new Uint8Array([0])))).to.eql(
            "mainnet"
        );

        expect(NetworkName.toName(1)).to.eql("testnet");
        expect(NetworkName.toName("1")).to.eql("testnet");
        expect(NetworkName.toName(new LedgerId(new Uint8Array([1])))).to.eql(
            "testnet"
        );

        expect(NetworkName.toName(2)).to.eql("previewnet");
        expect(NetworkName.toName("2")).to.eql("previewnet");
        expect(NetworkName.toName(new LedgerId(new Uint8Array([2])))).to.eql(
            "previewnet"
        );

        expect(NetworkName.toName(3)).to.eql("other");
        expect(NetworkName.toName("3")).to.eql("other");
        expect(NetworkName.toName(new LedgerId(new Uint8Array([3])))).to.eql(
            "other"
        );
    });

    it("toId", function () {});
});
