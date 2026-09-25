import { expect, test } from 'vitest'
import { copy } from '../src/index.js'

/**
 * Asserts the structuredClone column of the README's comparison table. structuredClone is the
 * platform's own deep clone, which makes it the most interesting comparison: it recurses, so it
 * runs out of call stack at a _lower_ depth than copy-anything does.
 */

test('README: unlimited nesting depth', () => {
  const depth = 10_000
  let deep: any = { value: 'leaf' }
  for (let i = 0; i < depth; i++) deep = { nested: deep }

  expect(() => structuredClone(deep)).toThrow(RangeError)

  let node = copy(deep)
  let seen = 0
  while (node.nested) {
    node = node.nested
    seen++
  }
  expect(seen).toEqual(depth)
})

test('README: structuredClone handles circular and shared references too', () => {
  const user: any = { name: 'Luca' }
  user.self = user
  const cloned = structuredClone(user)
  expect(cloned.self).toBe(cloned)
  expect(cloned).not.toBe(user)

  const shared = { count: 0 }
  const clonedShared = structuredClone({ a: shared, b: shared })
  expect(clonedShared.a).toBe(clonedShared.b)
  expect(clonedShared.a).not.toBe(shared)
})

test('README: symbol keys', () => {
  const key = Symbol('id')
  const original = { [key]: 'value', name: 'Ditto' }

  // structuredClone drops symbol keys silently rather than throwing
  expect(structuredClone(original)[key]).toBeUndefined()
  expect(structuredClone(original).name).toEqual('Ditto')

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

  expect((structuredClone(original) as any).id).toBeUndefined()
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

  // structuredClone keeps the data but throws the prototype away, so it comes back a plain object
  const cloned = structuredClone(original)
  expect(cloned.pokemon).not.toBe(instance)
  expect(cloned.pokemon).not.toBeInstanceOf(Pokemon)
  expect(cloned.pokemon.name).toEqual('Ditto')

  expect(copy(original).pokemon).toBe(instance)
})

test('README: Date / Map / Set / RegExp are copied over as is, structuredClone clones them', () => {
  const date = new Date(0)
  const map = new Map([['key', 1]])
  const original = { date, map }

  const copied = copy(original)
  expect(copied.date).toBe(date)
  expect(copied.map).toBe(map)

  const cloned = structuredClone(original)
  expect(cloned.date).not.toBe(date)
  expect(cloned.date).toBeInstanceOf(Date)
  expect(cloned.map).not.toBe(map)
  expect(cloned.map).toBeInstanceOf(Map)
})

test('README: functions in the input make structuredClone throw', () => {
  const fn = (): number => 1
  const original = { fn, name: 'Ditto' }

  expect(() => structuredClone(original)).toThrow()

  expect(copy(original).fn).toBe(fn)
})
