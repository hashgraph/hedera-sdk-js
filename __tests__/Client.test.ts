import { __testExports } from '../src/Client';

const key = Uint8Array.of(
    -37, 72, 75, -126, -114, 100, -78, -40, -15, 44, -29, -64, -96, -23, 58, 11, -116, -50,
    122, -15, -69, -113, 57, -55, 119, 50, 57, 68, -126, 83, -114, 16);

const keyStr = '302e020100300506032b657004220420db484b828e64b2d8f12ce3c0a0e93a0b8cce7af1bb8f39c97732394482538e10';

test('encodeKey produces correctly encoded string', () => {
    expect(__testExports.encodeKey(key)).toEqual(keyStr);
});

test('decodeKey returns correct value', () => {
    expect(__testExports.decodeKey(keyStr)).toEqual(key);
});
