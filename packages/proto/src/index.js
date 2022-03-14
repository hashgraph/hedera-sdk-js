import * as $protobuf from "protobufjs/minimal.js";
import Long from "long";

export { proto, com, google } from "./proto.js";

export const Reader = $protobuf.Reader;
export const Writer = $protobuf.Writer;

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
