/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
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

/**
 * @typedef {import("../contract/ContractId.js").default} ContractId
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../LedgerId.js").default} LedgerId
 * /
/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IQuery} HashgraphProto.proto.IQuery
 */
/**
 * Layer between the SDK and the Mirror Node
 */

const API_VERSION = "/api/v1";
const HTTP = "http://";
const HTTPS = "https://";
const LOCAL_NODE_PORT = "5551";

export default class MirrorNodeRouter {
    /**
     * Set mirror node url
     * @param {string[]} mirrorNetwork
     * @param {LedgerId | null} ledgerId
     * @returns {string}
     */
    static getMirrorNodeUrl(mirrorNetwork, ledgerId) {
        let path;
        let mirrorNodeAddress;

        mirrorNodeAddress = mirrorNetwork.map((a) =>
            a.substring(0, a.indexOf(":")),
        )[0];

        if (mirrorNodeAddress.length == 0) {
            throw new Error("Mirror address not found!");
        }

        if (ledgerId != null && !ledgerId.isLocalNode()) {
            path = HTTPS + mirrorNodeAddress.toString();
        } else {
            // local node case
            path = HTTP + mirrorNodeAddress.toString() + ":" + LOCAL_NODE_PORT;
        }

        return path;
    }

    /**
     *
     * @param {string} route
     * @param {string} id
     * @returns {string}
     */
    static _getRoute = (route, id) => {
        return route.replace("%s", id);
    };

    /**
     * @param {string} mirrorNodeUrl
     * @param {string} route
     * @param {string} id
     * @returns {string}
     */
    static buildApiUrl(mirrorNodeUrl, route, id) {
        return mirrorNodeUrl + API_VERSION + this._getRoute(route, id);
    }
}
