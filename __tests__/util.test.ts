import {tinybarRangeCheck} from "../src/util";
import {TinybarValueError} from "../src/errors";
import BigNumber from "bignumber.js";
import {Hbar} from "../src/Hbar";

describe('tinybarRangeCheck()', () => {
    it('forbids negative numbers by default', () => {
        expect(() => tinybarRangeCheck(-1)).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(new BigNumber(-1))).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(Hbar.of('-1'))).toThrow(TinybarValueError);
    });

    it('forbids number values out of range', () => {
        expect(() => tinybarRangeCheck(2 ** 53)).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(2 ** 53 - 1)).not.toThrow();

        expect(() => tinybarRangeCheck(-(2 ** 53), 'allowNegative')).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(-(2 ** 53) + 1, 'allowNegative')).not.toThrow();
    });

    it('forbids BigNumber values out of range', () => {
        expect(() => tinybarRangeCheck(new BigNumber(2).pow(63))).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(new BigNumber(2).pow(63).minus(1))).not.toThrow();

        expect(() => tinybarRangeCheck(new BigNumber(-2).pow(63).minus(1), 'allowNegative')).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(new BigNumber(-2).pow(63), 'allowNegative')).not.toThrow();
    });

    it('forbids Hbar values out of range', () => {
        expect(() => tinybarRangeCheck(Hbar.from(93, 'gigabar'))).toThrow(TinybarValueError);
        // the maximum amount of gigabar in the network at any given time
        expect(() => tinybarRangeCheck(Hbar.from(50, 'gigabar'))).not.toThrow();

        expect(() => tinybarRangeCheck(Hbar.from(-93, 'gigabar'), 'allowNegative')).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(Hbar.from(-50, 'gigabar'), 'allowNegative')).not.toThrow();

    });
});
