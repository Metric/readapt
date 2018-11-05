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

    protected onChange(key: string, value: any, previous: any) {
        if(this.shouldComponentUpdate(key,value,previous)) {
            if(this.renderMode === SYNC) renderComponent(this, this.parentNode);
            else if(this.renderMode === ASYNC) enqueue(this);
        }
    }

    forceUpdate() {
        renderComponent(this, this.parentNode);
    }

    componentDidUpdate(previous) : void {
        
    }

    render() : any {

    }

    componentWillUnmount() : void {

    }

    componentDidMount() : void {

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
                        this.onChange(k,nv,prev);
                    }
                }
            });
        }
    }
}

export function renderComponent(component: Component, parentNode: any) {
    let isUpdate = component.base, p, props, previousProps, rendered, toUnmount, cbase, inst, base, wrap, type;
    if(component.disabled) return;

    rendered = component.render();

    if(!rendered || Array.isArray(rendered)) {
        if(component.base) {
            recollectNodeTree(component.base, false);
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
            previousProps = inst.base ? Object.assign({}, inst.base[ATTR_KEY]) : {};
            const update = prepareRender(inst, props, rendered.childNodes);
            if(update) {
                renderComponent(inst, inst.parentNode);
                inst.componentDidUpdate(previousProps);
            }
        }
        else {
            toUnmount = inst; type = rendered.nodeName;
            if(!toUnmount && cbase) recollectNodeTree(cbase, false);
            component.child = inst = new type(props, component);
            inst.children = rendered.childNodes;
            if(inst.ref) inst.ref(inst);
            renderComponent(inst, component.parentNode);
        }

        base = inst.base;
    }
    if(typeof rendered.nodeName !== 'function') {
        toUnmount = component.child;
        if(toUnmount) cbase = component.child = null;
        base = diff(cbase, rendered, component.parentNode, true);
    }

    if(cbase && base !== cbase && inst !== component.child) {
        p = cbase.parentNode;
        if(p && base !== p) {
            p.replaceChild(base, cbase);

            if(!toUnmount) {
                base._component = null;
                recollectNodeTree(cbase, false);
            }
        }
    }

    if(toUnmount) unmountComponent(toUnmount);

    component.base = base;
    if(base && !component.child) base._component = component;
    if(!isUpdate) {
        component.componentDidMount();
    }
}

export function prepareRender(inst: Component, props: any, children: Array<any>) : boolean {
    let diff = false;
    if(inst.ref) inst.ref(inst);
    inst.children = children;

    inst.disabled = true;
    for(let n in props) {
        if(inst[n] !== undefined) {
            if(inst[n] !== props[n]) diff = true;
            inst[n] = props[n];
        }
    }
    inst.disabled = false;
    return diff;
}

export function unmountComponent(component: Component) {
    const base = component.base;
    component.disabled = true;
    component.componentWillUnmount();
    component.base = null;
    if(component.child) unmountComponent(component.child);
    component.parent = null;
    component.child = null;
    if(base) {
        base._component = null;
        if(base[ATTR_KEY] && base[ATTR_KEY].ref) base[ATTR_KEY].ref(null);

        recollectNodeTree(base, false);
    }
    if(component.ref) component.ref(null);
}

export function buildComponent(dom: any, node: VNode, parentNode: any) {
    let c = dom && dom._component,
        isDirectOwner = c && c.constructor === node.nodeName,
        props = node.attributes,
        type = node.nodeName,
        previousProps = dom ? Object.assign({}, dom[ATTR_KEY]) : {};

    if(isDirectOwner && c) {
        const update = prepareRender(c, props, node.childNodes);
        if(update) {
            renderComponent(c, parentNode);
            c.componentDidUpdate(previousProps);
        }
        dom = c.base;
    }
    else {
        recollectNodeTree(dom, false);
        c = new type(props, null);
        c.children = node.childNodes;
        if(c.ref) c.ref(c);
        renderComponent(c, parentNode);
        dom = c.base;
    }
    
    return dom;
}