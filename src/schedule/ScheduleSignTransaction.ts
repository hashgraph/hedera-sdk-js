import { SingleTransactionBuilder } from "../TransactionBuilder";
import { SignatureMap, SignaturePair } from "../generated/BasicTypes_pb";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import * as base64 from "@stablelib/base64";

import { ScheduleService } from "../generated/ScheduleService_pb_service";
import { ScheduleSignTransactionBody } from "../generated/ScheduleSign_pb";
import { ScheduleId, ScheduleIdLike } from "../schedule/ScheduleId";
import { Ed25519PublicKey } from "../crypto/Ed25519PublicKey";

export class ScheduleSignTransaction extends SingleTransactionBuilder {
    private readonly _body: ScheduleSignTransactionBody;

    public constructor() {
        super();
        this._body = new ScheduleSignTransactionBody();
        this._inner.setSchedulesign(this._body);
    }

    public setScheduleId(scheduleIdLike: ScheduleIdLike): this {
        this._body.setScheduleid(new ScheduleId(scheduleIdLike)._toProto());
        return this;
    }

    public addScheduleSignature(publicKey: Ed25519PublicKey, signature: Uint8Array): this {
        const pubKeyBytes = publicKey.toBytes();
        const sigMap = this._body.getSigmap() || new SignatureMap();
        sigMap.getSigpairList().forEach((sigPair) => {
            const sigPairBytes = base64.decode(sigPair.getPubkeyprefix_asB64());
            if (pubKeyBytes.toString() === sigPairBytes.toString()) {
                throw new Error(`transaction already signed with key ${publicKey.toString()}`);
            }
        });

        const sigPair = new SignaturePair();
        sigPair.setPubkeyprefix(publicKey.toBytes());
        sigPair.setEd25519(signature);

        sigMap.addSigpair(sigPair);
        this._body.setSigmap(sigMap);

        return this;
    }

    protected _doValidate(errors: string[]): void {
        const scheduleId = this._body.getScheduleid();

        if (scheduleId == null) {
            errors.push("ScheduleSignTransaction must have a schedule id set");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return ScheduleService.signSchedule;
    }
}
