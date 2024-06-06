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

import axios from "axios";
import MirrorNodeRouter from "./MirrorNodeRouter.js";

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
 * @typedef MirrorNodeTokenResponse
 * @property {boolean} automatic_association
 * @property {number} balance
 * @property {string} created_timestamp
 * @property {number} decimals
 * @property {string} token_id
 * @property {string} freeze_status
 * @property {string} kyc_status
 */

export const ACCOUNTS_ROUTE = "/accounts/%s";
export const CONTRACT_ROUTE = "/contracts/%s";
export const ACCOUNT_TOKENS_ROUTE = "/accounts/%s/tokens";

export default class MirrorNodeGateway {
    /**
     * @param {object} props
     * @param {string} props.mirrorNodeUrl
     */
    constructor(props) {
        /**
         * @type {string}
         */
        this._mirrorNodeUrl = props.mirrorNodeUrl;
    }

    /**
     * Set mirror node url
     * @param {string} mirrorNodeUrl
     */
    static setMirrorNodeUrl(mirrorNodeUrl) {
        this._mirrorNodeUrl = mirrorNodeUrl;
    }

    /**
     * @param {string[]} mirrorNetworkNodes
     * @param {?LedgerId} ledgerId
     * @returns {MirrorNodeGateway}
     */
    static forNetwork(mirrorNetworkNodes, ledgerId) {
        const mirrorNodeUrl = MirrorNodeRouter.getMirrorNodeUrl(
            mirrorNetworkNodes,
            ledgerId,
        );

        return new MirrorNodeGateway({ mirrorNodeUrl });
    }

    /**
     * @internal
     * @param {string} url
     * @returns {Promise<import("axios").AxiosResponse>}
     */
    static executeRequest(url) {
        return new Promise((resolve, reject) => {
            axios
                .get(url)
                .then((response) => resolve(response))
                .catch((error) => reject(error));
        });
    }

    /**
     * @internal
     * @param {string} idOrAliasOrEvmAddress
     * @returns {Promise<import("axios").AxiosResponse>}
     */
    getAccountTokens(idOrAliasOrEvmAddress) {
        var apiUrl = MirrorNodeRouter.buildApiUrl(
            this._mirrorNodeUrl,
            ACCOUNT_TOKENS_ROUTE,
            idOrAliasOrEvmAddress,
        );

        return new Promise((resolve, reject) => {
            MirrorNodeGateway.executeRequest(apiUrl)
                .then((response) => resolve(response))
                .catch((error) => reject(error));
        });
    }
}
