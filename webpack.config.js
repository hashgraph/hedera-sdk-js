import path from "path";
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default {
    mode: "production",
    entry: "./src/browser.js",
    output: {
        filename: "[name].js",

        library: {
            type: "module",
        },
        module: true,
        // Output each module separately
        chunkFormat: "module",
        // Preserve directory structure
        //preserveModules: true,
        //preserveModulesRoot: "src",
    },
    experiments: {
        outputModule: true,
    },
};
