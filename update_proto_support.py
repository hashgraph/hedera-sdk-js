import os 
import fnmatch

PROTOBASE = "packages/proto/"
PROTODIR = PROTOBASE + "src/proto/services/"
STATUSCODES = PROTOBASE + "src/proto.d.ts"

firstPart="""/*-
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
"""

switchStr="""            default:
                return `UNKNOWN ($\{this._code\})`;
        }
    }

    /**
     * @internal
     * @param \{number\} code
     * @returns {Status}
     */
    static _fromCode(code) {
    """

switchTailStr = """default:
                throw new Error(
                    \`(BUG) Status.fromCode() does not handle code: $\{code\}\`
                );
        }
    }
"""
contents = [f for f in os.listdir("./packages/proto/src/proto/services") if fnmatch.fnmatch(f, '*.proto')]
copy = False
buff = []
commentsAndNames = {}
for protofile in contents:
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

# get status code names from proto.d.ts
statusCodeNames = {}
with open(STATUSCODES) as infile:
    copy = False
    for line in infile:
        stripped = line.strip()
        if stripped.__contains__("enum HederaFunctionality {"):
            copy = True
            continue
        elif stripped == "}":
            copy = False
            continue
        elif copy:
            lineWords=stripped.split()
            statusKey = lineWords[2][:-1]
            statusVal = lineWords[0]
            statusCodeNames[statusKey] = statusVal
            continue
print(statusCodeNames)

# Get status codes from proto.d.ts and make code out of them
with open(STATUSCODES) as infile, open('StatusCodes', 'w') as outfile:
    copy = False
    outfile.write(firstPart)
    for line in infile:
        stripped = line.strip()
        if stripped.__contains__("enum ResponseCodeEnum {"):
            copy = True
            continue
        elif stripped == "}":
            copy = False
            continue
        elif copy:
            currentLine = stripped.split()
            outfile.write("\t\t\tcase Status."+currentLine[0]+":\n");
            outfile.write("\t\t\t\treturn "+currentLine[0]+"\n")
            copy = True
            continue
    outfile.write(switchStr)
    infile.close()
    outfile.close()

#make next codeblock     
with open(STATUSCODES) as infile2, open('StatusCodes', 'a+') as outfile2:
    copy = False
    first = True
    for line in infile2:
        stripped = line.strip()
        if stripped.__contains__("enum ResponseCodeEnum {"):
            copy = True
            continue
        elif stripped == "}":
            copy = False
            continue
        elif copy:
            currentLine = stripped.split()
            notFirst = ""
            if (first):
                notFirst = "\t"
            first = False
            outfile2.write(notFirst+"\t\t\t\tcase "+currentLine[2][:-1]+":\n\t\t\t\t\t\treturn Status."+currentLine[0]+"\n")
            continue
    outfile2.write("\t\t\t\t\t"+switchTailStr)
    outfile2.close()
    infile2.close()
      