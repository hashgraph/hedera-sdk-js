/**
 * BIP-44 key derivation options as described here:
 * https://github.com/bitcoin/bips/blob/33e6283/bip-0044.mediawiki#account
 *
 * `purpose = "44"` and `coin = "3030" (Hedera HBAR)` are hardcoded.
 */
export type DeriveOpts = {
    account: number;
    change: number;
    index: number;
}
