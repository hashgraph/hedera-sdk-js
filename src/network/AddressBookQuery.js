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

import NodeAddress from "../address_book/NodeAddress.js";
import NodeAddressBook from "../address_book/NodeAddressBook.js";
import * as HashgraphProto from "@hashgraph/proto";
import FileId from "../file/FileId.js";
import { RST_STREAM } from "../Executable.js";
import CACHE from "../Cache.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../channel/MirrorChannel.js").default} MirrorChannel
 * @typedef {import("../channel/MirrorChannel.js").MirrorError} MirrorError
 */

/**
 * @template {Channel} ChannelT
 * @typedef {import("../client/Client.js").default<ChannelT, MirrorChannel>} Client<ChannelT, MirrorChannel>
 */

export default class AddressBookQuery {
    /**
     * @param {object} props
     * @param {FileId | string} [props.fileId]
     * @param {number} [props.limit]
     */
    constructor(props = {}) {
        /**
         * @private
         * @type {?FileId}
         */
        this._fileId = null;
        if (props.fileId != null) {
            this.setFileId(props.fileId);
        }

        /**
         * @private
         * @type {?number}
         */
        this._limit = null;
        if (props.limit != null) {
            this.setLimit(props.limit);
        }

        /**
         * @private
         * @type {(error: MirrorError | Error | null) => boolean}
         */
        this._retryHandler = (error) => {
            if (error != null) {
                if (error instanceof Error) {
                    // Retry on all errors which are not `MirrorError` because they're
                    // likely lower level HTTP/2 errors
                    return true;
                } else {
                    // Retry on `NOT_FOUND`, `RESOURCE_EXHAUSTED`, `UNAVAILABLE`, and conditionally on `INTERNAL`
                    // if the message matches the right regex.
                    switch (error.code) {
                        // INTERNAL
                        // eslint-disable-next-line no-fallthrough
                        case 13:
                            return RST_STREAM.test(error.details.toString());
                        // NOT_FOUND
                        // eslint-disable-next-line no-fallthrough
                        case 5:
                        // RESOURCE_EXHAUSTED
                        // eslint-disable-next-line no-fallthrough
                        case 8:
                        // UNAVAILABLE
                        // eslint-disable-next-line no-fallthrough
                        case 14:
                            return true;
                        default:
                            return false;
                    }
                }
            }

            return false;
        };

        /** @type {NodeAddress[]} */
        this._addresses = [];

        /**
         * @private
         * @type {number}
         */
        this._maxAttempts = 10;

        /**
         * @private
         * @type {number}
         */
        this._maxBackoff = 8000;

        /**
         * @private
         * @type {number}
         */
        this._attempt = 0;
    }

    /**
     * @returns {?FileId}
     */
    get fileId() {
        return this._fileId;
    }

    /**
     * @param {FileId | string} fileId
     * @returns {AddressBookQuery}
     */
    setFileId(fileId) {
        this._fileId =
            typeof fileId === "string"
                ? FileId.fromString(fileId)
                : fileId.clone();

        return this;
    }

    /**
     * @returns {?number}
     */
    get limit() {
        return this._limit;
    }

    /**
     * @param {number} limit
     * @returns {AddressBookQuery}
     */
    setLimit(limit) {
        this._limit = limit;

        return this;
    }

    /**
     * @param {number} attempts
     */
    setMaxAttempts(attempts) {
        this._maxAttempts = attempts;
    }

    /**
     * @param {number} backoff
     */
    setMaxBackoff(backoff) {
        this._maxBackoff = backoff;
    }

    /**
     * @param {Client<Channel>} client
     * @param {number=} requestTimeout
     * @returns {Promise<NodeAddressBook>}
     */
    execute(client, requestTimeout) {
        return new Promise((resolve, reject) => {
            this._makeServerStreamRequest(
                client,
                /** @type {(value: NodeAddressBook) => void} */ (resolve),
                reject,
                requestTimeout
            );
        });
    }

    /**
     * @private
     * @param {Client<Channel>} client
     * @param {(value: NodeAddressBook) => void} resolve
     * @param {(error: Error) => void} reject
     * @param {number=} requestTimeout
     */
    _makeServerStreamRequest(client, resolve, reject, requestTimeout) {
        const request =
            HashgraphProto.com.hedera.mirror.api.proto.AddressBookQuery.encode({
                fileId:
                    this._fileId != null ? this._fileId._toProtobuf() : null,
                limit: this._limit,
            }).finish();

        client._mirrorNetwork
            .getNextMirrorNode()
            .getChannel()
            .makeServerStreamRequest(
                "NetworkService",
                "getNodes",
                request,
                (data) => {
                    this._addresses.push(
                        NodeAddress._fromProtobuf(
                            HashgraphProto.proto.NodeAddress.decode(data)
                        )
                    );

                    if (this._limit != null && this._limit > 0) {
                        this._limit = this._limit - 1;
                    }
                },
                (error) => {
                    const message =
                        error instanceof Error ? error.message : error.details;

                    if (
                        this._attempt < this._maxAttempts &&
                        this._retryHandler(error)
                    ) {
                        const delay = Math.min(
                            250 * 2 ** this._attempt,
                            this._maxBackoff
                        );
                        console.warn(
                            `Error getting nodes from mirror for file ${
                                this._fileId != null
                                    ? this._fileId.toString()
                                    : "UNKNOWN"
                            } during attempt ${
                                this._attempt
                            }. Waiting ${delay} ms before next attempt: ${message}`
                        );

                        this._attempt += 1;

                        setTimeout(() => {
                            this._makeServerStreamRequest(
                                client,
                                resolve,
                                reject,
                                requestTimeout
                            );
                        }, delay);
                    } else {
                        reject(new Error("failed to query address book"));
                    }
                },
                () => {
                    resolve(
                        new NodeAddressBook({ nodeAddresses: this._addresses })
                    );
                }
            );
    }
}

CACHE.setAddressBookQueryConstructor(() => new AddressBookQuery());
