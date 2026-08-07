/* ============================================================
   verify-makerng.js — Session-1 Step-2 gate for the snapshottable RNG.

   Two checks, both must PASS:

   1) COPY-IDENTITY — makeRng's raw draw sequence is byte-identical to
      the CANONICAL mulberry32 in frozen model/sim2016.js (extracted
      from source; model/ is never modified), across several seeds,
      >=1000 draws each.

   2) SNAPSHOT/RESTORE FIDELITY — getState() then setState() reproduces
      the exact subsequent draw sequence, for many seeds and at varied
      snapshot points. Tested two ways:
        (a) same generator restored to a snapshot;
        (b) a FRESH generator setState()'d to the snapshot — the exact
            pattern the legibility counterfactual will use.

   Usage:  node verify-makerng.js
   Exit 0 = PASS, 1 = FAIL.
   ============================================================ */

const fs = require("fs");
const path = require("path");
const { makeRng } = require("./src/rng.js");

let pass = true;

// ---- canonical mulberry32 from frozen model/sim2016.js (read-only) ----
function loadCanonical() {
    const src = fs.readFileSync(path.join(__dirname, "..", "model", "sim2016.js"), "utf8");
    const m = src.match(/function mulberry32[\s\S]*?\n\}/);
    if (!m) { console.error("FAIL — canonical mulberry32 not found in model/sim2016.js"); process.exit(1); }
    return new Function(m[0] + "\nreturn mulberry32;")();
}
const canonical = loadCanonical();

// ---- 1) COPY-IDENTITY ----
const DRAWS = 2000;
const seeds = [20160201, 1, 123456789, 4294967295, 777];
let copyOk = true, drift = null;
for (const s of seeds) {
    const a = makeRng(s);
    const b = canonical(s);
    for (let i = 0; i < DRAWS; i++) {
        if (a() !== b()) { copyOk = false; drift = { s, i }; break; }
    }
    if (!copyOk) break;
}
console.log("1) COPY-IDENTITY — makeRng vs canonical model/sim2016.js mulberry32:");
console.log(`   seeds: ${seeds.join(", ")}   draws/seed: ${DRAWS}`);
console.log(copyOk
    ? `   PASS — byte-identical across ${seeds.length * DRAWS} draws.`
    : `   FAIL — drift at seed ${drift.s}, draw ${drift.i}.`);
pass = pass && copyOk;
console.log("");

// ---- 2) SNAPSHOT/RESTORE FIDELITY ----
const SEQ = 1000;
let snapOk = true, snapFail = null;
const advancePoints = [0, 1, 7, 50, 333, 1009];
for (const s of [20160201, 2, 999983, 4294967295, 42]) {
    for (const adv of advancePoints) {
        const r = makeRng(s);
        for (let i = 0; i < adv; i++) r();       // advance to a varied point
        const snap = r.getState();

        const seqA = []; for (let i = 0; i < SEQ; i++) seqA.push(r());

        // (a) same generator restored
        r.setState(snap);
        for (let i = 0; i < SEQ; i++) {
            if (r() !== seqA[i]) { snapOk = false; snapFail = { s, adv, i, mode: "same-gen" }; break; }
        }
        if (!snapOk) break;

        // (b) FRESH generator restored to the snapshot (the counterfactual pattern)
        const r2 = makeRng(0);
        r2.setState(snap);
        for (let i = 0; i < SEQ; i++) {
            if (r2() !== seqA[i]) { snapOk = false; snapFail = { s, adv, i, mode: "fresh-gen" }; break; }
        }
        if (!snapOk) break;
    }
    if (!snapOk) break;
}
console.log("2) SNAPSHOT/RESTORE FIDELITY — getState()/setState() reproduces the stream:");
console.log(`   seeds × snapshot-points tested; ${SEQ} draws compared per case; same-gen AND fresh-gen restore.`);
console.log(snapOk
    ? "   PASS — restored sequences byte-identical (both restore modes)."
    : `   FAIL — mismatch at seed ${snapFail.s}, advance ${snapFail.adv}, draw ${snapFail.i} (${snapFail.mode}).`);
pass = pass && snapOk;

console.log("");
console.log(pass ? "makeRng GATE: PASS" : "makeRng GATE: FAIL");
process.exit(pass ? 0 : 1);
