import {getResponseCodeName, ResponseCodeEnum} from "../src/errors";

describe('getResponseCodeName()', () => {
    it('returns the correct name for the right response code', () => {
        for (const [name, code] of Object.entries(ResponseCodeEnum)) {
            expect(getResponseCodeName(code)).toStrictEqual(name);
        }
    });
});
