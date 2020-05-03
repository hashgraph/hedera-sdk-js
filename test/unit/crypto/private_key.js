import PrivateKey from "../../../src/crypto/private_key";
import * as utf8 from "../../../src/encoding/utf8";

const privateKey = new PrivateKey(Uint8Array.from([
    33, 208, 42, 88, 98, 70, 60, 159,
    145, 130, 223, 177, 218, 189, 234, 153,
    129, 205, 50, 63, 124, 121, 44, 43,
    213, 176, 67, 12, 15, 35, 17, 138
]));

const message = utf8.encode("hello, world");

const signature = Uint8Array.from([
    245, 79, 177, 18, 10, 184, 20, 212, 61, 203, 80,
    114, 25, 243, 90, 74, 10, 156, 234, 212, 188, 189,
    216, 104, 208, 134, 70, 193, 190, 140, 2, 247, 241,
    27, 188, 123, 245, 236, 152, 74, 145, 181, 158, 114,
    222, 204, 6, 63, 184, 34, 97, 19, 77, 124, 105,
    164, 106, 186, 125, 157, 140, 234, 96, 15
]);

describe("hedera/PrivateKey", () => {
    it("should sign", () => {
        expect(privateKey.sign(message)).to.deep.eq(signature);
    });

    it("should verify", () => {
        expect(privateKey.publicKey.verify(message, signature)).to.be.true;
    });
});
