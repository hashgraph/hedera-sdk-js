import * as $protobuf from "protobufjs/minimal.js";
import Long from "long";

import * as $proto from "./proto.js";

/**
 * Patch protobuf race condition between loading protobuf and Long.js libraries.
 */
(() => {
    var $util = $protobuf.util;

    if ($util.Long == null) {
        console.log(`Patching Protobuf Long.js instance...`);
        $util.Long = Long;

        if ($protobuf.Reader._configure != null) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            $protobuf.Reader._configure($protobuf.BufferReader);
        }
    }
})();

export const Reader = $protobuf.Reader;
export const Writer = $protobuf.Writer;

export const proto = $proto.proto;
export const com = $proto.com;
export const google = $proto.google;
