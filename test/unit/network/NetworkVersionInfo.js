// SPDX-License-Identifier: Apache-2.0

import * as HieroProto from "@hiero-ledger/proto";
import NetworkVersionInfo from "../../../src/network/NetworkVersionInfo.js";
import SemanticVersion from "../../../src/network/SemanticVersion.js";

describe("NetworkVersionInfo", function () {
    it("constructor stores both versions and freezes the instance", function () {
        const protobufVersion = new SemanticVersion({
            major: 1,
            minor: 2,
            patch: 3,
        });
        const servicesVersion = new SemanticVersion({
            major: 4,
            minor: 5,
            patch: 6,
        });

        const info = new NetworkVersionInfo({
            protobufVersion,
            servicesVersion,
        });

        expect(info.protobufVersion).to.equal(protobufVersion);
        expect(info.servicesVersion).to.equal(servicesVersion);
        expect(Object.isFrozen(info)).to.be.true;
    });

    it("_fromProtobuf maps hapiProtoVersion and hederaServicesVersion onto the renamed fields", function () {
        const info = NetworkVersionInfo._fromProtobuf({
            hapiProtoVersion: { major: 1, minor: 2, patch: 3 },
            hederaServicesVersion: { major: 4, minor: 5, patch: 6 },
        });

        expect(info.protobufVersion).to.be.an.instanceof(SemanticVersion);
        expect(info.servicesVersion).to.be.an.instanceof(SemanticVersion);
        expect(info.protobufVersion._toProtobuf()).to.deep.equal({
            major: 1,
            minor: 2,
            patch: 3,
        });
        expect(info.servicesVersion._toProtobuf()).to.deep.equal({
            major: 4,
            minor: 5,
            patch: 6,
        });
    });

    it("_fromProtobuf keeps the two versions apart", function () {
        // The names differ between the protobuf message and the class, so a
        // swap would be invisible if both versions were equal.
        const info = NetworkVersionInfo._fromProtobuf({
            hapiProtoVersion: { major: 9, minor: 9, patch: 9 },
            hederaServicesVersion: { major: 1, minor: 0, patch: 0 },
        });

        expect(info.protobufVersion.major).to.equal(9);
        expect(info.servicesVersion.major).to.equal(1);
    });

    it("_toProtobuf returns the protobuf field names", function () {
        const info = new NetworkVersionInfo({
            protobufVersion: new SemanticVersion({
                major: 1,
                minor: 2,
                patch: 3,
            }),
            servicesVersion: new SemanticVersion({
                major: 4,
                minor: 5,
                patch: 6,
            }),
        });

        expect(info._toProtobuf()).to.deep.equal({
            hapiProtoVersion: { major: 1, minor: 2, patch: 3 },
            hederaServicesVersion: { major: 4, minor: 5, patch: 6 },
        });
    });

    it("toBytes and fromBytes round-trip preserves both versions", function () {
        const info = new NetworkVersionInfo({
            protobufVersion: new SemanticVersion({
                major: 10,
                minor: 11,
                patch: 12,
            }),
            servicesVersion: new SemanticVersion({
                major: 13,
                minor: 14,
                patch: 15,
            }),
        });

        const decoded = NetworkVersionInfo.fromBytes(info.toBytes());

        expect(decoded).to.be.an.instanceof(NetworkVersionInfo);
        expect(decoded.protobufVersion._toProtobuf()).to.deep.equal({
            major: 10,
            minor: 11,
            patch: 12,
        });
        expect(decoded.servicesVersion._toProtobuf()).to.deep.equal({
            major: 13,
            minor: 14,
            patch: 15,
        });
    });

    it("toBytes matches the protobuf encoder output", function () {
        const info = new NetworkVersionInfo({
            protobufVersion: new SemanticVersion({
                major: 1,
                minor: 2,
                patch: 3,
            }),
            servicesVersion: new SemanticVersion({
                major: 4,
                minor: 5,
                patch: 6,
            }),
        });

        const expected = HieroProto.proto.NetworkGetVersionInfoResponse.encode({
            hapiProtoVersion: { major: 1, minor: 2, patch: 3 },
            hederaServicesVersion: { major: 4, minor: 5, patch: 6 },
        }).finish();

        expect(info.toBytes()).to.deep.equal(expected);
    });

    it("fromBytes decodes bytes produced by the protobuf encoder", function () {
        const bytes = HieroProto.proto.NetworkGetVersionInfoResponse.encode({
            hapiProtoVersion: { major: 2, minor: 0, patch: 1 },
            hederaServicesVersion: { major: 0, minor: 40, patch: 0 },
        }).finish();

        const info = NetworkVersionInfo.fromBytes(bytes);

        expect(info.protobufVersion._toProtobuf()).to.deep.equal({
            major: 2,
            minor: 0,
            patch: 1,
        });
        expect(info.servicesVersion._toProtobuf()).to.deep.equal({
            major: 0,
            minor: 40,
            patch: 0,
        });
    });
});
