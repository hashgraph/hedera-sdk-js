import { TinybarValueError } from "../src/errors";
import BigNumber from "bignumber.js";
import { Hbar, HbarUnit } from "../src/Hbar";
import { AccountId } from "../src/account/AccountId";
import { ContractId } from "../src/contract/ContractId";
import { FileId } from "../src/file/FileId";
import { tinybarRangeCheck } from "../src/Tinybar";
import { dateToTimestamp, timestampToDate, timestampToProto } from "../src/Timestamp";

describe("tinybarRangeCheck()", () => {
    it("forbids negative numbers by default", () => {
        expect(() => tinybarRangeCheck(-1)).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(new BigNumber(-1))).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(Hbar.of("-1"))).toThrow(TinybarValueError);
    });

    it("forbids number values out of range", () => {
        expect(() => tinybarRangeCheck(2 ** 53)).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck((2 ** 53) - 1)).not.toThrow();

        expect(() => tinybarRangeCheck(-(2 ** 53), "allowNegative")).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(-(2 ** 53) + 1, "allowNegative")).not.toThrow();
    });

    it("forbids BigNumber values out of range", () => {
        expect(() => tinybarRangeCheck(new BigNumber(2).pow(63))).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(new BigNumber(2).pow(63).minus(1))).not.toThrow();

        expect(() => tinybarRangeCheck(new BigNumber(-2).pow(63).minus(1), "allowNegative")).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(new BigNumber(-2).pow(63), "allowNegative")).not.toThrow();
    });

    it("forbids Hbar values out of range", () => {
        expect(() => tinybarRangeCheck(Hbar.from(93, HbarUnit.Gigabar))).toThrow(TinybarValueError);
        // the maximum amount of gigabar in the network at any given time
        expect(() => tinybarRangeCheck(Hbar.from(50, HbarUnit.Gigabar))).not.toThrow();
        expect(() => tinybarRangeCheck(Hbar.MAX)).not.toThrow();

        expect(() => tinybarRangeCheck(Hbar.from(-93, HbarUnit.Gigabar), "allowNegative")).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(Hbar.from(-50, HbarUnit.Gigabar), "allowNegative")).not.toThrow();
        expect(() => tinybarRangeCheck(Hbar.MIN, "allowNegative")).not.toThrow();
    });
});

