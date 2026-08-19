import cloneDeep from 'lodash.clonedeep'
import { expect, test } from 'vitest'
import { copy } from '../src/index.js'

/**
 * Asserts the lodash.cloneDeep column of the README's comparison table. A failure means either
 * copy-anything regressed or lodash changed — check which, then update the README to match.
 */

test('README: unlimited nesting depth', () => {
  const depth = 10_000
  let deep: any = { value: 'leaf' }
  for (let i = 0; i < depth; i++) deep = { nested: deep }

  expect(() => cloneDeep(deep)).toThrow(RangeError)

  let node = copy(deep)
  let seen = 0
  while (node.nested) {
    node = node.nested
    seen++
  }
  expect(seen).toEqual(depth)
})

test('README: lodash handles circular and shared references too', () => {
  const user: any = { name: 'Luca' }
  user.self = user
  const cloned = cloneDeep(user)
  expect(cloned.self).toBe(cloned)
  expect(cloned).not.toBe(user)

  const shared = { count: 0 }
  const clonedShared = cloneDeep({ a: shared, b: shared })
  expect(clonedShared.a).toBe(clonedShared.b)
  expect(clonedShared.a).not.toBe(shared)
})

test('README: lodash copies symbol keys too', () => {
  const key = Symbol('id')
  const original = { [key]: 'value' }

  expect(cloneDeep(original)[key]).toEqual('value')
  expect(copy(original)[key]).toEqual('value')
})

test('README: non-enumerable props', () => {
  const original = { name: 'Bulbasaur' }
  Object.defineProperty(original, 'id', {
    value: '001',
    writable: true,
    enumerable: false,
    configurable: true,
  })

  expect((cloneDeep(original) as any).id).toBeUndefined()
  expect((copy(original, { nonenumerable: true }) as any).id).toEqual('001')
})

test('README: class instances are left alone', () => {
  class Pokemon {
    name: string
    constructor(name: string) {
      this.name = name
    }
  }
  const instance = new Pokemon('Ditto')
  const original = { pokemon: instance }

  // lodash clones the instance rather than passing it through, though it does keep the prototype
  // and does not re-run the constructor
  const cloned = cloneDeep(original)
  expect(cloned.pokemon).not.toBe(instance)
  expect(cloned.pokemon).toBeInstanceOf(Pokemon)

  expect(copy(original).pokemon).toBe(instance)
})

test('README: Date / Map / Set / RegExp are copied over as is, lodash clones them', () => {
  const date = new Date(0)
  const map = new Map([['key', 1]])
  const original = { date, map }

  const copied = copy(original)
  expect(copied.date).toBe(date)
  expect(copied.map).toBe(map)

  const cloned = cloneDeep(original)
  expect(cloned.date).not.toBe(date)
  expect(cloned.date).toBeInstanceOf(Date)
  expect(cloned.map).not.toBe(map)
  expect(cloned.map).toBeInstanceOf(Map)
})

test('README: functions in the input survive', () => {
  const fn = (): number => 1
  const original = { fn }

  expect(cloneDeep(original).fn).toBe(fn)
  expect(copy(original).fn).toBe(fn)
})
