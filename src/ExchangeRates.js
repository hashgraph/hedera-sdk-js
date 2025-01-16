/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

import ExchangeRate from "./ExchangeRate.js";
import * as HashgraphProto from "@hashgraph/proto";

const { proto } = HashgraphProto;

/**
 *  Represents a pair of exchange rates for HBAR to USD cents conversion.
 * Contains both the current exchange rate and the next exchange rate that will take effect.
 */
export default class ExchangeRates {
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
     * @param {HashgraphProto.proto.IExchangeRateSet} rateSet
     * @returns {ExchangeRates}
     */
    static _fromProtobuf(rateSet) {
        return new ExchangeRates({
            currentRate: ExchangeRate._fromProtobuf(
                /** @type {HashgraphProto.proto.IExchangeRate} */ (
                    rateSet.currentRate
                ),
            ),
            nextRate: ExchangeRate._fromProtobuf(
                /** @type {HashgraphProto.proto.IExchangeRate} */ (
                    rateSet.nextRate
                ),
            ),
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IExchangeRateSet}
     */
    _toProtobuf() {
        return {
            currentRate: this.currentRate._toProtobuf(),
            nextRate: this.nextRate._toProtobuf(),
        };
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {ExchangeRates}
     */
    static fromBytes(bytes) {
        return ExchangeRates._fromProtobuf(proto.ExchangeRateSet.decode(bytes));
    }
}
