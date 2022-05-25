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
 * @typedef {import("./LedgerId.js").default} LedgerId
 * @typedef {import("./SignerSignature.js").default} SignerSignature
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./transaction/Transaction.js").default} Transaction
 * @typedef {import("./transaction/TransactionResponse.js").default} TransactionResponse
 * @typedef {import("./transaction/TransactionReceipt.js").default} TransactionReceipt
 * @typedef {import("./transaction/TransactionRecord.js").default} TransactionRecord
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./account/AccountBalance.js").default} AccountBalance
 * @typedef {import("./account/AccountInfo.js").default} AccountInfo
 * @typedef {import("./Key.js").default} Key
 */

/**
 * @template {any} O
 * @typedef {import("./query/Query.js").default<O>} Query<O>
 */

/**
 * @template RequestT
 * @template ResponseT
 * @template OutputT
 * @typedef {import("./Executable.js").default<RequestT, ResponseT, OutputT>} Executable<RequestT, ResponseT, OutputT>
 */

/**
 * @typedef {object} Signer
 * @property {() => LedgerId?} getLedgerId
 * @property {() => AccountId} getAccountId
 * @property {() => Key} [getAccountKey]
 * @property {() => {[key: string]: (string | AccountId)}} getNetwork
 * @property {() => string[]} getMirrorNetwork
 * @property {(messages: Uint8Array[]) => Promise<SignerSignature[]>} sign
 * @property {() => Promise<AccountBalance>} getAccountBalance
 * @property {() => Promise<AccountInfo>} getAccountInfo
 * @property {() => Promise<TransactionRecord[]>} getAccountRecords
 * @property {<T extends Transaction>(transaction: T) => Promise<T>} signTransaction
 * @property {<T extends Transaction>(transaction: T) => Promise<T>} checkTransaction
 * @property {<T extends Transaction>(transaction: T) => Promise<T>} populateTransaction
 * @property {<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>) => Promise<OutputT>} call
 */

export default {};
