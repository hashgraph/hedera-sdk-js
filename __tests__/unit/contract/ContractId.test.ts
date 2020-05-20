import { ContractId } from "../../../src/exports";

describe("ContractId", () => {
    const expectedAddress = "000000ff00000000000000ff0000000000000400";
    const expectedContractId = new ContractId(255, 255, 1024);

    it("ContractId: from/to Solidity Address", () => {
        // A simple account id to  solidity address test
        expect(expectedContractId.toSolidityAddress()).toBe(expectedAddress);

        // Full round trip test
        expect(ContractId.fromSolidityAddress(expectedAddress).toSolidityAddress()).toBe(expectedAddress);
    });
});
