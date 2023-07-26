const {PrivateKey} = require("@hashgraph/sdk");

module.exports = {
    generatePublicKey: ({privateKey}) => {
        return PrivateKey.fromString(privateKey).publicKey.toString();
    },
    generatePrivateKey: () => {
        return PrivateKey.generateED25519().toString();
    }
};
