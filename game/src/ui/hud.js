/* hud.js — standings panel. Sorts a COPY of field (never mutates the
   field's order, which the rng draw order depends on). */

const { el } = require("./dom.js");
const { tip } = require("./tip.js");

function render(game) {
    const wrap = el("div", { class: "panel hud" });
    const sorted = game.field.slice().sort((a, b) => b.delegates - a.delegates);
    const leader = sorted[0];

    // Copy FINAL (MJ pass 2026-08-08, approved as written).
    const t = tip(`Everyone in the race, sorted by delegates. "del" is delegates won — first to ${game.clinch} clinches the nomination. "mo" is momentum: the wind at a campaign's back (or in its face) right now. ▶ marks you.`);
    wrap.appendChild(el("h2", { text: "STANDINGS" }, [t.btn]));
    wrap.appendChild(t.body);
    wrap.appendChild(el("div", {
        class: "clinch",
        text: `Leader: ${leader.name} — ${leader.delegates} / ${game.clinch} to clinch`
    }));

    const table = el("div", { class: "standings" });
    for (const c of sorted) {
        const isPlayer = c.id === game.playerId;
        table.appendChild(el("div", { class: "cand-row" + (isPlayer ? " player" : "") }, [
            el("span", { class: "cand-name", text: (isPlayer ? "▶ " : "") + c.name }),
            el("span", { class: "cand-del", text: `${c.delegates} del` }),
            el("span", { class: "cand-mo", text: `mo ${c.momentum.toFixed(1)}` })
        ]));
    }
    wrap.appendChild(table);
    return wrap;
}

module.exports = { render };
