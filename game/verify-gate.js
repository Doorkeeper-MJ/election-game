/* ============================================================
   verify-gate.js — Slice 1 ACCEPTANCE GATE (addition A: RNG identity)

   Two machine-checked invariants, both must PASS:

   PART 1 — COPY-IDENTITY. game/src/rng.js's mulberry32 is a verbatim
   copy of the canonical one in the FROZEN model/sim2016.js (which
   exports nothing). This part extracts the canonical function FROM
   SOURCE (read-only; model/ is never modified) and asserts the copy
   produces a byte-identical draw sequence over >=1000 draws per seed,
   across several seeds. If they ever drift, the gate FAILS.

   PART 2 — DIGIT-FOR-DIGIT. A no-move turn-loop playthrough must equal
   runPrimary's single run at the same seed, comparing final delegates
   per candidate exactly. The play loop resolves the FULL calendar
   (end-policy disabled, as runPrimary has none) for a like-for-like
   compare.

   Usage:  node verify-gate.js [seed]      (default seed 20160201)
   Exit 0 = PASS, 1 = FAIL.
   ============================================================ */

const fs = require("fs");
const path = require("path");
const { runPrimary } = require("../model/engine.js");
const { candidates2016, calendar2016, cycle2016 } = require("../model/data-2016.js");
const { mulberry32 } = require("./src/rng.js");   // the play-layer COPY under test
const { newGame } = require("./src/gameState.js");
const { resolveTurn } = require("./src/turnLoop.js");

const SEED = parseInt(process.argv[2], 10) || 20160201;
let pass = true;

// ---- PART 1: copy-identity vs the canonical function in frozen model/ ----
function loadCanonicalMulberry() {
    const src = fs.readFileSync(path.join(__dirname, "..", "model", "sim2016.js"), "utf8");
    const m = src.match(/function mulberry32[\s\S]*?\n\}/);
    if (!m) {
        console.error("FAIL — could not locate canonical mulberry32 in model/sim2016.js");
        process.exit(1);
    }
    return new Function(m[0] + "\nreturn mulberry32;")();
}
const canonical = loadCanonicalMulberry();

const DRAWS = 2000;
const copySeeds = [SEED, 1, 123456789, 4294967295];
let copyOk = true;
let drift = null;
for (const s of copySeeds) {
    const a = mulberry32(s);
    const b = canonical(s);
    for (let i = 0; i < DRAWS; i++) {
        const x = a();
        const y = b();
        if (x !== y) { copyOk = false; drift = { seed: s, i, x, y }; break; }
    }
    if (!copyOk) break;
}
console.log("COPY-IDENTITY — play-layer rng vs canonical model/sim2016.js mulberry32:");
console.log(`  seeds: ${copySeeds.join(", ")}   draws/seed: ${DRAWS}`);
console.log(copyOk
    ? `  PASS — byte-identical across ${copySeeds.length * DRAWS} draws.`
    : `  FAIL — drift at seed ${drift.seed}, draw ${drift.i}: copy=${drift.x} canonical=${drift.y}`);
pass = pass && copyOk;
console.log("");

// ---- PART 2: digit-for-digit, no-move playthrough vs runPrimary ----
const ref = runPrimary(candidates2016, calendar2016, cycle2016, mulberry32(SEED))
    .map(c => ({ name: c.name, delegates: c.delegates }))
    .sort((x, y) => x.name.localeCompare(y.name));

const game = newGame("R16-2", SEED); // player = Cruz, but makes no moves
while (game.turnIndex < game.turns.length) resolveTurn(game, null);
const got = game.field
    .map(c => ({ name: c.name, delegates: c.delegates }))
    .sort((x, y) => x.name.localeCompare(y.name));

let delOk = ref.length === got.length;
const rows = [];
for (let i = 0; i < ref.length; i++) {
    const match = got[i] && ref[i].name === got[i].name && ref[i].delegates === got[i].delegates;
    delOk = delOk && match;
    rows.push(`  ${match ? "ok" : "XX"}  ${ref[i].name.padEnd(16)} ref=${String(ref[i].delegates).padStart(4)}  game=${String(got[i] ? got[i].delegates : "?").padStart(4)}`);
}
console.log(`DIGIT-FOR-DIGIT — no-move playthrough vs runPrimary (seed ${SEED}):`);
console.log(rows.join("\n"));
console.log(delOk ? "  PASS — identical." : "  FAIL — diverged.");
pass = pass && delOk;

console.log("");
console.log(pass ? "GATE A: PASS" : "GATE A: FAIL");
process.exit(pass ? 0 : 1);
