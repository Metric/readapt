'use strict';

import VNode from './readapt-vdom/vnode';
import Component from './component';

export function h(nodeName: string | Component, attributes: any, ...children) {
    attributes = attributes || {};
    const stack = Array<any>(0);
    let child, p = new VNode(nodeName, typeof nodeName === 'function' ? 'component' : 'element', '');

    children.forEach(c => stack.unshift(c));
    if(attributes && attributes.children != null) {
        if(!stack.length) stack.push(attributes.children);
        delete attributes.children;
    }

    while(stack.length) {
        child = stack.pop();
        if(Array.isArray(child)) child.forEach(c => stack.unshift(c));
        else {
            if(child instanceof VNode) p.childNodes.push(child);
            else p.childNodes.push(new VNode('#text', 'text', child));
        }
    }
    
    p.attributes = attributes;
    p.key = attributes.key ? attributes.key : undefined;

    return p;
};