import _ from "lodash";
import { AccountId } from "@hashgraph/sdk";

function component() {
  const element = document.createElement('div');

  const accountId = AccountId.fromString("0.0.4");

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = _.join(['Hello', accountId.toString()], ' ');

  return element;
}

document.body.appendChild(component());
