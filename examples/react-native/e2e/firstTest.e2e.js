describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should be able to see transaction ID from TransferTransaction', async () => {
    await expect(element(by.id('transactionId'))).toBeVisible();
  });

  it('should be able to see info from AccountInfoQuery', async () => {
    await expect(element(by.id('info'))).toBeVisible();
  });

  it('should be able to balance from AccountBalanceQuery', async () => {
    await expect(element(by.id('balance'))).toBeVisible();
  });

  it('should be able to see a generated mnemonic', async () => {
    await expect(element(by.id('mnemonic'))).toBeVisible();
  });

  it('should not see random node', async () => {
    await expect(element(by.id('random'))).not.toBeVisible();
  });
});
