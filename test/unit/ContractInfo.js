import { ContractInfo, Hbar, LedgerId, PrivateKey } from "../../src/index.js";
import Long from "long";

/** @typedef {import("../../src/PublicKey.js").default} PublicKey */

/**
 * Builds a `ContractGetInfoResponse.ContractInfo` protobuf object with only
 * the fields `_fromProtobuf()` cannot do without. `autoRenewPeriod` is always
 * required (it throws without it) and `deleted` is copied as is, so both are
 * always set. Optional fields are added through `overrides`.
 *
 * @param {object} [overrides]
 * @returns {object}
 */
function createContractInfoProto(overrides = {}) {
    return {
        contractID: { shardNum: 0, realmNum: 0, contractNum: 1001 },
        accountID: { shardNum: 0, realmNum: 0, accountNum: 1001 },
        expirationTime: { seconds: Long.fromNumber(1700000000), nanos: 0 },
        autoRenewPeriod: { seconds: Long.fromNumber(7776000) },
        deleted: false,
        ...overrides,
    };
}

/**
 * Builds a protobuf object with every optional field set.
 *
 * @param {PublicKey} adminKey
 * @returns {object}
 */
function createFullContractInfoProto(adminKey) {
    return createContractInfoProto({
        contractID: { shardNum: 1, realmNum: 2, contractNum: 1001 },
        accountID: { shardNum: 1, realmNum: 2, accountNum: 1001 },
        contractAccountID: "00000001000000000000000200000000000003e9",
        adminKey: adminKey._toProtobufKey(),
        expirationTime: {
            seconds: Long.fromNumber(1700000000),
            nanos: 500000000,
        },
        autoRenewPeriod: { seconds: Long.fromNumber(2592000) },
        autoRenewAccountId: { shardNum: 1, realmNum: 2, accountNum: 2002 },
        storage: Long.fromNumber(2048),
        memo: "contract memo",
        balance: Long.fromNumber(150),
        deleted: true,
        tokenRelationships: [
            { tokenId: { tokenNum: 9 }, balance: 3, decimals: 2 },
        ],
        ledgerId: LedgerId.TESTNET.toBytes(),
        stakingInfo: { declineReward: true, stakedNodeId: 3 },
        maxAutomaticTokenAssociations: Long.fromNumber(10),
    });
}

