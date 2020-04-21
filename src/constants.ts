'use strict';

export const ATTR_KEY = '__readapt__';
export const ASYNC = 3;
export const SYNC = 1;
export const NONE = 0;
export const FORCE = 2;

export function extend(base: Object, ref: Object) {
    for(let k in ref) base[k] = ref[k];
    return base;
};