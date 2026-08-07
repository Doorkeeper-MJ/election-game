/* ============================================================
   verify-broadcast.js — Slice 3 gate for the three-voice broadcast.

   The voices can only be as honest as the context they read, so this
   gate checks the FACTUAL SUBSTRATE, not the prose:

   PART 1 — CONTEXT FIDELITY. Every headline number in the context
   object must match live game state / the real calendar: delegates,
   standings order, clinch math, remaining-delegate sum, and the
   season-cumulative effect totals recomputed independently here.

   PART 2 — EFFECT PASSTHROUGH. The per-contest measured effect in the
   context must equal the Slice 2 counterfactual data exactly (no
   rounding, no invention, no dropped flips).

   PART 3 — VANTAGE DETERMINISM. The commentator's posture must be a
   pure function of (seed, turnIndex) — a re-render must never re-roll
   it, or the same turn could flip between measured and bold.

   PART 4 — PROMPT GUARDRAILS. All three system prompts must carry the
   no-fabrication rule and must explicitly forbid the systems this game
   does NOT model (money/fundraising/ads/endorsements/debates/polls-
   national). This is the check that stops a voice inventing a budget.

   PART 5 — TRUNCATION SURFACING. A voice that hits max_tokens is cut
   off mid-sentence. It must NEVER render as a finished call. Drives the
   real client + real panel with fetch stubbed, both directions:
   stop_reason "max_tokens" -> truncated flag -> visible marker + warn;
   stop_reason "end_turn" -> clean body, no marker. Nothing but this
   check stops a clipped call reading as intentional.

   Usage:  node verify-broadcast.js [seed]   (default 20160201)
   Exit 0 = PASS, 1 = FAIL.
   ============================================================ */

const { newGame } = require("./src/gameState.js");
const { resolveTurn } = require("./src/turnLoop.js");
const context = require("./src/broadcast/context.js");
const PROMPTS = require("./src/broadcast/prompts.js");

const SEED = parseInt(process.argv[2], 10) || 20160201;
let pass = true;
const fails = [];
function check(cond, label) { if (!cond) { pass = false; fails.push(label); } return cond; }

// ---- drive a real season with real moves ----
const g = newGame("R16-2", SEED);
const snapshots = [];
while (g.turnIndex < g.turns.length) {
    const turn = g.turns[g.turnIndex];
    const biggest = turn.contests.slice().sort((a, b) => b.delegates - a.delegates)[0];
    const res = resolveTurn(g, { effort: { [biggest.state]: 3 }, emphasis: 4 });
    snapshots.push(context.build(g, res));
}
const ctx = snapshots[snapshots.length - 1];
const player = g.field.find(c => c.id === g.playerId);

// ---- PART 1: context fidelity ----
check(ctx.player.delegates === player.delegates, "player delegate count mismatch");
check(ctx.game.delegates_to_clinch === g.clinch, "clinch threshold mismatch");
check(ctx.player.delegates_needed_to_clinch === Math.max(0, g.clinch - player.delegates), "player clinch math wrong");

const trueLeader = g.field.slice().sort((a, b) => b.delegates - a.delegates)[0];
check(ctx.leader.name === trueLeader.name && ctx.leader.delegates === trueLeader.delegates, "leader wrong");

let sortedOk = true;
for (let i = 1; i < ctx.standings.length; i++) {
    if (ctx.standings[i - 1].delegates < ctx.standings[i].delegates) sortedOk = false;
}
check(sortedOk, "standings not sorted by delegates");

// remaining-delegate sum recomputed independently (end of season -> 0)
let trueRemaining = 0;
for (let t = g.turnIndex; t < g.turns.length; t++)
    for (const c of g.turns[t].contests) trueRemaining += c.delegates;
check(ctx.calendar.delegates_remaining_in_all_future_contests === trueRemaining, "remaining-delegate sum wrong");

// season totals recomputed independently
let netDelta = 0, flips = 0, pushed = 0;
for (const res of g.history) {
    for (const c of res.contests) {
        const fx = c.effect;
        if (!fx || !fx.deltas) continue;
        const mine = fx.deltas.find(d => d.name === player.name);
        if (mine && mine.delta !== 0) { netDelta += mine.delta; pushed++; }
        if (fx.flipped && fx.realWinner === player.name) flips++;
    }
}
check(ctx.player_season_totals.net_delegates_gained_from_own_moves === netDelta, "season net delta wrong");
check(ctx.player_season_totals.contests_where_moves_measurably_mattered === pushed, "season pushed-contest count wrong");
check(ctx.player_season_totals.states_won_that_would_otherwise_have_been_lost === flips, "season flip count wrong");
console.log("CONTEXT FIDELITY — delegates, standings, clinch math, calendar sum, season totals:");
console.log(`  season net effect ${netDelta >= 0 ? "+" : ""}${netDelta} del · ${pushed} contests moved · ${flips} flips · remaining ${trueRemaining}`);
console.log(pass ? "  PASS — every headline number traces to live state." : "  FAIL");
console.log("");

