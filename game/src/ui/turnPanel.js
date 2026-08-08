/* turnPanel.js — v1's two levers.
   1. "Where to campaign" (Slice 1): allocate a bounded pool of effort
      points across THIS turn's states; zero = hands-off baseline.
   2. "What to emphasize" (Slice 2): pick ONE issue axis (or none).
      A strength (near the electorate mood) leans in — conviction
      messaging; a weakness shores up — position moves toward the mood.
      Both transient, both bounded, both visible in the results readout. */

const { el, clear } = require("./dom.js");
const CFG = require("../config-play.js");
const { AXES } = require("../../../model/data-2016.js");
const emphasisLever = require("../levers/emphasisLever.js");
const { tip } = require("./tip.js");

function render(game, onResolve) {
    const turn = game.turns[game.turnIndex];
    const player = game.field.find(c => c.id === game.playerId);
    const wrap = el("div", { class: "panel turn-panel" });
    const moves = { effort: {}, emphasis: null };
    const POOL = CFG.EFFORT_POOL;

    // Created once, re-appended on each redraw so the open/closed state
    // survives +/− clicks. DRAFT copy (Slice 4 tooltips) — pending MJ's pass.
    const t = tip(`Your moves for this date, then RUN CONTEST(S). WHERE TO CAMPAIGN: + and − spread your ${POOL} effort points across the states voting today. WHAT TO EMPHASIZE: ○ picks one issue to press — "you" is your position, "mood" is the electorate's, 0–10. Both are optional; skip both to play it straight.`);

    function used() {
        return Object.keys(moves.effort).reduce((s, k) => s + moves.effort[k], 0);
    }
    function remaining() { return POOL - used(); }

    function redraw() {
        clear(wrap);
        wrap.appendChild(el("h3", { text: `Turn ${game.turnIndex + 1} of ${game.turns.length} — ${turn.date}` }, [t.btn]));
        wrap.appendChild(t.body);
        wrap.appendChild(el("div", {
            class: "lever-label",
            text: `WHERE TO CAMPAIGN — ${POOL} effort points (remaining: ${remaining()})`
        }));

        for (const contest of turn.contests) {
            const cur = moves.effort[contest.state] || 0;
            wrap.appendChild(el("div", { class: "state-row" }, [
                el("span", { class: "state-name", text: `${contest.state} (${contest.delegates})` }),
                el("button", {
                    class: "step", text: "−",
                    onClick: () => { if (cur > 0) { moves.effort[contest.state] = cur - 1; redraw(); } }
                }),
                el("span", { class: "alloc", text: String(cur) }),
                el("button", {
                    class: "step", text: "+",
                    onClick: () => { if (remaining() > 0) { moves.effort[contest.state] = cur + 1; redraw(); } }
                })
            ]));
        }

        // ---- Lever 2: WHAT TO EMPHASIZE (Slice 2) ----
        if (player && player.calib) {
            wrap.appendChild(el("div", {
                class: "lever-label emphasis-label",
                text: "WHAT TO EMPHASIZE — one issue this turn (optional)"
            }));
            for (let a = 0; a < AXES.length; a++) {
                const mode = emphasisLever.modeFor(player, game.cycle, a);
                const chosen = moves.emphasis === a;
                const you = player.calib.issues[a];
                const mood = game.cycle.mood[a];
                wrap.appendChild(el("div", { class: "state-row emphasis-row" + (chosen ? " chosen" : "") }, [
                    el("button", {
                        class: "step emph-pick" + (chosen ? " on" : ""),
                        text: chosen ? "●" : "○",
                        onClick: () => { moves.emphasis = chosen ? null : a; redraw(); }
                    }),
                    el("span", { class: "state-name", text: AXES[a] }),
                    el("span", {
                        class: "emph-meta",
                        text: `you ${you} · mood ${mood} · ${mode === "lean-in" ? "STRENGTH — lean in" : "weak spot — shore up"}`
                    })
                ]));
            }
        }

        wrap.appendChild(el("button", {
            class: "run-btn", text: "RUN CONTEST(S) ▶",
            onClick: () => onResolve(moves)
        }));
        wrap.appendChild(el("div", { class: "hint", text: "Allocate 0 and emphasize nothing to play it straight (hands-off baseline)." }));
    }

    redraw();
    return wrap;
}

module.exports = { render };
