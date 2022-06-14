import * as tck from "@hashgraph/tck-chai";
import { SimpleRestSigner } from  "../src/index.js";

const signer = await SimpleRestSigner.connect();
await tck.test(signer, () => {});
