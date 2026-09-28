/* turnPanel.js — the player's levers.
   1. "Where to campaign" (Slice 1): allocate a bounded pool of effort
      points across THIS turn's states; zero = hands-off baseline.
   2. "What to emphasize" (Slice 2): pick ONE issue axis (or none).
      A strength (near the electorate mood) leans in — conviction
      messaging; a weakness shores up — position moves toward the mood.
      Both transient, both bounded, both visible in the results readout.
   3. "War chest" (v2 step 1, only when game.profile.money): buy up to
      MONEY_MAX_EXTRA_PER_TURN extra effort points from a finite cash pot.
      Bought points widen lever 1's pool; nothing else. The per-state cap
      (MAX_POLL_BUMP) still binds, so money buys breadth across states,
      never a bigger hammer in one — that is deliberate (council 2026-09-28). */

const { el, clear } = require("./dom.js");
const CFG = require("../config-play.js");
const { AXES } = require("../../../model/data-2016.js");
const emphasisLever = require("../levers/emphasisLever.js");
const moneyLever = require("../levers/moneyLever.js");
const { tip } = require("./tip.js");

function render(game, onResolve) {
    const turn = game.turns[game.turnIndex];
    const player = game.field.find(c => c.id === game.playerId);
    const wrap = el("div", { class: "panel turn-panel" });
    const moves = { effort: {}, emphasis: null, spend: 0 };
    const BASE = CFG.EFFORT_POOL;
    const MAX_PER_STATE = Math.floor(CFG.MAX_POLL_BUMP / CFG.POLL_BUMP_PER_EFFORT); // beyond this a state gains nothing
    const moneyOn = moneyLever.enabled(game);

    // Created once, re-appended on each redraw so the open/closed state
    // survives +/− clicks. Copy FINAL (MJ pass 2026-08-08) — four beats,
    // rendered as line breaks via .tip-body's white-space: pre-line.
    // The WAR CHEST beat is DRAFT (v2 step 1, 2026-09-28) pending MJ's pass.
    const t = tip(`Your moves for this date, then RUN CONTEST(S).

WHERE TO CAMPAIGN — spread your ${BASE} effort points across today's states with + and −.${moneyOn ? `

WAR CHEST — buy up to ${CFG.MONEY_MAX_EXTRA_PER_TURN} extra effort points a turn at ${CFG.MONEY_COST_PER_EFFORT} cash each. Cash never comes back. A state takes at most ${MAX_PER_STATE} points, so money buys reach across states, not a bigger push in one.` : ""}

WHAT TO EMPHASIZE — ○ picks one issue to press. "You" is your position, "mood" is the electorate's, on a 0–10 scale.

${moneyOn ? "All three are" : "Both are"} optional. Skip them to play it straight.`);

    function pool() { return moneyLever.poolFor(game, player, moves.spend); }
    function used() {
        return Object.keys(moves.effort).reduce((s, k) => s + moves.effort[k], 0);
    }
    function remaining() { return pool() - used(); }

    function redraw() {
        clear(wrap);
        wrap.appendChild(el("h3", { text: `Turn ${game.turnIndex + 1} of ${game.turns.length} — ${turn.date}` }, [t.btn]));
        wrap.appendChild(t.body);

        // ---- Lever 3 (step 1): WAR CHEST — shown first because it sets the pool ----
        if (moneyOn && player) {
            const maxBuy = moneyLever.maxBuyable(game, player);
            const bought = moneyLever.boughtFor(game, player, moves.spend);
            if (bought !== moves.spend) moves.spend = bought; // clamp if cash ran short
            const capacity = moneyLever.capacityFor(game);
            const why = maxBuy > 0 ? ` · up to ${maxBuy} this turn at ${CFG.MONEY_COST_PER_EFFORT} each`
                : capacity === 0 ? ` · nothing to buy today (${turn.contests.length === 1 ? "one state" : "today's states"} already covered by your ${BASE})`
                : " · no cash left";
            wrap.appendChild(el("div", {
                class: "lever-label money-label",
                text: `WAR CHEST — cash ${player.cash} · buying ${bought} extra effort (${bought * CFG.MONEY_COST_PER_EFFORT} cash)` + why
            }));
            wrap.appendChild(el("div", { class: "state-row money-row" }, [
                el("span", { class: "state-name", text: "Extra effort points" }),
                el("button", {
                    class: "step", text: "−",
                    onClick: () => {
                        if (moves.spend > 0) {
                            moves.spend -= 1;
                            // If the pool shrinks below what is allocated, trim the largest allocation.
                            while (used() > pool()) {
                                const top = Object.keys(moves.effort).sort((a, b) => moves.effort[b] - moves.effort[a])[0];
                                moves.effort[top] -= 1;
                            }
                            redraw();
                        }
                    }
                }),
                el("span", { class: "alloc", text: String(moves.spend) }),
                el("button", {
                    class: "step", text: "+",
                    onClick: () => { if (moves.spend < maxBuy) { moves.spend += 1; redraw(); } }
                })
            ]));
        }

        wrap.appendChild(el("div", {
            class: "lever-label",
            text: `WHERE TO CAMPAIGN — ${pool()} effort points (remaining: ${remaining()})`
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
                    onClick: () => {
                        if (remaining() > 0 && cur < MAX_PER_STATE) { moves.effort[contest.state] = cur + 1; redraw(); }
                    }
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
