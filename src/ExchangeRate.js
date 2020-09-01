import proto from "@hashgraph/proto";
import Long from "long";

export default class ExchangeRate {
    /**
     * @param {object} properties
     * @param {number} properties.hbarEquiv
     * @param {number} properties.centEquiv
     * @param {Date} properties.expirationTime
     */
    constructor(properties) {
        /**
         * @type {number}
         */
        this.hbarEquiv = properties.hbarEquiv;

        /**
         * @type {number}
         */
        this.centEquiv = properties.centEquiv;

        /**
         * @type {Date}
         */
        this.expirationTime = properties.expirationTime;
    }

    /**
     * @param {proto.IExchangeRate} rate
     * @returns {ExchangeRate}
     */
    static _fromProtobuf(rate) {
        return new ExchangeRate({
            // @ts-ignore
            hbarEquiv: rate.hbarEquiv,
            // @ts-ignore
            centEquiv: rate.centEquiv,
            expirationTime: new Date(
                rate.expirationTime?.seconds instanceof Long
                    ? rate.expirationTime.seconds.toInt()
                    : rate.expirationTime?.seconds ?? 0 * 1000
            ),
        });
    }

    /**
     * @returns {proto.IExchangeRate}
     */
    _toProtobuf() {
        return {
            hbarEquiv: this.hbarEquiv,
            centEquiv: this.centEquiv,
            expirationTime: {
                seconds: this.expirationTime.getSeconds(),
            },
        };
    }
}
