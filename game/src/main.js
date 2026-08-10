/* ============================================================
   main.js — Slice 1 browser entry. Wires the play layer around the
   frozen model/ engine. Screens: candidate select -> play -> end.

   This is the ONLY browser-facing orchestrator. It imports core logic
   (gameState/turnLoop/levers) which esbuild bundles together with the
   frozen model/ — model/ is read by the bundler, never modified.
   ============================================================ */

const { newGame } = require("./gameState.js");
const { resolveTurn, evaluateEnd } = require("./turnLoop.js");
const CFG = require("./config-play.js");
const { clear } = require("./ui/dom.js");
const candidateSelect = require("./ui/candidateSelect.js");
const quickStart = require("./ui/quickStart.js");
const sound = require("./ui/sound.js");
const hud = require("./ui/hud.js");
const turnPanel = require("./ui/turnPanel.js");
const resultsPanel = require("./ui/resultsPanel.js");
const broadcastPanel = require("./ui/broadcastPanel.js");
const endScreen = require("./ui/endScreen.js");

const DEFAULT_PLAYER = "R16-2"; // Cruz — non-Trump default (agency felt)

// DEV/TEST ONLY — fixed-seed lock via URL param (e.g. index.html?seed=20160201).
// When present, EVERY game (including Play Again) uses this seed, so a zero-effort
// vs all-effort comparison runs on the SAME seed (isolates the lever from seed
// noise). Absent (the normal double-click) -> fresh random seed per game, unchanged.
// Out of the player path: a normal player never passes the param and never sees it.
function readLockedSeed() {
    const m = /[?&]seed=(\d+)/.exec(location.search || "");
    return m ? (parseInt(m[1], 10) >>> 0) : null;
}
const SEED_LOCK = readLockedSeed();

let game = null;
let lastResult = null;

function root() { return document.getElementById("app"); }

function start(playerId) {
    game = newGame(playerId, SEED_LOCK);     // SEED_LOCK null -> random; number -> locked
    lastResult = null;
    window.EGV1 = { game: game, CFG: CFG, seedLock: SEED_LOCK };  // debug handle
    renderPlay();
}

// Clearly-marked DEV badge, shown ONLY when a seed is locked.
function showSeedBadge() {
    if (SEED_LOCK === null) return;
    const bar = document.querySelector(".topbar");
    if (bar && !document.getElementById("seed-badge")) {
        const badge = document.createElement("span");
        badge.id = "seed-badge";
        badge.className = "seed-badge";
        badge.textContent = `DEV · seed locked: ${SEED_LOCK}`;
        bar.appendChild(badge);
    }
}

function onResolve(moves) {
    // Engine resolves instantly (audio never touches turnLoop — the gates
    // drive it headlessly in Node). The Poll-Close Drumroll holds only the
    // REVEAL: results render when the riser lands. Muted -> no delay.
    lastResult = resolveTurn(game, moves);
    evaluateEnd(game);
    sound.drumroll(() => {
        sound.turnSounds(game, lastResult);   // one tier max per batch, highest wins
        if (game.phase === "concluded") renderEnd();
        else renderPlay();
    });
}

function renderSelect() {
    const r = root(); clear(r);
    r.appendChild(candidateSelect.render(start, DEFAULT_PLAYER));
}

function renderPlay() {
    const r = root(); clear(r);
    r.appendChild(hud.render(game));
    if (lastResult) r.appendChild(resultsPanel.render(lastResult, game));
    // Slice 3 — the three-voice broadcast. Async voices call renderPlay
    // again as they land; the per-turn cache keeps that from re-billing.
    r.appendChild(broadcastPanel.render(game, lastResult, renderPlay));
    r.appendChild(turnPanel.render(game, onResolve));
}

function renderEnd() {
    const r = root(); clear(r);
    r.appendChild(hud.render(game));
    if (lastResult) r.appendChild(resultsPanel.render(lastResult, game));
    r.appendChild(broadcastPanel.render(game, lastResult, renderEnd));
    r.appendChild(endScreen.render(game, renderSelect));
}

function boot() {
    showSeedBadge();
    quickStart.install();   // header "? HOW TO PLAY" button + first-launch auto-open (after badge — CSS expects badge-then-button order)
    sound.install();        // header mute toggle, after the help button
    renderSelect();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}
