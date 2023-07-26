const {sdk} = require("./sdk_data");

/**
 * Very primitive catch-all mapping prototype
 * @returns {Promise<*>}
 * @param callClass
 * @param methods An array of methods names and params to be called on the callClass
 */
module.exports = async function ({callClass, methods}) {
    const {[callClass]: cl} = require("@hashgraph/sdk");

    let currentObject = new cl();
    for (let {name, param} of methods) {
        console.log("." + name + "(" + param + ")")
        if (param === "client") {
            param = sdk.getClient()
        }

        if (typeof currentObject[name] === 'function') {
            currentObject = await currentObject[name](param)
        } else if (typeof cl[name] === 'function') {
            currentObject = await cl[name](param)
        }else if (typeof currentObject[name] === 'object') {
            currentObject = await currentObject[name]
        } else {
            throw Error(callClass + "." + name + "() isn't a function")
        }

    }
    return currentObject
};
