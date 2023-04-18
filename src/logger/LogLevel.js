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
                return `Unknown log level (${this._name})`;
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
                throw new Error(`Unknown log level: ${level}`);
        }
    }
}

LogLevel.Off = new LogLevel("off");
LogLevel.Error = new LogLevel("error");
LogLevel.Warn = new LogLevel("warn");
LogLevel.Info = new LogLevel("info");
LogLevel.Http = new LogLevel("http");
LogLevel.Debug = new LogLevel("debug");
LogLevel.Verbose = new LogLevel("verbose");
LogLevel.Silly = new LogLevel("silly");
