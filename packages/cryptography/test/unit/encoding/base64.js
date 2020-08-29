import * as base64 from "../../../src/encoding/base64.js";
import * as utf8 from "../../../src/encoding/utf8.js";

const encoded =
    "TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4gUGhhc2VsbHVzIGNvbnNlY3RldHVyIGV4IGRpYW0sIGV0IGZhdWNpYnVzIGxpYmVybyB1bHRyaWNpZXMgaWQuIENyYXMgY29uc2VjdGV0dXIgdmVsaXQgbGFjdXMsIHZlbCBwdWx2aW5hciBtYXVyaXMgZGlnbmlzc2ltIHNpdCBhbWV0LiBOdWxsYSB1dCBtb2xlc3RpZSBtYXNzYSwgcXVpcyB2dWxwdXRhdGUgZXJhdC4gVml2YW11cyBhIG1hdXJpcyBxdWFtLiBOdWxsYSB2dWxwdXRhdGUgY29uc2VjdGV0dXIgY29udmFsbGlzLiBDdXJhYml0dXIgdXQgdGVtcG9yIGxhY3VzLiBNb3JiaSBhdWN0b3IgdmVsaXQgZXQgbmliaCBmYXVjaWJ1cyBtYXhpbXVzLiBWZXN0aWJ1bHVtIGV1IHRvcnRvciB1bHRyaWNpZXMsIGNvbmRpbWVudHVtIGZlbGlzIHZlbCwgc3VzY2lwaXQgbGVvLiBWZXN0aWJ1bHVtIGxhb3JlZXQsIG9yY2kgdXQgc3VzY2lwaXQgc29sbGljaXR1ZGluLCBuaXNpIHNhcGllbiBhbGlxdWV0IGVuaW0sIGV1IHZhcml1cyByaXN1cyBtYWduYSB2aXRhZSBuaXNsLiBEb25lYyBtYXVyaXMgbGFjdXMsIHBoYXJldHJhIG5lYyB2YXJpdXMgZWdldCwgc2NlbGVyaXNxdWUgc2NlbGVyaXNxdWUgcHVydXMuIFBlbGxlbnRlc3F1ZSBwb3J0YSB2b2x1dHBhdCBlbmltIHZpdGFlIGJsYW5kaXQu";

const decoded =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus consectetur ex diam, et faucibus libero ultricies id. Cras consectetur velit lacus, vel pulvinar mauris dignissim sit amet. Nulla ut molestie massa, quis vulputate erat. Vivamus a mauris quam. Nulla vulputate consectetur convallis. Curabitur ut tempor lacus. Morbi auctor velit et nibh faucibus maximus. Vestibulum eu tortor ultricies, condimentum felis vel, suscipit leo. Vestibulum laoreet, orci ut suscipit sollicitudin, nisi sapien aliquet enim, eu varius risus magna vitae nisl. Donec mauris lacus, pharetra nec varius eget, scelerisque scelerisque purus. Pellentesque porta volutpat enim vitae blandit.";

describe("hedera/base64", function () {
    it("should decode correctly", function () {
        expect(utf8.decode(base64.decode(encoded))).to.deep.equal(decoded);
    });
});
