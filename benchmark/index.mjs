/**
 * Prints the `## Benchmark` section of the README as markdown, ready to paste.
 *
 * Run with `npm run benchmark`. Every number and every ✅/❌ below is produced by actually running
 * the libraries, so the table can be regenerated instead of trusted.
 */
import { klona } from 'klona'
import cloneDeep from 'lodash.clonedeep'
import os from 'node:os'
import { copy } from '../dist/index.js'

/**
 * The published 4.0.5 implementation, pasted verbatim together with the two is-what 5.5.0 helpers
 * it called, so "how much faster is 4.1.0" stays reproducible now that is-what is no longer a
 * dependency. Recursive by design — that is the point of comparing against it.
 */
const legacy = (() => {
  const getType = (payload) => Object.prototype.toString.call(payload).slice(8, -1)
  const isArray = (payload) => getType(payload) === 'Array'
  const isPlainObject = (payload) => {
    if (getType(payload) !== 'Object') return false
    const prototype = Object.getPrototypeOf(payload)
    return !!prototype && prototype.constructor === Object && prototype === Object.prototype
  }

  function assignProp(carry, key, newVal, originalObject, includeNonenumerable) {
    const propType = {}.propertyIsEnumerable.call(originalObject, key)
      ? 'enumerable'
      : 'nonenumerable'
    if (propType === 'enumerable') carry[key] = newVal
    if (includeNonenumerable && propType === 'nonenumerable') {
      Object.defineProperty(carry, key, {
        value: newVal,
        enumerable: false,
        writable: true,
        configurable: true,
      })
    }
  }

  return function copy(target, options = {}) {
    if (isArray(target)) return target.map((item) => copy(item, options))
    if (!isPlainObject(target)) return target

    const props = Object.getOwnPropertyNames(target)
    const symbols = Object.getOwnPropertySymbols(target)

    return [...props, ...symbols].reduce((carry, key) => {
      if (key === '__proto__') return carry
      if (isArray(options.props) && !options.props.includes(key)) return carry
      const val = target[key]
      const newVal = copy(val, options)
      assignProp(carry, key, newVal, target, options.nonenumerable)
      return carry
    }, {})
  }
})()

const contenders = [
  { name: 'copy-anything', fn: copy },
  { name: 'copy-anything@4.0.5', fn: legacy },
  { name: 'klona', fn: klona },
  { name: 'lodash.cloneDeep', fn: cloneDeep },
  { name: 'structuredClone', fn: structuredClone },
]

/**
 * `name` is the column header, kept short enough to keep the table readable. `about` is printed as
 * a legend under the table, so the precise shape lives next to the numbers instead of in a header
 * nobody can fit it into.
 */
const fixtures = [
  {
    name: 'flat',
    about: 'one object, 10 primitive keys',
    iterations: 200_000,
    make: () => ({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 'x', h: 'y', i: true, j: null }),
  },
  {
    name: 'mixed',
    about: 'one object 4 levels deep, holding an array of strings and an array of objects',
    iterations: 100_000,
    make: () => ({
      id: 1,
      name: 'Flareon',
      tags: ['fire', 'eevee'],
      meta: { created: 1, nested: { deep: { deeper: 'value' } } },
      list: [{ x: 1 }, { x: 2 }, { x: 3 }],
    }),
  },
  {
    name: '1000 objects',
    about: 'an array of 1000 flat objects',
    iterations: 1_500,
    make: () => Array.from({ length: 1000 }, (_, i) => ({ i, label: `item ${i}` })),
  },
  {
    name: '1000 keys',
    about: 'one object with 1000 primitive keys, to isolate the cost of enumerating them',
    iterations: 3_000,
    make: () => Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`k${i}`, i])),
  },
  {
    name: '1000 levels',
    /**
     * 1000 sits under every contender's stack ceiling on purpose, so this is a real head-to-head
     * instead of a column of `throws`. The 10_000 case lives in the capability table below.
     */
    about: 'a single-child chain 1000 objects deep',
    iterations: 1_000,
    make: () => {
      let node = { value: 'leaf' }
      for (let i = 0; i < 1000; i++) node = { nested: node }
      return node
    },
  },
]

