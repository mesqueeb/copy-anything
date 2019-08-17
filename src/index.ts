import { isPlainObject, isArray } from 'is-what'

function assignProp (carry, key, newVal, originalObject, nonenumerable) {
  const propType = originalObject.propertyIsEnumerable(key)
    ? 'enumerable'
    : 'nonenumerable'
  if (propType === 'enumerable') carry[key] = newVal
  if (nonenumerable && propType === 'nonenumerable') {
    Object.defineProperty(carry, key, {
      value: newVal,
      enumerable: false,
      writable: true,
      configurable: true
    })
  }
}

export type Options = {props: any[], nonenumerable: boolean}

/**
 * Copy (clone) an object and all its props recursively to get rid of any prop referenced of the original object. Arrays are also cloned, however objects inside arrays are still linked.
 *
 * @export
 * @param {*} target Target can be anything
 * @param {*} options Options can be `props` or `nonenumerable`.
 * @returns {*} the target with replaced values
 */
export default function copy (
  target: any,
  options: Options = {props: null, nonenumerable: false}
): any {
  if (isArray(target)) return target.map(i => copy(i, options))
  if (!isPlainObject(target)) return target
  const props = Object.getOwnPropertyNames(target)
  const symbols = Object.getOwnPropertySymbols(target)
  return [...props, ...symbols]
    .reduce((carry, key) => {
      if (isArray(options.props) && !options.props.includes(key)) {
        return carry
      }
      // @ts-ignore
      const val = target[key]
      const newVal = copy(val, options)
      assignProp(carry, key, newVal, target, options.nonenumerable)
      return carry
    }, {})
}
