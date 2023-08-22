import AccountId from "../account/AccountId.js";

// MAINNET node proxies are the same for both 'WebClient' and 'NativeClient'
export const MAINNET = {
    "https://grpc-web.myhbarwallet.com:443": new AccountId(3),
    "https://node01-00-grpc.swirlds.com:443": new AccountId(4),
    "https://node02.swirldslabs.com:443": new AccountId(5),
    "https://node03.swirldslabs.com:443": new AccountId(6),
    "https://node04.swirldslabs.com:443": new AccountId(7),
    "https://node05.swirldslabs.com:443": new AccountId(8),
    "https://node06.swirldslabs.com:443": new AccountId(9),
    "https://node07.swirldslabs.com:443": new AccountId(10),
    "https://node08.swirldslabs.com:443": new AccountId(11),
    "https://node09.swirldslabs.com:443": new AccountId(12),
    "https://node10.swirldslabs.com:443": new AccountId(13),
    "https://node11.swirldslabs.com:443": new AccountId(14),
    "https://node12.swirldslabs.com:443": new AccountId(15),
    "https://node13.swirldslabs.com:443": new AccountId(16),
    "https://node14.swirldslabs.com:443": new AccountId(17),
    "https://node15.swirldslabs.com:443": new AccountId(18),
    "https://node16.swirldslabs.com:443": new AccountId(19),
    "https://node17.swirldslabs.com:443": new AccountId(20),
    "https://node18.swirldslabs.com:443": new AccountId(21),
    "https://node19.swirldslabs.com:443": new AccountId(22),
    "https://node20.swirldslabs.com:443": new AccountId(23),
    "https://node21.swirldslabs.com:443": new AccountId(24),
    "https://node22.swirldslabs.com:443": new AccountId(25),
    "https://node23.swirldslabs.com:443": new AccountId(26),
    "https://node24.swirldslabs.com:443": new AccountId(27),
    "https://node25.swirldslabs.com:443": new AccountId(28),
    "https://node26.swirldslabs.com:443": new AccountId(29),
    //"https://node27.swirldslabs.com:443": new AccountId(30),
    //"https://node28.swirldslabs.com:443": new AccountId(31),
};

export const WEB_TESTNET = {
    "https://testnet-node00-00-grpc.hedera.com:443": new AccountId(3),
    "https://testnet-node01-00-grpc.hedera.com:443": new AccountId(4),
    "https://testnet-node02-00-grpc.hedera.com:443": new AccountId(5),
    "https://testnet-node03-00-grpc.hedera.com:443": new AccountId(6),
    "https://testnet-node04-00-grpc.hedera.com:443": new AccountId(7),
    "https://testnet-node05-00-grpc.hedera.com:443": new AccountId(8),
    "https://testnet-node06-00-grpc.hedera.com:443": new AccountId(9),
};

export const WEB_PREVIEWNET = {
    "https://previewnet-node00-00-grpc.hedera.com:443": new AccountId(3),
    "https://previewnet-node01-00-grpc.hedera.com:443": new AccountId(4),
    "https://previewnet-node02-00-grpc.hedera.com:443": new AccountId(5),
    "https://previewnet-node03-00-grpc.hedera.com:443": new AccountId(6),
    "https://previewnet-node04-00-grpc.hedera.com:443": new AccountId(7),
    "https://previewnet-node05-00-grpc.hedera.com:443": new AccountId(8),
    "https://previewnet-node06-00-grpc.hedera.com:443": new AccountId(9),
};

export const NATIVE_TESTNET = {
    "https://grpc-web.testnet.myhbarwallet.com:443": new AccountId(3),
};

export const NATIVE_PREVIEWNET = {
    "https://grpc-web.previewnet.myhbarwallet.com:443": new AccountId(3),
};
