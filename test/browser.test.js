import puppeteer from "puppeteer";

(async () => {
    const browser = await puppeteer.launch({ dupio: true, headless: true });
    const page = await browser.newPage();
    page.on("pageerror", async (message) => {
        await browser.close();
        throw new Error(message);
    });
    await page.goto("http://localhost:9001/");

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const tests = await page.evaluate(() => {
        const tests = Array.from(document.querySelectorAll(".test"))
            .map((test) => {
                const error = test.querySelector(".error");
                return {
                    name: [].reduce.call(test.querySelector("h2").childNodes, function(a, b) { return a + (b.nodeType === 3 ? b.textContent : ''); }, ''),
                    error: error != null ? error.innerText.trim() : null,
                };
            });
        return tests;
    });

    let error = false;
    
    for (const test of tests) {
        if (test.error != null) {
            error = true;
            console.log(`❌ ${test.name}`);
            console.log(`${test.error}`);
        // } else {
        //     console.log(`✔ ${test.name}`);
        }
    }

    await browser.close();

    if (error) {
        process.exit(-1);
    }
})();