// ---- PART 2: effect passthrough (mid-season snapshot with real pushes) ----
const mid = snapshots[Math.floor(snapshots.length / 2)];
const midResult = g.history[Math.floor(snapshots.length / 2)];
let passthroughOk = true, checkedRows = 0;
for (const row of (mid.this_turn_result ? mid.this_turn_result.contests : [])) {
    const src = midResult.contests.find(c => c.state === row.state);
    if (!src) { passthroughOk = false; continue; }
    const fx = src.effect;
    const hasReal = fx && fx.deltas && fx.deltas.some(d => d.delta !== 0);
    if (hasReal !== !!row.player_moves_measured_effect) { passthroughOk = false; continue; }
    if (!hasReal) continue;
    checkedRows++;
    for (const d of row.player_moves_measured_effect.deltas) {
        const s = fx.deltas.find(x => x.name === d.name);
        if (!s || s.delta !== d.delta || s.real !== d.real || s.cf !== d.without_player_moves) passthroughOk = false;
    }
    if (!!fx.flipped !== row.player_moves_measured_effect.flipped_winner) passthroughOk = false;
}
check(passthroughOk, "effect passthrough corrupted");
console.log(`EFFECT PASSTHROUGH — Slice 2 counterfactual data into the voices' context (${checkedRows} contest rows):`);
console.log(passthroughOk ? "  PASS — deltas, reals, counterfactuals, and flips identical." : "  FAIL");
console.log("");

// ---- PART 3: vantage determinism ----
const g2 = newGame("R16-2", SEED);
let vantageStable = true;
const seen = [];
while (g2.turnIndex < g2.turns.length) {
    const a = context.vantageFor(g2), b = context.vantageFor(g2), c = context.vantageFor(g2);
    if (a !== b || b !== c) vantageStable = false;
    seen.push(a);
    resolveTurn(g2, null);
}
const boldCount = seen.filter(v => v === "bold").length;
check(vantageStable, "vantage not stable across repeated calls");
check(seen.every(v => v === "bold" || v === "measured"), "vantage produced an unknown value");
check(boldCount > 0 && boldCount < seen.length, "vantage never varies (all one posture)");
console.log(`VANTAGE DETERMINISM — commentator posture is a pure fn of (seed, turn), seed ${SEED}:`);
console.log(`  ${seen.length} turns · ${boldCount} bold · ${seen.length - boldCount} measured · stable on repeat: ${vantageStable}`);
console.log(vantageStable ? "  PASS — a re-render can never re-roll the posture." : "  FAIL");
console.log("");

// ---- PART 4: prompt guardrails ----
const FORBIDDEN = ["money", "fundraising", "ad spending", "endorsements", "debates", "scandals"];
let guardOk = true;
for (const [name, text] of Object.entries({ ANNOUNCER: PROMPTS.ANNOUNCER, ADVISOR: PROMPTS.ADVISOR, COMMENTATOR: PROMPTS.COMMENTATOR })) {
    if (text.indexOf("NEVER INVENT ANYTHING") === -1) { guardOk = false; fails.push(name + " missing no-fabrication rule"); }
    if (text.indexOf("must come from the JSON") === -1) { guardOk = false; fails.push(name + " missing JSON-only rule"); }
    for (const f of FORBIDDEN) {
        if (text.toLowerCase().indexOf(f) === -1) { guardOk = false; fails.push(name + " does not forbid: " + f); }
    }
}
check(guardOk, "prompt guardrails incomplete");
console.log("PROMPT GUARDRAILS — all three voices carry the no-fabrication rule + the not-modeled list:");
console.log(`  forbidden systems each prompt must name: ${FORBIDDEN.join(", ")}`);
console.log(guardOk ? "  PASS — no voice is licensed to invent a budget." : "  FAIL");
console.log("");

// ---- PART 5: truncation surfacing ----
// Exercises the REAL client.speak and the REAL broadcastPanel render with
// only the network stubbed, so this covers the whole chain: stop_reason
// parsing -> truncated flag -> class + marker in the DOM. No API key, no
// network, no cost. See client.js (stop_reason) and broadcastPanel.js.

