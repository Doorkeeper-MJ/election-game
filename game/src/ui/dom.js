/* dom.js — tiny vanilla-DOM helper for the play-layer UI. Browser only. */

function el(tag, props, children) {
    const node = document.createElement(tag);
    props = props || {};
    for (const k of Object.keys(props)) {
        const v = props[k];
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.slice(0, 2) === "on" && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
        else if (v != null) node.setAttribute(k, v);
    }
    const kids = [].concat(children == null ? [] : children);
    for (const c of kids) {
        if (c == null) continue;
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
}

function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

module.exports = { el, clear };
