export declare type Options = {
    props: any[];
    nonenumerable: boolean;
};
/**
 * Copy (clone) an object and all its props recursively to get rid of any prop referenced of the original object. Arrays are also cloned, however objects inside arrays are still linked.
 *
 * @export
 * @param {*} target Target can be anything
 * @param {*} options Options can be `props` or `nonenumerable`.
 * @returns {*} the target with replaced values
 */
export default function copy(target: any, options?: Options): any;
