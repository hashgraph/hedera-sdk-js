import { expect } from "chai";
import EcdsaPrivateKey from "../src/EcdsaPrivateKey.js";

describe("EcdsaPrivateKey", function () {
    it("generate should return Ecdsa object", function () {
        let ecdsa = EcdsaPrivateKey.generate();
        // console.log(ecdsa.toString());
        expect(ecdsa != undefined && ecdsa != null);
    });

    it("generateAsync should return Ecdsa object", async function(){
        let ecdsa = EcdsaPrivateKey.generateAsync();

        expect(ecdsa != undefined && ecdsa != null);
    });

    it("toString should return stringified key",function(){
        let ecdsa = EcdsaPrivateKey.generate().toString();

        expect(typeof ecdsa).to.eql("string");
    });

    it("fromString should generate key from string with prefix",function(){
        let ecdsa = EcdsaPrivateKey.fromString("302e020100300506032b657004220420308184020100301006072a8648ce3d020106052b8104000a046d306b02010104");//302e020100300506032b657004220420

        // console.log(ecdsa);
        // console.log(ecdsa.toString());
    });

    it("fromString should generate key from string without prefix",function(){
        let ecdsa = EcdsaPrivateKey.fromString("308184020100301006072a8648ce3d020106052b8104000a046d306b02010104");

        // console.log(ecdsa);
        // console.log(ecdsa.toString());
    });

    it("toBytes should return key bytes",function(){
        let ecdsa = EcdsaPrivateKey.generate().toBytes();

        expect(ecdsa != undefined && ecdsa != null);
    });

    // it("fromBytes should generate key from bytes",function(){
    //     let bytesKey = "";
    //     let ecdsa = EcdsaPrivateKey.fromBytes(bytesKey);
        
    // });

    // it("sign should return key-signed bytes",function(){
    //     let ecdsa = EcdsaPrivateKey.generate().sign(new Uint8Array("dc d4 8d 7a 97 04 36 7b 07 cf"));
        
    //     console.log(ecdsa);
    // });
});
