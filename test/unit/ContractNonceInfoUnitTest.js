import {
    ContractId,
    ContractNonceInfo,
} from "../../src/exports.js";
import IntegrationTestEnv from "../integration/client/NodeIntegrationTestEnv.js";

describe("ContractNonceInfo", function () {
    this.timeout(120000);
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new({ balance: 100000 });
    });
    
    it("provides nonce correctly", async function () {
        const info = new ContractNonceInfo({
            contractId: ContractId.fromString("1.2.3"), nonce: 2
        });
    
        const contractId = {
            shardNum: 1,
            realmNum: 2,
            contractNum: 3,
            evmAddress: null,
        }

        expect(info.contractId.shard.toNumber()).to.be.equal(contractId.shardNum);
        expect(info.contractId.realm.toNumber()).to.be.equal(contractId.realmNum);
        expect(info.contractId.num.toNumber()).to.be.equal(contractId.contractNum);
        expect(info.contractId.evmAddress).to.be.equal(contractId.evmAddress);
        expect(info.nonce).to.be.equal(2);
    });
});
