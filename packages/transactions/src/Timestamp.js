import { root } from "./generated/proto.js";

/**
 * @typedef {object} Timestamp
 * @property {number} seconds
 * @property {number} nanos
 */

/**
 * @param {number | Date} dateOrMs
 * @returns {Timestamp}
 */
export function dateToTimestamp(dateOrMs) {
    const dateMs = dateOrMs instanceof Date ? dateOrMs.getTime() : dateOrMs;

    return {
        // get whole seconds since the epoch
        seconds: Math.floor(dateMs / 1000),
        // get remainder as nanoseconds
        nanos: Math.floor(dateMs % 1000 * 1_000_000)
    };
}

/**
 * @param {root.proto.Timestamp} timestamp
 * @returns {Date}
 */
export function timestampToDate(timestamp) {
    return new Date(timestampToMs(timestamp));
}

/**
 * @param {root.proto.Timestamp} timestamp
 * @returns {number}
 */
export function timestampToMs(timestamp) {
    return timestamp.getSeconds() * 1000 + Math.floor(timestamp.getNanos() / 1_000_000);
}

/**
 * @param {Timestamp} ts
 * @returns {root.proto.Timestamp}
 */
/* eslint-disable-next-line max-len */
export function timestampToProto({ seconds, nanos }) {
    const timestamp = new root.proto.Timestamp();
    timestamp.setSeconds(seconds);
    timestamp.setNanos(nanos);
    return timestamp;
}

/**
 * @returns {Timestamp}
 */
export function create() {
    const ms = new Date().getTime() - Math.floor(Math.random()) * 5_000 + 8_000;

    return {
        seconds: Math.floor(ms / 1000),
        nanos: Math.floor(ms % 1000 * 1_000_000) +  Math.floor(Math.random()) % 1_000_000,
    };
}
