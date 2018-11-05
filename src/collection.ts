'use strict';

import EventEmitter from './eventemitter';

export default class Collection extends EventEmitter {
    private arr: Array<any>;
    public length: Number;
    public proxy: Collection;

    constructor(arr: Array<any>) {
        super();

        Object.defineProperty(this, 'arr', {value: arr, writable: false, enumerable: false});
        Object.defineProperty(this, 'length', {value: arr.length, writable: true, enumerable: false});

        const proxy = new Proxy(this, {
            get: (obj, prop) : any => {
                const index : any = parseInt(prop as string);
                if(!Number.isInteger(index)) {
                    return this[prop];
                }
                return this.arr[index];
            },
            set: (obj, prop, value) : any => {
                const index : any = parseInt(prop as string);
                if(!Number.isInteger(index)) {
                    this[prop] = value;
                    return true;
                }
                this.arr[index] = value;
                this.emit('update');
            }
        });
        Object.defineProperty(this, 'proxy', {value: proxy, enumerable: false});
    }

    reduce(fn: (value: any, index: number) => void) {
        if(!fn || typeof fn !== 'function') return null;
        return this.arr.reduce(fn);
    }

    filter(fn: (value: any, index: number) => void) {
        if(!fn || typeof fn !== 'function') return this.arr;
        return this.arr.filter(fn);
    }

    map(fn: (value: any, index: number) => void) {
        if(!fn || typeof fn !== 'function') return this.arr;
        return this.arr.map(fn);
    }

    forEach(fn: (value: any, index: number) => void) {
        if(!fn || typeof fn !== 'function') return;
        return this.arr.forEach(fn);
    }

    remove(v: any) : void {
        const idx = this.arr.indexOf(v);
        if(idx > -1) {
            this.arr.splice(idx,1);
            this.length = this.arr.length;
            this.emit('update');
        }
    } 

    pop() : any {
        const v = this.arr.pop();
        this.length = this.arr.length;
        this.emit('update');
        return v;
    }

    push(...args) : void {
        this.arr.push.apply(this.arr, args);
        this.length = this.arr.length;
        this.emit('update');
    }

    slice(start, end) : Array<any> {
        return this.arr.slice(start, end);
    }

    splice(start, deleteCount, ...args) : Array<any> {
        let t = [start, deleteCount];
        t = t.concat(args);
        const deleted = this.arr.splice.apply(this.arr, t);
        this.length = this.arr.length;
        
        if(args.length > 0 || deleted.length > 0) {
            this.emit('update');
        }

        return deleted;
    }

    shift() : any {
        const v = this.arr.shift();
        this.length = this.arr.length;
        this.emit('update');
        return v;
    }

    unshift(...args) : void {
        this.arr.unshift.apply(this.arr, args);
        this.length = this.arr.length;
        this.emit('update');
    }
}