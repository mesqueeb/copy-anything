/** Declared locally so the comparison tests don't need the large `@types/lodash` package. */
declare module 'lodash.clonedeep' {
  export default function cloneDeep<T>(value: T): T
}
