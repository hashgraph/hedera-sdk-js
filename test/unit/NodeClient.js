import { expect } from "chai";
import {Client, LedgerId} from "../../src/index.js";
import AccountId from "../../src/account/AccountId.js";
import NodeClient, {Network} from "../../src/client/NodeClient.js";

describe("Client", function () {
    it("should support multiple IPs per node account ID", async function () {
        let nodes = {
            "0.testnet.hedera.com:50211": "0.0.3",
            "34.94.106.61:50211": "0.0.3",
            "50.18.132.211:50211": "0.0.3",
            "138.91.142.219:50211": "0.0.3",
        };

        const client = Client.forNetwork(nodes);

        let network = client.network;

        expect(Object.entries(network).length).to.be.equal(4);
        expect(network["0.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.3"
        );
        expect(network["34.94.106.61:50211"].toString()).to.be.equal("0.0.3");
        expect(network["50.18.132.211:50211"].toString()).to.be.equal("0.0.3");
        expect(network["138.91.142.219:50211"].toString()).to.be.equal("0.0.3");
    });

    it("should correctly construct and update network", async function () {
        let nodes = {
            "0.testnet.hedera.com:50211": "0.0.3",
        };

        const client = Client.forNetwork(nodes);

        let network = client.network;

        expect(Object.entries(network).length).to.be.equal(1);
        expect(network["0.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.3"
        );

        client.setNetwork(nodes);
        network = client.network;

        expect(Object.entries(network).length).to.be.equal(1);
        expect(network["0.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.3"
        );

        nodes["1.testnet.hedera.com:50211"] = "0.0.4";

        client.setNetwork(nodes);
        network = client.network;

        expect(Object.entries(network).length).to.be.equal(2);
        expect(network["0.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.3"
        );
        expect(network["1.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.4"
        );

        nodes["2.testnet.hedera.com:50211"] = "0.0.5";

        client.setNetwork(nodes);
        network = client.network;

        expect(Object.entries(network).length).to.be.equal(3);
        expect(network["0.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.3"
        );
        expect(network["1.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.4"
        );
        expect(network["2.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.5"
        );

        nodes = {
            "2.testnet.hedera.com:50211": "0.0.5",
        };

        client.setNetwork(nodes);
        network = client.network;

        expect(Object.entries(network).length).to.be.equal(1);
        expect(network["2.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.5"
        );

        nodes = {
            "2.testnet.hedera.com:50211": "0.0.6",
        };

        client.setNetwork(nodes);
        network = client.network;

        expect(Object.entries(network).length).to.be.equal(1);
        expect(network["2.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.6"
        );
    });

    describe("local-node factories work", () => {
        const consensusNodes = {"127.0.0.1:50211": new AccountId(3)};
        const mirrorNodes  = ["127.0.0.1:5600"];
        const ledgerId = LedgerId.LOCAL_NODE;

        function assertIsLocalNode(client) {
            expect(client.network).to.deep.equal(consensusNodes);
            expect(client.mirrorNetwork).to.deep.equal(mirrorNodes);
            expect(client.ledgerId).to.equal(ledgerId);
        }

        it("recognizes local node by name", () => {
            const client = Client.forNetwork('local-node');
            assertIsLocalNode(client);
        })

        it("builds explicit local node client", () => {
            const client = Client.forLocalNode();
            assertIsLocalNode(client);
        })

        it("allows setting local node network", () => {
            const client = new NodeClient();
            client.setNetwork('local-node')
            client.setMirrorNetwork('local-node')
            assertIsLocalNode(client);
        })

        it("destructures props for local node", () => {
            const client = new NodeClient({ network: 'local-node', mirrorNodes: 'local-node'});
            assertIsLocalNode(client);
        })

        it("supports getting local node consensus nodes", () => {
            const network = Network.fromName('local-node');
            expect(network).to.deep.equal(consensusNodes);
        })
    })


    it("should correctly construct and update mirror network", async function () {
        let nodes = ["hcs.testnet.mirrornode.hedera.com:5600"];

        const client = Client.forNetwork({}).setMirrorNetwork(nodes);

        let network = client.mirrorNetwork;

        expect(network.length).to.be.equal(1);
        expect(network.includes("hcs.testnet.mirrornode.hedera.com:5600")).to.be
            .true;

        client.setMirrorNetwork(nodes);
        network = client.mirrorNetwork;

        expect(network.length).to.be.equal(1);
        expect(network.includes("hcs.testnet.mirrornode.hedera.com:5600")).to.be
            .true;

        nodes.push("hcs.testnet1.mirrornode.hedera.com:5600");

        client.setMirrorNetwork(nodes);
        network = client.mirrorNetwork;

        expect(network.length).to.be.equal(2);
        expect(network.includes("hcs.testnet.mirrornode.hedera.com:5600")).to.be
            .true;
        expect(network.includes("hcs.testnet1.mirrornode.hedera.com:5600")).to
            .be.true;

        nodes = ["hcs.testnet1.mirrornode.hedera.com:5600"];

        client.setMirrorNetwork(nodes);
        network = client.mirrorNetwork;

        expect(network.length).to.be.equal(1);
        expect(network.includes("hcs.testnet1.mirrornode.hedera.com:5600")).to
            .be.true;
    });

    it("should maintain TLS after setting a mirror network with TLS", function () {
        const client = Client.forNetwork({})
            .setTransportSecurity(true)
            .setMirrorNetwork(["mainnet-public.mirrornode.hedera.com:443"]);

        expect(client.mirrorNetwork).to.deep.equal([
            "mainnet-public.mirrornode.hedera.com:443",
        ]);

        client.setTransportSecurity(false);
        expect(client.mirrorNetwork).to.deep.equal([
            "mainnet-public.mirrornode.hedera.com:5600",
        ]);

        client.setTransportSecurity(true);
        expect(client.mirrorNetwork).to.deep.equal([
            "mainnet-public.mirrornode.hedera.com:443",
        ]);
    });
});
