import BigNumber from "bignumber.js";

/** Normalized account ID returned by various methods in the SDK. */
export type AccountId = { shard: number; realm: number; account: number };

/**
 * Input type for an ID of an account on the network.
 *
 * In any form, `shard` and `realm` are assumed to be 0 if not provided.
 *
 * Strings may take the form `'<shard>.<realm>.<account>'` or `'<account>'`.
 *
 * A bare `number` will be taken as the account number with shard and realm of 0.
 */
export type AccountIdLike =
    { shard?: number; realm?: number; account: number }
    | string
    | number;

/** Normalized contract ID returned by various methods in the SDK. */
export type ContractId = { shard: number; realm: number; contract: number };

/**
 * Input type for an ID of a contract on the network.
 *
 * In any form, `shard` and `realm` are assumed to be 0 if not provided.
 *
 * Strings may take the form `'<shard>.<realm>.<contract>'` or `'<contract>'`.
 *
 * A bare `number` will be taken as the contract number with shard and realm of 0.
 */
export type ContractIdLike =
    { shard?: number; realm?: number; contract: number }
    | string
    | number;

/** Normalized file ID returned by various methods in the SDK. */
export type FileId = { shard: number; realm: number; file: number };

/**
 * Input type for an ID of a file on the network.
 *
 * In any form, `shard` and `realm` are assumed to be 0 if not provided.
 *
 * Strings may take the form `'<shard>.<realm>.<file>'` or `'<file>'`.
 *
 * A bare `number` will be taken as the file number with shard and realm of 0.
 */
export type FileIdLike =
    { shard?: number; realm?: number; file: number }
    | string
    | number;

/**
 * Normalized transaction ID returned by various methods in the SDK.
 */
export type TransactionId = {
    account: AccountId;
    validStartSeconds: number;
    validStartNanos: number;
};

/**
 * Input type for an ID of a new transaction.
 */
export type TransactionIdLike = { account: AccountIdLike }
    & ({ validStart: Date } | { validStartSeconds: number; validStartNanos: number });

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
