'use strict';

import { Parser } from 'htmlparser2';
import * as utils from './utils';


if (!String.prototype.trim) {
    (function () {
        let rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function () {
            return this.replace(rtrim, '');
        }
    })();
}


export function convert(html: string, options: { indent: { with: string, size: number } }): string {
    let elm = '';
    let indentSize = options.indent.size;
    let indentWith = options.indent.with;
    let depth = -1;
    let context = [];
    // Void elems don't support child elements.
    let voidElems = ["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "menuitem", "meta", "param", "source", "track", "wbr"];
    let isVoidElem = function (name: string) { return voidElems.some(x => x === name.toLowerCase()); }
    let onOpenTag = (name: string, attributes: any): void => {
        let pre = '';
        let tag = [];
        let attrs = Object.keys(attributes).map((attribute) => {
            let value = attributes[attribute];
            if (attribute === 'style') {
                return "Style" + ' [ ' + utils.styleToElm(value).join('; ') + ' ]';
            } else if (attribute === 'class') {
                attribute = 'ClassName';
            } else if (attribute.startsWith("data-")) {
                // Wrap up the attribute and value.
                // TODO I'm not sure if all values should be a string...
                return attribute = '!!("' + attribute + '", "' + value + '")';
            } else {
                attribute = attribute.charAt(0).toUpperCase() + attribute.slice(1);
            }
            return attribute + ' "' + value + '"';
        });

        depth++;
        if (context[depth]) {
            // Tag open at this depth, so indent.
            pre = '\n' + utils.indent(depth, indentSize, indentWith);
        } else {
            // Mark that tag open at this depth.
            context[depth] = true;
        }
        tag.push(pre + name);
        tag.push(' [');
        if (attrs.length) {
            tag.push(' ' + attrs.join('; ') + ' ');
        }
        // TODO don't push the opening child component list [ for tags like br.
        tag.push(']');
        if (isVoidElem(name)) {
        } else {
            tag.push(' [\n' + utils.indent(depth + 1, indentSize, indentWith))
        }
        elm += tag.join('');
    };
    let onText = (rawText: string): void => {
        let text = rawText.trim();
        if (text.length !== 0) {
            elm += `str "${text}"`;
            elm += '\n' + utils.indent(depth + 1, indentSize, indentWith);
        }
    };
    let onCloseTag = (name: string) => {
        if (context[depth + 1]) {
            // Closing tag which had child.
            delete context[depth + 1];
            elm += '\n' + utils.indent(depth, indentSize, indentWith);
        }
        depth--;
        // TODO don't push the closing child component list [ for tags like br.
        if (isVoidElem(name)) {
        } else {
            elm += ']';
        }
    };
    let parser = new Parser({
        onopentag: onOpenTag,
        ontext: onText,
        onclosetag: onCloseTag
    }, { decodeEntities: true });

    parser.write(html);
    parser.end('');
    return elm;
}
