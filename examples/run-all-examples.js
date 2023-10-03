import fs from "fs";
import path from "path";
import { spawnSync, execSync } from "child_process";
import os from "os";

function getNodePath() {
    try {
        if (os.platform() === "darwin" || os.platform() === "linux") {
            // macOS or Linux
            const result = execSync("which node").toString().trim();
            return result;
        } else if (os.platform() === "win32") {
            // Windows
            const result = execSync("where node").toString().trim();
            return result;
        } else {
            console.log("Unsupported operating system.");
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

const examplesDirectory = "./";
const excludedDirectories = [
    "./node_modules",
    "./precompile-example",
    "./react-native-example",
    "./simple_rest_signature_provider",
];
const excludedJSFile = "run-all-examples.js";

fs.readdir(examplesDirectory, (err, files) => {
    if (err) {
        console.error("Error reading directory:", err);
        return;
    }

    let completed = 0;
    let failed = 0;

    const isPathStartsWith = (
        /** @type {string} */ file,
        /** @type {string} */ directory
    ) => path.join(examplesDirectory, file).startsWith(directory);

    const examples = files.filter(
        (file) =>
            file.endsWith(".js") &&
            file !== excludedJSFile &&
            excludedDirectories.some(
                (directory) => !isPathStartsWith(directory, file)
            )
    );

    const total = examples.length;

    const nodePath = getNodePath();

    if (!nodePath) {
        throw new Error(
            "Node.js not found. Make sure it's installed and in the PATH."
        );
    }

    examples.forEach((file, index) => {
        console.log(`\n⏳ ${index + 1}. Running ${file}...`);
        const examplePath = path.join(examplesDirectory, file);

        const result = spawnSync(nodePath, [examplePath]);

        if (result.status === 0) {
            completed += 1;
            console.log(`✅ Successfully executed.`);
        } else {
            failed += 1;
            console.error(`❌ Failed. `);
        }
    });

    console.log(
        `\nTotal: [${total}] \n✅ Completed: [${completed}] \n❌ Failed: [${failed}] ${
            failed === 0 ? " \nGreat job! 🎉" : ""
        } `
    );
});
