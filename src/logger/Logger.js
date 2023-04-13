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
import LogFormat from "./LogFormat.js";
const { combine, timestamp, json, errors, printf } = format;

const customFormat = printf(({ level, message, timestamp }) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return `[${timestamp}] ${level}: ${message}`;
});

const defaultOptions = {
    level: "debug",
    format: combine(
        json(),
        errors({ stack: true }),
        timestamp({ format: "HH:mm:ss" })
    ),
    exceptionHandlers: [
        new transports.Console({ consoleWarnLevels: ["error"] }),
    ],
    rejectionHandlers: [
        new transports.Console({ consoleWarnLevels: ["error"] }),
    ],
};

// eslint-disable-next-line jsdoc/require-returns
/**
 * Create default logger instance with specified level
 *
 * @param {LogLevel} level
 */
const defaultLogger = (level) => {
    let logger = createLogger(defaultOptions);
    logger.add(new transports.Console({ level: level.toString() }));
    return logger;
};

export default class Logger {
    /**
     * @param {LogLevel} level
     */
    constructor(level) {
        this._logger = defaultLogger(level);

        /**
         * Whether or not to include lower levels than the specified level
         * when saving logs to a file location. Default is `false`. This means that
         * when `saveToFile()` is called for a specific `level`,
         * the file will contain only logs for this level
         *
         * @private
         * @type {boolean}
         */
        this._includeLowerLevelsInFileLogs = false;
    }

    /**
     * Set logger
     *
     * @public
     * @param {import("winston").Logger} logger
     * @returns {this}
     */
    setLogger(logger) {
        this._logger = logger;
        return this;
    }

    /**
     * Set log level
     *
     * @public
     * @param {LogLevel} level
     * @returns {this}
     */
    setLevel(level) {
        if (level == LogLevel.Off) {
            this._logger.silent = true;
        } else {
            // The `Console` transport option will always be
            // the 3rd element in the array, so we edit the level on it
            this._logger.transports[2].level = level.toString();
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
        const level = this._logger.transports[2].level
            ? this._logger.transports[2].level
            : this._logger.level;

        return LogLevel._fromString(level);
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
     * Set include lower levels in file logs on/off
     *
     * @public
     * @description Whether or not to include lower levels than the specified level when saving logs to a file
     * @param {boolean} include
     * @returns {this}
     */
    setIncludeLowerLevelsInFileLogs(include) {
        this._includeLowerLevelsInFileLogs = include;
        return this;
    }

    /**
     * Get include lower levels in file logs
     *
     * @public
     * @returns {boolean}
     */
    get includeLowerLevelsInFileLogs() {
        return this._includeLowerLevelsInFileLogs;
    }

    /**
     * Save logs in a file location
     *
     * If `level` is provided, only the logs for this specific level will be saved in the file,
     * If `format` is provided, it will be applied in the file logs, otherwise json format is the default option
     *
     * @public
     * @param {string} fileLocation
     * @param {?LogLevel} level
     * @param {?LogFormat} format
     * @returns {this}
     */
    saveToFile(fileLocation, level = null, format = null) {
        const winstonFormat = format
            ? format == LogFormat.String
                ? customFormat
                : json()
            : json();

        let listFormats = [winstonFormat];

        if (!this._includeLowerLevelsInFileLogs && level != null) {
            listFormats.push(this.filterOnly(level.toString()));
        }

        level == null
            ? this._logger.add(
                  new transports.File({
                      filename: fileLocation,
                      format: combine(...listFormats),
                  })
              )
            : this._logger.add(
                  new transports.File({
                      filename: fileLocation,
                      level: level.toString(),
                      format: combine(...listFormats),
                  })
              );

        return this;
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

    // eslint-disable-next-line jsdoc/require-returns
    /**
     * Log only the messages the match `level`
     *
     * @private
     * @param {string} level
     */
    filterOnly(level) {
        const LEVEL = Symbol.for("level");
        // @ts-ignore
        return format(function (info) {
            if (info[LEVEL] === level) {
                return info;
            }
        })();
    }
}
