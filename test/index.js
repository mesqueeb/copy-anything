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
