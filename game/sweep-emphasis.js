/* ============================================================
   sweep-emphasis.js — balance sweep for the Slice 2 emphasis lever.
   (Play-layer tooling, same pattern as sweep-lever.js; engine frozen,
   config-play.js unchanged by running this.)

   Strategies, 200 seeds each, player = Cruz:
     A. hands-off            (baseline; expect ~17.5% win)
     B. emphasis-only        (weakest axis each turn)
     C. effort-only          (all-in biggest state; expect ~31%)
     D. effort + emphasis    (both levers)

   Question: does emphasis move the win rate a sensible amount —
   noticeable but smaller than the campaign lever, and does stacking
   stay inside the "earned upset" philosophy (no blowout)?
   ============================================================ */

const { newGame } = require("./src/gameState.js");
const { resolveTurn } = require("./src/turnLoop.js");
const { cycle2016 } = require("../model/data-2016.js");

const SEEDS = 200;
const BASE = 20160000;

function weakestAxis(p) {
    let axis = 0, worst = -1;
    for (let a = 0; a < p.calib.issues.length; a++) {
        const gap = Math.abs(p.calib.issues[a] - cycle2016.mood[a]);
        if (gap > worst) { worst = gap; axis = a; }
    }
    return axis;
}

function season(seed, useEffort, useEmphasis) {
    const g = newGame("R16-2", seed);
    while (g.turnIndex < g.turns.length) {
        const turn = g.turns[g.turnIndex];
        const p = g.field.find(c => c.id === g.playerId);
        const moves = { effort: {}, emphasis: null };
        if (useEffort) {
            const biggest = turn.contests.slice().sort((a, b) => b.delegates - a.delegates)[0];
            moves.effort[biggest.state] = 3;
        }
        if (useEmphasis) moves.emphasis = weakestAxis(p);
        resolveTurn(g, (useEffort || useEmphasis) ? moves : null);
    }
    const sorted = g.field.slice().sort((a, b) => b.delegates - a.delegates);
    const cruz = g.field.find(c => c.id === "R16-2");
    return { won: sorted[0].id === "R16-2", dels: cruz.delegates };
}

const strategies = [
    ["A hands-off      ", false, false],
    ["B emphasis-only  ", false, true],
    ["C effort-only    ", true, false],
    ["D effort+emphasis", true, true]
];

for (const [label, eff, emp] of strategies) {
    let wins = 0, dels = 0;
    for (let i = 0; i < SEEDS; i++) {
        const r = season(BASE + i, eff, emp);
        if (r.won) wins++;
        dels += r.dels;
    }
    console.log(`${label}  win ${(100 * wins / SEEDS).toFixed(1)}%   avg dels ${(dels / SEEDS).toFixed(0)}`);
}
