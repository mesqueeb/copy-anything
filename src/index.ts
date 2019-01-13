import { isPlainObject } from 'is-what'

/**
 * Copy (clone) an object and all its props recursively to get rid of any prop referenced of the original object.
 *
 * @export
 * @param {*} target Target can be anything
 * @returns {*} the target with replaced values
 */
export default function copy (target: any): any {
  if (!isPlainObject(target)) return target
  return Object.keys(target)
    .reduce((carry, key) => {
      const val = target[key]
      carry[key] = copy(val)
      return carry
    }, {})
}