// minimal DOM + browser-global stubs (node has none of these)
function mkNode(tag) {
    return {
        tag, className: "", textContent: "", children: [],
        appendChild(c) { this.children.push(c); return c; },
        removeChild(c) { this.children = this.children.filter(x => x !== c); },
        addEventListener() {}, setAttribute() {},
        get firstChild() { return this.children[0] || null; }
    };
}
global.document = { createElement: mkNode, createTextNode: (t) => ({ tag: "#text", textContent: t, children: [] }) };
global.localStorage = { getItem: () => "sk-ant-gate-stub", setItem() {}, removeItem() {} };

function flatten(node, out) {
    out = out || [];
    out.push({ cls: node.className || "", text: node.textContent || "" });
    (node.children || []).forEach(c => flatten(c, out));
    return out;
}

const CUT_TEXT = "Cruz takes Iowa and the arithmetic still";
const STUB_OUTPUT_TOKENS = 1487;   // near a 1500 cap: the thinking-ate-it signature
function stubFetch(stopReason) {
    global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
            content: [{ type: "text", text: CUT_TEXT }],
            stop_reason: stopReason,
            usage: { input_tokens: 2000, output_tokens: STUB_OUTPUT_TOKENS }
        })
    });
}

const PANEL_PATH = require.resolve("./src/ui/broadcastPanel.js");
const lastRes = g.history[g.history.length - 1];

function renderWith(stopReason) {
    stubFetch(stopReason);
    delete require.cache[PANEL_PATH];          // reset the panel's per-turn cache
    const panel = require("./src/ui/broadcastPanel.js");
    const warnings = [];
    const realWarn = console.warn;
    console.warn = (m) => warnings.push(String(m));
    return new Promise(resolve => {
        let tree = null, settled = false;
        const done = () => {
            if (settled) return;
            settled = true;
            console.warn = realWarn;
            resolve({ rows: flatten(tree), warnings });
        };
        const rerender = () => { tree = panel.render(g, lastRes, rerender); setTimeout(done, 0); };
        tree = panel.render(g, lastRes, rerender);
        setTimeout(done, 100);                 // resolve even if nothing async fires
    });
}

(async () => {
    const cut = await renderWith("max_tokens");
    const cutMarker = cut.rows.find(r => r.cls === "bc-cutoff");
    const cutBody = cut.rows.find(r => r.cls.indexOf("bc-body") === 0);
    check(!!cutMarker, "truncated call renders no visible CUT OFF marker");
    check(!!cutBody && cutBody.cls.indexOf("truncated") !== -1, "truncated call body missing .truncated class");
    check(cut.warnings.some(w => w.indexOf("max_tokens") !== -1), "truncated call did not warn to console");
    check(cut.warnings.some(w => w.indexOf("output_tokens=" + STUB_OUTPUT_TOKENS) !== -1),
          "truncation warning omits the reported output_tokens");

    const ok = await renderWith("end_turn");
    const okMarker = ok.rows.find(r => r.cls === "bc-cutoff");
    const okBody = ok.rows.find(r => r.cls.indexOf("bc-body") === 0);
    check(!okMarker, "complete call wrongly marked as cut off");
    check(!!okBody && okBody.cls.indexOf("truncated") === -1, "complete call body wrongly given .truncated class");
    check(!!okBody && okBody.text.indexOf(CUT_TEXT) !== -1, "complete call lost its text");

    console.log("TRUNCATION SURFACING — a clipped voice must never read as a finished call:");
    console.log(`  stop_reason "max_tokens" -> marker: ${!!cutMarker} · body class ${JSON.stringify(cutBody ? cutBody.cls : "(none)")} · warn reports output_tokens=${STUB_OUTPUT_TOKENS}: ${cut.warnings.some(w => w.indexOf("output_tokens=" + STUB_OUTPUT_TOKENS) !== -1)}`);
    console.log(`  stop_reason "end_turn"   -> marker: ${!!okMarker} · body class ${JSON.stringify(okBody ? okBody.cls : "(none)")}`);
    console.log(cutMarker && !okMarker ? "  PASS — truncation is visible, completion is clean." : "  FAIL");

    console.log("");
    if (!pass) console.log("FAILURES: " + fails.join(" | "));
    console.log(pass ? "BROADCAST GATE: PASS" : "BROADCAST GATE: FAIL");
    process.exit(pass ? 0 : 1);
})();