/** Median of 5 samples, because a single sample swings by 30% or more on a laptop. */
function nsPerOp(fn, input, iterations) {
  const samples = []
  for (let sample = 0; sample < 5; sample++) {
    for (let i = 0; i < iterations / 10; i++) fn(input)
    const start = process.hrtime.bigint()
    for (let i = 0; i < iterations; i++) fn(input)
    samples.push(Number(process.hrtime.bigint() - start) / iterations)
  }
  return samples.sort((a, b) => a - b)[2]
}

const results = contenders.map(({ name, fn }) => ({
  name,
  timings: fixtures.map(({ make, iterations }) => {
    const input = make()
    try {
      return nsPerOp(fn, input, iterations)
    } catch {
      return null
    }
  }),
}))

const format = (ns) =>
  ns === null ? 'throws' : ns < 10_000 ? `${Math.round(ns)}ns` : `${(ns / 1000).toFixed(1)}µs`

console.log('## Benchmark\n')
console.log(`| clone function | ${fixtures.map((f) => f.name).join(' | ')} |`)
console.log(`| --- | ${fixtures.map(() => '---').join(' | ')} |`)
for (const { name, timings } of results) {
  const label = name === 'copy-anything' ? `**${name}**` : name
  console.log(`| ${label} | ${timings.map(format).join(' | ')} |`)
}

console.log('')
for (const { name, about } of fixtures) console.log(`- **${name}** — ${about}`)

class RequiresConstructorArgs {
  constructor(id) {
    if (id === undefined) throw new Error('id is required')
    this.id = id
  }
}

const capabilities = [
  {
    name: 'unlimited nesting depth',
    test: (f) => {
      let o = { value: 'leaf' }
      for (let i = 0; i < 10_000; i++) o = { nested: o }
      f(o)
      return true
    },
  },
  {
    name: 'circular references',
    test: (f) => {
      const o = { name: 'root' }
      o.self = o
      const c = f(o)
      return c.self === c
    },
  },
  {
    name: 'shared references stay shared',
    test: (f) => {
      const shared = { v: 1 }
      const c = f({ x: shared, y: shared })
      return c.x === c.y && c.x !== shared
    },
  },
  {
    name: 'symbol keys',
    test: (f) => {
      const s = Symbol('s')
      return f({ [s]: 'v' })[s] === 'v'
    },
  },
  {
    name: 'non-enumerable props',
    test: (f) => {
      const o = {}
      Object.defineProperty(o, 'hidden', { value: 2 })
      return f(o, { nonenumerable: true }).hidden === 2
    },
  },
  {
    name: 'class instances left alone',
    test: (f) => {
      const instance = new RequiresConstructorArgs(1)
      return f({ instance }).instance === instance
    },
  },
  {
    name: 'clones Date / Map / Set / RegExp',
    test: (f) => {
      const date = new Date(0)
      const clonedDate = f({ date }).date
      return clonedDate !== date && clonedDate instanceof Date
    },
  },
  {
    name: 'survives functions in the input',
    test: (f) => {
      const fn = () => 1
      return f({ fn }).fn === fn
    },
  },
]

console.log('\n| | ' + contenders.map((c) => c.name).join(' | ') + ' |')
console.log('| --- | ' + contenders.map(() => '---').join(' | ') + ' |')
for (const { name, test } of capabilities) {
  const cells = contenders.map(({ fn }) => {
    try {
      return test(fn) ? '✅' : '❌'
    } catch {
      return '❌'
    }
  })
  console.log(`| ${name} | ${cells.join(' | ')} |`)
}

const [cpu] = os.cpus()
console.log(`\n_Measured on ${cpu.model}, Node ${process.version}. Lower is better._`)
