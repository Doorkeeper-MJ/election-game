/* ============================================================
   sweep2016.js — tuning-knob sweep for the 2016 batch

   Runs the 200-run batch across a grid of AUTH bounds x
   CALIB_SCALE values and reports Trump win % and average
   delegate share per cell. Mutates the shared config object
   in-memory only — config.js on disk is never touched.

   Usage:  node sweep2016.js [nRuns] [seed]
   ============================================================ */

const CFG = require("./config.js");
const { runPrimary } = require("./engine.js");
const { cycle2016, candidates2016, calendar2016 } = require("./data-2016.js");

function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const nRuns = parseInt(process.argv[2], 10) || 200;
const seed = parseInt(process.argv[3], 10) || 20160201;
const totalDelegates = calendar2016.reduce((s, c) => s + c.delegates, 0);

function batch() {
    const rng = mulberry32(seed); // same seed every cell, comparable
    let trumpWins = 0;
    let trumpDels = 0;
    let cruzDels = 0;
    for (let i = 0; i < nRuns; i++) {
        const result = runPrimary(candidates2016, calendar2016, cycle2016, rng);
        if (result[0].name === "Donald Trump") trumpWins++;
        trumpDels += result.find(c => c.name === "Donald Trump").delegates;
        cruzDels += result.find(c => c.name === "Ted Cruz").delegates;
    }
    return {
        winPct: 100 * trumpWins / nRuns,
        trumpShare: 100 * (trumpDels / nRuns) / totalDelegates,
        cruzShare: 100 * (cruzDels / nRuns) / totalDelegates
    };
}

const AUTH_GRID = [[1.0, 1.0], [0.85, 1.15], [0.7, 1.3], [0.6, 1.4], [0.5, 1.5]];
const SCALE_GRID = [0, 5, 10, 15, 20];

console.log(`Sweep: ${nRuns} runs/cell, seed ${seed}. Cells: Trump win% | Trump share% | Cruz share%`);
console.log(`(history: Trump 58.3% share, Cruz 22.3%)`);
console.log("");
const header = ["AUTH \\ SCALE", ...SCALE_GRID.map(s => String(s).padStart(20))].join(" ");
console.log(header);
for (const [amin, amax] of AUTH_GRID) {
    CFG.AUTH_MIN = amin;
    CFG.AUTH_MAX = amax;
    const cells = [];
    for (const scale of SCALE_GRID) {
        CFG.CALIB_SCALE = scale;
        const r = batch();
        cells.push(`${r.winPct.toFixed(0)}% | ${r.trumpShare.toFixed(1)} | ${r.cruzShare.toFixed(1)}`.padStart(20));
    }
    console.log(`${(amin + "-" + amax).padEnd(12)} ${cells.join(" ")}`);
}