describe("normalizeAccountId()", () => {
    const expectedAccountId = new AccountId({ shard: 0, realm: 0, account: 3 });
    const expectedId = {
        shard: expectedAccountId.shard,
        realm: expectedAccountId.realm,
        account: expectedAccountId.account
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let shard, realm, account;
    it("normalizes objects", () => {
        expect({ shard, realm, account } = new AccountId({ account: 3 }))
            .toMatchObject(expectedId);
        expect({ shard, realm, account } = new AccountId({ shard: 1, account: 3 }))
            .toMatchObject({ shard: 1, realm: 0, account: 3 });
        expect({ shard, realm, account } = new AccountId({ realm: 2, account: 3 }))
            .toMatchObject({ shard: 0, realm: 2, account: 3 });
        expect({ shard, realm, account } = new AccountId({ shard: 1, realm: 2, account: 3 }))
            .toMatchObject({ shard: 1, realm: 2, account: 3 });
        expect(true).toBe(true);
    });

    it("normalizes strings", () => {
        expect({ shard, realm, account } = new AccountId("3")).toMatchObject(expectedId);
        expect({ shard, realm, account } = new AccountId("0.0.3")).toMatchObject(expectedId);
        expect({ shard, realm, account } = new AccountId("1.2.3")).toMatchObject({ shard: 1, realm: 2, account: 3 });

        expect(() => new AccountId("0.0.0.3"))
            .toThrow("invalid account ID: 0.0.0.3");
        expect(() => new AccountId("0.3"))
            .toThrow("invalid account ID: 0.3");
        expect(() => new AccountId("."))
            .toThrow("invalid account ID: .");
    });

    it("normalizes numbers", () => {
        expect({ shard, realm, account } = new AccountId(3)).toMatchObject(expectedId);
        expect({ shard, realm, account } = new AccountId(Number.MAX_SAFE_INTEGER))
            .toMatchObject({ shard: 0, realm: 0, account: Number.MAX_SAFE_INTEGER });

        expect(() => new AccountId(-1))
            .toThrow("invalid account ID: -1");
        expect(() => new AccountId(0.3))
            .toThrow("invalid account ID: 0.3");
        expect(() => new AccountId(Number.MAX_SAFE_INTEGER + 1))
            .toThrow(`account ID outside safe integer range for number: ${Number.MAX_SAFE_INTEGER + 1}`);
    });
});

// technically redundant to `new AccountId()` but if the implementation details or types change
// asymmetrically or in a breaking manner we would want to know
describe("new ContractId()", () => {
    const expectedContractId = new ContractId({ shard: 0, realm: 0, contract: 3 });
    const expectedId = {
        shard: expectedContractId.shard,
        realm: expectedContractId.realm,
        contract: expectedContractId.contract
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let shard, realm, contract;

    it("normalizes objects", () => {
        expect({ shard, realm, contract } = new ContractId({ contract: 3 }))
            .toMatchObject({ shard: 0, realm: 0, contract: 3 });
        expect({ shard, realm, contract } = new ContractId({ shard: 1, contract: 3 }))
            .toMatchObject({ shard: 1, realm: 0, contract: 3 });
        expect({ shard, realm, contract } = new ContractId({ realm: 2, contract: 3 }))
            .toMatchObject({ shard: 0, realm: 2, contract: 3 });
        expect({ shard, realm, contract } = new ContractId({ shard: 1, realm: 2, contract: 3 }))
            .toMatchObject({ shard: 1, realm: 2, contract: 3 });
        expect({ shard, realm, contract } = new ContractId(expectedId)).toMatchObject(expectedId);
    });

    it("normalizes strings", () => {
        expect({ shard, realm, contract } = new ContractId("3")).toMatchObject(expectedId);
        expect({ shard, realm, contract } = new ContractId("0.0.3")).toMatchObject(expectedId);
        expect({ shard, realm, contract } = new ContractId("1.2.3")).toMatchObject({ shard: 1, realm: 2, contract: 3 });

        expect(() => new ContractId("0.0.0.3"))
            .toThrow("invalid contract ID: 0.0.0.3");
        expect(() => new ContractId("0.3"))
            .toThrow("invalid contract ID: 0.3");
        expect(() => new ContractId("."))
            .toThrow("invalid contract ID: .");
    });

    it("normalizes numbers", () => {
        expect({ shard, realm, contract } = new ContractId(3)).toMatchObject(expectedId);
        expect({ shard, realm, contract } = new ContractId(Number.MAX_SAFE_INTEGER))
            .toMatchObject({ shard: 0, realm: 0, contract: Number.MAX_SAFE_INTEGER });

        expect(() => new ContractId(-1))
            .toThrow("invalid contract ID: -1");
        expect(() => new ContractId(0.3))
            .toThrow("invalid contract ID: 0.3");
        expect(() => new ContractId(Number.MAX_SAFE_INTEGER + 1))
            .toThrow(`contract ID outside safe integer range for number: ${Number.MAX_SAFE_INTEGER + 1}`);
    });
});

// technically redundant to `new AccountId()` but if the implementation details or types change
// asymmetrically or in a breaking manner we would want to know
describe("new FileId()", () => {
    const expectedFileId = new FileId({ shard: 0, realm: 0, file: 3 });
    const expectedId = {
        shard: expectedFileId.shard,
        realm: expectedFileId.realm,
        file: expectedFileId.file
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let shard, realm, file;

    it("normalizes objects", () => {
        expect({ shard, realm, file } = new FileId({ file: 3 })).toMatchObject(expectedId);
        expect({ shard, realm, file } = new FileId({ shard: 1, file: 3 }))
            .toMatchObject({ shard: 1, realm: 0, file: 3 });
        expect({ shard, realm, file } = new FileId({ realm: 2, file: 3 }))
            .toMatchObject({ shard: 0, realm: 2, file: 3 });
        expect({ shard, realm, file } = new FileId({ shard: 1, realm: 2, file: 3 }))
            .toMatchObject({ shard: 1, realm: 2, file: 3 });
        expect({ shard, realm, file } = new FileId(expectedId)).toMatchObject(expectedId);
    });

    it("normalizes strings", () => {
        expect({ shard, realm, file } = new FileId("3")).toMatchObject(expectedId);
        expect({ shard, realm, file } = new FileId("0.0.3")).toMatchObject(expectedId);
        expect({ shard, realm, file } = new FileId("1.2.3")).toMatchObject({ shard: 1, realm: 2, file: 3 });

        expect(() => new FileId("0.0.0.3"))
            .toThrow("invalid file ID: 0.0.0.3");
        expect(() => new FileId("0.3"))
            .toThrow("invalid file ID: 0.3");
        expect(() => new FileId("."))
            .toThrow("invalid file ID: .");
    });

    it("normalizes numbers", () => {
        expect({ shard, realm, file } = new FileId(3)).toMatchObject(expectedId);
        expect({ shard, realm, file } = new FileId(Number.MAX_SAFE_INTEGER)).toMatchObject({
            shard: 0,
            realm: 0,
            file: Number.MAX_SAFE_INTEGER
        });

        expect(() => new FileId(-1))
            .toThrow("invalid file ID: -1");
        expect(() => new FileId(0.3))
            .toThrow("invalid file ID: 0.3");
        expect(() => new FileId(Number.MAX_SAFE_INTEGER + 1))
            .toThrow(`file ID outside safe integer range for number: ${Number.MAX_SAFE_INTEGER + 1}`);
    });
});

describe("Date and Timestamp", () => {
    it("roundtrip", () => {
        const date = new Date(1414141411);
        const timestamp = dateToTimestamp(date);
        const protoTimestmap = timestampToProto(timestamp);
        const roundTripDate = timestampToDate(protoTimestmap);
        expect(date.toDateString()).toStrictEqual(roundTripDate.toDateString());
    });
});
