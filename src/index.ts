import { isPlainObject, isArray } from 'is-what'

function assignProp (carry, key, newVal, originalObject) {
  const propType = originalObject.propertyIsEnumerable(key)
    ? 'enumerable'
    : 'nonenumerable'
  if (propType === 'enumerable') carry[key] = newVal
  if (propType === 'nonenumerable') {
    Object.defineProperty(carry, key, {
      value: newVal,
      enumerable: false,
      writable: true,
      configurable: true
    })
  }
}

/**
 * Copy (clone) an object and all its props recursively to get rid of any prop referenced of the original object. Arrays are also cloned, however objects inside arrays are still linked.
 *
 * @export
 * @param {*} target Target can be anything
 * @returns {*} the target with replaced values
 */
export default function copy (target: any): any {
  if (isArray(target)) return target.map(i => copy(i))
  if (!isPlainObject(target)) return target
  const props = Object.getOwnPropertyNames(target)
  const symbols = Object.getOwnPropertySymbols(target)
  return [...props, ...symbols]
    .reduce((carry, key) => {
      // @ts-ignore
      const val = target[key]
      const newVal = copy(val)
      assignProp(carry, key, newVal, target)
      return carry
    }, {})
}
