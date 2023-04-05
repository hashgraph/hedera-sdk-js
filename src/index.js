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

/**
 * The entry point for NodeJS applications
 */

import Logger from "js-logger";

export * from "./exports.js";

export { default as LocalProvider } from "./LocalProvider.js";
export { default as Client } from "./client/NodeClient.js";

if (
    process != null &&
    process.env != null &&
    process.env.HEDERA_SDK_LOG_LEVEL != null
) {
    Logger.useDefaults();

    switch (process.env.HEDERA_SDK_LOG_LEVEL) {
        case "DEBUG":
            Logger.setLevel(Logger.DEBUG);
            break;
        case "TRACE":
            Logger.setLevel(Logger.TRACE);
            break;
        case "WARN":
            Logger.setLevel(Logger.WARN);
            break;
        case "INFO":
            Logger.setLevel(Logger.INFO);
            break;
    }
}
