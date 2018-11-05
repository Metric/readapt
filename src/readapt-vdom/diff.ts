'use strict';

import Component, { buildComponent } from '../component';
import VNode from './vnode';
import {ATTR_KEY} from '../constants';
import {createNode, setAccessor, isSameNodeType, removeNode} from '../readapt-dom/index';
import {unmountComponent} from '../component';
import {DOM} from '../readapt-dom/index';

export const inputs : any = [
    'input',
    'textarea',
    'select',
    'meter',
    'progress',
    'button'
];

export let hydrating = false;
export let diffLevel = 0;

export function diff(dom: any, node: VNode, parent: any, root: boolean) {
    let ret : any = null;
    if(!diffLevel++) hydrating = dom && !dom[ATTR_KEY];

    ret = idiff(dom, node, parent, root);
    if(parent && ret.parentNode !== parent) parent.appendChild(ret);

    if(!--diffLevel) {
        hydrating = false;
    }

    return ret;
}

function idiff(dom: any, node: VNode, parent: any, root: boolean) {
    let out : any = dom;
    if(node.nodeValue == null || typeof node.nodeValue === 'boolean') node.nodeValue = '';
    if(node.nodeType === 'text') {
        if(dom && dom.splitText && dom.parentNode && (!dom._component || root)) {
            if(dom.nodeValue != node.nodeValue) dom.nodeValue = node.nodeValue;
        }
        else {
            out = DOM.document.createTextNode(node.nodeValue);
            if(dom) {
                if(dom.parentNode) dom.parentNode.replaceChild(out, dom);
                //recollectNodeTree
                recollectNodeTree(dom, false);
            }
        }

        out[ATTR_KEY] = {};
        return out;
    }

    let nodeName : any = node.nodeName, nroot;
    if(typeof nodeName === 'function') return buildComponent(dom, node, parent);
    if(!dom || dom.nodeName.toLowerCase() !== nodeName.toLowerCase()) {
        out = createNode(nodeName);
        if(dom) {
            while(dom.firstChild) out.appendChild(dom.firstChild);
            if(dom.parentNode) dom.parentNode.replaceChild(out, dom);

            //recollect
            recollectNodeTree(dom, false);
        }
    }
    let props : any = out[ATTR_KEY];
    if(!props) {
        props = out[ATTR_KEY] = {};
        out.getAttributeNames().forEach(n => props[n] = out.getAttribute(n));
    }

    let fc = out.firstChild, children = node.childNodes;
    if(children.length || fc) innerDiffNode(out, children, root);

    diffAttributes(out, node.attributes, props);

    return out;
}

function innerDiffNode(dom, vchildren: Array<VNode>, root: boolean) {
	let originalChildren = dom.childNodes,
		children = Array<any>(),
		keyed = {},
		keyedLen = 0,
		min = 0,
		len = originalChildren.length,
		childrenLen = 0,
		vlen = vchildren ? vchildren.length : 0,
		j, c, f, vchild, child;

	// Build up a map of keyed children and an Array of unkeyed children:
	if (len!==0) {
		for (let i=0; i<len; i++) {
			let child = originalChildren[i],
				props = child[ATTR_KEY],
				key = vlen && props ? child._component ? child._component.key : props.key : null;
			if (key!=null) {
				keyedLen++;
				keyed[key] = child;
			}
			else if (props || (child.splitText!==undefined ? (hydrating ? child.nodeValue.trim() : true) : hydrating)) {
				children[childrenLen++] = child;
			}
		}
	}

	if (vlen!==0) {
		for (let i=0; i<vlen; i++) {
			vchild = vchildren[i];
			child = null;

			// attempt to find a node based on key matching
			let key = vchild.key;
			if (key!=null) {
				if (keyedLen && keyed[key]!==undefined) {
					child = keyed[key];
					keyed[key] = undefined;
					keyedLen--;
				}
			}
			// attempt to pluck a node of the same type from the existing children
			else if (min<childrenLen) {
				for (j=min; j<childrenLen; j++) {
					if (children[j]!==undefined && isSameNodeType(c = children[j], vchild, hydrating)) {
						child = c;
						children[j] = undefined;
						if (j===childrenLen-1) childrenLen--;
						if (j===min) min++;
						break;
					}
				}
			}

			// morph the matched/found/created DOM child to match vchild (deep)
			child = idiff(child, vchild, dom, root);

			f = originalChildren[i];
			if (child && child!==dom && child!==f) {
				if (f==null) {
					dom.appendChild(child);
				}
				else if (child===f.nextSibling) {
					removeNode(f);
				}
				else {
					dom.insertBefore(child, f);
				}
			}
		}
	}


	// remove unused keyed children:
	if (keyedLen) {
		for (let i in keyed) if (keyed[i]!==undefined) recollectNodeTree(keyed[i], false);
	}

	// remove orphaned unkeyed children:
	while (min<=childrenLen) {
		if ((child = children[childrenLen--])!==undefined) recollectNodeTree(child, false);
	}
}

export function recollectNodeTree(node: any, unmountOnly: boolean) {
    if(!node) return;
    let component = node._component;
    if(component) unmountComponent(component);
    if(node[ATTR_KEY] && node[ATTR_KEY].ref) node[ATTR_KEY].ref(null);
    if(unmountOnly === false || node[ATTR_KEY]) removeNode(node);
    removeChildren(node);
}

export function removeChildren(node: any) {
    node = node.lastChild;
    while(node) {
        let next = node.previousSibling;
        recollectNodeTree(node, true);
        node = next;
    }
}

function diffAttributes(dom: any, attrs: any, old: any) {
    let name;
    for(name in old) {
        if(!(attrs && attrs[name] != null) && old[name] != null) setAccessor(dom, name, old, old[name] = undefined);
    }
    for(name in attrs) {
        if(name !== 'children' && name !== 'innerHTML' 
            && (attrs[name] !== ((name === 'value' || name === 'checked') ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name]); 
    }
}