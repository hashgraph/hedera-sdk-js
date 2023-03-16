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
     * @param {number} code
     */
    constructor(code) {
        /** @readonly */
        this._code = code;

        Object.freeze(this);
    }

    /**
     * @returns {string}
     */
    toString() {
        switch (this) {
            case LogLevel.Off:
                return "off";
            case LogLevel.Error:
                return "error";
            case LogLevel.Warn:
                return "warn";
            case LogLevel.Info:
                return "info";
            case LogLevel.Http:
                return "http";
            case LogLevel.Debug:
                return "debug";
            case LogLevel.Verbose:
                return "verbose";
            case LogLevel.Silly:
                return "silly";
            default:
                return `UNKNOWN (${this._code})`;
        }
    }

    /**
     * @param {string} level
     * @returns {LogLevel}
     */
    static _fromString(level) {
        switch (level) {
            case "off":
                return LogLevel.Off;
            case "error":
                return LogLevel.Error;
            case "warn":
                return LogLevel.Warn;
            case "info":
                return LogLevel.Info;
            case "http":
                return LogLevel.Http;
            case "debug":
                return LogLevel.Debug;
            case "verbose":
                return LogLevel.Verbose;
            case "silly":
                return LogLevel.Silly;
            default:
                throw new Error(`Unknown level: ${level}`);
        }
    }

    /**
     * @internal
     * @param {number} code
     * @returns {LogLevel}
     */
    static _fromCode(code) {
        switch (code) {
            case 0:
                return LogLevel.Off;
            case 1:
                return LogLevel.Error;
            case 2:
                return LogLevel.Warn;
            case 3:
                return LogLevel.Info;
            case 4:
                return LogLevel.Http;
            case 5:
                return LogLevel.Debug;
            case 6:
                return LogLevel.Verbose;
            case 7:
                return LogLevel.Silly;
            default:
                throw new Error(
                    `(BUG) LogLevel.fromCode() does not handle code: ${code}`
                );
        }
    }
}

LogLevel.Off = new LogLevel(0);
LogLevel.Error = new LogLevel(1);
LogLevel.Warn = new LogLevel(2);
LogLevel.Info = new LogLevel(3);
LogLevel.Http = new LogLevel(4);
LogLevel.Debug = new LogLevel(5);
LogLevel.Verbose = new LogLevel(6);
LogLevel.Silly = new LogLevel(7);
