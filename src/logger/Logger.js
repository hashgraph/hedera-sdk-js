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

import { createLogger, format, transports } from "winston";
import LogLevel from "./LogLevel.js";
const { combine, timestamp, json } = format;

const levels = {
    off: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};

/* const myFormat = printf(({ level, message, timestamp }) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return `[${timestamp}] ${level}: ${message}`;
}); */

const defaultOptions = {
    level: "debug",
    levels: levels,
    //silent: false,
    //format: format.json(),
    format: combine(
        json(),
        //colorize(),
        timestamp({ format: "HH:mm:ss" })
        //myFormat,
    ),

    transports: [
        new transports.Console(),
        /* new transports.File({
            filename: 'logger.log',
          }) */
    ],
};

const defaultLogger = () => {
    return createLogger(defaultOptions);
};

export default class Logger {
    constructor() {
        this._logger = defaultLogger();
    }

    /**
     * Set logger
     *
     * @public
     * @param {import("winston").Logger} logger
     * @returns {void}
     */
    setLogger(logger) {
        this._logger = logger;
    }

    /**
     * Set log level
     *
     * @public
     * @param {LogLevel} level
     * @returns {this}
     */
    setLevel(level) {
        console.log(level == LogLevel.Off);
        if (level == LogLevel.Off) {
            this._logger.silent = true;
        } else {
            this._logger.level = level.toString();
            this._logger.silent = false;
        }
        return this;
    }

    /**
     * Get logging level
     *
     * @public
     * @returns {LogLevel}
     */
    get level() {
        return LogLevel._fromString(this._logger.level);
    }

    /**
     * Set silent mode on/off
     *
     * @public
     * @description If set to true, the logger will not display any log messages
     * @param {boolean} silent
     * @returns {this}
     */
    setSilent(silent) {
        this._logger.silent = silent;
        return this;
    }

    /**
     * Get silent mode
     *
     * @public
     * @returns {boolean}
     */
    get silent() {
        return this._logger.silent;
    }

    /**
     * Log info
     *
     * @public
     * @param {string} message
     * @returns {void}
     */
    info(message) {
        this._logger.info(message);
    }

    /**
     * Log debug
     *
     * @public
     * @param {string} message
     * @returns {void}
     */
    debug(message) {
        this._logger.debug(message);
    }

    /**
     * Log warn
     *
     * @public
     * @param {string} message
     * @returns {void}
     */
    warn(message) {
        this._logger.warn(message);
    }

    /**
     * Log error
     *
     * @public
     * @param {string} message
     * @returns {void}
     */
    error(message) {
        this._logger.error(message);
    }
}
