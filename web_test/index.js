window.hedera = require("@hashgraph/sdk");

function assert(left, right) {
  if (left != right) {
    throw new Error(`\`left\` != \`right\` : ${left} != ${right}`);;
  }
}

window.assert = assert;
