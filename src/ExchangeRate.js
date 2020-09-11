import proto from "@hashgraph/proto";
import Long from "long";

export default class ExchangeRate {
    /**
     * @private
     * @param {object} properties
     * @param {number} properties.hbarEquiv
     * @param {number} properties.centEquiv
     * @param {Date} properties.expirationTime
     */
    constructor(properties) {
        /**
         * Denotes Hbar equivalent to cents (USD)
         *
         * @readonly
         * @type {number}
         */
        this.hbarEquiv = properties.hbarEquiv;

        /**
         * Denotes cents (USD) equivalent to Hbar
         *
         * @readonly
         * @type {number}
         */
        this.centEquiv = properties.centEquiv;

        /**
         * Expiration time of this exchange rate
         *
         * @readonly
         * @type {Date}
         */
        this.expirationTime = properties.expirationTime;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.IExchangeRate} rate
     * @returns {ExchangeRate}
     */
    static _fromProtobuf(rate) {
        return new ExchangeRate({
            hbarEquiv: /** @type {number} */ (rate.hbarEquiv),
            centEquiv: /** @type {number} */ (rate.centEquiv),
            expirationTime: new Date(
                (rate.expirationTime != null)
                ?(rate.expirationTime.seconds instanceof Long
                    ? rate.expirationTime.seconds.toInt()
                    : ((rate.expirationTime.seconds != null)
                        ? rate.expirationTime.seconds
                        : 0 * 1000))
                : 0
            ),
        });
    }

    /**
     * @internal
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
