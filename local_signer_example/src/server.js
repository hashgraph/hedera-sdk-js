import express from "express";
import readline from "readline";
import { Wallet, LocalProvider } from "@hashgraph/sdk";

if (process.env.OPERATOR_KEY == null || process.env.OPERATOR_ID == null) {
    throw new Error("`OPERATOR_KEY` and `OPERATOR_ID` required");
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const app = express();
app.use(express.json());

const provider = new LocalProvider();

const wallet = new Wallet(
    process.env.OPERATOR_ID,
    process.env.OPERATOR_KEY,
    provider,
);

const ledgerId = provider.getLedgerId();
const network = provider.getNetwork();
const mirrorNetwork = provider.getMirrorNetwork();

app.post("/login", function (req, res) {
    const request = /** @type {{ accountId: string | undefined }} */ (req.body);
    if (request.accountId != null && request.accountId != wallet.accountId.toString()) {
        res.json({ error: "invalid account ID" });
        return;
    }

    const accountId = request.accountId == null ? wallet.accountId : request.accountId;

    rl.question(`Login as ${accountId.toString()}?\n`, name => {
        switch (name) {
        case "y":
        case "yes":
            res.json({
                accountId: wallet.accountId,
                publicKey: wallet.publicKey,
                ledgerId,
                network,
                mirrorNetwork,
            });
            break;
        default:
            res.json({ error: "request denied" });
        }
    });
})

app.listen(3000);
