/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
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

export default class Logger {
    /**
     * @param {object} props
     * @param {string} [props.name]
     * @param {string} [props.level]
     */
    constructor(props = {}) {
        /**
         * @private
         * @type {?string}
         */
        this._name = null;

        if (props.name != null) {
            this.setLoggerName(props.name);
        }

        /**
         * @private
         * @type {?string}
         */
        this._level = null;

        if (props.level != null) {
            this.setLoggerLevel(props.level);
        }
    }

    /**
     * Set the level of the Logger.
     *
     * @param {string} name
     * @returns {void}
     */
    setLoggerName(name) {
        this._name = name;
    }

    /**
     * @returns {?string}
     */
    get name() {
        return this.name;
    }

    /**
     * Set the level of the Logger.
     *
     * @param {string} level
     * @returns {void}
     */
    setLoggerLevel(level) {
        this._level = level;
    }

    /**
     * @returns {?string}
     */
    get level() {
        return this.level;
    }
}
