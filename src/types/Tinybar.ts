import BigNumber from "bignumber.js";

/**
 * The default denomination of currency for the SDK and in the Hedera protocol.
 *
 * One Tinybar is `1 / 100,000,000` of an HBAR.
 *
 * Note that `number` can only precisely represent integers in the range `[-2^53, 2^53)`;
 * passing `number` values outside of this range will cause an error to be thrown as rounding may
 * have occurred. For all other cases, `BigNumber` may be used.
 *
 * However, the recommended way to handle HBAR amounts with the SDK is to use the `Hbar` class
 * which provides conversion to and from any standard denomination of HBAR. Any method which
 * accepts this type for currency amounts also accepts instances of this class.
 *
 * Note additionally that while `BigNumber` and `Hbar` are arbitrary-precision, the largest range
 * supported by the Hedera protocol is `[-2^63, 2^63)`.
 */
export type Tinybar = number | BigNumber;
