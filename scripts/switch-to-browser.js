import { promises as fs } from "fs"; // Use the fs promises API

async function modifyPackageJson() {
    try {
        const packageJsonContent = await fs.readFile("./package.json", "utf8");
        const packageJson = JSON.parse(packageJsonContent);

        // Modify the necessary fields for the browser build
        packageJson.types = "./lib/browser.d.ts";
        packageJson.main = "./lib/browser.cjs";
        packageJson.module = "./src/browser.js";

        if (packageJson.exports && packageJson.exports["."]) {
            packageJson.exports["."].types = "./lib/browser.d.ts";
            packageJson.exports["."].import = "./src/browser.js";
            packageJson.exports["."].require = "./lib/browser.cjs";
        }

        await fs.writeFile(
            "./package.json",
            JSON.stringify(packageJson, null, 2) + "\n",
            "utf8",
        );

        console.log("package.json successfully updated for browser build.");
    } catch (err) {
        console.error("Error modifying package.json:", err);
    }
}

// Execute the function to modify package.json
modifyPackageJson();
