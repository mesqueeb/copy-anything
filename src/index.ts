import { isPlainObject, isArray } from 'is-what'

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
  return Object.keys(target)
    .reduce((carry, key) => {
      const val = target[key]
      carry[key] = copy(val)
      return carry
    }, {})
}
