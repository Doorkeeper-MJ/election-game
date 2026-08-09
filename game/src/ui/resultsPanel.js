/* resultsPanel.js — shows the last turn's per-state delegate awards,
   plus (Slice 2) the LEGIBILITY readout: the marginal effect of the
   player's own effort, from the real-engine counterfactual.

   Honest-copy rule: the delta is the LOCAL effect of the player's push
   in THAT contest given the real race state — so the copy always says
   "your push here", never season-long attribution. */

const { el } = require("./dom.js");
const { tip } = require("./tip.js");

function lastName(full) {
    const parts = full.split(" ");
    return parts[parts.length - 1];
}

// "Cruz +8 (73 vs 65) · Trump −8" — top movers by |delta|, player first.
function effectLine(effect, playerName) {
    const moved = effect.deltas
        .filter(d => d.delta !== 0)
        .sort((a, b) => {
            if (a.name === playerName) return -1;
            if (b.name === playerName) return 1;
            return Math.abs(b.delta) - Math.abs(a.delta);
        })
        .slice(0, 3);
    return moved.map(d => {
        const sign = d.delta > 0 ? "+" : "−";
        const mag = Math.abs(d.delta);
        const detail = d.name === playerName ? ` (${d.real} vs ${d.cf})` : "";
        return `${lastName(d.name)} ${sign}${mag}${detail}`;
    }).join(" · ");
}

function render(lastResult, game) {
    const player = game.field.find(c => c.id === game.playerId);
    const playerName = player ? player.name : null;

    const wrap = el("div", { class: "panel results" });
    // Copy FINAL (MJ pass 2026-08-08, approved as written).
    const t = tip("Each line: the state, the delegates it carried, and who won them. The gold ↳ line is the measured effect of your moves — your delegates with them versus without, same contest, same dice. ⚡ means your moves changed who won the state.");
    wrap.appendChild(el("h3", { text: `Results — ${lastResult.date}` }, [t.btn]));
    wrap.appendChild(t.body);

    // Three states to distinguish (copy set by MJ 2026-08-08):
    //   1. no moves made            -> hands-off line
    //   2. moves made, effect != 0  -> the gold line (unchanged)
    //   3. moves made, effect == 0  -> explicit zero line, never mislabeled
    //      as hands-off (a real push CAN measure zero; the gates only
    //      guarantee the converse — zero moves always measure zero).
    const pm = lastResult.playerMoves || null;
    const movesMade = pm ? pm.any : null; // null = pre-playerMoves result (legacy)

    let pushedAnywhere = false;
    let netPlayerDelta = 0;

    for (const c of lastResult.contests) {
        const top = c.awards.slice().sort((a, b) => b.delegates - a.delegates)
            .slice(0, 3)
            .map(a => `${lastName(a.name)} ${a.delegates}`)
            .join(", ");
        wrap.appendChild(el("div", {
            class: "result-row",
            text: `${c.state} (${c.delegates}): ${top || "no award"}`
        }));

        const fx = c.effect;
        if (!fx || !fx.deltas) continue;
        const anyDelta = fx.deltas.some(d => d.delta !== 0);

        // Did the player's moves apply to THIS contest? Effort is per-state;
        // emphasis is turn-wide, so it touches every contest on the date.
        const movesHere = pm && (pm.effort[c.state] > 0 || pm.emphasis !== null);

        if (!anyDelta) {
            if (movesHere) {
                wrap.appendChild(el("div", {
                    class: "effect-zero",
                    text: "Your moves here: no measurable change this contest."
                }));
            }
            continue;
        }

        pushedAnywhere = true;
        if (playerName) {
            const mine = fx.deltas.find(d => d.name === playerName);
            if (mine) netPlayerDelta += mine.delta;
        }

        wrap.appendChild(el("div", {
            class: "effect-line",
            text: `↳ your moves here: ${effectLine(fx, playerName)}`
        }));

        if (fx.flipped) {
            const wonIt = playerName && fx.realWinner === playerName;
            wrap.appendChild(el("div", {
                class: "effect-flip",
                text: wonIt
                    ? `⚡ Your moves WON ${c.state} (was ${lastName(fx.cfWinner)}'s)`
                    : `⚡ Your moves changed the winner here: ${lastName(fx.cfWinner)} → ${lastName(fx.realWinner)}`
            }));
        }
    }

    if (pushedAnywhere && playerName) {
        const sign = netPlayerDelta > 0 ? "+" : (netPlayerDelta < 0 ? "−" : "±");
        wrap.appendChild(el("div", {
            class: "effect-summary",
            text: `Net effect of your moves this turn: ${lastName(playerName)} ${sign}${Math.abs(netPlayerDelta)} delegates`
        }));
    } else if (movesMade === false || (movesMade === null && !pushedAnywhere)) {
        wrap.appendChild(el("div", {
            class: "effect-none",
            text: "Hands-off turn — baseline result, no moves made."
        }));
    }

    return wrap;
}

module.exports = { render };
