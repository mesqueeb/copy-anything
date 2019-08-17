import { isArray, isPlainObject } from 'is-what';

function assignProp(carry, key, newVal, originalObject, nonenumerable) {
    var propType = originalObject.propertyIsEnumerable(key)
        ? 'enumerable'
        : 'nonenumerable';
    if (propType === 'enumerable')
        carry[key] = newVal;
    if (nonenumerable && propType === 'nonenumerable') {
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
 * @param {*} options Options can be `props` or `nonenumerable`.
 * @returns {*} the target with replaced values
 */
function copy(target, options) {
    if (options === void 0) { options = { props: null, nonenumerable: false }; }
    if (isArray(target))
        return target.map(function (i) { return copy(i, options); });
    if (!isPlainObject(target))
        return target;
    var props = Object.getOwnPropertyNames(target);
    var symbols = Object.getOwnPropertySymbols(target);
    return props.concat(symbols).reduce(function (carry, key) {
        if (isArray(options.props) && !options.props.includes(key)) {
            return carry;
        }
        // @ts-ignore
        var val = target[key];
        var newVal = copy(val, options);
        assignProp(carry, key, newVal, target, options.nonenumerable);
        return carry;
    }, {});
}

export default copy;
