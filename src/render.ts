'use strict';

import Component, { DEFER_PROMISE, renderComponent } from './component';
import VNode from './readapt-vdom/vnode';
import { diff } from './readapt-vdom/diff';

export function enqueue(component: Component) {
    (component.asyncMethod || DEFER_PROMISE)(async () => {
        await renderComponent(component, component.parentNode, false);
    });
}
export function enqueueState(component: Component, state: Promise<any>) {
    (component.asyncMethod || DEFER_PROMISE)(async () => {
        await state;
    });
}
export async function hydrate(node: VNode, parent: any) {
    return await render(node, parent, parent.firstElementChild);
}
export async function render(node: VNode, parent: any, merge: any) {
    return await diff(merge, node, parent, true);
}