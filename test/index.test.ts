import { expect, test } from 'vitest'
import { copy } from '../src/index.js'

test('copy - change original', () => {
  const original: { a: number; b: number; c: { d: number; e?: string } } = {
    a: 0,
    b: 0,
    c: { d: 0 },
  }
  const copied = copy(original)
  expect(copied).toEqual(original)
  // change original
  original.a = 1
  expect(original.a).toEqual(1)
  expect(copied.a).toEqual(0)
  original.c.d = 1
  expect(original.c.d).toEqual(1)
  expect(copied.c.d).toEqual(0)
  original.c.e = 'new'
  expect(original.c.e).toEqual('new')
  expect(copied.c.e).toEqual(undefined)
})

test('copy - change copied', () => {
  const original: { a: boolean; b: string; c: { d: boolean; e?: string } } = {
    a: false,
    b: '',
    c: { d: false },
  }
  const copied = copy(original)
  // change copied
  copied.a = true
  expect(copied.a).toEqual(true)
  expect(original.a).toEqual(false)
  copied.c.d = true
  expect(copied.c.d).toEqual(true)
  expect(original.c.d).toEqual(false)
  copied.c.e = 'new'
  expect(copied.c.e).toEqual('new')
  expect(original.c.e).toEqual(undefined)
})

test('Arrays in objects - change original', () => {
  const original = { a: [1, 2], c: { d: ['a'] } }
  const copied = copy(original)
  expect(copied).toEqual(original)
  // change original
  original.a.push(3)
  expect(original.a).toEqual([1, 2, 3])
  expect(copied.a).toEqual([1, 2])
  original.c.d.splice(0, 0, 'z')
  expect(original.c.d).toEqual(['z', 'a'])
  expect(copied.c.d).toEqual(['a'])
})

test('Arrays in objects - change copied', () => {
  const original = { a: [1, 2], c: { d: ['a'] } }
  const copied = copy(original)
  expect(copied).toEqual(original)
  // change copied
  copied.a.push(3)
  expect(copied.a).toEqual([1, 2, 3])
  expect(original.a).toEqual([1, 2])
  copied.c.d.splice(0, 0, 'z')
  expect(copied.c.d).toEqual(['z', 'a'])
  expect(original.c.d).toEqual(['a'])
})

test('Arrays with objects in objects - change original', () => {
  const original = { a: [{ a: 1 }], c: { d: [{ b: 1 }] } }
  const copied = copy(original)
  expect(copied).toEqual(original)
  // change original
  original.a[0].a = 2
  expect(original.a).toEqual([{ a: 2 }])
  expect(copied.a).toEqual([{ a: 1 }])
  original.c.d[0].b = 2
  expect(original.c.d).toEqual([{ b: 2 }])
  expect(copied.c.d).toEqual([{ b: 1 }])
})

test('Arrays with objects in objects - change copied', () => {
  const original = { a: [{ a: 1 }], c: { d: [{ b: 1 }] } }
  const copied = copy(original)
  expect(copied).toEqual(original)
  // change copied
  copied.a[0].a = 2
  expect(copied.a).toEqual([{ a: 2 }])
  expect(original.a).toEqual([{ a: 1 }])
  copied.c.d[0].b = 2
  expect(copied.c.d).toEqual([{ b: 2 }])
  expect(original.c.d).toEqual([{ b: 1 }])
})

test('Arrays', () => {
  const original = [1, 2, 3, 4]
  const copied = copy(original)
  expect(copied).toEqual(original)
  copied.splice(0, 0, 0)
  expect(original).toEqual([1, 2, 3, 4])
  expect(copied).toEqual([0, 1, 2, 3, 4])
})

test('non objects 1', () => {
  const original = 'ha'
  const copied = copy(original)
  expect(copied).toEqual(original)
})

test('non objects 2', () => {
  const original = 1
  const copied = copy(original)
  expect(copied).toEqual(original)
})

test('non objects 3', () => {
  const original = undefined
  const copied = copy(original)
  expect(copied).toEqual(original)
})

