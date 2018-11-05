'use strict';
import {h, h as createElement} from './h';
import Component from './component';
import {DOM} from './readapt-dom/index';
import {render} from './render';
import DocumentImpl from './readapt-vdom/document';
import PartialRenderer from './readapt-vdom/partialrenderer';

DOM.document = new DocumentImpl();
exports.h = h;
exports.Component = Component;
exports.Readapt = {
    render: render,
    renderToString: PartialRenderer.renderToString,
    renderToStream: PartialRenderer.renderToStream,
    DOM: DOM
};
exports.React = {
    createElement: createElement,
    render: render,
};