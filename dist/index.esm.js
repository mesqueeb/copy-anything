import { isArray, isPlainObject } from 'is-what';

/**
 * Copy (clone) an object and all its props recursively to get rid of any prop referenced of the original object. Arrays are also cloned, however objects inside arrays are still linked.
 *
 * @export
 * @param {*} target Target can be anything
 * @returns {*} the target with replaced values
 */
function copy(target) {
    if (isArray(target))
        return target.map(function (i) { return copy(i); });
    if (!isPlainObject(target))
        return target;
    return Object.keys(target)
        .reduce(function (carry, key) {
        var val = target[key];
        carry[key] = copy(val);
        return carry;
    }, {});
}

export default copy;
