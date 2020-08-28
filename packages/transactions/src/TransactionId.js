import AccountId from "./AccountId.js";
import Time from "./Time.js";
import { root } from "./generated/proto.js";
import { orThrow } from "./util.js";
import * as timestamp from "./Timestamp.js";
// import { BaseClient } from "./BaseClient";
// import { TransactionReceipt } from "./TransactionReceipt";
// import { TransactionRecord } from "./TransactionRecord";

/**
 * Input type for an ID of a new transaction.
 *
 * @typedef {{ account: import("./AccountId.js").AccountIdLike } & ( { validStart: Date } | { validStartSeconds: number; validStartNanos: number }) | TransactionId} TransactionIdLike
 */

/**
 * Normalized transaction ID returned by various methods in the SDK.
 *
 * The ID for a transaction. This is used for retrieving receipts and records for a transaction,
 * for appending to a file right after creating it, for instantiating a smart contract with
 * bytecode in a file just created, and internally by the network for detecting when duplicate
 * transactions are submitted. A user might get a transaction processed faster by submitting it
 * to N nodes, each with a different node account, but all with the same root.proto.TransactionID. Then,
 * the transaction will take effect when the first of all those nodes submits the transaction
 * and it reaches consensus. The other transactions will not take effect. So this could make the
 * transaction take effect faster, if any given node might be slow. However, the full transaction
 * fee is charged for each transaction, so the total fee is N times as much if the transaction
 * is sent to N nodes.
 */
export default class TransactionId {
    /**
     * @param {TransactionIdLike | import("./AccountId.js").AccountIdLike} id
     */
    constructor(id) {
        // Cannot use try/catch here because test die horribly
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        // eslint-disable-next-line dot-notation
        if (!("validStart" in id) && !("validStartSeconds" in id)) {
            /**
             * The Account ID that paid for this transaction.
             *
             * @type {AccountId}
             */
            this.accountId = new AccountId(id, undefined, undefined);

            const { seconds, nanos } = timestamp.create();

            /**
             * The transaction is invalid if consensusTimestamp < transactionID.transactionStartValid.
             *
             * @type {Time}
             */
            this.validStart = new Time(seconds, nanos);
        } else {
            if (id instanceof TransactionId) {
                this.accountId = id.accountId;
                this.validStart = new Time(
                    id.validStart.seconds,
                    id.validStart.nanos
                );
            } else {
                /**
                 * @type {TransactionIdLike}
                 */
                const transactionId = id;

                this.accountId = new AccountId(transactionId.account, undefined, undefined);

                if ("validStart" in transactionId) {
                    const { seconds, nanos } = timestamp.dateToTimestamp(
                        transactionId.validStart
                    );

                    this.validStart = new Time(seconds, nanos);
                } else {
                    this.validStart = new Time(
                        transactionId.validStartSeconds,
                        transactionId.validStartNanos
                    );
                }
            }
        }
    }

    /**
     * @param {import("./AccountId.js").AccountIdLike} id
     * @param {Time} validStart
     * @returns {TransactionId}
     */
    static withValidStart(id, validStart) {
        return new TransactionId({
            account: id,
            validStartSeconds: validStart.seconds,
            validStartNanos: validStart.nanos,
        });
    }

    /**
     * @param {string} id
     * @returns {TransactionId}
     */
    static fromString(id) {
        const [account, time] = id.split("@");
        const [seconds, nanos] = time.split(".");

        return new TransactionId({
            account: new AccountId(account, undefined, undefined),
            validStartSeconds: Number(seconds),
            validStartNanos: Number(nanos),
        });
    }

    /**
     * @returns {string}
     */
    toString() {
        return `${this.accountId.toString()}@${this.validStart.seconds}.${
            this.validStart.nanos
        }`;
    }

    // /**
    //  * @param {BaseClient} _
    //  * @returns {Promise<TransactionReceipt>}
    //  */
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // getReceipt(_) {
    //     return new Promise((_, reject) => {
    //         reject(
    //             new Error(
    //                 "(BUG) `TransactionId.getReceipt()` declared, but not overwritten."
    //             )
    //         );
    //     });
    // }

    // /**
    //  * @param {BaseClient} _
    //  * @returns {Promise<TransactionRecord>}
    //  */
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // getRecord(_) {
    //     return new Promise((_, reject) => {
    //         reject(
    //             new Error(
    //                 "(BUG) `TransactionId.getRecord()` declared, but not overwritten."
    //             )
    //         );
    //     });
    // }

    /**
     * NOT A STABLE API
     *
     * @param {root.proto.TransactionID} id
     * @returns {TransactionId}
     */
    static _fromProtobuf(id) {
        const seconds = orThrow(id.getTransactionvalidstart()).getSeconds();
        const nanos = orThrow(id.getTransactionvalidstart()).getNanos();

        return new TransactionId({
            account: AccountId._fromProtobuf(orThrow(id.getAccountid())),
            validStartSeconds: seconds,
            validStartNanos: nanos,
        });
    }

    /**
     * NOT A STABLE API
     *
     * @returns {root.proto.TransactionID}
     */
    _toProtobuf() {
        const id = new root.proto.TransactionID();
        id.setAccountid(this.accountId._toProtobuf());

        const ts = new root.proto.Timestamp();
        ts.setSeconds(this.validStart.seconds);
        ts.setNanos(this.validStart.nanos);
        id.setTransactionvalidstart(ts);

        return id;
    }
}
