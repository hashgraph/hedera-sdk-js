## Release process of JS SDK

-   **Run** the [local node](https://github.com/hashgraph/hedera-local-node)
-   Run `task test:integration:node`
-   **Stop** the local node
-   Run `task test:unit:node`
-   Run `task test:publish` (if the local node is not stopped, those tests will fail)
-   Run `pnpm publish` (Be careful, you need to update `package.json` version as well as `subpackage` versions if needed!)
-   Create a PR to merge release/vX.Y.Z to DEVELOP and then to MAIN
-   Go to the [SDK PAGE](https://github.com/hashgraph/hedera-sdk-js/releases) and press the “Draft a new release” button
-   Create a new tag from the branch that you are releasing (release/vX.Y.Z) with the same version of the branch
-   Generate the release notes automatically.
-   Copy the latest changes from the release notes to the CHANGELOG.md
-   Push with the message: the release version
-   Publish Release
