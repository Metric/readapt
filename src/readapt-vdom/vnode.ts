'use strict';
export default class VNode {
    attributes: any;
    nodeName: any;
    nodeType: string;
    nodeValue: any;
    childNodes: Array<any>;
    key: any;

    constructor(name: any, type: string, v: any ) {
        this.nodeName = name;
        this.nodeType = type;
        this.nodeValue = v;
        this.childNodes = Array<any>(0);
    }
}