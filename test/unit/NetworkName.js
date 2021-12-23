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

    it("toString should return string networkId",function () {
        let networkName = new NetworkName(0);
        expect(networkName.toString()).to.eql("0");

        networkName = new NetworkName("0");
        expect(networkName.toString()).to.eql("0");

        networkName = new NetworkName(1);
        expect(networkName.toString()).to.eql("1");

        networkName = new NetworkName("1");
        expect(networkName.toString()).to.eql("1");

        networkName = new NetworkName(2);
        expect(networkName.toString()).to.eql("2");

        networkName = new NetworkName("2");
        expect(networkName.toString()).to.eql("2");
    });

    // it("",function () {

    // });

    // it("",function () {

    // });
});
