import ExchangeRate from "./ExchangeRate.js";
import * as proto from "@hashgraph/proto";

export default class ExchangeRateSet {

    /**
     * @private
     * @param {object} props
     * @param {ExchangeRate} props.currentRate
     * @param {ExchangeRate} props.nextRate
     */
    constructor(props) {
        /**
         * @readonly
         */
        this.currentRate = props.currentRate;

        /**
         * @readonly
         */
        this.nextRate = props.nextRate;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.IExchangeRateSet} rateSet
     * @returns {ExchangeRateSet}
     */
    static _fromProtobuf(rateSet) {
        return new ExchangeRateSet({
            currentRate: ExchangeRate._fromProtobuf(/** @type {proto.IExchangeRate} */ (rateSet.currentRate)),
            nextRate: ExchangeRate._fromProtobuf(/** @type {proto.IExchangeRate} */ (rateSet.nextRate))
        });
    }

    /**
     * @internal
     * @returns {proto.IExchangeRateSet}
     */
    _toProtobuf() {
        return {
            currentRate: this.currentRate._toProtobuf(),
            nextRate: this.nextRate._toProtobuf()
        };
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {ExchangeRateSet}
     */
    static fromBytes(bytes) {
        return ExchangeRateSet._fromProtobuf(
            proto.ExchangeRateSet.decode(bytes)
        );
    }

}
