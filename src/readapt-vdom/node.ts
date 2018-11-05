'use strict';

import ClassList from './classlist';

export default class NodeImpl {
    childNodes: Array<NodeImpl>;
    firstChild: NodeImpl | null;
    lastChild: NodeImpl | null;
    nextSibling: NodeImpl | null;
    parentNode: NodeImpl | null;
    nodeType: string;
    previousSibling: NodeImpl | null;
    nodeValue: string;
    nodeName: string | any;
    attributes: Object;
    style: Object;
    classList: ClassList;
    key: any;
    splitText: any;
    _component: Object;

    //this is a shortcut to the W3Spec 
    //we just care about a few things to mimic
    constructor(name: string | any, type: string) {
        this.nodeType = type;
        this.nodeName = name;
        this.splitText = type === 'text';
        this.childNodes = Array<NodeImpl>(0);
        this.attributes = {};
        this.style = { 
            set cssText(value: any) {
                for(let n in this) {
                    if(n !== 'cssText') delete this[n];
                }
                const values = value.split(';').filter(v => v.length > 0);
                values.forEach(b => {
                    const items = b.split(':');
                    if(items.length == 2) this[items[0]] = items[1];
                });
            }
        };
        this.classList = new ClassList();
    }

    get className() : string {
        return this.classList.toString();
    }

    set className(n: string) {
        this.classList.fromString(n);
    }

    get children() : Array<any> {
        return this.childNodes.filter(c => c.nodeType !== 'text');
    }

    get textContent() : string {
        let str = '';

        str += this.nodeValue;

        this.childNodes.forEach((n) => {
            if(n.nodeValue)str += n.nodeValue
            const all = n.textContent;
            if(all) str += all;
        })

        return str;
    }

    set textContent(v: string) {
        this.nodeValue = v;
        this.childNodes.forEach(c => this.removeChild(c));
    }

    addEventListener(event: string, fn: any, capture: boolean) {
        ///place holder
    }

    removeEventListener(event: string, fn: any, capture: boolean) {
        //placeholder
    }

    getAttributeNames() {
        return Object.keys(this.attributes);
    }

    setAttribute(name: string, v: string) {
        this.attributes[name] = v;
    }
    getAttribute(name: string) {
        return this.attributes[name];
    }
    removeAttribute(name: string) {
        delete this.attributes[name];
    }

    appendChild(node: NodeImpl) {
        if(this.childNodes.indexOf(node) > -1) {
            return;
        }
        if(this.firstChild === null) {
            this.firstChild = node;
            this.lastChild = node;
            if(node.parentNode) node.parentNode.removeChild(node);
            node.parentNode = this;
        }
        else if(this.lastChild) {
            if(node.parentNode) node.parentNode.removeChild(node);
            this.lastChild.nextSibling = node;
            node.previousSibling = this.lastChild;
            node.parentNode = this;
            this.lastChild = node;
        }
        this.childNodes.push(node);
    }

    replaceChild(child: NodeImpl, target: NodeImpl) {
        const idx = this.childNodes.indexOf(target);

        if(idx > -1) {
            if(child.parentNode) child.parentNode.removeChild(child);

            child.parentNode = this;
            child.nextSibling = target.nextSibling;
            child.previousSibling = target.previousSibling;

            if(target.previousSibling) target.previousSibling.nextSibling = child;
            if(target.nextSibling) target.nextSibling.previousSibling = child;

            target.nextSibling = null;
            target.parentNode = null;
            target.previousSibling = null;

            this.childNodes.splice(idx,1,child);
        }
    }

    removeChild(child: NodeImpl) {
        const idx = this.childNodes.indexOf(child);

        if(idx > -1) this.childNodes.splice(idx,1);

        if(child.previousSibling) child.previousSibling.nextSibling = child.nextSibling;
        
        if(child.nextSibling) child.nextSibling.previousSibling = child.previousSibling;
        

        if(child === this.firstChild) this.firstChild = this.firstChild.nextSibling;
        else if (child === this.lastChild) this.lastChild = this.lastChild.previousSibling;
        

        child.parentNode = null;
    }

    contains(node: NodeImpl) {
        return this.childNodes.indexOf(node) > -1;
    }

    insertBefore(child: NodeImpl, ref: NodeImpl) {
        const idx = this.childNodes.indexOf(ref);
        if(idx > -1) {
            child.nextSibling = ref;
            child.previousSibling = ref.previousSibling;
            
            if(ref.previousSibling) ref.previousSibling.nextSibling = child;

            ref.previousSibling = child;

            this.childNodes.splice(idx,0,child);
        }
    }

    cloneNode(deep: boolean) : NodeImpl {
        if(deep) {
            const n = new NodeImpl(this.nodeName, this.nodeType);
            n.nodeValue = this.nodeValue;
            for(let i = 0; i < this.childNodes.length; i++) n.appendChild(this.childNodes[i].cloneNode(deep));
            for(let style in this.style) n.style[style] = this.style[style];
            for(let attr in this.attributes) n.attributes[attr] = this.attributes[attr];
            n.classList.classes = this.classList.clone();
            return n;
        }

        return new NodeImpl(this.nodeName, this.nodeType);
    }
}