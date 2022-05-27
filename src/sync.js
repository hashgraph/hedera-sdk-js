import axios from "axios";
import Cache from "./Cache.js";

const sync = (async () => {
    const response = await axios.get(
        "http://worldtimeapi.org/api/timezone/gmt"
    );
    const currentTime = Math.round(Date.now() / 1000);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const worldTime = response.data.unixtime;
    Cache.timeDrift = worldTime - currentTime;
})();

export default sync;
