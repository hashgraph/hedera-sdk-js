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

export default class LogLevel {
    /**
     * @hideconstructor
     * @internal
     * @param {string} name
     */
    constructor(name) {
        /** @readonly */
        this._name = name;

        Object.freeze(this);
    }

    /**
     * @returns {string}
     */
    toString() {
        switch (this) {
            case LogLevel.Json:
                return "json";
            case LogLevel.String:
                return "string";
            default:
                return `Unknown log format (${this._name})`;
        }
    }

    /**
     * @param {string} format
     * @returns {LogLevel}
     */
    static _fromString(format) {
        switch (format) {
            case "json":
                return LogLevel.Json;
            case "string":
                return LogLevel.String;
            default:
                throw new Error(`Unknown log format: ${format}`);
        }
    }
}

LogLevel.Json = new LogLevel("json");
LogLevel.String = new LogLevel("string");
