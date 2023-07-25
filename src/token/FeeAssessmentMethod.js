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

export default class FeeAssessmentMethod {
    /**
     * @hideconstructor
     * @internal
     * @param {boolean} value
     */
    constructor(value) {
        /** @readonly */
        this._value = value;

        Object.freeze(this);
    }

    /**
     * @returns {string}
     */
    toString() {
        switch (this) {
            case FeeAssessmentMethod.Inclusive:
                return "INCLUSIVE";
            case FeeAssessmentMethod.Exclusive:
                return "EXCLUSIVE";
            default:
                return `UNKNOWN (${this._value.toString()})`;
        }
    }

    /**
     * @internal
     * @param {boolean} value
     * @returns {FeeAssessmentMethod}
     */
    static _fromValue(value) {
        switch (value) {
            case false:
                return FeeAssessmentMethod.Inclusive;
            case true:
                return FeeAssessmentMethod.Exclusive;
        }
    }

    /**
     * @returns {boolean}
     */
    valueOf() {
        return this._value;
    }
}

FeeAssessmentMethod.Inclusive = new FeeAssessmentMethod(false);
FeeAssessmentMethod.Exclusive = new FeeAssessmentMethod(true);
