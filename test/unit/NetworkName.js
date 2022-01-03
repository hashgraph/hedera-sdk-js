import NetworkName from "../src/NetworkName.js";
import LedgerId from "../src/LedgerId.js";

describe("NetworkName", function () {
    it("toBytes", function () {
        let networkName = NetworkName.MAINNET;
        expect(networkName.toBytes()).to.eql(new Uint8Array([0]));

        networkName = NetworkName.TESTNET;
        expect(networkName.toBytes()).to.eql(new Uint8Array([1]));

        networkName = NetworkName.PREVIEWNET;
        expect(networkName.toBytes()).to.eql(new Uint8Array([2]));

        networkName = NetworkName.OTHER;
        expect(networkName.toBytes()).to.eql(new Uint8Array([3]));
    });

    it("fromBytes", function () {
        let networkName = NetworkName.fromBytes(new Uint8Array([0]));
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[0]);

        networkName = NetworkName.fromBytes(new Uint8Array([1]));
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[1]);

        networkName = NetworkName.fromBytes(new Uint8Array([2]));
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[2]);

        networkName = NetworkName.fromBytes(new Uint8Array([3]));
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[3]);
    });

    it("fromString", function () {
        let networkName = NetworkName.fromString(NetworkName.NETNAMES[0]);
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[0]);

        networkName = NetworkName.fromString(NetworkName.NETNAMES[1]);
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[1]);

        networkName = NetworkName.fromString(NetworkName.NETNAMES[2]);
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[2]);

        networkName = NetworkName.fromString(NetworkName.NETNAMES[3]);
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[3]);
    });

    it("toName", function () {
        expect(NetworkName.toName(0)).to.eql(NetworkName.NETNAMES[0]);
        expect(NetworkName.toName("0")).to.eql(NetworkName.NETNAMES[0]);
        expect(NetworkName.toName(LedgerId.MAINNET)).to.eql(
            NetworkName.NETNAMES[0]
        );

        expect(NetworkName.toName(1)).to.eql(NetworkName.NETNAMES[1]);
        expect(NetworkName.toName("1")).to.eql(NetworkName.NETNAMES[1]);
        expect(NetworkName.toName(LedgerId.TESTNET)).to.eql(
            NetworkName.NETNAMES[1]
        );

        expect(NetworkName.toName(2)).to.eql(NetworkName.NETNAMES[2]);
        expect(NetworkName.toName("2")).to.eql(NetworkName.NETNAMES[2]);
        expect(NetworkName.toName(LedgerId.PREVIEWNET)).to.eql(
            NetworkName.NETNAMES[2]
        );

        expect(NetworkName.toName(3)).to.eql(NetworkName.NETNAMES[3]);
        expect(NetworkName.toName("3")).to.eql(NetworkName.NETNAMES[3]);
        expect(NetworkName.toName(LedgerId.OTHER)).to.eql(
            NetworkName.NETNAMES[3]
        );
    });

    it("toId", function () {});
});
