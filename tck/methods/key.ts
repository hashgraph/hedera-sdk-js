import { PrivateKey } from "@hashgraph/sdk";

export default {
  generatePublicKey: ({ privateKey }: { privateKey: string }) => {
    return PrivateKey.fromString(privateKey).publicKey.toString();
  },
  generatePrivateKey: () => {
    return PrivateKey.generateED25519().toString();
  },
};