describe("ContractInfo", function () {
    describe("_fromProtobuf", function () {
        it("should map all fields from protobuf", function () {
            const adminKey = PrivateKey.generateED25519().publicKey;

            const info = ContractInfo._fromProtobuf(
                createFullContractInfoProto(adminKey),
            );

            expect(info.contractId.toString()).to.equal("1.2.1001");
            expect(info.accountId.toString()).to.equal("1.2.1001");
            expect(info.contractAccountId).to.equal(
                "00000001000000000000000200000000000003e9",
            );
            expect(info.adminKey.toString()).to.equal(adminKey.toString());
            expect(info.expirationTime.seconds.toNumber()).to.equal(1700000000);
            expect(info.expirationTime.nanos.toNumber()).to.equal(500000000);
            expect(info.autoRenewPeriod.seconds.toNumber()).to.equal(2592000);
            expect(info.autoRenewAccountId.toString()).to.equal("1.2.2002");
            expect(info.storage.toNumber()).to.equal(2048);
            expect(info.contractMemo).to.equal("contract memo");
            expect(info.balance.toTinybars().toNumber()).to.equal(150);
            expect(info.isDeleted).to.equal(true);
            expect(info.tokenRelationships.size).to.equal(1);
            expect(
                info.tokenRelationships.get("0.0.9").balance.toNumber(),
            ).to.equal(3);
            expect(info.ledgerId.toString()).to.equal(
                LedgerId.TESTNET.toString(),
            );
            expect(info.stakingInfo.declineStakingReward).to.equal(true);
            expect(
                Long.fromValue(info.stakingInfo.stakedNodeId).toNumber(),
            ).to.equal(3);
            expect(info.maxAutomaticTokenAssociations.toNumber()).to.equal(10);
        });

        it("should convert plain number storage and maxAutomaticTokenAssociations to Long", function () {
            const info = ContractInfo._fromProtobuf(
                createContractInfoProto({
                    storage: 4096,
                    maxAutomaticTokenAssociations: 25,
                }),
            );

            expect(info.storage).to.be.instanceOf(Long);
            expect(info.storage.toNumber()).to.equal(4096);
            expect(info.maxAutomaticTokenAssociations).to.be.instanceOf(Long);
            expect(info.maxAutomaticTokenAssociations.toNumber()).to.equal(25);
        });

        it("should convert balance in tinybars to an Hbar", function () {
            const info = ContractInfo._fromProtobuf(
                createContractInfoProto({ balance: 250000000 }),
            );

            expect(info.balance).to.be.instanceOf(Hbar);
            expect(info.balance.toTinybars().toNumber()).to.equal(250000000);
            expect(info.balance.toString()).to.equal(new Hbar(2.5).toString());
        });

        it("should default contractAccountId and contractMemo to an empty string", function () {
            const info = ContractInfo._fromProtobuf(createContractInfoProto());

            expect(info.contractAccountId).to.equal("");
            expect(info.contractMemo).to.equal("");
        });

        it("should default adminKey, autoRenewAccountId, ledgerId and stakingInfo to null", function () {
            const info = ContractInfo._fromProtobuf(createContractInfoProto());

            expect(info.adminKey).to.be.null;
            expect(info.autoRenewAccountId).to.be.null;
            expect(info.ledgerId).to.be.null;
            expect(info.stakingInfo).to.be.null;
        });

        it("should default storage, balance and maxAutomaticTokenAssociations to zero", function () {
            const info = ContractInfo._fromProtobuf(createContractInfoProto());

            expect(info.storage).to.be.instanceOf(Long);
            expect(info.storage.isZero()).to.be.true;
            expect(info.balance).to.be.instanceOf(Hbar);
            expect(info.balance.toTinybars().isZero()).to.be.true;
            expect(info.maxAutomaticTokenAssociations).to.be.instanceOf(Long);
            expect(info.maxAutomaticTokenAssociations.isZero()).to.be.true;
        });

        it("should default tokenRelationships to an empty map", function () {
            const info = ContractInfo._fromProtobuf(createContractInfoProto());

            expect(info.tokenRelationships.size).to.equal(0);
        });
    });

    describe("toBytes and fromBytes round-trip", function () {
        it("should preserve every field that was set", function () {
            const adminKey = PrivateKey.generateED25519().publicKey;
            const original = ContractInfo._fromProtobuf(
                createFullContractInfoProto(adminKey),
            );

            const restored = ContractInfo.fromBytes(original.toBytes());

            expect(restored.contractId.toString()).to.equal(
                original.contractId.toString(),
            );
            expect(restored.accountId.toString()).to.equal(
                original.accountId.toString(),
            );
            expect(restored.contractAccountId).to.equal(
                original.contractAccountId,
            );
            expect(restored.adminKey.toString()).to.equal(adminKey.toString());
            expect(restored.expirationTime.seconds.toNumber()).to.equal(
                original.expirationTime.seconds.toNumber(),
            );
            expect(restored.expirationTime.nanos.toNumber()).to.equal(
                original.expirationTime.nanos.toNumber(),
            );
            expect(restored.autoRenewPeriod.seconds.toNumber()).to.equal(
                original.autoRenewPeriod.seconds.toNumber(),
            );
            expect(restored.autoRenewAccountId.toString()).to.equal(
                original.autoRenewAccountId.toString(),
            );
            expect(restored.storage.toNumber()).to.equal(
                original.storage.toNumber(),
            );
            expect(restored.contractMemo).to.equal(original.contractMemo);
            expect(restored.balance.toTinybars().toNumber()).to.equal(
                original.balance.toTinybars().toNumber(),
            );
            expect(restored.isDeleted).to.equal(original.isDeleted);
            expect(restored.tokenRelationships.size).to.equal(1);
            expect(
                restored.tokenRelationships.get("0.0.9").balance.toNumber(),
            ).to.equal(3);
            expect(restored.ledgerId.toString()).to.equal(
                original.ledgerId.toString(),
            );
            expect(restored.stakingInfo.declineStakingReward).to.equal(
                original.stakingInfo.declineStakingReward,
            );
            expect(
                Long.fromValue(restored.stakingInfo.stakedNodeId).toNumber(),
            ).to.equal(3);
            expect(restored.maxAutomaticTokenAssociations.toNumber()).to.equal(
                original.maxAutomaticTokenAssociations.toNumber(),
            );
        });
    });

    describe("toBytes and fromBytes round-trip without optional fields", function () {
        it("should keep the defaults of a contract with only the required fields", function () {
            const original = ContractInfo._fromProtobuf(
                createContractInfoProto(),
            );

            const restored = ContractInfo.fromBytes(original.toBytes());

            expect(restored.contractId.toString()).to.equal("0.0.1001");
            expect(restored.contractAccountId).to.equal("");
            expect(restored.contractMemo).to.equal("");
            expect(restored.adminKey).to.be.null;
            expect(restored.autoRenewAccountId).to.be.null;
            expect(restored.stakingInfo).to.be.null;
            expect(restored.storage.isZero()).to.be.true;
            expect(restored.balance.toTinybars().isZero()).to.be.true;
            expect(restored.maxAutomaticTokenAssociations.isZero()).to.be.true;
            expect(restored.tokenRelationships.size).to.equal(0);
            expect(restored.isDeleted).to.equal(false);
        });

        it("should restore a missing ledgerId as an empty LedgerId, not null", function () {
            const original = ContractInfo._fromProtobuf(
                createContractInfoProto(),
            );
            expect(original.ledgerId).to.be.null;

            const restored = ContractInfo.fromBytes(original.toBytes());

            // Protobuf has no null for bytes, so the empty value comes back.
            expect(restored.ledgerId).to.be.instanceOf(LedgerId);
            expect(restored.ledgerId.toBytes().length).to.equal(0);
        });
    });

    describe("object frozen", function () {
        it("should be frozen after construction", function () {
            const info = ContractInfo._fromProtobuf(createContractInfoProto());

            expect(Object.isFrozen(info)).to.be.true;
        });
    });
});
