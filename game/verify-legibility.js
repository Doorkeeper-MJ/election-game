/* ============================================================
   verify-legibility.js — Slice 2 gate for the legibility counterfactual.

   Three machine-checked invariants, all must PASS:

   PART 1 — NO-OP INVARIANT. A zero-move season must produce EXACTLY zero
   delta on every candidate in every contest, and no winner flips. If the
   counterfactual ever disagrees with the authoritative run when the player
   did nothing, the clone/rng-restore machinery is broken.

   PART 2 — GATE A NON-PERTURBATION. The same no-move playthrough (now with
   the counterfactual running every contest) must STILL equal runPrimary
   digit-for-digit at the same seed — proving the clones and the separate
   cf generator never touch the real game. (verify-gate.js also still runs
   standalone; this re-checks inside the same process as Part 1.)

   PART 3 — EFFORT SMOKE. All-in effort on the first turn's biggest state,
   across several seeds: the effect structure must be present and at least
   one nonzero delta must appear somewhere (the lever's +/−N is known-real
   from the 200-seed sweep; if the readout can never see it, it's broken).

   Usage:  node verify-legibility.js [seed]   (default 20160201)
   Exit 0 = PASS, 1 = FAIL.
   ============================================================ */

const { runPrimary } = require("../model/engine.js");
const { candidates2016, calendar2016, cycle2016 } = require("../model/data-2016.js");
const { mulberry32 } = require("./src/rng.js");
const { newGame } = require("./src/gameState.js");
const { resolveTurn } = require("./src/turnLoop.js");

const SEED = parseInt(process.argv[2], 10) || 20160201;
let pass = true;

// ---- PART 1: no-op invariant ----
const g1 = newGame("R16-2", SEED);
let contests = 0, badDeltas = 0, flips = 0, missingEffect = 0;
while (g1.turnIndex < g1.turns.length) {
    const res = resolveTurn(g1, null);
    for (const c of res.contests) {
        contests++;
        if (!c.effect || !Array.isArray(c.effect.deltas)) { missingEffect++; continue; }
        for (const d of c.effect.deltas) if (d.delta !== 0) badDeltas++;
        if (c.effect.flipped) flips++;
    }
}
const noopOk = badDeltas === 0 && flips === 0 && missingEffect === 0;
console.log(`NO-OP INVARIANT — zero-move season, seed ${SEED}:`);
console.log(`  contests checked: ${contests}  nonzero deltas: ${badDeltas}  flips: ${flips}  missing effect: ${missingEffect}`);
console.log(noopOk ? "  PASS — counterfactual identical to authoritative on every contest." : "  FAIL");
pass = pass && noopOk;
console.log("");

// ---- PART 2: Gate A non-perturbation (digit-for-digit inside this process) ----
const ref = runPrimary(candidates2016, calendar2016, cycle2016, mulberry32(SEED))
    .map(c => ({ name: c.name, delegates: c.delegates }))
    .sort((x, y) => x.name.localeCompare(y.name));
const got = g1.field
    .map(c => ({ name: c.name, delegates: c.delegates }))
    .sort((x, y) => x.name.localeCompare(y.name));
let digitOk = ref.length === got.length;
for (let i = 0; i < ref.length; i++) {
    if (!got[i] || ref[i].name !== got[i].name || ref[i].delegates !== got[i].delegates) digitOk = false;
}
console.log(`NON-PERTURBATION — no-move playthrough (counterfactual active) vs runPrimary, seed ${SEED}:`);
console.log(digitOk ? "  PASS — digit-for-digit identical." : "  FAIL — diverged.");
pass = pass && digitOk;
console.log("");

// ---- PART 3: effort smoke across seeds ----
const smokeSeeds = [SEED, 20160272, 42];
let sawNonzero = false, structureOk = true;
for (const s of smokeSeeds) {
    const g = newGame("R16-2", s);
    while (g.turnIndex < g.turns.length) {
        const turn = g.turns[g.turnIndex];
        const biggest = turn.contests.slice().sort((a, b) => b.delegates - a.delegates)[0];
        const res = resolveTurn(g, { effort: { [biggest.state]: 3 } });
        for (const c of res.contests) {
            if (!c.effect || !Array.isArray(c.effect.deltas)) { structureOk = false; continue; }
            for (const d of c.effect.deltas) if (d.delta !== 0) sawNonzero = true;
        }
    }
}
const smokeOk = structureOk && sawNonzero;
console.log(`EFFORT SMOKE — all-in on biggest state each turn, seeds ${smokeSeeds.join(", ")}:`);
console.log(`  effect structure present: ${structureOk}  nonzero delta observed: ${sawNonzero}`);
console.log(smokeOk ? "  PASS — the readout can see the lever working." : "  FAIL");
pass = pass && smokeOk;

console.log("");

// ---- PART 4: emphasis lever — smoke + shared-calib non-mutation ----
// Snapshot the frozen data module's calib objects BEFORE an emphasis-heavy
// season; they must be byte-identical after (the lever swaps references,
// never mutates). Also: emphasis alone must produce a visible delta.
const calibBefore = JSON.stringify(candidates2016.map(c => c.calib));
const cycleBefore = JSON.stringify({ mood: cycle2016.mood, salience: cycle2016.salience });

let emphNonzero = false;
for (const s of [SEED, 42]) {
    const g = newGame("R16-2", s);
    while (g.turnIndex < g.turns.length) {
        // Emphasize the player's WEAKEST axis each turn (max |pos − mood|) — emphasis only, no effort.
        const p = g.field.find(c => c.id === g.playerId);
        let axis = 0, worst = -1;
        for (let a = 0; a < p.calib.issues.length; a++) {
            const gap = Math.abs(p.calib.issues[a] - cycle2016.mood[a]);
            if (gap > worst) { worst = gap; axis = a; }
        }
        const res = resolveTurn(g, { effort: {}, emphasis: axis });
        for (const c of res.contests) {
            if (c.effect && c.effect.deltas.some(d => d.delta !== 0)) emphNonzero = true;
        }
    }
}
const calibAfter = JSON.stringify(candidates2016.map(c => c.calib));
const cycleAfter = JSON.stringify({ mood: cycle2016.mood, salience: cycle2016.salience });
const calibOk = calibBefore === calibAfter && cycleBefore === cycleAfter;
const emphOk = calibOk && emphNonzero;
console.log("EMPHASIS LEVER — emphasis-only seasons (weakest axis each turn), seeds " + SEED + ", 42:");
console.log(`  shared calib/cycle data unmutated: ${calibOk}  nonzero delta observed: ${emphNonzero}`);
console.log(emphOk ? "  PASS — emphasis is transient, bounded, and visible." : "  FAIL");
pass = pass && emphOk;

console.log("");
console.log(pass ? "LEGIBILITY GATE: PASS" : "LEGIBILITY GATE: FAIL");
process.exit(pass ? 0 : 1);
