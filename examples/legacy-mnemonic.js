const { Mnemonic } = require("@hashgraph/sdk");

async function main() {
    const words = "jolly,kidnap,Tom,lawn,drunk,chick,optic,lust,mutter,mole,bride,galley,dense,member,sage,neural,widow,decide,curb,aboard,margin,manure".split(",");

    const mnemonic = new Mnemonic(words);
    const privateKey = await mnemonic.toPrivateKey();

    console.log(privateKey);
    console.log("302e020100300506032b657004220420882a565ad8cb45643892b5366c1ee1c1ef4a730c5ce821a219ff49b6bf173ddf");
}

main();
