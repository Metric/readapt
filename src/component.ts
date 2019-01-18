'use strict';
import {removeNode} from './readapt-dom/index';
import VNode from './readapt-vdom/vnode';
import { ATTR_KEY, ASYNC, SYNC } from './constants';
import { diff, recollectNodeTree } from './readapt-vdom/diff';
import { diffLevel} from './readapt-vdom/diff';
import { enqueue } from './render';

export const DEFER_PROMISE = Promise.resolve().then.bind(Promise.resolve());
export const DEFER_TIMEOUT = setTimeout;
export const DEFER_ANIMATION = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : DEFER_PROMISE;

export default class Component {
    key: any;
    ref: any;
    disabled: boolean;
    parent : any;
    base: any;
    renderMode: Number;
    child: any;
    asyncMethod: any;
    parentNode: any;
    children: Array<any>;

    constructor(props: any, parent: Component, renderMode: any) {
        this.disabled = false;
        this.key = props.key;
        this.ref = props.ref;
        this.asyncMethod = DEFER_PROMISE;
        this.renderMode = renderMode || SYNC;
        this.child = null;
        this.base = null;
        this.parent = parent;
        this.parentNode = null;
        this.children = [];
        
        delete props.ref;
        delete props.key;
   
        this.observe(props);
    }

    protected async componentChange(key: string, value: any, previous: any) {
        if(this.shouldComponentUpdate(key,value,previous)) {
            if(this.renderMode === SYNC) await renderComponent(this, this.parentNode);
            else if(this.renderMode === ASYNC) enqueue(this);
        }
    }

    async forceUpdate() {
        await renderComponent(this, this.parentNode);
    }

    async componentDidUpdate(previous) : Promise<any> {
        
    }

    async render() : Promise<any> {

    }

    async componentWillUnmount() : Promise<any> {

    }

    async componentDidMount() : Promise<any> {

    }

    protected shouldComponentUpdate(key: string, value: any, previous: any) : boolean {
        return true;
    }

    protected observe(o: Object) {
        for(let k in o) {
            let v : any = o[k];

            if(typeof v === 'function') {
                this[k] = v;
                continue;
            }

            Object.defineProperty(this, `\$${k}`, {value: v, writable: true, enumerable: false });
            
            Object.defineProperty(this, k, {
                enumerable: true,
                get() {
                    return this[`\$${k}`];
                },
                set(nv: any) {
                    const prev = this[`\$${k}`];
                    this[`\$${k}`] = nv;

                    if(!this.disabled && prev !== nv) {
                        this.componentChange(k,nv,prev);
                    }
                }
            });
        }
    }
}

export async function renderComponent(component: Component, parentNode: any) {
    let isUpdate = component.base, p, props, rendered, toUnmount, cbase, inst, base, type;
    if(component.disabled) return;

    rendered = await component.render();

    if(!rendered || Array.isArray(rendered)) {
        if(component.child) {
            await unmountComponent(component.child);
            component.child = null;
        }
        if(component.base) {
            component.base._component = null;
            await recollectNodeTree(component.base, false);
            component.base = null;
        }
        return;
    }

    component.parentNode = parentNode;
    cbase = base = component.base;

    if(typeof rendered.nodeName === 'function') {
        props = rendered.attributes;
        inst = component.child;
        if(inst && inst.constructor === rendered.nodeName) {
            const update = prepareRender(inst, props, rendered.childNodes);
            if(update._different) {
                await renderComponent(inst, inst.parentNode);
                await inst.componentDidUpdate(update);
            }
        }
        else {
            toUnmount = inst; type = rendered.nodeName;

            if(cbase && !toUnmount) {
                cbase._component = null;
                await recollectNodeTree(cbase, false);
            }

            component.child = inst = new type(props, component);
            inst.children = rendered.childNodes;
            if(inst.ref) inst.ref(inst);
            await renderComponent(inst, component.parentNode);
        }

        base = inst.base;
    }
    if(typeof rendered.nodeName !== 'function') {
        toUnmount = component.child;
        if(toUnmount) cbase = component.child = null;
        base = await diff(cbase, rendered, component.parentNode, true);
    }

    if(cbase && base !== cbase && inst !== component.child) {
        p = cbase.parentNode;
        if(p && base !== p) {
            p.replaceChild(base, cbase);

            if(!toUnmount) {
                cbase._component = null;
                await recollectNodeTree(cbase, false);
            }
        }
    }

    if(toUnmount) await unmountComponent(toUnmount);

    component.base = base;
    if(base && !component.child) {
        let cmp = component, t = component;

        while((t = t.parent)) {
            (cmp = t).base = base;
        }

        base._component = cmp;
    } 
    if(!isUpdate) {
        await component.componentDidMount();
    }
}

export function prepareRender(inst: Component, props: any, children: Array<any>) : any {
    let diff = {_different: false};
    if(inst.ref) inst.ref(inst);
    inst.children = children;

    inst.disabled = true;
    for(let n in props) {
        if(inst[n] !== undefined) {
            if(inst[n] !== props[n]) {
                diff[n] = inst[n];
                diff._different = true;
            }
            inst[n] = props[n];
        }
    }
    inst.disabled = false;

    return diff;
}

export async function unmountComponent(component: Component) {
    const base = component.base;
    component.disabled = true;
    await component.componentWillUnmount();
    if(component.child) await unmountComponent(component.child);
    component.base = null;
    component.parent = null;
    component.child = null;
    if(base) {
        base._component = null;
        if(base[ATTR_KEY] && base[ATTR_KEY].ref) base[ATTR_KEY].ref(null);

        await recollectNodeTree(base, false);
    }
    if(component.ref) component.ref(null);
}

export async function buildComponent(dom: any, node: VNode, parentNode: any) {
    let c = dom && dom._component,
        isDirectOwner = c && c.constructor === node.nodeName,
        props = node.attributes,
        type = node.nodeName;

    if(isDirectOwner && c) {
        const update = prepareRender(c, props, node.childNodes);
        if(update._different) {
            await renderComponent(c, parentNode);
            await c.componentDidUpdate(update);
        }
        dom = c.base;
    }
    else {
        await recollectNodeTree(dom, false);
        c = new type(props, null);
        c.children = node.childNodes;
        if(c.ref) c.ref(c);
        await renderComponent(c, parentNode);
        dom = c.base;
    }
    
    return dom;
}