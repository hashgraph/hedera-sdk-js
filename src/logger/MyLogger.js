import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf } = format;

export const defaultLogger = () => {
    const myFormat = printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level}: ${message}`;
    });

    return createLogger({
        level: "debug",
        // format: winston.format.simple(),
        format: combine(
            format.colorize(),
            timestamp({ format: "HH:mm:ss" }),
            myFormat
        ),

        // defaultMeta: { service: 'user-service' },
        transports: [
            new transports.Console(),
            /* new transports.File({
                filename: 'errors.log',
              }) */
        ],
    });
};

export default class MyLogger {
    constructor() {
        this._logger = defaultLogger();
    }

    /**
     * Log debug
     * @public
     * @param {import("winston").Logger} logger
     * @returns {void}
     */
    setLogger(logger) {
        this._logger = logger;
    }

    /**
     * Log debug
     * @public
     * @param {string} level
     * @returns {void}
     */
    setLevel(level) {
        this._logger.configure({ level: level });
    }

    /**
     * Log debug
     * @public
     * @returns {string}
     */
    get level() {
        return this._logger.level;
    }

    /**
     * Log info
     * @public
     * @param {string} message
     * @returns {void}
     */
    info(message) {
        this._logger.info(message);
    }

    /**
     * Log debug
     * @public
     * @param {string} message
     * @returns {void}
     */
    debug(message) {
        this._logger.debug(message);
    }

    /**
     * Log warn
     * @public
     * @param {string} message
     * @returns {void}
     */
    warn(message) {
        this._logger.warn(message);
    }

    /**
     * Log error
     * @public
     * @param {string} message
     * @returns {void}
     */
    error(message) {
        this._logger.error(message);
    }
}
