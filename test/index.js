import test from 'ava'
import copy from '../dist/index.cjs'

test('copy', t => {
  let res, target
  target = {a: '', b: '', c: {d: ''}}
  res = copy(target)
  t.deepEqual(res, target)
  // change target
  target.a = 1
  t.is(target.a, 1)
  t.is(res.a, '')
  target.c.d = 1
  t.is(target.c.d, 1)
  t.is(res.c.d, '')
  target.c.e = 'new'
  t.is(target.c.e, 'new')
  t.is(res.c.e, undefined)
  // change res
  target = {a: '', b: '', c: {d: ''}}
  res = copy(target)
  res.a = true
  t.is(res.a, true)
  t.is(target.a, '')
  res.c.d = true
  t.is(res.c.d, true)
  t.is(target.c.d, '')
  res.c.e = 'new'
  t.is(res.c.e, 'new')
  t.is(target.c.e, undefined)
})

test('Arrays in objects', t => {
  let res, target
  target = {a: [1, 2], c: {d: ['a']}}
  res = copy(target)
  t.deepEqual(res, target)
  // change target
  target.a.push(3)
  t.deepEqual(target.a, [1, 2, 3])
  t.deepEqual(res.a, [1, 2])
  target.c.d.splice(0, 0, 'z')
  t.deepEqual(target.c.d, ['z', 'a'])
  t.deepEqual(res.c.d, ['a'])
  // reset test
  target = {a: [1, 2], c: {d: ['a']}}
  res = copy(target)
  t.deepEqual(res, target)
  // change res
  res.a.push(3)
  t.deepEqual(res.a, [1, 2, 3])
  t.deepEqual(target.a, [1, 2])
  res.c.d.splice(0, 0, 'z')
  t.deepEqual(res.c.d, ['z', 'a'])
  t.deepEqual(target.c.d, ['a'])
})

test('Arrays with objects in objects', t => {
  let res, target
  target = {a: [{a: 1}], c: {d: [{b: 1}]}}
  res = copy(target)
  t.deepEqual(res, target)
  // change target
  target.a[0].a = 2
  t.deepEqual(target.a, [{a: 2}])
  t.deepEqual(res.a, [{a: 1}])
  target.c.d[0].b = 2
  t.deepEqual(target.c.d, [{b: 2}])
  t.deepEqual(res.c.d, [{b: 1}])
  // reset test
  target = {a: [{a: 1}], c: {d: [{b: 1}]}}
  res = copy(target)
  t.deepEqual(res, target)
  // change res
  res.a[0].a = 2
  t.deepEqual(res.a, [{a: 2}])
  t.deepEqual(target.a, [{a: 1}])
  res.c.d[0].b = 2
  t.deepEqual(res.c.d, [{b: 2}])
  t.deepEqual(target.c.d, [{b: 1}])
})

test('Arrays', t => {
  let res, target
  target = [1, 2, 3, 4]
  res = copy(target)
  t.deepEqual(res, target)
  res.splice(0, 0, 0)
  t.deepEqual(target, [1, 2, 3, 4])
  t.deepEqual(res, [0, 1, 2, 3, 4])
})

test('non objects', t => {
  let res, target
  target = 'ha'
  res = copy(target)
  t.is(res, target)
  target = 1
  res = copy(target)
  t.is(res, target)
  target = undefined
  res = copy(target)
  t.is(res, target)
})

test('special objects', t => {
  let res, target
  target = new Date()
  res = copy(target)
  t.deepEqual(res, target)
  target = {}
  res = copy(target)
  t.deepEqual(res, target)
})

test('symbols as keys', t => {
  let res, target
  const mySymbol = Symbol('mySymbol')
  target = { value: 42, [mySymbol]: 'hello' }
  res = copy(target)
  // change original
  target.value = 1
  target[mySymbol] = 2
  t.is(res.value, 42)
  t.is(res[mySymbol], 'hello')
  t.is(target.value, 1)
  t.is(target[mySymbol], 2)
})

test('nonenumerable keys', t => {
  let target, res
  const mySymbol = Symbol('mySymbol')
  target = { value: 42 }
  Object.defineProperty(target, 'id', {
    value: 1,
    writable: true,
    enumerable: false,
    configurable: true
  })
  Object.defineProperty(target, mySymbol, {
    value: 'original',
    writable: true,
    enumerable: false,
    configurable: true
  })
  res = copy(target)
  // change original
  target.id = 100
  target[mySymbol] = 'new'
  target.value = 300
  t.is(res.value, 42)
  t.is(res.id, 1)
  t.is(res[mySymbol], 'original')
  t.is(Object.keys(res).length, 1)
  t.true(Object.keys(res).includes('value'))
  t.is(target.id, 100)
  t.is(target[mySymbol], 'new')
  t.is(target.value, 300)
  t.is(Object.keys(target).length, 1)
})
