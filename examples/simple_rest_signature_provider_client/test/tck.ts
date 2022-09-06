import { expect } from "chai";
import * as tck from "@hashgraph/tck";
import { SimpleRestSigner } from "../src/signer";
import mocha from "mocha";

describe("TCK", async function () {
    const self = this;
    self.timeout(60 * 1000);

    this.beforeAll(async function () {
        const signer = await SimpleRestSigner.connect();
        const expects = {
            toEqual: (a: any, b: any) => {
                expect(a).to.deep.equal(b);
            },
            toHaveMembers: (a: any, b: any) => {
                expect(a).to.have.members(b);
            },
            toNotBeNull: (a: any) => {
                expect(a).to.not.be.null;
            },
            toBeTrue: (a: any) => {
                expect(a).to.be.true;
            },
        };
        const tests = tck.createTckTests(
            signer,
            (request: string) => {
                // This is the callback that will be called after each request is created
                // It is up to the signer/provider implementor to decide what to do here.

                const provider = signer.getProvider()!;
                provider.instance.post("/wallet/callback", { request });
            },
            expects
        );

        for (const test of tests) {
            self.addTest(new mocha.Test(test.name, test.fn));
        }
    });

    // A single test is requried, otherwise `beforeAll` is never run and tests
    // are added
    it("can connect", async function () {});
});
