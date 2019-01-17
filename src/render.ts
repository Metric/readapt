'use strict';

import Component, { DEFER_PROMISE, renderComponent } from './component';
import VNode from './readapt-vdom/vnode';
import { diff } from './readapt-vdom/diff';

let renderQueue = Array<Component>(0);
export function enqueue(component: Component) {
    renderQueue.unshift(component);
    (component.asyncMethod || DEFER_PROMISE)(async () => {
        let p, list = renderQueue;
        renderQueue = Array<Component>(0);           
        while((p = list.pop())) await renderComponent(p, p.parent, p.parentNode);
    });
}
export async function hydrate(node: VNode, parent: any) {
    return await render(node, parent, parent.firstElementChild);
}
export async function render(node: VNode, parent: any, merge: any) {
    return await diff(merge, node, null, parent, true);
}