'use strict';

interface Listener {
    type: Number,
    fn: Function
}

export default class EventEmitter {
    private $events;
    
    constructor() {
        Object.defineProperty(this, '$events', {value: {}, writable: true, enumerable: false});
    }

    removeListener(event: string, fn: Function) : EventEmitter {
        if(fn && event) {
            if(this.$events[event]) {
                const i : Number = this.$events[event].findIndex(c => c.fn === fn);

                if(i > -1) {
                    this.$events[event].splice(i,1);
                }
            }
        }
        else if(event) {
            this.$events[event] = Array<Object>(0);
        }

        return this;
    }

    on(event: string, fn: Function) : EventEmitter {
        let list : Array<Listener> = this.$events[event] || Array<Listener>(0);
        list.push({type: 0, fn: fn});
        this.$events[event] = list;
        return this;
    }

    once(event: string, fn: Function) : EventEmitter {
        let list : Array<Listener> = this.$events[event] || Array<Listener>(0);
        list.push({type: 1, fn: fn});
        this.$events[event] = list;
        return this;
    }

    emit(event: string, ...args) : EventEmitter {
        const list : Array<Listener> = this.$events[event];
        if(list) {
            for(let i = 0; i < list.length; i++) {
                 list[i].fn.apply(this, args);   
                 if(list[i].type === 1) {
                    list.splice(i,1);
                    i--;
                }
            }
         }
         return this;
    }
}