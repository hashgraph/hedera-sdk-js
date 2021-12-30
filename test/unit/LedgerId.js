import LedgerId from "../src/LedgerId.js";
import * as hex from "../src/encoding/hex.js";

describe("LedgerId", function () {
    const MAINNET = "mainnet";
    const TESTNET = "testnet";
    const PREVIEWNET = "previewnet";

    it('fromString returns LedgerId from strings/hex "mainnet", "testnet", "previewnet"', function () {
        let ledgerId = LedgerId.fromString("0");
        expect(ledgerId.ledgerId).to.eql(new Uint8Array([0]));
        ledgerId = LedgerId.fromString(MAINNET);
        expect(ledgerId.ledgerId).to.eql(new Uint8Array([0]));
        ledgerId = LedgerId.fromString(hex.encode(MAINNET));
        expect(ledgerId.ledgerId).to.eql(new Uint8Array([0]));

        ledgerId = LedgerId.fromString("1");
        expect(ledgerId.ledgerId).to.eql(new Uint8Array([1]));
        ledgerId = LedgerId.fromString(TESTNET);
        expect(ledgerId.ledgerId).to.eql(new Uint8Array([1]));
        ledgerId = LedgerId.fromString(hex.encode(TESTNET));
        expect(ledgerId.ledgerId).to.eql(new Uint8Array([1]));

        ledgerId = LedgerId.fromString("2");
        expect(ledgerId.ledgerId).to.eql(new Uint8Array([2]));
        ledgerId = LedgerId.fromString(PREVIEWNET);
        expect(ledgerId.ledgerId).to.eql(new Uint8Array([2]));
        ledgerId = LedgerId.fromString(hex.encode(PREVIEWNET));
        expect(ledgerId.ledgerId).to.eql(new Uint8Array([2]));
    });

    it("fromBytes returns LedgerId from any bytes obj", function () {
        let ledgerId = LedgerId.fromBytes(new Uint8Array([0]));
        expect(ledgerId.ledgerId).to.eql(new Uint8Array([0]));

        ledgerId = LedgerId.fromBytes(new Uint8Array([1]));
        expect(ledgerId.ledgerId).to.eql(new Uint8Array([1]));

        ledgerId = LedgerId.fromBytes(new Uint8Array([2]));
        expect(ledgerId.ledgerId).to.eql(new Uint8Array([2]));

        ledgerId = LedgerId.fromBytes(new Uint8Array([MAINNET]));
        expect(ledgerId.toString()).to.eql(MAINNET);
    });

    it("isMainnet|Testnet|Previewnet returns boolean", function () {
        let ledgerId = LedgerId.fromString("0");
        expect(ledgerId.isMainnet()).to.eql(true);
        expect(ledgerId.isTestnet()).to.eql(false);
        expect(ledgerId.isPreviewnet()).to.eql(false);
        ledgerId = LedgerId.fromString(MAINNET);
        expect(ledgerId.isMainnet()).to.eql(true);
        expect(ledgerId.isTestnet()).to.eql(false);
        expect(ledgerId.isPreviewnet()).to.eql(false);
        ledgerId = LedgerId.fromBytes(new Uint8Array([0]));
        expect(ledgerId.isMainnet()).to.eql(true);
        expect(ledgerId.isTestnet()).to.eql(false);
        expect(ledgerId.isPreviewnet()).to.eql(false);

        ledgerId = LedgerId.fromString("1");
        expect(ledgerId.isTestnet()).to.eql(true);
        expect(ledgerId.isMainnet()).to.eql(false);
        expect(ledgerId.isPreviewnet()).to.eql(false);
        ledgerId = LedgerId.fromString(TESTNET);
        expect(ledgerId.isTestnet()).to.eql(true);
        expect(ledgerId.isMainnet()).to.eql(false);
        expect(ledgerId.isPreviewnet()).to.eql(false);
        ledgerId = LedgerId.fromBytes(new Uint8Array([1]));
        expect(ledgerId.isTestnet()).to.eql(true);
        expect(ledgerId.isMainnet()).to.eql(false);
        expect(ledgerId.isPreviewnet()).to.eql(false);

        ledgerId = LedgerId.fromString("2");
        expect(ledgerId.isPreviewnet()).to.eql(true);
        expect(ledgerId.isTestnet()).to.eql(false);
        expect(ledgerId.isMainnet()).to.eql(false);
        ledgerId = LedgerId.fromString(PREVIEWNET);
        expect(ledgerId.isPreviewnet()).to.eql(true);
        expect(ledgerId.isTestnet()).to.eql(false);
        expect(ledgerId.isMainnet()).to.eql(false);
        ledgerId = LedgerId.fromBytes(new Uint8Array([2]));
        expect(ledgerId.isPreviewnet()).to.eql(true);
        expect(ledgerId.isTestnet()).to.eql(false);
        expect(ledgerId.isMainnet()).to.eql(false);
    });
});
