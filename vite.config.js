module.exports = {
    optimizeDeps: {
        // allows the package to _reference_ node builtins statically as long as the code branches
        // that use them are never reached
        allowNodeBuiltins: [
            "@hashgraph/cryptography"
        ]
    }
};