test('special objects 1', () => {
  const original = new Date()
  const copied = copy(original)
  expect(copied).toEqual(original)
  // toEqual compares dates by value, so assert it is the very same instance and was not cloned
  expect(copied).toBe(original)
})

test('special objects 2', () => {
  const original = {}
  const copied = copy(original)
  expect(copied).toEqual(original)
})

test('symbols as keys', () => {
  const mySymbol = Symbol('mySymbol')
  const original: { [key in string | symbol]: number | string } = { value: 42, [mySymbol]: 'hello' }
  const copied = copy(original)
  // change original
  original.value = 1
  original[mySymbol] = 2
  expect(copied.value).toEqual(42)
  expect(copied[mySymbol]).toEqual('hello')
  expect(original.value).toEqual(1)
  expect(original[mySymbol]).toEqual(2)
})

test('nonenumerable keys - turned on', () => {
  const mySymbol = Symbol('mySymbol')
  const original: { [key in string | symbol]: number | string } = { value: 42 }
  Object.defineProperty(original, 'id', {
    value: 1,
    writable: true,
    enumerable: false,
    configurable: true,
  })
  Object.defineProperty(original, mySymbol, {
    value: 'original',
    writable: true,
    enumerable: false,
    configurable: true,
  })
  const copied = copy(original, { nonenumerable: true })
  // change original
  original.id = 100
  original[mySymbol] = 'new'
  original.value = 300
  expect(copied.value).toEqual(42)
  expect(copied.id).toEqual(1)
  expect(copied[mySymbol]).toEqual('original')
  expect(Object.keys(copied).length).toEqual(1)
  expect(Object.keys(copied).includes('value')).toEqual(true)
  expect(original.id).toEqual(100)
  expect(original[mySymbol]).toEqual('new')
  expect(original.value).toEqual(300)
  expect(Object.keys(original).length).toEqual(1)
})

test('nonenumerable keys - turned off', () => {
  const mySymbol = Symbol('mySymbol')
  const original: { [key in string | symbol]: number } = { value: 42 }
  Object.defineProperty(original, 'id', {
    value: 1,
    writable: true,
    enumerable: false,
    configurable: true,
  })
  Object.defineProperty(original, mySymbol, {
    value: 'original',
    writable: true,
    enumerable: false,
    configurable: true,
  })
  const copied = copy(original)
  // change original
  expect(copied.value).toEqual(42)
  expect(copied.id).toEqual(undefined)
  expect(copied[mySymbol]).toEqual(undefined)
})

test('specific props', () => {
  const mySymbol = Symbol('mySymbol')
  const mySymbol2 = Symbol('mySymbol')
  const original: { [key: symbol | string]: number } = { value: 42, value2: 24 }
  Object.defineProperty(original, 'id', {
    value: 1,
    writable: true,
    enumerable: false,
    configurable: true,
  })
  Object.defineProperty(original, mySymbol, {
    value: 'original',
    writable: true,
    enumerable: false,
    configurable: true,
  })
  Object.defineProperty(original, 'id2', {
    value: 2,
    writable: true,
    enumerable: false,
    configurable: true,
  })
  Object.defineProperty(original, mySymbol2, {
    value: 'original2',
    writable: true,
    enumerable: false,
    configurable: true,
  })
  // only enumerable
  const copied = copy(original, { props: [mySymbol, 'value', 'id'] })
  expect(copied.value).toEqual(42)
  expect(copied.id).toEqual(undefined)
  expect(copied[mySymbol]).toEqual(undefined)
  expect(copied.value2).toEqual(undefined)
  expect(copied.id2).toEqual(undefined)
  expect(copied[mySymbol2]).toEqual(undefined)
  expect(Object.keys(copied).length).toEqual(1)
  expect(Object.keys(copied).includes('value')).toEqual(true)
  expect(Object.keys(original).length).toEqual(2)

  // non-enumerable included
  const copied2 = copy(original, { props: [mySymbol, 'value', 'id'], nonenumerable: true })
  expect(copied2.value).toEqual(42)
  expect(copied2.id).toEqual(1)
  expect(copied2[mySymbol]).toEqual('original')
  expect(copied2.value2).toEqual(undefined)
  expect(copied2.id2).toEqual(undefined)
  expect(copied2[mySymbol2]).toEqual(undefined)
  expect(Object.keys(copied2).length).toEqual(1)
  expect(Object.keys(copied2).includes('value')).toEqual(true)
  expect(Object.keys(original).length).toEqual(2)
})

