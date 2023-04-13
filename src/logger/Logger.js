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
    //format: format.json(),
    format: combine(
        //cli(),
        json(),
        errors({ stack: true }),
        //colorize(),
        timestamp({ format: "HH:mm:ss" })
        //customFormat
    ),
    transports: [
        new transports.Console(),
    ],
    exceptionHandlers: [
        new transports.Console({ consoleWarnLevels: ["error"] }),
    ],
    rejectionHandlers: [
        new transports.Console({ consoleWarnLevels: ["error"] }),
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
        const winstonFormat =
            format != null && format != undefined
                ? format == LogFormat.Json
                    ? json()
                    : format == LogFormat.String
                    ? customFormat
                    : json()
                : null;

        level == null
            ? winstonFormat == null
                ? this._logger.add(
                      new transports.File({
                          filename: fileLocation,
                      })
                  )
                : this._logger.add(
                      new transports.File({
                          filename: fileLocation,
                          format: winstonFormat,
                      })
                  )
            : winstonFormat == null
            ? this._logger.add(
                  new transports.File({
                      filename: fileLocation,
                      level: level.toString(),
                      format: this.filterOnly(level.toString())
                  })
              )
            : this._logger.add(
                  new transports.File({
                      filename: fileLocation,
                      level: level.toString(),
                      format: combine(
                        winstonFormat,
                        this.filterOnly(level.toString()),
                      )
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

    /**
     * Log only the messages the match `level`
     * 
     * @private
     * @param {string} level
     */
    filterOnly(level) {
        const LEVEL = Symbol.for('level');
        // @ts-ignore
        return format(function (info) {
            if (info[LEVEL] === level) {
                return info;
            }
        })();
    }
}
