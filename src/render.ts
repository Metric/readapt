'use strict';

import Component, { DEFER_PROMISE, renderComponent } from './component';
import VNode from './readapt-vdom/vnode';
import { diff } from './readapt-vdom/diff';

let renderQueue = Array<Component>(0);
export function enqueue(component: Component) {
    renderQueue.unshift(component);
    (component.asyncMethod || DEFER_PROMISE)(() => {
        let p, list = renderQueue;
        renderQueue = Array<Component>(0);           
        while((p = list.pop())) renderComponent(p, p.parentNode);
    });
}
export function hydrate(node: VNode, parent: any) {
    return render(node, parent, parent.firstElementChild);
}
export function render(node: VNode, parent: any, merge: any) {
    return diff(merge, node, parent, true);
}