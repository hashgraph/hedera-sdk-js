import express from "express";
import readline from "readline";
import { Wallet, LocalProvider, Transaction, Query } from "@hashgraph/sdk";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv();

addFormats(ajv);

ajv.addFormat(
    "TransactionHex",
    /** @type {ajv.ForamtValidator<string>} */ {
        validate: (/** @type {string} */ data) => {
            if (typeof data !== "string" || data === "") {
                return false;
            }

            Transaction.fromBytes(Buffer.from(data, "hex"));
            return true;
        },
    }
);

ajv.addFormat(
    "RequestType",
    /** @type {ajv.ForamtValidator<string>} */ {
        validate: (/** @type {string} */ data) => {
            if (typeof data !== "string") {
                return false;
            }

            return data === "Query" || data === "Transaction";
        },
    }
);

ajv.addFormat(
    "QueryHex",
    /** @type {ajv.ForamtValidator<string>} */ {
        validate: (/** @type {string} */ data) => {
            if (typeof data !== "string" || data === "") {
                return false;
            }

            Query.fromBytes(Buffer.from(data, "hex"));
            return true;
        },
    }
);

const validateCall = ajv.compile({
    type: "object",
    properties: {
        type: { type: "string", format: "RequestType" },
        transaction: { type: "string", format: "TransactionHex" },
        query: { type: "string", format: "QueryHex" },
    },
    required: ["type"],
    additionalProperties: false,
});

const validateSign = ajv.compile({
    type: "object",
    properties: {
        transaction: { type: "string", format: "TransactionHex" },
    },
    required: ["transaction"],
    additionalProperties: false,
});

// @ts-ignore
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const app = express();
app.use(express.json());

const provider = new LocalProvider();

provider._client.setNetwork({ "127.0.0.1:50211": "0.0.3" });
provider._client.setMirrorNetwork(["127.0.0.1:5600"]);

// if (process.env.OPERATOR_KEY == null || process.env.OPERATOR_ID == null) {
//     throw new Error("`OPERATOR_KEY` and `OPERATOR_ID` required");
// }

const wallet = new Wallet(
    "0.0.1032",
    "0x7f109a9e3b0d8ecfba9cc23a3614433ce0fa7ddcc80f2a8f10b222179a5a80d6",
    provider
);

const ledgerId = provider.getLedgerId();
const network = provider.getNetwork();
Object.entries(network).map(([key, value]) => {
    network[key] = value.toString();
});
const mirrorNetwork = provider.getMirrorNetwork();

app.post("/login", function (req, res) {
    // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // const request = /** @type {{ accountId: string | undefined }} */ (req.body);
    // if (
    //     request.accountId != null &&
    //     request.accountId != wallet.accountId.toString()
    // ) {
    //     res.json({ error: "invalid account ID" });
    //     return;
    // }
    //
    // const accountId =
    //     request.accountId == null ? wallet.accountId : request.accountId;
    //
    // rl.question(`Login as ${accountId.toString()}?\n`, (name) => {
    //     switch (name) {
    //         case "y":
    //         case "yes":
    res.json({
        accountId: wallet.accountId.toString(),
        publicKey: wallet.publicKey.toString(),
        ledgerId: ledgerId != null ? ledgerId.toString() : null,
        network,
        mirrorNetwork,
        //             });
        //             break;
        //         default:
        //             res.json({ error: "request denied" });
        //     }
    });
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.post("/request", async function (req, res) {
    if (!validateCall(req.body)) {
        return res.json({ error: JSON.stringify(validateCall.errors) });
    }

    try {
        switch (req.body.type) {
            case "Query": {
                /**
                 * @template T
                 * @type {Query<T>}
                 */
                const query = Query.fromBytes(
                    Buffer.from(req.body.query, "hex")
                );
                /**
                 * @template {{ toBytes: () => Uint8Array }} T
                 * @type T
                 */
                const queryResponse = await wallet.call(query);
                return res.json({
                    response: Buffer.from(
                        query._serializeResponse(queryResponse)
                    ).toString("hex"),
                });
            }
            case "Transaction": {
                const transaction = Transaction.fromBytes(
                    Buffer.from(req.body.transaction, "hex")
                );
                await transaction.signWithSigner(wallet);
                const transactionResponse = await wallet.call(transaction);
                return res.json({
                    response: Buffer.from(
                        transaction._serializeResponse(transactionResponse)
                    ).toString("hex"),
                });
            }
            default:
                throw new Error(
                    "(BUG) req.body.type was neither Query or Transaction yet passed validation"
                );
        }
    } catch (error) {
        return res.json({
            error: /** @type {Error} */ (error).toString(),
        });
    }
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.post("/sign", async function (req, res) {
    if (!validateSign(req.body)) {
        return res.json({ error: "failed to validate request" });
    }

    try {
        const transaction = Transaction.fromBytes(
            Buffer.from(req.body.transaction, "hex")
        );
        await transaction.signWithSigner(wallet);
        return res.json({
            response: Buffer.from(transaction.toBytes()).toString("hex"),
        });
    } catch (error) {
        return res.json({
            error: /** @type {Error} */ (error).toString(),
        });
    }
});

app.listen(3000);
