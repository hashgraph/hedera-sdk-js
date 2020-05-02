describe('Mnemonics', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:1234/')
  })

  it('should be same as node keys', async () => {
    await page.evaluate(async () => {
      const MNEMONIC = "inmate flip alley wear offer often piece magnet surge toddler submit right radio absent pear floor belt raven price stove replace reduce plate home"; 
      const KEY_STR = "302e020100300506032b657004220420853f15aecd22706b105da1d709b4ac05b4906170c2b9c7495dff9af49e1391da";
      const KEY_DERIVE_STR = "302e020100300506032b657004220420f8dcc99a1ced1cc59bc2fee161c26ca6d6af657da9aa654da724441343ecd16f";

      const key = await window.hedera.Ed25519PrivateKey.fromMnemonic(MNEMONIC, "");
      window.assert(KEY_STR, key.toString());
      window.assert(KEY_DERIVE_STR, (await key.derive2(0)).toString());
    });
  })
})
