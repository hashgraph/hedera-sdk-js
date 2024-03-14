## Release process of JS SDK

- **Create** a new release branch following the naming convention for:
    - stable release - `release/v*.*.*`
    - beta release - `release/v*.*.*-beta.*`
- **Run** the [local node](https://github.com/hashgraph/hedera-local-node)
- **Run** `task test:integration:node`
- **Stop** the [local node](https://github.com/hashgraph/hedera-local-node)
- **Run** `task test:release` (Note: the local node should not be running)
- **Update** the SDK version in `package.json` file
- **Update** the CHANGELOG file
- **Create** a new tag from the branch that you are releasing (release/vX.Y.Z) with the same version of the branch as running following command for:
    - stable release - `git tag -a "v*.*.*" -m "[message]"`
    - bet release - `git tag -a "v*.*.*-beta.*" -m "[message]"`
- **Run** the following command for:
    - stable release - `git push origin v*.*.*`
    - beta release - `git push origin v*.*.*-beta.*`
- **Monitor** the [status](https://github.com/hashgraph/hedera-sdk-js/actions/workflows/publish_release.yaml) of this CI pipeline