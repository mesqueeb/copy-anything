'use strict';

var isWhat = require('is-what');

/**
 * Copy (clone) an object and all its props recursively to get rid of any prop referenced of the original object.
 *
 * @export
 * @param {*} target Target can be anything
 * @returns {*} the target with replaced values
 */
function copy(target) {
    if (!isWhat.isPlainObject(target))
        return target;
    return Object.keys(target)
        .reduce(function (carry, key) {
        var val = target[key];
        carry[key] = copy(val);
        return carry;
    }, {});
}

module.exports = copy;
