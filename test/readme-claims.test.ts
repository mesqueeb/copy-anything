/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect, test } from 'vitest'
import { copy } from '../src/index.js'

/** One test per bullet in the README's "I was looking for" list, taken at its word. */

test('README claim: props must lose any reference to original object', () => {
  const original = { a: 1, nested: { b: 2 }, list: [{ c: 3 }] }
  const copied = copy(original)

  expect(copied.nested).not.toBe(original.nested)
  expect(copied.list).not.toBe(original.list)
  expect(copied.list[0]).not.toBe(original.list[0])

  // ...but only for plain props. A non-plain prop is copied over as is, which means it is still
  // shared with the original, and mutating it through the copy is visible on the original.
  const original2 = { caughtAt: new Date('2020-01-01'), stats: new Map([['hp', 48]]) }
  const copied2 = copy(original2)

  expect(copied2.caughtAt).toBe(original2.caughtAt)
  copied2.caughtAt.setFullYear(1999)
  expect(original2.caughtAt.getFullYear()).toEqual(1999)

  copied2.stats.set('hp', 999)
  expect(original2.stats.get('hp')).toEqual(999)
})

test('README claim: works with arrays and objects in arrays', () => {
  const original = [{ name: 'Squirtle' }]
  const copied = copy(original)

  copied[0]!.name = 'Wartortle'
  expect(original[0]!.name).toEqual('Squirtle')
})

test('README claim: supports symbols', () => {
  const key = Symbol('id')
  expect(copy({ [key]: 'value' })[key]).toEqual('value')
})

test('README claim: can copy non-enumerable props as well', () => {
  const original = { name: 'Bulbasaur' }
  Object.defineProperty(original, 'id', {
    value: '001',
    writable: true,
    enumerable: false,
    configurable: true,
  })

  expect((copy(original, { nonenumerable: true }) as any).id).toEqual('001')
})

test('README claim: does not break special class instances', () => {
  class Pokemon {
    constructor(public name: string) {}
  }
  const instance = new Pokemon('Ditto')

  expect(copy({ instance }).instance).toBe(instance)
  expect(copy({ instance }).instance).toBeInstanceOf(Pokemon)
})

test('a plain object reached through a class instance stays linked to the original', () => {
  class Holder {
    constructor(public ref: { v: number }) {}
  }
  const shared = { v: 1 }
  const holder = new Holder(shared)
  const original = { direct: shared, holder }

  const copied = copy(original)

  // the path that copy-anything cloned is detached
  expect(copied.direct).not.toBe(shared)

  // the path through the class instance is not, because the instance is copied over as is
  expect(copied.holder).toBe(holder)
  expect(copied.holder.ref).toBe(shared)
  copied.holder.ref.v = 777
  expect(shared.v).toEqual(777)
  expect(copied.direct.v).toEqual(1)
})
