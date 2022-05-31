import axios from "axios";
import Cache from "./Cache.js";
import Logger from "js-logger";

const sync = (async () => {
    // http://time.google.com:80 doesn't actually give us an NTP response, instead it returns
    // a 302 redirected response. However, it does contain a `date` header which we can use.
    try {
        const response = await axios.get("http://time.google.com", {
            maxRedirects: 0,

            // By default a status of 302 is considered an erring status
            validateStatus: function (status) {
                return status < 500;
            },
        });

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
})();

export default sync;
