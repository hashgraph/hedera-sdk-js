import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

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

    examples.forEach((file, index) => {
        console.log(`\n⏳ ${index + 1}. Running ${file}...`);
        const examplePath = path.join(examplesDirectory, file);

        const result = spawnSync("node", [examplePath]);

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
