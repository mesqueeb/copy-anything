import { klona } from 'klona'
import { expect, test } from 'vitest'
import { copy } from '../src/index.js'

/**
 * The README's `## Benchmark` section claims specific things about what klona does differently.
 * These tests assert both halves of each claim, so the comparison table can't quietly rot.
 *
 * A failure here means either copy-anything regressed or klona changed — check which, then update
 * the README table to match.
 */

test('README: unlimited nesting depth', () => {
  const depth = 10_000
  let deep: any = { value: 'leaf' }
  for (let i = 0; i < depth; i++) deep = { nested: deep }

  expect(() => klona(deep)).toThrow(RangeError)

  let node = copy(deep)
  let seen = 0
  while (node.nested) {
    node = node.nested
    seen++
  }
  expect(seen).toEqual(depth)
  expect(node.value).toEqual('leaf')
})

test('README: circular references', () => {
  const user: any = { name: 'Luca' }
  user.self = user

  expect(() => klona(user)).toThrow(RangeError)

  const copied = copy(user)
  expect(copied.self).toBe(copied)
  expect(copied).not.toBe(user)
})

test('README: shared references stay shared', () => {
  const shared = { count: 0 }
  const original = { a: shared, b: shared }

  const klonad = klona(original)
  expect(klonad.a).not.toBe(klonad.b)

  const copied = copy(original)
  expect(copied.a).toBe(copied.b)
  expect(copied.a).not.toBe(shared)
})

test('README: symbol keys', () => {
  const key = Symbol('id')
  const original = { [key]: 'value', name: 'Ditto' }

  expect(klona(original)[key]).toBeUndefined()
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

  expect((klona(original) as any).id).toBeUndefined()
  expect((copy(original) as any).id).toBeUndefined()
  expect((copy(original, { nonenumerable: true }) as any).id).toEqual('001')
})

test('README: class instances are left alone', () => {
  class User {
    id: number
    constructor(id?: number) {
      if (id === undefined) throw new Error('id is required')
      this.id = id
    }
  }
  const instance = new User(1)
  const original = { user: instance }

  // klona rebuilds instances with `new x.constructor()`, which a required argument rejects
  expect(() => klona(original)).toThrow('id is required')

  expect(copy(original).user).toBe(instance)
})

test('README: Date / Map / Set / RegExp are copied over as is, klona clones them', () => {
  const date = new Date(0)
  const map = new Map([['key', 1]])
  const set = new Set([1])
  const regex = /pokemon/g
  const original = { date, map, set, regex }

  const copied = copy(original)
  expect(copied.date).toBe(date)
  expect(copied.map).toBe(map)
  expect(copied.set).toBe(set)
  expect(copied.regex).toBe(regex)

  const klonad = klona(original)
  expect(klonad.date).not.toBe(date)
  expect(klonad.date).toBeInstanceOf(Date)
  expect(klonad.map).not.toBe(map)
  expect(klonad.map).toBeInstanceOf(Map)
})

test('README: functions in the input survive, structuredClone throws', () => {
  const fn = (): number => 1
  const original = { fn, name: 'Ditto' }

  expect(() => structuredClone(original)).toThrow()

  expect(copy(original).fn).toBe(fn)
  expect(klona(original).fn).toBe(fn)
})
