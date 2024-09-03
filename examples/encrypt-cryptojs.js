import CryptoJS from "crypto-js";

// Generate a random 32-byte (256-bit) key
const blowfishKey = CryptoJS.lib.WordArray.random(32);

// Generate a random IV
const iv = CryptoJS.lib.WordArray.random(8); // Blowfish uses a block size of 8 bytes (64 bits)

// Encrypt the plaintext using Blowfish with the key and IV
const encrypted = CryptoJS.Blowfish.encrypt("Hello, World!", blowfishKey, {
    iv: iv,
});

console.log("Blowfish Key in Hex:", blowfishKey.toString(CryptoJS.enc.Hex));
console.log("IV in Hex:", iv.toString(CryptoJS.enc.Hex));
console.log("Encrypted Message:", encrypted.toString());

console.log(CryptoJS.TripleDES.encrypt(blowfishKey, "zaza").toString());
