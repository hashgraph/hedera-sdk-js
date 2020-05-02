// const hedera = require("@hashgraph/sdk");

// const MNEMONIC = "inmate flip alley wear offer often piece magnet surge toddler submit right radio absent pear floor belt raven price stove replace reduce plate home"; 

// const KEY_STR = "302e020100300506032b65700422042000476a7dcbec615287043d193690df68e7ac52ca961bbf2b9fe0f3097a257b67";
// const KEY_DERIVE_STR = "302e020100300506032b6570042204209c8157cff1a6962087ea8b42f31da83639f94d2efcef10185cff557a7f22a912";

// function assert(left, right) {
//   if (left != right) {
//     throw new Error(`\`left\` != \`right\` : ${left} != ${right}`);;
//   }
// }

// async function test_fn(fn) {
//   let text = `${fn.name} `;

//   try {
//     await fn();
//     text = text + `passed...`;
//   } catch (e) {
//     text = text + `failed... ${e}`;
//   } finally {
//     const element = document.createElement("div");
//     element.innerText = text;
//     document.body.appendChild(element);
//   }
// }

// async function mnemonic_test() {
//   const key = await hedera.Ed25519PrivateKey.fromMnemonic(MNEMONIC, "");
//   assert(KEY_STR, key.toString());
//   assert(KEY_DERIVE_STR, key.derive(0).toString());
// }

// document.addEventListener("DOMContentLoaded", function(event) { 
//   test_fn(mnemonic_test);
// });

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // await page.goto("localhost:1234");

  // await browser.close();
})();
