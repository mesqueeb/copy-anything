import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    /**
     * `copy()` deliberately has no depth limit, so a bug in its visited-Map turns a cyclic input
     * into an unbounded allocating loop rather than a thrown error. These caps keep that failure
     * inside Node's own heap: it dies in a second or two with a heap error instead of asking macOS
     * for everything and taking the desktop down with it.
     */
    testTimeout: 10_000,
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 2,
        execArgv: ['--max-old-space-size=512'],
      },
    },
  },
})
