import NetworkName from "../src/NetworkName.js";

describe("NetworkName", function () {
    it("should create NetworkName from num|string networkId: 0,1,2", function () {
        let networkName = new NetworkName(0);
        expect(networkName.networkId).to.eql(0);
        expect(networkName.networkName).to.eql(NetworkName.MAINNET);

        networkName = new NetworkName("0");
        expect(networkName.networkId).to.eql(0);
        expect(networkName.networkName).to.eql(NetworkName.MAINNET);

        networkName = new NetworkName(1);
        expect(networkName.networkId).to.eql(1);
        expect(networkName.networkName).to.eql(NetworkName.TESTNET);

        networkName = new NetworkName("1");
        expect(networkName.networkId).to.eql(1);
        expect(networkName.networkName).to.eql(NetworkName.TESTNET);

        networkName = new NetworkName(2);
        expect(networkName.networkId).to.eql(2);
        expect(networkName.networkName).to.eql(NetworkName.PREVIEWNET);

        networkName = new NetworkName("2");
        expect(networkName.networkId).to.eql(2);
        expect(networkName.networkName).to.eql(NetworkName.PREVIEWNET);
    });

    it("toString should return string networkId", function () {
        let networkName = new NetworkName(0);
        expect(networkName.toString()).to.eql("0");
        expect(networkName.networkId).to.eql(0);
        expect(networkName.networkName).to.eql(NetworkName.MAINNET);

        networkName = new NetworkName("0");
        expect(networkName.toString()).to.eql("0");
        expect(networkName.networkId).to.eql(0);
        expect(networkName.networkName).to.eql(NetworkName.MAINNET);

        networkName = new NetworkName(1);
        expect(networkName.toString()).to.eql("1");
        expect(networkName.networkName).to.eql(NetworkName.TESTNET);

        networkName = new NetworkName("1");
        expect(networkName.toString()).to.eql("1");
        expect(networkName.networkName).to.eql(NetworkName.TESTNET);

        networkName = new NetworkName(2);
        expect(networkName.toString()).to.eql("2");
        expect(networkName.networkName).to.eql(NetworkName.PREVIEWNET);

        networkName = new NetworkName("2");
        expect(networkName.toString()).to.eql("2");
        expect(networkName.networkName).to.eql(NetworkName.PREVIEWNET);
    });

    it("fromString should return class", function () {
        let networkName = NetworkName.fromString("0");
        expect(networkName.toString()).to.eql("0");
        expect(networkName.networkId).to.eql(0);
        expect(networkName.networkName).to.eql(NetworkName.MAINNET);

        networkName = NetworkName.fromString("mainnet");
        expect(networkName.toString()).to.eql("0");
        expect(networkName.networkId).to.eql(0);
        expect(networkName.networkName).to.eql(NetworkName.MAINNET);

        networkName = NetworkName.fromString("1");
        expect(networkName.toString()).to.eql("1");
        expect(networkName.networkId).to.eql(1);
        expect(networkName.networkName).to.eql(NetworkName.TESTNET);

        networkName = NetworkName.fromString("testnet");
        expect(networkName.toString()).to.eql("1");
        expect(networkName.networkId).to.eql(1);
        expect(networkName.networkName).to.eql(NetworkName.TESTNET);

        networkName = NetworkName.fromString("2");
        expect(networkName.toString()).to.eql("2");
        expect(networkName.networkId).to.eql(2);
        expect(networkName.networkName).to.eql(NetworkName.PREVIEWNET);

        networkName = NetworkName.fromString("previewnet");
        expect(networkName.toString()).to.eql("2");
        expect(networkName.networkId).to.eql(2);
        expect(networkName.networkName).to.eql(NetworkName.PREVIEWNET);
    });

    it("toProtobuf returns Uint8Array of networkId", function () {
        let networkName = new NetworkName(0);
        expect(networkName.toProtobuf()[0]).to.eql(0);

        networkName = new NetworkName("0");
        expect(networkName.toProtobuf()[0]).to.eql(0);

        networkName = new NetworkName(1);
        expect(networkName.toProtobuf()[0]).to.eql(1);

        networkName = new NetworkName("1");
        expect(networkName.toProtobuf()[0]).to.eql(1);

        networkName = new NetworkName(2);
        expect(networkName.toProtobuf()[0]).to.eql(2);

        networkName = new NetworkName("2");
        expect(networkName.toProtobuf()[0]).to.eql(2);
    });

    it("networkIdToProtobuf returns Uint8Array of networkId", function () {
        expect(NetworkName.networkIdToProtobuf(0)[0]).to.eql(0);
        expect(NetworkName.networkIdToProtobuf("0")[0]).to.eql(0);

        expect(NetworkName.networkIdToProtobuf(1)[0]).to.eql(1);
        expect(NetworkName.networkIdToProtobuf("1")[0]).to.eql(1);

        expect(NetworkName.networkIdToProtobuf(2)[0]).to.eql(2);
        expect(NetworkName.networkIdToProtobuf("2")[0]).to.eql(2);
    });

    it("fromProtobuf returns NetworkName from bytes", function () {
        expect(NetworkName.fromProtobuf(new Uint8Array([0])).networkId).to.eql(
            0
        );
        expect(
            NetworkName.fromProtobuf(new Uint8Array([0])).networkName
        ).to.eql(NetworkName.MAINNET);

        expect(NetworkName.fromProtobuf(new Uint8Array([1])).networkId).to.eql(
            1
        );
        expect(
            NetworkName.fromProtobuf(new Uint8Array([1])).networkName
        ).to.eql(NetworkName.TESTNET);

        expect(NetworkName.fromProtobuf(new Uint8Array([2])).networkId).to.eql(
            2
        );
        expect(
            NetworkName.fromProtobuf(new Uint8Array([2])).networkName
        ).to.eql(NetworkName.PREVIEWNET);
    });

    it("fromNetworkId returns NetworkName", function () {
        let networkName = NetworkName.fromNetworkId(0);
        expect(networkName.toString()).to.eql("0");
        expect(networkName.networkId).to.eql(0);
        expect(networkName.networkName).to.eql(NetworkName.MAINNET);

        networkName = NetworkName.fromNetworkId("0");
        expect(networkName.toString()).to.eql("0");
        expect(networkName.networkId).to.eql(0);
        expect(networkName.networkName).to.eql(NetworkName.MAINNET);

        networkName = NetworkName.fromNetworkId(1);
        expect(networkName.toString()).to.eql("1");
        expect(networkName.networkId).to.eql(1);
        expect(networkName.networkName).to.eql(NetworkName.TESTNET);

        networkName = NetworkName.fromNetworkId("1");
        expect(networkName.toString()).to.eql("1");
        expect(networkName.networkId).to.eql(1);
        expect(networkName.networkName).to.eql(NetworkName.TESTNET);

        networkName = NetworkName.fromNetworkId(2);
        expect(networkName.toString()).to.eql("2");
        expect(networkName.networkId).to.eql(2);
        expect(networkName.networkName).to.eql(NetworkName.PREVIEWNET);

        networkName = NetworkName.fromNetworkId("2");
        expect(networkName.toString()).to.eql("2");
        expect(networkName.networkId).to.eql(2);
        expect(networkName.networkName).to.eql(NetworkName.PREVIEWNET);
    });

    it("fromNetworkName returns NetworkName", function () {
        let networkName = NetworkName.fromNetworkName("mainnet");
        expect(networkName.toString()).to.eql("0");
        expect(networkName.networkId).to.eql(0);
        expect(networkName.networkName).to.eql(NetworkName.MAINNET);

        networkName = NetworkName.fromNetworkName(NetworkName.MAINNET);
        expect(networkName.toString()).to.eql("0");
        expect(networkName.networkId).to.eql(0);
        expect(networkName.networkName).to.eql(NetworkName.MAINNET);

        networkName = NetworkName.fromNetworkName("testnet");
        expect(networkName.toString()).to.eql("1");
        expect(networkName.networkId).to.eql(1);
        expect(networkName.networkName).to.eql(NetworkName.TESTNET);

        networkName = NetworkName.fromNetworkName(NetworkName.TESTNET);
        expect(networkName.toString()).to.eql("1");
        expect(networkName.networkId).to.eql(1);
        expect(networkName.networkName).to.eql(NetworkName.TESTNET);

        networkName = NetworkName.fromNetworkName("previewnet");
        expect(networkName.toString()).to.eql("2");
        expect(networkName.networkId).to.eql(2);
        expect(networkName.networkName).to.eql(NetworkName.PREVIEWNET);

        networkName = NetworkName.fromNetworkName(NetworkName.PREVIEWNET);
        expect(networkName.toString()).to.eql("2");
        expect(networkName.networkId).to.eql(2);
        expect(networkName.networkName).to.eql(NetworkName.PREVIEWNET);
    });

    it("networkIdFromName returns id from name", function () {
        expect(NetworkName.networkIdFromName("mainnet")).to.eql(0);
        expect(NetworkName.networkIdFromName(NetworkName.MAINNET)).to.eql(0);

        expect(NetworkName.networkIdFromName("testnet")).to.eql(1);
        expect(NetworkName.networkIdFromName(NetworkName.TESTNET)).to.eql(1);

        expect(NetworkName.networkIdFromName("previewnet")).to.eql(2);
        expect(NetworkName.networkIdFromName(NetworkName.PREVIEWNET)).to.eql(2);
    });

    it("networkNameFromId returns name from id", function () {
        expect(NetworkName.networkNameFromId("0")).to.eql(NetworkName.MAINNET);
        expect(NetworkName.networkNameFromId(0)).to.eql(NetworkName.MAINNET);

        expect(NetworkName.networkNameFromId("1")).to.eql(NetworkName.TESTNET);
        expect(NetworkName.networkNameFromId(1)).to.eql(NetworkName.TESTNET);

        expect(NetworkName.networkNameFromId("2")).to.eql(
            NetworkName.PREVIEWNET
        );
        expect(NetworkName.networkNameFromId(2)).to.eql(NetworkName.PREVIEWNET);
    });
});
