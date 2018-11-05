'use strict';
import {h, h as createElement} from './h';
import Component from './component';
import {DOM} from './readapt-dom/index';
import {render, hydrate} from './render';

DOM.document = document;
window.h = h;
window.Component = Component;
window.Readapt = {
    render: render,
    hydrate: hydrate
};
window.React = {
    createElement: createElement,
    render: render,
    hydrate: hydrate
};