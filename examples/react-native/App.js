import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
    Client,
    AccountId,
    TransferTransaction,
    AccountBalanceQuery,
    AccountInfoQuery,
    PrivateKey,
    Mnemonic
} from "@hashgraph/sdk";

const operatorId = AccountId.fromString("0.0.47439");
const operatorKey = PrivateKey.fromString("302e020100300506032b6570042204208f4014a3f7f7a6c7147070da98d88f9cea074c13ed0554783471825d801888cf");

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            transactionId: null,
            info: null,
            balance: null,
            mnemonic: null,
            error: null,
        };
    }

    async componentDidMount() {
        try {
            const response = await new TransferTransaction()
                .addHbarTransfer(operatorId, -1)
                .addHbarTransfer("0.0.3", 1)
                .execute(client);

            this.setState({ ...this.state, transactionId: response.transactionId.toString() });
        } catch (err) {
            this.setState({ ...this.state, error: err.toString() });
        }

        try {
            const info = await new AccountInfoQuery()
                .setAccountId(operatorId)
                .execute(client);

            this.setState({ ...this.state, info: info.accountId.toString() });
        } catch (err) {
            this.setState({ ...this.state, error: err.toString() });
        }

        try {
            const balance = await new AccountBalanceQuery()
                .setAccountId(operatorId)
                .execute(client);

            this.setState({ ...this.state, balance: balance.hbars.toString() });
        } catch (err) {
            this.setState({ ...this.state, error: err.toString() });
        }

        try {
            const mnemonic = await Mnemonic.generate12();

            this.setState({ ...this.state, mnemonic: mnemonic.toString() });
        } catch (err) {
            this.setState({ ...this.state, error: err.toString() });
        }
    }

    render() {
        let transactionId = null;
        if (this.state.transactionId != null) {
            transactionId = <Text testID="transactionId">TransactionId: {this.state.transactionId}</Text>
        }

        let info = null;
        if (this.state.info != null) {
            info = <Text testID="info">Info: {this.state.info}</Text>
        }

        let balance = null;
        if (this.state.balance != null) {
            balance = <Text testID="balance">Balance: {this.state.balance}</Text>
        }

        let mnemonic = null;
        if (this.state.mnemonic != null) {
            mnemonic = <Text testID="mnemonic">Mnemonic: {this.state.mnemonic}</Text>
        }

        let error = null;
        if (this.state.error != null) {
            error = <Text testID="error">Error: {this.state.error}</Text>
        }

        return (
            <View style={styles.container}>
                {transactionId}
                {info}
                {balance}
                {mnemonic}
                {error}
                <StatusBar style="auto" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
