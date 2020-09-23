import { AccountId } from "../../../src/exports";

describe("AccountId", () => {
  const data = [
    {
      expectedAddress: "000000ff00000000000000ff0000000000000400",
      expectedAccountId: new AccountId(255, 255, 1024),
    },
    {
      expectedAddress: "000000ff00000001ffffffff00000001ffffffff",
      expectedAccountId: new AccountId(255, 2 ** 33 - 1, 2 ** 33 - 1),
    },
  ];

  it("AccountId: from/to Solidity Address", () => {
    data.forEach(({ expectedAddress, expectedAccountId }) => {
      // A simple account id to  solidity address test
      expect(expectedAccountId.toSolidityAddress()).toBe(expectedAddress);

      // Full round trip test
      expect(
        AccountId.fromSolidityAddress(expectedAddress).toSolidityAddress()
      ).toBe(expectedAddress);
    });
  });
});
