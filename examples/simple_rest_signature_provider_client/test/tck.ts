import * as tck from "@hashgraph/tck-chai";
import { SimpleRestSigner } from "../src/signer";
import mocha from "mocha";

describe("TCK", async function () {
    const self = this;
    self.timeout(60 * 1000);

    this.beforeAll(async function () {
        const signer = await SimpleRestSigner.connect();
        const tests = tck.createTckTests(signer, () => {});

        for (const test of tests) {
            self.addTest(new mocha.Test(test.name, test.fn));
        }
    });

    // A single test is requried, otherwise `beforeAll` is never run and tests
    // are added
    it("can connect", async function () {});
});
