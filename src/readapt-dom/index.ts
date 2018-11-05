'use strict';

export const DOM : any = {
    document: null
};

export function createNode(nodeName: string) {
    return DOM.document.createElement(nodeName);
}

export function removeNode(node) {
    const parentNode = node.parentNode;
    if (parentNode) parentNode.removeChild(node);
}

export function isSameNodeType(node: any, vnode: any, hydrating: boolean) {
    if(!node) return false;
    if(vnode.nodeType === 'text') return node.splitText;
    if(typeof vnode.nodeName === 'string') return !node._component && node.nodeName.toLowerCase() === vnode.nodeName.toLowerCase();

    return hydrating || (node._component && node._component.constructor === vnode.nodeName);
}

export function setAccessor(node, name, old, value) {
    if(name === 'className') name = 'class';
    if(name === 'key') {
        //do nothing
    }
    else if(name === 'ref') {
        if(old) old(null);
        if(value) value(node);
    }
    else if(name === 'html') {
        if(old !== value) {
            node.innerHTML = value;
        }
    }
    else if(name === 'class') {
        if(!value || typeof value === 'string') {
            node.className = value || '';
        }
        else if(value && typeof value === 'object') {
            if(typeof old === 'object') {
                for(let i in old) {
                    if (!(i in value)) node.classList.remove(i);
                }
            }
            for(let i in value)  {
                if(value[i]) node.classList.add(i);
                else node.classList.remove(i);
            }
        }
    }
    else if(name === 'style') {
        if(!value || typeof value === 'string' || typeof old === 'string') {
            node.style.cssText = value || '';
        }
        else if(value && typeof value === 'object') {
            if(typeof old === 'object') {
                for(let i in old) {
                    if (!(i in value)) node.style[i] = '';
                }
            }
            else node.style.cssText = '';
            for(let i in value) node.style[i] = value[i] || '';
        }
    }
    else if(name[0] === 'o' && name[1] === 'n') {
        let useCapture = name !== (name = name.replace(/Capture$/, ''));
        name = name.toLowerCase().substring(2);
        if(value) {
            if(!old) node.addEventListener(name, value, useCapture);
        }
        else if(old) node.removeEventListener(name, old, useCapture);
    }
    else if(name !== 'list' && name !== 'type' && name in node) {
        try {
            node[name] = value == null ? '' : value;
        }
        catch (e) {
            if((value == null || value === false) && name !== 'spellcheck') node.removeAttribute(name);
        }
    }
    else {
        if(value == null || value === false) node.removeAttribute(name);
        else if(typeof value !== 'function') node.setAttribute(name, value);
    }
}