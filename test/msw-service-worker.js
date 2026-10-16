// SPDX-License-Identifier: Apache-2.0

/**
 * Serves MSW's service worker at `/mockServiceWorker.js` for the browser test
 * suites, where `setupWorker().start()` registers it.
 *
 * Vitest 4 browser mode resolved that path to `msw/mockServiceWorker.js` on its
 * own; Vitest 5 dropped it (vitest-dev/vitest#11230), so the browser tests that
 * mock HTTP with MSW fail to register the worker without this plugin.
 *
 * @returns {import("vite").Plugin}
 */
export function mswServiceWorker() {
    return {
        name: "msw-service-worker",
        resolveId(source) {
            if (source !== "/mockServiceWorker.js") return null;
            return this.resolve("msw/mockServiceWorker.js", undefined, {
                skipSelf: true,
            });
        },
    };
}
