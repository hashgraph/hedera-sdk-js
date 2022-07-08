#
# ‌
# Hedera JavaScript SDK
# ​
# Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
# ​
# Licensed under the Apache License, Version 2.0 (the \"License\");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an \"AS IS\" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ‍
#

import os
import fnmatch
from string import Template

PROTOBASE = "packages/proto/"
PROTODIR = PROTOBASE + "src/proto/services/"
STATUS_JS = PROTOBASE + "src/proto.d.ts"

# strings to substitute into the template
toStringSwitches = "!!!!!!!!! toString Switches missing !!!!!!!!!"
fromStringSwitches = "!!!!!!!!! fromCode Switches missing !!!!!!!!!"

# get protos from services
protoFiles = [f for f in os.listdir("./packages/proto/src/proto/services") if fnmatch.fnmatch(f, '*.proto')]

def getStrippedText(startText, stopText, fileName):
    linesToGet = []
    with open(fileName) as scanFile:
        copy = False
        for line in scanFile:
            stripped = line.strip()
            if stripped.__contains__(startText):
                copy = True
                continue
            elif stripped == stopText:
                copy = False
                continue
            elif copy:
                linesToGet.append(stripped)
    return linesToGet

status_lines = getStrippedText("enum HederaFunctionality {", "}", STATUS_JS)

#take an array of arrays of lines and split them and get the first and third fields to make a dict
def status_lines_to_dict(lines):
    statusDict = {}
    for line in lines:
        lineArr = line.split()
        key = lineArr[2]
        val = lineArr[0]
        statusDict[key] = val
    return statusDict

statusCodes = status_lines_to_dict(status_lines)

def getProtoNamesAndComments():
    copy = False
    buff = []
    commentsAndNames = {}
    for protofile in protoFiles:
        with open(PROTODIR+protofile) as pfile:
            currentIndex = 0
            for line in pfile:
                currentIndex += 1
                stripped = line.strip()
                if stripped.__contains__("/**"):
                    copy = True
                    continue
                elif stripped == "*/":
                    copy = False
                    fncHeader = pfile.readline(currentIndex).strip()
                    if (fncHeader.__contains__("message")):
                        currentKey = fncHeader.split()[1]
                        currentVal = buff
                        commentsAndNames[currentKey] = currentVal
                    buff = []
                    continue
                elif copy:
                    buff.append(stripped)
                    continue
            currentIndex = 0
    return commentsAndNames

#gets a dictionary mapping names: comments from proto.d.ts
statusNamesAndComments = getProtoNamesAndComments()

def assembleStatuses():
    

fileTemplate = """
/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the \"License\");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an \"AS IS\" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

/**
 * @namespace proto
 * @typedef {import(\"@hashgraph/proto\").proto.ResponseCodeEnum} HashgraphProto.proto.ResponseCodeEnum
 */

export default class Status {
    /**
     * @hideconstructor
     * @internal
     * @param {number} code
     */
    constructor(code) {
        /** @readonly */
        this._code = code;

        Object.freeze(this);
    }

    /**
     * @returns {string}
     */
    toString() {
        switch (this) {
$tSS
           default:
                return `UNKNOWN ($${this._code})`;
        }
    }

    /**
     * @internal
     * @param {number} code
     * @returns {Status}
     */
    static _fromCode(code) {
$fCS
    default:
                throw new Error(
                    `(BUG) Status.fromCode() does not handle code: $${code}`
                );
        }

"""

# result = Template(fileTemplate).substitute({'tSS':toStringSwitches, 'fCS':fromStringSwitches})
# print(result)

