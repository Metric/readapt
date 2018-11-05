'use strict';

const UPPER_REGEX = /([A-Z])/g;
const MS_REGEX = /^ms-/;
const MOZ_REGEX = /^moz-/;
const styleCache = {};

const VOID_ELEMENTS : any = [
    'input', 
    'br',
    'area',
    'col',
    'base',
    'command',
    'embed',
    'hr',
    'img',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
];

export default class PartialRenderer {
    static renderToString(child: any) {
        if(!child) return '';

        //shortcut for browsers
        if(child.innerHTML !== undefined) return child.innerHTML;

        let str = '';

        if(child.nodeType === 'element') {
            str += PartialRenderer.startTag(child);
            const style = PartialRenderer.styleString(child);
            if(style) str += ` style="${style}"`;
            const classes = PartialRenderer.classString(child);
            if(classes) str += ` class="${classes}"`;
            const attributes = PartialRenderer.attributeString(child);
            if(attributes) str += ' ' + attributes;
            str += PartialRenderer.startTagEnd(child);
        }
        else str += child.nodeValue;

        child.childNodes.forEach(c => str += PartialRenderer.renderToString(c));

        if(child.nodeType === 'element') str += PartialRenderer.endTag(child);

        return str;
    }

    ///only works on server!!!
    static renderToStream(child: any, stream: any) {
        if(!child) return;

        if(child.nodeType === 'element') {
            stream.write(PartialRenderer.startTag(child));
            const style = PartialRenderer.styleString(child);
            if(style) stream.write(` style="${style}"`);
            const classes = PartialRenderer.classString(child);
            if(classes) stream.write(` class="${classes}"`);
            const attributes = PartialRenderer.attributeString(child);
            if(attributes) stream.write(' ' + attributes);
            stream.write(PartialRenderer.startTagEnd(child));
        }
        else stream.write(child.nodeValue);

        child.childNodes.forEach(c => PartialRenderer.renderToStream(child, stream));

        if(child.nodeType === 'element') stream.write(PartialRenderer.endTag(child));

        stream.end();
    }

    static startTag(child: any) : string {
        return `<${child.nodeName.toLowerCase()}`;
    }

    static startTagEnd(child: any) : string {
        if(VOID_ELEMENTS.includes(child.nodeName.toLowerCase())) return '/>';
        return '>';
    }

    static endTag(child: any) : string {
        if(VOID_ELEMENTS.includes(child.nodeName.toLowerCase())) return '';

        return `</${child.nodeName.toLowerCase()}>`;
    }

    static classString(child: any) : string {
        return child.className;
    }

    static attributeString(child: any) : string {
        let str = '',delimiter = '';

        for(let attr in child.attributes) {
            if(child.attributes[attr]) str += delimiter + `${attr}="${child.attributes[attr]}"`;
            delimiter = ' ';
        }

        return str;
    }

    static styleString(child: any) : string {
        const styles = child.style;
        let str = '', delimiter = '';
        for(let style in styles) {
            if(style !== 'cssText') {
                const name = PartialRenderer.styleName(style);
                str += delimiter + `${style}: ${styles[style]}`;
                delimiter = ';';
            }
        }
        return str;
    }

    static styleName(name: string) : string {
        if(styleCache[name]) return styleCache[name];
        const cache = name.replace(UPPER_REGEX, '-$1')
        .toLowerCase()
        .replace(MS_REGEX, '-ms-')
        .replace(MOZ_REGEX, '-moz-');
        styleCache[name] = cache;
        return cache;
    }
}