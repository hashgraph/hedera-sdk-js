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
            transactionId: "Waiting for data",
            accountId: "Waiting for data",
            balance: "Waiting for data",
            mnemonic: "Waiting for data"
        };
    }

    componentDidMount() {
        new TransferTransaction()
            .addHbarTransfer(operatorId, -1)
            .addHbarTransfer("0.0.3", 1)
            .execute(client)
            .then((response) => {
                this.setState({ ...this.state, transactionId: response.transactionId.toString() });
            })
            .catch((err) => {
                this.setState({ ...this.state, transactionId: err.toString() });
            });
        new AccountInfoQuery()
            .setAccountId(operatorId)
            .execute(client)
            .then((info) => {
                this.setState({ ...this.state, accountId: info.accountId.toString() });
            })
            .catch((err) => {
                this.setState({ ...this.state, accountId: err.toString() });
            });
        new AccountBalanceQuery()
            .setAccountId(operatorId)
            .execute(client)
            .then((balance) => {
                this.setState({ ...this.state, balance: balance.hbars.toString() });
            })
            .catch((err) => {
                this.setState({ ...this.state, balance: err.toString() });
            });
        Mnemonic.generate12()
            .then((mnemonic) => {
                this.setState({ ...this.state, mnemonic: mnemonic.toString() });
            })
            .catch((err) => {
                this.setState({ ...this.state, mnemonic: err.toString() });
            });
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>TransactionId: {this.state.transactionId}</Text>
                <Text>AccountInfo.accountId: {this.state.accountId}</Text>
                <Text>Balance: {this.state.balance}</Text>
                <Text>Random Mnemonic: {this.state.mnemonic}</Text>
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
