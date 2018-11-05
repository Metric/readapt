'use strict';

import NodeImpl from './node';

export default class DocumentImpl {
    constructor() {

    }

    get body() : NodeImpl {
        return new NodeImpl('body', 'element');
    }

    createElement(name: string) : NodeImpl {
        return new NodeImpl(name, 'element');
    }

    createTextNode(txt: string) : NodeImpl {
        const node = new NodeImpl('#text', 'text');
        node.splitText = true;
        node.nodeValue = txt;
        return node;
    }

    //place holder
    querySelector(name: string)  {
        return null;
    }

    //place holder
    querySelectorAll(name: string) {
        return null;
    }
}