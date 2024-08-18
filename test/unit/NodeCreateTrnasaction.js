import {
    AccountId,
    Hbar,
    NodeCreateTransaction,
    PrivateKey,
    ServiceEndpoint,
    Timestamp,
    TransactionId,
} from "../../src/index.js";

describe("NodeCreateTransaction", function () {
    let tx,
        TEST_ACCOUNT_ID,
        TEST_NODE_ACCOUNT_IDS,
        TEST_GOSSIP_CA_CERTIFICATE,
        TEST_GOSSIP_ENDPOINTS,
        TEST_SERVICE_ENDPOINTS;

    const TEST_VALID_START = new Timestamp(1596210382, 0);
    const TEST_DESCRIPTION = "Test Description";

    beforeEach(function () {
        const IP_AddressV4 = Uint8Array.of(127, 0, 0, 1);
        TEST_ACCOUNT_ID = AccountId.fromString("0.6.9");
        TEST_NODE_ACCOUNT_IDS = [
            AccountId.fromString("0.0.5005"),
            AccountId.fromString("0.0.5006"),
        ];
        TEST_GOSSIP_CA_CERTIFICATE = Buffer.from("gossipCaCertificate");
        TEST_GOSSIP_ENDPOINTS = [
            new ServiceEndpoint().setIpAddressV4(IP_AddressV4),
        ];
        TEST_SERVICE_ENDPOINTS = [
            new ServiceEndpoint().setIpAddressV4(IP_AddressV4),
        ];

        const TEST_ADMIN_KEY = PrivateKey.fromStringED25519(
            "302e020100300506032b65700422042062c4b69e9f45a554e5424fb5a6fe5e6ac1f19ead31dc7718c2d980fd1f998d4b",
        ).publicKey;

        tx = new NodeCreateTransaction()
            .setNodeAccountIds(TEST_NODE_ACCOUNT_IDS)
            .setTransactionId(
                TransactionId.withValidStart(
                    TEST_NODE_ACCOUNT_IDS[0],
                    TEST_VALID_START,
                ),
            )
            .setAccountId(TEST_ACCOUNT_ID)
            .setDescription(TEST_DESCRIPTION)
            .setGossipCaCertificate(TEST_GOSSIP_CA_CERTIFICATE)
            .setCertificateHash(TEST_GOSSIP_CA_CERTIFICATE) // TODO: change this vlaue to a proper one
            .setAdminKey(TEST_ADMIN_KEY)
            .setServiceEndpoints(TEST_SERVICE_ENDPOINTS)
            .setGossipEndpoints(TEST_GOSSIP_ENDPOINTS)
            .setMaxTransactionFee(new Hbar(1));
    });

    it("should convert from and to bytes", function () {
        const tx2 = NodeCreateTransaction.fromBytes(tx.toBytes());

        tx.nodeAccountIds.forEach((element, index) => {
            expect(tx.nodeAccountIds[index].toString()).to.equal(
                tx2.nodeAccountIds[index].toString(),
            );
        });
        expect(tx.transactionId.toString()).to.equal(
            tx2.transactionId.toString(),
        );
        expect(tx.accountId.toString()).to.equal(tx2.accountId.toString());
        expect(tx.description).to.equal(tx2.description);
        expect(tx.gossipCaCertificate.equals(tx2.gossipCaCertificate)).to.be
            .true;
        expect(tx.certificateHash.equals(tx2.certificateHash)).to.be.true;
        expect(tx.adminKey.toString()).to.equal(tx2.adminKey.toString());
        expect(tx.maxTransactionFee.toTinybars().toInt()).to.equal(
            tx2.maxTransactionFee.toTinybars().toInt(),
        );
    });

    it("should change account id", function () {
        const newAccountId = AccountId.fromString("0.4.20");
        tx.setAccountId(newAccountId);
        expect(tx.accountId.toString()).to.equal(newAccountId.toString());
    });

    it("should not change accound id if frozen", function () {
        const newAccountId = AccountId.fromString("0.4.20");
        tx.freeze();
        let err = false;
        try {
            tx.setAccountId(newAccountId);
        } catch (error) {
            err = error.toString().includes("transaction is immutable");
        }

        if (!err) {
            throw new Error(
                "transaction successfully built from invalid bytes",
            );
        }
    });

    it("should change description", async function () {
        const NEW_DESCRIPTION = "New Description";
        tx.setDescription(NEW_DESCRIPTION);
        expect(tx.description).to.equal(NEW_DESCRIPTION);
    });

    it("should not change description if frozen", async function () {
        const NEW_DESCRIPTION = "New Description";
        tx.freeze();
        let err = false;
        try {
            tx.setDescription(NEW_DESCRIPTION);
        } catch (error) {
            err = error.toString().includes("transaction is immutable");
        }

        if (!err) {
            throw new Error(
                "transaction successfully built from invalid bytes",
            );
        }
    });

    it("should change admin key", async function () {
        const NEW_ADMIN_KEY = PrivateKey.fromStringED25519(
            "302e020100300506032b65700422042062c4b69e9f45a554e5424fb5a6fe5e6ac1f19ead31dc7718c2d980fd1f998d4b",
        ).publicKey;
        tx.setAdminKey(NEW_ADMIN_KEY);
        expect(tx.adminKey.toString()).to.equal(NEW_ADMIN_KEY.toString());
    });

    it("should not change admin key if frozen", async function () {
        const NEW_ADMIN_KEY = PrivateKey.fromStringED25519(
            "302e020100300506032b65700422042062c4b69e9f45a554e5424fb5a6fe5e6ac1f19ead31dc7718c2d980fd1f998d4b",
        ).publicKey;
        tx.freeze();
        let err = false;
        try {
            tx.setAdminKey(NEW_ADMIN_KEY);
        } catch (error) {
            err = error.toString().includes("transaction is immutable");
        }

        if (!err) {
            throw new Error(
                "transaction successfully built from invalid bytes",
            );
        }
    });
    it("should change certificate", async function () {
        const NEW_CERTIFICATE = Buffer.from("newCertificate");
        tx.setGossipCaCertificate(NEW_CERTIFICATE);
        expect(tx.gossipCaCertificate.equals(NEW_CERTIFICATE)).to.be.true;
    });

    it("should not change certificate if frozen", async function () {
        const NEW_CERTIFICATE = Buffer.from("newCertificate");
        tx.freeze();
        let err = false;
        try {
            tx.setGossipCaCertificate(NEW_CERTIFICATE);
        } catch (error) {
            err = error.toString().includes("transaction is immutable");
        }

        if (!err) {
            throw new Error(
                "transaction successfully built from invalid bytes",
            );
        }
    });

    it("should change certificate hash", async function () {
        const NEW_CERTIFICATE = Buffer.from("certificate_hash");
        tx.setCertificateHash(NEW_CERTIFICATE);
        expect(tx.certificateHash.equals(NEW_CERTIFICATE)).to.be.true;
    });

    it("should not change certificate hash if frozen", async function () {
        const NEW_CERTIFICATE = Buffer.from("certificate_hash");
        tx.freeze();
        let err = false;
        try {
            tx.setCertificateHash(NEW_CERTIFICATE);
        } catch (error) {
            err = error.toString().includes("transaction is immutable");
        }

        if (!err) {
            throw new Error(
                "transaction successfully built from invalid bytes",
            );
        }
    });

    it("should change gossip endpoints", async function () {
        const NEW_GOSSIP_ENDPOINTS = [
            new ServiceEndpoint().setIpAddressV4(Uint8Array.of(127, 0, 0, 2)),
        ];
        tx.setGossipEndpoints(NEW_GOSSIP_ENDPOINTS);
        expect(tx.gossipEndpoints.join("")).to.equal(
            NEW_GOSSIP_ENDPOINTS.join(""),
        );
    });

    it("should not change gossip endpoints if frozen", async function () {
        const NEW_GOSSIP_ENDPOINTS = [
            new ServiceEndpoint().setIpAddressV4(Uint8Array.of(127, 0, 0, 2)),
        ];
        tx.freeze();
        let err = false;
        try {
            tx.setGossipEndpoints(NEW_GOSSIP_ENDPOINTS);
        } catch (error) {
            err = error.toString().includes("transaction is immutable");
        }

        if (!err) {
            throw new Error(
                "transaction successfully built from invalid bytes",
            );
        }
    });

    it("should change service endpoints", async function () {
        const NEW_SERVICE_ENDPOINTS = [
            new ServiceEndpoint().setIpAddressV4(Uint8Array.of(127, 0, 0, 2)),
        ];
        tx.setServiceEndpoints(NEW_SERVICE_ENDPOINTS);
        expect(tx.serviceEndpoints.join("")).to.equal(
            NEW_SERVICE_ENDPOINTS.join(""),
        );
    });

    it("should not change service endpoints if frozen", async function () {
        const NEW_SERVICE_ENDPOINTS = [
            new ServiceEndpoint().setIpAddressV4(Uint8Array.of(127, 0, 0, 2)),
        ];
        tx.freeze();
        let err = false;
        try {
            tx.setServiceEndpoints(NEW_SERVICE_ENDPOINTS);
        } catch (error) {
            err = error.toString().includes("transaction is immutable");
        }

        if (!err) {
            throw new Error(
                "transaction successfully built from invalid bytes",
            );
        }
    });
});
