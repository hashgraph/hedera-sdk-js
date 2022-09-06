// Testing framework imports
import mocha from "mocha";
import { expect } from "chai";

// TCK/Signatuer Provider imports
import * as tck from "@hashgraph/tck";
import { SimpleRestSigner } from "../src/signer";

// Could be abstracted into packages and/or into a separate file as these
// are always going to be the same
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

describe("TCK", async function () {
    // Set a timeout on all TCK tests
    this.timeout(60 * 1000);

    // Dummy test to make sure dynamic tests are loaded
    it("connects", () => {});

    const signer = await SimpleRestSigner.connect();

    // This is the callback that will be called after each request is created
    // It is up to the signer/provider implementor to decide what to do here.
    //
    // Note: The callback will only be called when a transaction is signed or executed
    // it will not be called when a request is being frozen as we are unable to
    // serialize a transaction before it's frozen.
    const callback = (request: string) => {
        const provider = signer.getProvider()!;

        // We're going to simply call `/wallet/callback` with the request bytes hex
        // encoded to tell the service this request came from the TCK. The service
        // waits until `/wallet/callback` is called with the request before
        // proceeding, and will timeout quickly otherwise.
        provider.instance.post("/wallet/callback", { request });
    };

    // Run the TCK test creator to create all the tests and then
    // add them to the test suite using the testing framework.
    // With mocha to add tests we can simply call `this.addTest()` assuming
    // a test already exists in the list -- otherwise the added tests
    // will never run :(
    for (const test of tck.createTckTests(signer, callback, expects)) {
        this.addTest(new mocha.Test(test.name, test.fn));
    }
});
