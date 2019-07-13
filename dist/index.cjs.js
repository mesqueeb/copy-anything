'use strict';

var isWhat = require('is-what');

function assignProp(carry, key, newVal, originalObject) {
    var propType = originalObject.propertyIsEnumerable(key)
        ? 'enumerable'
        : 'nonenumerable';
    if (propType === 'enumerable')
        carry[key] = newVal;
    if (propType === 'nonenumerable') {
        Object.defineProperty(carry, key, {
            value: newVal,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
}
/**
 * Copy (clone) an object and all its props recursively to get rid of any prop referenced of the original object. Arrays are also cloned, however objects inside arrays are still linked.
 *
 * @export
 * @param {*} target Target can be anything
 * @returns {*} the target with replaced values
 */
function copy(target) {
    if (isWhat.isArray(target))
        return target.map(function (i) { return copy(i); });
    if (!isWhat.isPlainObject(target))
        return target;
    var props = Object.getOwnPropertyNames(target);
    var symbols = Object.getOwnPropertySymbols(target);
    return props.concat(symbols).reduce(function (carry, key) {
        // @ts-ignore
        var val = target[key];
        var newVal = copy(val);
        assignProp(carry, key, newVal, target);
        return carry;
    }, {});
}

module.exports = copy;
