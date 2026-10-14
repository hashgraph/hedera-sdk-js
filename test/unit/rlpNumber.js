import Long from "long";
import BigNumber from "bignumber.js";
import {
    bytesOrHexToBytes,
    toMinimalBytes,
    bytesToLong,
    bytesToBigNumber,
} from "../../src/encoding/rlpNumber.js";

describe("bytesOrHexToBytes", function () {
    it("accepts 0x-prefixed and plain hex strings with the same bytes", function () {
        const expected = new Uint8Array([1, 0, 255]);

        expect(bytesOrHexToBytes("0x0100ff")).to.deep.equal(expected);
        expect(bytesOrHexToBytes("0100ff")).to.deep.equal(expected);
    });

    it("returns a copy instead of aliasing the caller's Uint8Array", function () {
        const original = new Uint8Array([0, 1, 2, 3]);
        const result = bytesOrHexToBytes(original);

        expect(result).to.not.equal(original);
        result[0] = 9;
        expect(original).to.deep.equal(new Uint8Array([0, 1, 2, 3]));
        expect(result).to.deep.equal(new Uint8Array([9, 1, 2, 3]));
    });
});

describe("toMinimalBytes", function () {
    it("produces the same minimal bytes for equivalent numeric inputs", function () {
        const expected = new Uint8Array([1, 0]);
        const values = [
            new Uint8Array([0, 0, 1, 0]),
            "0x0100",
            "256",
            256,
            Long.fromNumber(256),
            new BigNumber(256),
            256n,
        ];

        for (const value of values) {
            expect(toMinimalBytes(value)).to.deep.equal(expected);
        }
    });

    it("encodes zero in every accepted form as empty bytes", function () {
        const expected = new Uint8Array();

        expect(toMinimalBytes(0)).to.deep.equal(expected);
        expect(toMinimalBytes(0n)).to.deep.equal(expected);
        expect(toMinimalBytes("0")).to.deep.equal(expected);
        expect(toMinimalBytes("0x00")).to.deep.equal(expected);
        expect(toMinimalBytes(Long.ZERO)).to.deep.equal(expected);
        expect(toMinimalBytes(new BigNumber(0))).to.deep.equal(expected);
        expect(toMinimalBytes(new Uint8Array([0, 0, 0]))).to.deep.equal(
            expected,
        );
    });

    it("returns a copy and never aliases the caller's buffer", function () {
        const original = new Uint8Array([0, 0, 1, 0]);
        const result = toMinimalBytes(original);

        expect(result).to.not.equal(original);
        result[0] = 9;
        expect(original).to.deep.equal(new Uint8Array([0, 0, 1, 0]));
        expect(result).to.deep.equal(new Uint8Array([9, 0]));
    });

    it("supports values above the uint64 range", function () {
        expect(toMinimalBytes(2n ** 64n)).to.deep.equal(
            new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0]),
        );
    });

    it("rejects negative numbers and negative Long values", function () {
        expect(() => toMinimalBytes(-1)).to.throw("non-negative integers");
        expect(() => toMinimalBytes(Long.fromInt(-1))).to.throw(
            "non-negative integers",
        );
    });

    it("rejects unsafe and fractional numeric values", function () {
        expect(() => toMinimalBytes(1.5)).to.throw("safe integers");
        expect(() => toMinimalBytes(Number.MAX_SAFE_INTEGER + 1)).to.throw(
            "safe integers",
        );
    });

    it("rejects fractional and non-numeric strings", function () {
        expect(() => toMinimalBytes("1.5")).to.throw("non-negative integers");
        expect(() => toMinimalBytes("abc")).to.throw();
    });
});

describe("bytesToLong", function () {
    it("decodes empty bytes as zero", function () {
        expect(bytesToLong(new Uint8Array()).toString()).to.equal("0");
    });

    it("decodes the largest uint64 as an unsigned Long", function () {
        const bytes = new Uint8Array(8).fill(0xff);

        expect(bytesToLong(bytes).toString()).to.equal("18446744073709551615");
    });

    it("throws when more than eight bytes are provided", function () {
        expect(() =>
            bytesToLong(new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 1])),
        ).to.throw("uint64 range");
    });
});

describe("bytesToBigNumber", function () {
    it("decodes empty bytes as zero", function () {
        expect(bytesToBigNumber(new Uint8Array()).toString()).to.equal("0");
    });

    it("decodes 32 bytes of 0xff as the largest uint256", function () {
        const maxUint256 = new Uint8Array(32).fill(0xff);
        const expected = new BigNumber(2).pow(256).minus(1).toString();

        expect(bytesToBigNumber(maxUint256).toString()).to.equal(expected);
    });

    it("round-trips values encoded by toMinimalBytes", function () {
        const values = [
            0,
            1,
            256,
            2n ** 64n,
            new BigNumber("123456789012345678901234567890"),
        ];

        for (const value of values) {
            const bytes = toMinimalBytes(value);
            expect(bytesToBigNumber(bytes).toString()).to.equal(
                new BigNumber(value.toString()).toString(),
            );
        }
    });
});
