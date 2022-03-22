import Long from "long";

export default class ExchangeRate {
    /**
     * @private
     * @param {object} props
     * @param {number} props.hbars
     * @param {number} props.cents
     * @param {Date} props.expirationTime
     */
    constructor(props) {
        /**
         * Denotes Hbar equivalent to cents (USD)
         *
         * @readonly
         * @type {number}
         */
        this.hbars = props.hbars;

        /**
         * Denotes cents (USD) equivalent to Hbar
         *
         * @readonly
         * @type {number}
         */
        this.cents = props.cents;

        /**
         * Expiration time of this exchange rate
         *
         * @readonly
         * @type {Date}
         */
        this.expirationTime = props.expirationTime;

        /**
         * Calculated exchange rate
         *
         * @readonly
         * @type {number}
         */
        this.exchangeRateInCents = props.cents / props.hbars;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {import("@hashgraph/proto").IExchangeRate} rate
     * @returns {ExchangeRate}
     */
    static _fromProtobuf(rate) {
        let date = rate.expirationTime ? rate.expirationTime : new Date();
        // depending on whether we are getting seconds, a long, or a date string, we want to get the right data
        date = date?.seconds ? date?.seconds.low ? date.seconds.low :date.seconds : date;
        let expirationTime = new Date(date); 
        return new ExchangeRate({
            hbars: /** @type {number} */ (rate.hbarEquiv),
            cents: /** @type {number} */ (rate.centEquiv),
            expirationTime: expirationTime,
        });
    }

    /**
     * @internal
     * @returns {import("@hashgraph/proto").IExchangeRate}
     */
    _toProtobuf() {
        return {
            hbarEquiv: this.hbars,
            centEquiv: this.cents,
            expirationTime: {
                seconds: Long.fromNumber(this.expirationTime.getSeconds()),
            },
        };
    }
}
