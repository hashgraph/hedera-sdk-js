import { test, expect } from "@playwright/test";

test("can execute @hashgraph/cryptography within browser", async function ({ page }) {
    page.on("pageerror", async (message) => {
        await browser.close();
        throw new Error(message);
    });

    await page.goto("http://localhost:9001/");

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const tests = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".test"))
            .map((test) => {
                const error = test.querySelector(".error");
                return {
                    name: [].reduce.call(test.querySelector("h2").childNodes, function(a, b) { return a + (b.nodeType === 3 ? b.textContent : ''); }, ''),
                    error: error != null ? error.innerText.trim() : null,
                };
            });
    });

    expect(tests.length).toBeGreaterThan(0);
    for (const t of tests) {
        expect(t.error).toBeNull();
    }
});
