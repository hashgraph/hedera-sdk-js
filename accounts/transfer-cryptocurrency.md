# Transfer cryptocurrency

```javascript
await new CryptoTransferTransaction()
     .addSender(operatorAccount, 10)
     .addRecipient("0.0.3", 10)
     .setMemo("sdk example")
     .execute(client);
```

