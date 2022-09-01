import { Injectable, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import {
    AccountId,
    PrivateKey,
    Wallet,
    LocalProvider,
    StatusError,
    Transaction,
} from "@hashgraph/sdk";
import { Executable } from "../../../../lib/LocalProvider";

@Injectable()
export class WalletService {
    public wallet: Wallet;
    public allowedRequests = new Set<string>();

    constructor() {
        this.wallet = new Wallet(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY),
            new LocalProvider(),
        );
    }

    async call<RequestT, ResponseT, OutputT>(
        bytes: string,
        res: Response,
        request: Executable<RequestT, ResponseT, OutputT>,
    ): Promise<void> {
        // Make sure `callback` is called with the same request before we continue
        const timeout = new Promise((_, reject) => {
            setTimeout(
                () =>
                    reject(
                        new Error("failed to find transaction in mirror node"),
                    ),
                10000,
            );
        });

        const promise = async () => {
            while (!this.allowedRequests.has(bytes)) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
            this.allowedRequests.delete(bytes);
        };

        try {
            await Promise.race([promise, timeout]);
        } catch {
            res.status(HttpStatus.REQUEST_TIMEOUT).send();
            return;
        }

        try {
            // Sign the request if necessary
            if (request instanceof Transaction) {
                request = await this.wallet.signTransaction(request);
            }
            const response = await this.wallet.call(request);

            // TODO: We should not be calling private methods
            const serialized = request._serializeResponse(response);
            const hex = Buffer.from(serialized).toString("hex");
            res.status(HttpStatus.OK).send({ response: hex });
        } catch (error) {
            if (error instanceof StatusError) {
                // This error is allowed to happen
                res.status(HttpStatus.OK).send({
                    error: error.toJSON(),
                });
            } else {
                res.status(HttpStatus.BAD_REQUEST).send({
                    error: error.toString(),
                });
            }
        }
    }
}
