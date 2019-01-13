# Copy anything 🎭

An optimised way to copy'ing an object. A small and simple integration.

## Motivation

I created this package because I tried a lot of similar packages that do copy'ing/cloning of objects. But all had its quirks, and *all of them break things they are not supposed to break*... 😞

I was looking for:

- a simple copy function like `JSON.parse(JSON.stringify(object))`
- props must lose any reference to original object
- **does not break special class instances**　‼️

This last one is crucial! So many libraries use custom classes that create objects with special prototypes, and such objects all break when trying to copy them inproperly. So we gotta be careful!

copy-anything will copy objects and nested properties, but only as long as they're "plain objects". As soon as a sub-prop is not a "plain object" and has a special prototype, it will copy that instance over "as is". ♻️

## Meet the family

- [copy-anything 🎭](https://github.com/mesqueeb/copy-anything)
- [merge-anything 🥡](https://github.com/mesqueeb/merge-anything)
- [filter-anything ⚔️](https://github.com/mesqueeb/filter-anything)
- [find-and-replace-anything 🎣](https://github.com/mesqueeb/find-and-replace-anything)
- [compare-anything 🛰](https://github.com/mesqueeb/compare-anything)
- [flatten-anything 🏏](https://github.com/mesqueeb/flatten-anything)
- [is-what 🙉](https://github.com/mesqueeb/is-what)

## Usage

```js
import copy from 'copy-anything'

const target = {name: 'Ditto', type: {water: true}}
const copy = copy(target)

// now if we change a nested prop like the type:
copy.type.water = false
copy.type.fire = true

// then the original object will still be the same:
// target.type.water === true
// target.type.fire === undefined
```

## Source code

The source code is literally just these lines. Most of the magic comes from the isPlainObject function from the [is-what library](https://github.com/mesqueeb/is-what).

```TypeScript
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
```
