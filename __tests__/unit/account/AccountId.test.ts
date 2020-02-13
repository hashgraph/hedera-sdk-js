import { AccountId } from "../../../src/exports";
import {mockClient, privateKey} from "../MockClient";

describe("AccountId", () => {
    const expectedAddress = "000000ff00000000000000ff0000000000000400";
    const expectedAccountId = new AccountId(255, 255, 1024);

    it("AccountId: from/to Solidity Address", () => {
        // A simple account id to  solidity address test
        expect(expectedAccountId.toSolidityAddress()).toBe(expectedAddress);

        // Full round trip test
        expect(AccountId.fromSolidityAddress(expectedAddress).toSolidityAddress()).toBe(expectedAddress);
    });
});
