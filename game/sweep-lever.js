/* ============================================================
   sweep-lever.js — play-layer tuning sweep. Changes NO file: it
   mutates the play-layer config object IN MEMORY only (the on-disk
   config-play.js is never written). Engine stays frozen.

   Strategy under test: "focused all-in on Cruz" — every turn, put all
   EFFORT_POOL points on that turn's biggest-delegate state (matches
   how MJ played). For a grid of effective max-bump magnitudes, report:
     - Cruz WIN RATE over N seeds (the "earned upset" band measure)
     - Cruz avg delegates
     - the deterministic outcome at the locked seed 20160201
   maxBump 0 = hands-off reference (no lever).

   Usage:  node sweep-lever.js [nSeeds]   (default 200)
   ============================================================ */

const { newGame } = require("./src/gameState.js");
const { resolveTurn, evaluateEnd } = require("./src/turnLoop.js");
const PCFG = require("./src/config-play.js");

const N = parseInt(process.argv[2], 10) || 200;
const LOCKED = 20160201;
const MAGNITUDES = [0, 12, 18, 24, 30, 40, 55, 75]; // 12 = current; 0 = hands-off ref

// Set the effective per-state max bump (3 focused points -> maxBump). In-memory only.
function setMag(maxBump) {
    PCFG.POLL_BUMP_PER_EFFORT = maxBump / PCFG.EFFORT_POOL;
    PCFG.MAX_POLL_BUMP = maxBump;
}

function focusedMoves(turn) {
    let big = turn.contests[0];
    for (const c of turn.contests) if (c.delegates > big.delegates) big = c;
    const effort = {};
    effort[big.state] = PCFG.EFFORT_POOL;
    return { effort: effort };
}

function playFocused(seed) {
    const g = newGame("R16-2", seed); // Cruz
    while (g.phase !== "concluded" && g.turnIndex < g.turns.length) {
        const moves = focusedMoves(g.turns[g.turnIndex]);
        resolveTurn(g, moves);
        evaluateEnd(g);
    }
    const cruz = g.field.find(c => c.id === "R16-2");
    const trump = g.field.find(c => c.id === "R16-1");
    return { win: g.nominee.id === "R16-2", nominee: g.nominee.name, cruz: cruz.delegates, trump: trump.delegates };
}

console.log(`LEVER SWEEP — focused all-in on Cruz, ${N} seeds/magnitude. Engine frozen; config-play mutated in memory only.`);
console.log("");
console.log("maxBump | Cruz win% | Cruz avgDel | @seed20160201 (Cruz/Trump, winner)");
console.log("--------+-----------+-------------+-----------------------------------");
for (const mag of MAGNITUDES) {
    setMag(mag);
    let wins = 0, cruzSum = 0;
    for (let k = 0; k < N; k++) {
        const r = playFocused((LOCKED + k) >>> 0);
        if (r.win) wins++;
        cruzSum += r.cruz;
    }
    const locked = playFocused(LOCKED);
    const tag = mag === 0 ? " (hands-off ref)" : mag === 12 ? " (current)" : "";
    console.log(
        `${String(mag).padStart(7)} | ${(100 * wins / N).toFixed(1).padStart(8)}% | ${String(Math.round(cruzSum / N)).padStart(11)} | ` +
        `${String(locked.cruz).padStart(4)}/${String(locked.trump).padStart(4)}  ${locked.win ? "CRUZ" : locked.nominee.split(" ").pop()}${tag}`
    );
}