test('prototype pollution prevention', () => {
  const maliciousPayload = JSON.parse('{"__proto__": {"polluted": true}}')
  const original = { a: 1 }

  // Attempt prototype pollution
  const copied = copy(maliciousPayload)

  // Verify the prototype wasn't polluted
  expect((Object.prototype as any).polluted).toBeUndefined()
  expect((copied as any).__proto__).toBe(Object.prototype)

  // Verify the original object wasn't affected
  const originalCopy = copy(original)
  expect((originalCopy as any).__proto__).toBe(Object.prototype)
  expect((originalCopy as any).polluted).toBeUndefined()
})

/** Red test: `copy` recurses per nesting level, so deep input exhausts the JS call stack. */
test('deeply nested objects do not exhaust the call stack', () => {
  const depth = 10_000
  let original: any = { value: 'leaf' }
  for (let i = 0; i < depth; i++) original = { nested: original }

  const copied = copy(original)

  let node = copied
  for (let i = 0; i < depth; i++) node = node.nested
  expect(node.value).toEqual('leaf')
})

test('circular references are reproduced, not followed forever', () => {
  const original: any = { name: 'root' }
  original.self = original
  original.child = { parent: original }

  const copied = copy(original)

  expect(copied).not.toBe(original)
  expect(copied.self).toBe(copied)
  expect(copied.child.parent).toBe(copied)
  original.name = 'changed'
  expect(copied.name).toEqual('root')
})

test('two props pointing at one object share one copy', () => {
  const shared = { v: 1 }
  const copied = copy({ a: shared, b: shared })

  expect(copied.a).toBe(copied.b)
  expect(copied.a).not.toBe(shared)
  copied.a.v = 2
  expect(shared.v).toEqual(1)
})

test('array holes and length are preserved', () => {
  const original = [1, , 3] as (number | undefined)[]
  original.length = 5

  const copied = copy(original)

  expect(copied.length).toEqual(5)
  expect(1 in copied).toEqual(false)
  expect(copied[0]).toEqual(1)
  expect(copied[2]).toEqual(3)
})

test('prototype pollution prevention with nonenumerable option', () => {
  const maliciousPayload = JSON.parse('{"a": 1, "__proto__": {"polluted": true}}')

  const copied = copy(maliciousPayload, { nonenumerable: true })

  expect((Object.prototype as any).polluted).toBeUndefined()
  expect((copied as any).polluted).toBeUndefined()
  expect(Object.getPrototypeOf(copied)).toBe(Object.prototype)
  expect(copied.a).toEqual(1)
})

test('inherited enumerable props are not copied as own props', () => {
  ;(Object.prototype as any).inheritedByEveryone = 'leak'
  try {
    const copied = copy({ a: 1 })

    expect(Object.keys(copied)).toEqual(['a'])
    expect(Object.prototype.hasOwnProperty.call(copied, 'inheritedByEveryone')).toEqual(false)
  } finally {
    delete (Object.prototype as any).inheritedByEveryone
  }
})

test('special class instances are copied over as is', () => {
  class Pokemon {
    name: string
    constructor(name: string) {
      this.name = name
    }
  }
  const instance = new Pokemon('Ditto')
  const nullProto = Object.create(null)
  nullProto.a = 1
  const original = { instance, nullProto, nested: { instance } }

  const copied = copy(original)

  expect(copied.instance).toBe(instance)
  expect(copied.nested.instance).toBe(instance)
  expect(copied.nullProto).toBe(nullProto)
  // the plain wrapper around them is still a real copy
  expect(copied).not.toBe(original)
  expect(copied.nested).not.toBe(original.nested)
})
