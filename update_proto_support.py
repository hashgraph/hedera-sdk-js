STATUSCODES = "packages/proto/src/proto.d.ts"

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
    static _fromCode(code) {code) {
    """

switchTailStr = """default:
                throw new Error(
                    \`(BUG) Status.fromCode() does not handle code: $\{code\}\`
                );
        }
    }
"""

with open(STATUSCODES) as infile, open('StatusCodes', 'w') as outfile:
    copy = False
    outfile.write(firstPart)
    outfile.write("########################!!!\n")      
    for line in infile:
        stripped = line.strip()
        if stripped.__contains__("ResponseCodeEnum"):
            print("case Start")
            copy = True
            continue
        elif stripped == "}":
            print("case End")
            copy = False
            continue
        elif copy:
            print("case middle")
            currentLine = stripped.split()
            outfile.write("case Status."+currentLine[0]+":\n");
            outfile.write("test\n")
            copy = True
            continue
    outfile.write("########################!!!\n")      
    outfile.write(switchStr)
    outfile.write("########################!!!\n")
#    infile.close()
#    outfile.close()
# print("whaaat is happening....")
# with open('yourfile.js') as infile2, open('StatusCodes', 'a+') as outfile2:
#     copy = False
#     for line in infile2:
#         stripped = line.strip()
#         if stripped.__contains__("ResponseCodeEnum"):
#             print("case Start2")
#             copy = True
#             continue
#         elif stripped == "}":
#             print("case End2")
#             copy = False
#             continue
#         elif copy:
#             print("case middle")
#             currentLine = stripped.split()
#             outfile2.write("\t\t\t\t\tcase "+currentLine[2][:-1]+":\n\t\t\t\t\t\treturn Status."+currentLine[0]+"\n")
#             continue
#     outfile2.write("########################!!!\n")            
#     outfile2.write("\t\t\t\t\t"+switchTailStr)
#     outfile2.close()
#     infile2.close()
      