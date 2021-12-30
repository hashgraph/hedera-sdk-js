import NetworkName from "../src/NetworkName.js";

describe("NetworkName", function () {
    it("toBytes", function () {
        let networkName = NetworkName.MAINNET;
        expect(networkName.toBytes()).to.eql(new Uint8Array([0]));

        networkName = NetworkName.TESTNET;
        expect(networkName.toBytes()).to.eql(new Uint8Array([1]));

        networkName = NetworkName.PREVIEWNET;
        expect(networkName.toBytes()).to.eql(new Uint8Array([2]));
    });

    it("fromBytes", function () {
        let networkName = NetworkName.fromBytes(new Uint8Array([0]));
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[0]);

        networkName = NetworkName.fromBytes(new Uint8Array([1]));
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[1]);

        networkName = NetworkName.fromBytes(new Uint8Array([2]));
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[2]);
    });

    it("fromString", function () {
        let networkName = NetworkName.fromString(NetworkName.NETNAMES[0]);
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[0]);

        networkName = NetworkName.fromString(NetworkName.NETNAMES[1]);
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[1]);

        networkName = NetworkName.fromString(NetworkName.NETNAMES[2]);
        expect(networkName.toString()).to.eql(NetworkName.NETNAMES[2]);
    });

    it("isMainnet|Testnet|Previewnet", function () {
        let networkName = NetworkName.MAINNET;
        expect(networkName.isMainnet()).to.eql(true);
        expect(networkName.isTestnet()).to.eql(false);
        expect(networkName.isPreviewnet()).to.eql(false);

        networkName = NetworkName.TESTNET;
        expect(networkName.isMainnet()).to.eql(false);
        expect(networkName.isTestnet()).to.eql(true);
        expect(networkName.isPreviewnet()).to.eql(false);

        networkName = NetworkName.PREVIEWNET;
        expect(networkName.isMainnet()).to.eql(false);
        expect(networkName.isTestnet()).to.eql(false);
        expect(networkName.isPreviewnet()).to.eql(true);
    });
});
