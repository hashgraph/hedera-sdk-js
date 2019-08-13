
import { encodeKey, decodeKeyPair } from '../src/Keys';

const keyStr = '302e020100300506032b657004220420db484b828e64b2d8f12ce3c0a0e93a0b8cce7af1bb8f39c97732394482538e10';

test('key encoding functions correctly', () => {
    const { privateKey } = decodeKeyPair(keyStr);
    expect(encodeKey(privateKey).toString('hex')).toEqual(keyStr);
});
