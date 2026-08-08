/* tip.js — Slice 4 static "?" tooltips. One per panel, click to toggle
   a short static blurb. No hover-only behavior (touch-hostile), no
   Tutorial Mode — DoD item 4 is static help only.

   GOVERNING PRINCIPLE (SLICE4_QUICKSTART.md): a tip explains what is
   ON SCREEN in its panel — never what the engine does in reply.

   Copy status: FINAL — all four tooltip strings (passed in by each
   panel) went through MJ's copy pass 2026-08-08. Wording changes go
   through MJ. Multi-beat tips rely on .tip-body's white-space:
   pre-line, which renders embedded newlines as line breaks. */

const { el } = require("./dom.js");

/* Returns { btn, body }. Caller appends btn inside the panel's heading
   and body directly after it. Both are stable nodes: a panel that
   redraws itself can re-append them and keep the open/closed state.
   Visibility toggles via className (not inline style) — Gate C's DOM
   stub models className but not .style, and the gate drives the real
   broadcast panel. */
function tip(text) {
    const body = el("div", { class: "tip-body hidden", text });
    const btn = el("button", {
        class: "tip-btn", text: "?", "aria-label": "What is this panel?",
        onClick: () => {
            body.className = body.className.indexOf("hidden") >= 0 ? "tip-body" : "tip-body hidden";
        }
    });
    return { btn, body };
}

module.exports = { tip };
