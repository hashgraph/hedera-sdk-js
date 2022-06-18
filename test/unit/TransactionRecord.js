import { expect } from "chai";

import {
    TransactionRecord,
} from "../../src/index.js";
import * as hex from "../../src/encoding/hex.js";

const HEX_BYTES = "1afb010a26081612070800100018de092a130a110801100c1a0b0880ae99a4ffffffffff013800420058001230cac44f2db045ba441f3fbc295217f2eb0f956293d28b3401578f6160e66f4e47ea87952d91c4b1cb5bda6447823b979a1a0c08f3fcb495061083d9be900322190a0c08e8fcb495061098f09cf20112070800100018850918002a0030bee8f013526c0a0f0a0608001000180510d0df820118000a0f0a0608001000186210f08dff1e18000a100a070800100018a00610def1ef0318000a100a070800100018a10610def1ef0318000a110a070800100018850910fbf8b7e10718000a110a070800100018de091080a8d6b90718008a0100";

describe("TransactionRecord", function () {
    it("[from|to]Bytes()", function () {
        const record = TransactionRecord.fromBytes(hex.decode(HEX_BYTES));
        expect(hex.encode(record.toBytes())).to.equal(HEX_BYTES);
    });
});
