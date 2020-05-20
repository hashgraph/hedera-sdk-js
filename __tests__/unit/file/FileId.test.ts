import { FileId } from "../../../src/exports";

describe("FileId", () => {
    const expectedAddress = "000000ff00000000000000ff0000000000000400";
    const expectedFileId = new FileId(255, 255, 1024);

    it("FileId: from/to Solidity Address", () => {
        // A simple account id to  solidity address test
        expect(expectedFileId.toSolidityAddress()).toBe(expectedAddress);

        // Full round trip test
        expect(FileId.fromSolidityAddress(expectedAddress).toSolidityAddress()).toBe(expectedAddress);
    });
});
