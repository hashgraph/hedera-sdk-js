import axios from "axios";
import Cache from "./Cache.js";
import Logger from "js-logger";

/**
 * @returns {Promise<void>}
 */
export async function syncFunction() {
    // Make a "fake" account balance query and extract the date header from the response
    try {
        const response = await axios.post(
            // "https://myhbarwallet.com:443",
            "https://grpc-web.myhbarwallet.com:443/proto.CryptoService/cryptoGetBalance",
            {},
            {
                maxRedirects: 0,
                headers: {
                    "content-type": "application/grpc-web+proto",
                    "x-user-agent": "hedera-sdk-js/v2",
                    "x-grpc-web": "1",
                },

                // By default a status of 302 is considered an erring status
                validateStatus: function (status) {
                    return status < 500;
                },
            }
        );

        if (
            response == null ||
            response.headers == null ||
            response.headers.date == null ||
            Number.isNaN(response.headers.date)
        ) {
            return;
        }

        const currentTime = Math.round(Date.now() / 1000);

        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        // strongly discourages us using `Date.parse()`, but I'm not sure what we should replace
        // it with without adding any new deps.
        //
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        const worldTime = Math.round(Date.parse(response.headers.date) / 1000);

        Cache.timeDrift = worldTime - currentTime;
    } catch (error) {
        Logger.debug(
            `Failed to sync time drift: ${
                /** @type {Error} */ (error).toString()
            }`
        );
    }
}

const sync = (async () => {
    await syncFunction();
})();

export default sync;
