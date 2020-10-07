/**
 * @param {Uint8Array} array1
 * @param {Uint8Array} array2
 * @returns {boolean}
 */
export function arrayEqual(array1, array2) {
    if (array1 === array2) {
        return true;
    }

    if (array1.byteLength !== array2.byteLength) {
        return false;
    }

    const view1 = new DataView(array1.buffer);
    const view2 = new DataView(array2.buffer);

    let i = array1.byteLength;

    while (i--) {
        if (view1.getUint8(i) !== view2.getUint8(i)) {
            return false;
        }
    }

    return true;
}

/**
 * @param {Uint8Array} array
 * @param {Uint8Array} arrayPrefix
 * @returns {boolean}
 */
export function arrayStartsWith(array, arrayPrefix) {
    // console.log("Lengths", array.byteLength, arrayPrefix.byteLength);
    if (array.byteLength < arrayPrefix.byteLength) {
        return false;
    }

    // for (let j = 0; j < arrayPrefix.length; j++) {
    //     console.log("Values", array[j], arrayPrefix[j]);
    // }

    // console.log("-----------------------------------------");

    // const view1 = new DataView(array.buffer, 0, arrayPrefix.byteLength);
    // const view2 = new DataView(arrayPrefix.buffer);

    let i = arrayPrefix.byteLength;

    while (i--) {
        // console.log("Values", view1.getUint8(i), view2.getUint8(i));
        // if (view1.getUint8(i) !== view2.getUint8(i)) {
        if (array[i] !== arrayPrefix[i]) {
            return false;
        }
    }

    return true;
}
