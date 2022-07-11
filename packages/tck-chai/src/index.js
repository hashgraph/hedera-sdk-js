import { expect } from "chai";
import * as tck from "@hashgraph/tck";

/**
 * @typedef {import("@hashgraph/sdk").Signer} Signer
 */

/**
 * @param {Signer} signer
 * @param {() => void} callback
 * @returns {Promise<void>}
 */
export async function test(signer, callback) {
    const expects = await tck.test(signer, callback);

    for (const e of expects) {
        // eslint-disable-next-line no-undef
        it(e.name, function () {
            if (e.error != null) {
                expect(() => {
                    throw e.error;
                }).to.not.throw();
            } else {
                expect(e.condition, e.name).to.be.true;
            }
        });
    }
}
