import {
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractCallQuery,
    AccountId,
    ContractFunctionParameters,
    FileAppendTransaction,
    ContractFunctionResult,
    ContractId,
    ContractNonceInfo,
} from "../../src/exports.js";
import * as hex from "../../src/encoding/hex.js";
import IntegrationTestEnv from "../integration/client/NodeIntegrationTestEnv.js";
import BigNumber from "bignumber.js";
import BN from "bn.js";
import * as ethers from "@ethersproject/bignumber";

describe("ContractFunctionResult", function () {
    this.timeout(120000);
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new({ balance: 100000 });
    });
    
    it.only("provides results correctly", async function () {
        const CALL_RESULT_HEX = "00000000000000000000000000000000000000000000000000000000ffffffff"
        + "7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        + "00000000000000000000000011223344556677889900aabbccddeeff00112233"
        + "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        + "00000000000000000000000000000000000000000000000000000000000000c0"
        + "0000000000000000000000000000000000000000000000000000000000000100"
        + "000000000000000000000000000000000000000000000000000000000000000d"
        + "48656c6c6f2c20776f726c642100000000000000000000000000000000000000"
        + "0000000000000000000000000000000000000000000000000000000000000014"
        + "48656c6c6f2c20776f726c642c20616761696e21000000000000000000000000";

        const callResult = hex.decode(CALL_RESULT_HEX);
        const evmAddress = hex.decode("98329e006610472e6B372C080833f6D79ED833cf");

        const result = new ContractFunctionResult({
            contractId: ContractId.fromString("1.2.3")._toProtobuf(),
            bytes: callResult,
            evmAddress: evmAddress,
            senderAccountId: AccountId.fromString("1.2.3")._toProtobuf(),
            contractNonces: new ContractNonceInfo({
                contractId: AccountId.fromString("1.2.3"), nonce: 10
            }),
        })

        expect(result.getBool(0)).to.be.true;
        expect(result.getInt32(0)).to.be.equal(-1);
        //expect(result.getInt64(0)).to.be.equal((1 << 32) - 1);
        expect(result.getInt256(0).toString()).to.be.equal(((ethers.BigNumber.from(1).shl(32)) - ethers.BigNumber.from(1)).toString());
        //expect(result.getInt256(1)).to.be.equal(((ethers.BigNumber.from(1).shl(255)) - ethers.BigNumber.from(1)));
        expect(result.getAddress(2)).to.be.equal("11223344556677889900aabbccddeeff00112233");

        //expect(result.getUint32(3)).to.be.equal(-1);
        //expect(result.getUint64(3)).to.be.equal(-1);
        //expect(result.getUint256(3)).to.be.equal(((ethers.BigNumber.from(1).shl(256)) - ethers.BigNumber.from(1)).toString());
        
        expect(result.getString(4)).to.be.equal("Hello, world!");
        expect(result.getString(5)).to.be.equal("Hello, world, again!");

        //expect(result.senderAccountId.toString()).to.be.equal(AccountId.fromString("1.2.3"));
        //expect(result.contractId).to.be.equal(ContractId.fromString("1.2.3"));
        expect(result.evmAddress).to.be.equal(evmAddress);
        console.log(result.contractNonces)
        expect(result.contractNonces).to.be.equal(new ContractNonceInfo(ContractId.fromString("1.2.3"), 10));
    });
});
