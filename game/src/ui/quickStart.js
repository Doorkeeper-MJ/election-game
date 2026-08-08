/* ============================================================
   quickStart.js — Slice 4 Quick Start modal.

   GOVERNING PRINCIPLE (SLICE4_QUICKSTART.md, set by MJ 2026-08-08):
   this modal covers ONLY what a player must know before turn one.
   The three broadcast voices cover everything learned after; deeper
   system logic lives in the README, never in this UI. Consequence:
   the modal states what the player CONTROLS — never what the game
   does in reply (momentum, engine response). Those are discovered
   through play. Do not add them here.

   Shown automatically on first launch (localStorage flag, set on
   dismiss); re-openable any time from the "? HOW TO PLAY" header
   button. If localStorage is unavailable it shows every launch —
   harmless, no error path.

   >>> ALL PLAYER-FACING COPY BELOW IS DRAFT <<<
   Structure is the deliverable; final wording is a separate pass
   (see SLICE4_QUICKSTART.md "Copy status").
   ============================================================ */

const { el } = require("./dom.js");

const SEEN_KEY = "egv1.quickstart_seen";

function hasSeen() {
    try { return localStorage.getItem(SEEN_KEY) === "1"; } catch (e) { return false; }
}
function markSeen() {
    try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) { /* show-every-launch fallback */ }
}

function onKey(e) { if (e.key === "Escape") close(); }

function close() {
    const ov = document.getElementById("qs-overlay");
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    document.removeEventListener("keydown", onKey);
    markSeen();
}

function panel(title, kids) {
    return el("div", { class: "qs-panel" },
        [el("div", { class: "qs-panel-title", text: title })].concat(kids));
}
function line(props) { return el("p", Object.assign({ class: "qs-line" }, props)); }

function renderOverlay() {
    const overlay = el("div", {
        id: "qs-overlay", class: "qs-overlay",
        onClick: (e) => { if (e.target && e.target.id === "qs-overlay") close(); }
    });

    const modal = el("div", { class: "qs-modal", role: "dialog", "aria-label": "How to play" }, [
        el("button", { class: "qs-x", text: "✕", "aria-label": "Close", onClick: close }),
        el("h2", { class: "qs-title", text: "HOW TO PLAY" }),

        // 1 — the subject FIRST (this repo also holds a two-party general-election
        // prototype, which is exactly why the game must say what it is up front).
        panel("THE RACE", [
            line({ class: "qs-line lead", text: "This is the 2016 Republican presidential primary — not a general election, and not a two-party simulator." }),
            line({ text: "You run one campaign for the nomination. Win it by clinching 1,237 delegates — or by holding the delegate lead when the calendar runs out." })
        ]),

        panel("THE TURN", [
            line({ text: "Each turn is one date on the primary calendar. Every state voting that day resolves at once, and the race moves on — date by date, to the last contest." })
        ]),

        panel("YOUR LEVERS", [
            line({ html: "<b>WHERE TO CAMPAIGN</b> — 3 effort points, yours to spread across the states voting this turn. Stack them, split them, or hold them back." }),
            line({ html: "<b>WHAT TO EMPHASIZE</b> — press one issue this turn, or none. Lean into a strength, or shore up a weak spot." })
        ]),

        panel("THE GOLD READOUT", [
            line({ text: "After each contest, the gold line measures what your moves actually changed — your delegates with the push versus without it, same contest, same dice:" }),
            el("div", { class: "qs-example", text: "↳ your moves here: Cruz +2 (16 vs 14) · Trump −2" }),
            line({ text: "If your push flipped a state's winner, it says so. No line means a hands-off turn." })
        ]),

        // 5 — most players run unkeyed: an invitation, never a deficiency notice.
        panel("THE BROADCAST", [
            line({ text: "Three voices can call your race — the live play-by-play, your own campaign advisor, and an outside TV commentator who is not on your payroll. Commentary brings the race to life: add an Anthropic API key in the broadcast panel to hear them." }),
            line({ class: "qs-line quiet", text: "The game is complete without a key. With one, calls bill that key's account." })
        ]),

        el("div", { class: "qs-readme", text: "Curious what's under the hood? The README's \"How the simulation works\" section is the full tour — rules, momentum, and what the voices are allowed to know." }),
        el("button", { class: "run-btn qs-go", text: "TO THE RACE ▶", onClick: close })
    ]);

    overlay.appendChild(modal);
    document.addEventListener("keydown", onKey);
    return overlay;
}

function show() {
    if (document.getElementById("qs-overlay")) return;
    document.body.appendChild(renderOverlay());
}

/* Header button + first-launch auto-open. Call once at boot, AFTER
   showSeedBadge() — the badge carries margin-left:auto, and the CSS
   sibling rule expects badge-then-button order when both exist. */
function install() {
    const bar = document.querySelector(".topbar");
    if (bar && !document.getElementById("qs-help-btn")) {
        bar.appendChild(el("button", {
            id: "qs-help-btn", class: "qs-help", text: "? HOW TO PLAY", onClick: show
        }));
    }
    if (!hasSeen()) show();
}

module.exports = { install, show };
