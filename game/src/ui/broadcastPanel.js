/* ============================================================
   broadcastPanel.js — Slice 3 UI: the three-voice broadcast booth.

   - PLAY-BY-PLAY fires automatically when a turn resolves (if a key
     is set). It is non-blocking: the turn renders instantly and the
     call lands a moment later.
   - ADVISOR and COMMENTATOR are on-demand, one click each, available
     every turn.
   - Per-turn cache: a voice speaks once per turn unless re-asked, so
     re-renders never re-bill the API.
   ============================================================ */

const { el } = require("./dom.js");
const client = require("../broadcast/client.js");

// turnKey -> { announcer: {state,text}, advisor: {...}, commentator: {...} }
const cache = {};
let keyPromptOpen = false;

function turnKey(game) { return game.seed + ":" + game.turnIndex; }

function slot(game, voice) {
    const k = turnKey(game);
    cache[k] = cache[k] || {};
    cache[k][voice] = cache[k][voice] || { state: "idle", text: null, truncated: false };
    return cache[k][voice];
}

const LABELS = {
    announcer:   { title: "PLAY-BY-PLAY", sub: "live call" },
    advisor:     { title: "CAMPAIGN ADVISOR", sub: "your strategist · inside the room" },
    commentator: { title: "TV COMMENTATOR", sub: "outside analyst · not on your payroll" }
};

function render(game, lastResult, rerender) {
    const wrap = el("div", { class: "panel broadcast" });
    wrap.appendChild(el("h3", { text: "THE BROADCAST" }));

    // ---- no key: offer to set one, and keep the game fully playable ----
    if (!client.hasKey()) {
        if (!keyPromptOpen) {
            wrap.appendChild(el("div", { class: "bc-nokey" }, [
                el("span", { text: "Broadcast voices are off — no API key set. " }),
                el("button", {
                    class: "bc-btn small", text: "Add key",
                    onClick: () => { keyPromptOpen = true; rerender(); }
                })
            ]));
        } else {
            const input = el("input", { class: "bc-key-input", type: "password", placeholder: "sk-ant-..." });
            wrap.appendChild(el("div", { class: "bc-nokey" }, [
                input,
                el("button", {
                    class: "bc-btn small", text: "Save",
                    onClick: () => {
                        const v = (input.value || "").trim();
                        if (v.indexOf("sk-ant-") === 0) { client.setStoredKey(v); keyPromptOpen = false; rerender(); }
                        else { input.value = ""; input.placeholder = "needs to start with sk-ant-"; }
                    }
                }),
                el("button", {
                    class: "bc-btn small ghost", text: "Cancel",
                    onClick: () => { keyPromptOpen = false; rerender(); }
                }),
                el("div", { class: "bc-note", text: "Stored in this browser only (localStorage). Local single-player use — not ship-safe for public release." })
            ]));
        }
        return wrap;
    }

    // ---- announcer: auto-fires once per resolved turn ----
    if (lastResult) {
        const a = slot(game, "announcer");
        if (a.state === "idle") {
            a.state = "loading";
            client.speak("announcer", game, lastResult)
                .then(r => { a.state = "done"; a.text = r.text; a.truncated = r.truncated; rerender(); })
                .catch(e => { a.state = "error"; a.text = e.message; a.truncated = false; rerender(); });
        }
        wrap.appendChild(voiceBlock("announcer", a, null));
    }

    // ---- advisor + commentator: on demand ----
    for (const voice of ["advisor", "commentator"]) {
        const s = slot(game, voice);
        const ask = () => {
            s.state = "loading"; s.truncated = false; rerender();
            client.speak(voice, game, lastResult)
                .then(r => { s.state = "done"; s.text = r.text; s.truncated = r.truncated; rerender(); })
                .catch(e => { s.state = "error"; s.text = e.message; s.truncated = false; rerender(); });
        };
        wrap.appendChild(voiceBlock(voice, s, ask));
    }

    return wrap;
}

function voiceBlock(voice, s, ask) {
    const L = LABELS[voice];
    const box = el("div", { class: "bc-voice bc-" + voice });

    const head = el("div", { class: "bc-head" }, [
        el("span", { class: "bc-title", text: L.title }),
        el("span", { class: "bc-sub", text: L.sub })
    ]);
    box.appendChild(head);

    if (s.state === "loading") {
        box.appendChild(el("div", { class: "bc-body loading", text: "…" }));
    } else if (s.state === "done") {
        box.appendChild(el("div", { class: "bc-body" + (s.truncated ? " truncated" : ""), text: s.text }));
        if (s.truncated) {
            box.appendChild(el("div", {
                class: "bc-cutoff",
                text: "CUT OFF — hit the length limit mid-sentence. This is not the whole call."
            }));
        }
        if (ask) box.appendChild(el("button", { class: "bc-btn small ghost", text: "ask again", onClick: ask }));
    } else if (s.state === "error") {
        box.appendChild(el("div", { class: "bc-body error", text: "(" + s.text + ")" }));
        if (ask) box.appendChild(el("button", { class: "bc-btn small ghost", text: "retry", onClick: ask }));
    } else if (ask) {
        box.appendChild(el("button", {
            class: "bc-btn",
            text: voice === "advisor" ? "Ask your strategist" : "Get the outside read",
            onClick: ask
        }));
    }

    return box;
}

module.exports = { render };
