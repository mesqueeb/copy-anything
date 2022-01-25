import { test, expect } from 'vitest'
import { copy } from '../src/index'

test('copy - change original', () => {
  const original = { a: 0, b: 0, c: { d: 0 } }
  const copied = copy(original)
  t.deepEqual(copied, original)
  // change original
  original.a = 1
  expect(original.a).toEqual(1)
  expect(copied.a).toEqual(0)
  original.c.d = 1
  expect(original.c.d).toEqual(1)
  expect(copied.c.d).toEqual(0)
  // @ts-ignore
  original.c.e = 'new'
  // @ts-ignore
  expect(original.c.e).toEqual('new')
  // @ts-ignore
  expect(copied.c.e).toEqual(undefined)
})
test('copy - change copied', () => {
  const original = { a: false, b: '', c: { d: false } }
  const copied = copy(original)
  // change copied
  copied.a = true
  expect(copied.a).toEqual(true)
  expect(original.a).toEqual(false)
  copied.c.d = true
  expect(copied.c.d).toEqual(true)
  expect(original.c.d).toEqual(false)
  // @ts-ignore
  copied.c.e = 'new'
  // @ts-ignore
  expect(copied.c.e).toEqual('new')
  // @ts-ignore
  expect(original.c.e).toEqual(undefined)
})

test('Arrays in objects - change original', () => {
  const original = { a: [1, 2], c: { d: ['a'] } }
  const copied = copy(original)
  t.deepEqual(copied, original)
  // change original
  original.a.push(3)
  t.deepEqual(original.a, [1, 2, 3])
  t.deepEqual(copied.a, [1, 2])
  original.c.d.splice(0, 0, 'z')
  t.deepEqual(original.c.d, ['z', 'a'])
  t.deepEqual(copied.c.d, ['a'])
})
test('Arrays in objects - change copied', () => {
  const original = { a: [1, 2], c: { d: ['a'] } }
  const copied = copy(original)
  t.deepEqual(copied, original)
  // change copied
  copied.a.push(3)
  t.deepEqual(copied.a, [1, 2, 3])
  t.deepEqual(original.a, [1, 2])
  copied.c.d.splice(0, 0, 'z')
  t.deepEqual(copied.c.d, ['z', 'a'])
  t.deepEqual(original.c.d, ['a'])
})

test('Arrays with objects in objects - change original', () => {
  const original = { a: [{ a: 1 }], c: { d: [{ b: 1 }] } }
  const copied = copy(original)
  t.deepEqual(copied, original)
  // change original
  original.a[0].a = 2
  t.deepEqual(original.a, [{ a: 2 }])
  t.deepEqual(copied.a, [{ a: 1 }])
  original.c.d[0].b = 2
  t.deepEqual(original.c.d, [{ b: 2 }])
  t.deepEqual(copied.c.d, [{ b: 1 }])
})
test('Arrays with objects in objects - change copied', () => {
  const original = { a: [{ a: 1 }], c: { d: [{ b: 1 }] } }
  const copied = copy(original)
  t.deepEqual(copied, original)
  // change copied
  copied.a[0].a = 2
  t.deepEqual(copied.a, [{ a: 2 }])
  t.deepEqual(original.a, [{ a: 1 }])
  copied.c.d[0].b = 2
  t.deepEqual(copied.c.d, [{ b: 2 }])
  t.deepEqual(original.c.d, [{ b: 1 }])
})

test('Arrays', () => {
  const original = [1, 2, 3, 4]
  const copied = copy(original)
  t.deepEqual(copied, original)
  copied.splice(0, 0, 0)
  t.deepEqual(original, [1, 2, 3, 4])
  t.deepEqual(copied, [0, 1, 2, 3, 4])
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
  t.deepEqual(copied, original)
})
test('special objects 2', () => {
  const original = {}
  const copied = copy(original)
  t.deepEqual(copied, original)
})

test('symbols as keys', () => {
  const mySymbol = Symbol('mySymbol')
  const original = { value: 42, [mySymbol]: 'hello' }
  const copied = copy(original)
  // change original
  original.value = 1
  // @ts-ignore
  original[mySymbol] = 2
  expect(copied.value).toEqual(42)
  expect(copied[mySymbol]).toEqual('hello')
  expect(original.value).toEqual(1)
  // @ts-ignore
  expect(original[mySymbol]).toEqual(2)
})

test('nonenumerable keys - turned on', () => {
  const mySymbol = Symbol('mySymbol')
  const original = { value: 42 }
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
  // @ts-ignore
  original.id = 100
  original[mySymbol] = 'new'
  original.value = 300
  expect(copied.value).toEqual(42)
  // @ts-ignore
  expect(copied.id).toEqual(1)
  expect(copied[mySymbol]).toEqual('original')
  expect(Object.keys(copied).length).toEqual(1)
  t.true(Object.keys(copied).includes('value'))
  // @ts-ignore
  expect(original.id).toEqual(100)
  expect(original[mySymbol]).toEqual('new')
  expect(original.value).toEqual(300)
  expect(Object.keys(original).length).toEqual(1)
})

test('nonenumerable keys - turned off', () => {
  const mySymbol = Symbol('mySymbol')
  const original = { value: 42 }
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
  // @ts-ignore
  expect(copied.id).toEqual(undefined)
  expect(copied[mySymbol]).toEqual(undefined)
})

test('specific props', () => {
  const mySymbol = Symbol('mySymbol')
  const mySymbol2 = Symbol('mySymbol')
  const original = { value: 42, value2: 24 }
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
  // @ts-ignore
  expect(copied.id).toEqual(undefined)
  expect(copied[mySymbol]).toEqual(undefined)
  expect(copied.value2).toEqual(undefined)
  // @ts-ignore
  expect(copied.id2).toEqual(undefined)
  expect(copied[mySymbol2]).toEqual(undefined)
  expect(Object.keys(copied).length).toEqual(1)
  t.true(Object.keys(copied).includes('value'))
  expect(Object.keys(original).length).toEqual(2)

  // non-enumerable included
  const copied2 = copy(original, { props: [mySymbol, 'value', 'id'], nonenumerable: true })
  expect(copied2.value).toEqual(42)
  // @ts-ignore
  expect(copied2.id).toEqual(1)
  expect(copied2[mySymbol]).toEqual('original')
  expect(copied2.value2).toEqual(undefined)
  // @ts-ignore
  expect(copied2.id2).toEqual(undefined)
  expect(copied2[mySymbol2]).toEqual(undefined)
  expect(Object.keys(copied2).length).toEqual(1)
  t.true(Object.keys(copied2).includes('value'))
  expect(Object.keys(original).length).toEqual(2)
})
