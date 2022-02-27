import { expect } from "chai";

import { ContractId } from "../../src/exports.js";
import * as hex from "../../src/encoding/hex.js";
import Long from "long";

describe("ContractId", function () {
    const evmAddress = "0011223344556677889900112233445577889900";

    it("fromString() with num", function () {
        expect(
            ContractId.fromString(`1.2.3`).toString()
        ).to.be.equal(`1.2.3`);
    });

    it("fromString() with evmAddress", function () {
        expect(
            ContractId.fromString(`1.2.${evmAddress}`).toString()
        ).to.be.equal(`1.2.${evmAddress}`);
    });

    it("toSolidityAddress() to prioritize evmAddress", function () {
        const emvAddresContractId = ContractId.fromEvmAddress(1, 2, evmAddress);

        expect(emvAddresContractId.toString()).to.be.equal(`1.2.${evmAddress}`);
        expect(emvAddresContractId.toSolidityAddress()).to.be.equal(evmAddress);
    });

    it("toString() to prioritize evmAddress", function () {
        const emvAddresContractId = ContractId.fromEvmAddress(1, 2, evmAddress);

        expect(emvAddresContractId.toString()).to.be.equal(`1.2.${evmAddress}`);
    });

    it("toProtobuf() with evmAddres", function () {
        const emvAddresContractId = ContractId.fromEvmAddress(1, 2, evmAddress);

        expect(emvAddresContractId._toProtobuf()).to.deep.equal({
            shardNum: Long.fromNumber(1),
            realmNum: Long.fromNumber(2),
            contractNum: Long.ZERO,
            evmAddress: hex.decode(evmAddress),
        });
    });

    it("toProtobuf() with evmAddress", function () {
        const contractId = new ContractId(1, 2, 3);

        expect(contractId._toProtobuf()).to.deep.equal({
            shardNum: Long.fromNumber(1),
            realmNum: Long.fromNumber(2),
            contractNum: Long.fromNumber(3),
            evmAddress: null,
        });
    });
});
