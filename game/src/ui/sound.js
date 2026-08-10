/* ============================================================
   sound.js — v1 sound layer per game/SOUND_SPEC.md.
   Tiers 1 (tick), 2 (chime), 5a (fanfare), 5b (somber) + the
   Poll-Close Drumroll. Tiers 3/4 are PARKED TO v2 — no cue for
   them exists in this file, deliberately: the spec forbids any
   other trigger from ever using the Tier 4 sound, and the
   cleanest guarantee of "no Tier 4 path exists" is absence.

   All cues are WebAudio-SYNTHESIZED — no audio files, no fetch,
   no CDN, no licenses. Works unkeyed and from file:// by
   construction. The spec's royalty-free-pack sourcing section is
   superseded for v1; the Doorkeeper Original Music replacement
   for the 5a fanfare drops in by replacing `cues.fanfare` with a
   decoded buffer player — the registry shape is built for that.

   Lives in the UI layer ONLY. The spec named turnLoop/evaluateEnd
   as hook points, but those are pure functions driven headlessly
   by the gates in Node — audio there would break gate:all. main.js
   calls in; engine and gates never see this file.

   UI doctrine (MJ, preserved in the spec): sound = information
   hierarchy for the ears; the rarer the sound, the more power it
   keeps. No stacking: one tier per resolution batch, highest wins.
   ============================================================ */

var MASTER_VOL = 0.6;          // spec: default ON at ~60%
var DRUMROLL_S = 1.8;          // "2–3s tension riser" — short end, respects pace
var MUTE_KEY = "egv1.muted";   // spec: persist mute for the session

var ctx = null;
var master = null;
var disabled = false;          // graceful no-audio fallback
var muted = readMuted();
var endPlayedFor = null;       // one Tier 5 per game instance

function readMuted() {
    try { return sessionStorage.getItem(MUTE_KEY) === "1"; } catch (e) { return false; }
}
function storeMuted(m) {
    try { sessionStorage.setItem(MUTE_KEY, m ? "1" : "0"); } catch (e) { /* fine */ }
}

/* AudioContext is created lazily INSIDE user-gesture call stacks
   (every play originates from a click), which satisfies autoplay
   policy without a separate unlock dance. */
function ensureCtx() {
    if (disabled) return null;
    if (!ctx) {
        try {
            var AC = window.AudioContext || window.webkitAudioContext;
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = muted ? 0 : MASTER_VOL;
            master.connect(ctx.destination);
        } catch (e) { disabled = true; return null; }
    }
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) { /* fine */ } }
    return ctx;
}

// ---- synth primitives ----
function tone(freq, endFreq, type, t0, dur, peak, attack) {
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (endFreq && endFreq !== freq) o.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + (attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.05);
}

function noiseSwell(t0, dur, peak) {
    var len = Math.ceil(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource(); src.buffer = buf;
    var f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.Q.value = 0.8;
    f.frequency.setValueAtTime(300, t0);
    f.frequency.exponentialRampToValueAtTime(1400, t0 + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + dur * 0.85);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + dur + 0.05);
}

// ---- the cue registry (replace an entry to swap a cue, e.g. Doorkeeper 5a) ----
var cues = {
    // Tier 1 — soft blip, <0.5s, subliminal
    tick: function (t) { tone(1250, 900, "square", t, 0.05, 0.10); },

    // Tier 2 — single clean note, ~1s
    chime: function (t) {
        tone(988, null, "sine", t, 0.9, 0.22);
        tone(1976, null, "sine", t, 0.45, 0.06); // soft octave shimmer
    },

    // Poll-Close Drumroll — riser + closing thump
    drumroll: function (t) {
        noiseSwell(t, DRUMROLL_S - 0.15, 0.20);
        tone(100, 240, "sine", t, DRUMROLL_S - 0.2, 0.10, 0.3);
        tone(170, 55, "sine", t + DRUMROLL_S - 0.15, 0.16, 0.35); // the "projection lands" thump
    },

    // Tier 5a — placeholder fanfare (Doorkeeper Original Music replaces post-ship)
    fanfare: function (t) {
        var notes = [262, 330, 392, 523]; // C E G C — arpeggio then held chord
        for (var i = 0; i < notes.length; i++) {
            tone(notes[i], null, "sawtooth", t + i * 0.13, 0.5, 0.10);
        }
        for (var j = 0; j < notes.length; j++) {
            tone(notes[j], null, "sawtooth", t + 0.6, 2.2, 0.09, 0.08);
            tone(notes[j] * 1.005, null, "sawtooth", t + 0.6, 2.2, 0.05, 0.08); // detune warmth
        }
    },

    // Tier 5b — low, minor, decaying
    somber: function (t) {
        tone(110, null, "triangle", t, 2.6, 0.16, 0.25);   // A2
        tone(130.8, null, "triangle", t, 2.6, 0.12, 0.3);  // C3
        tone(164.8, null, "triangle", t, 2.2, 0.10, 0.35); // E3
    }
};

function play(name) {
    if (muted || disabled) return;
    if (!ensureCtx()) return;
    try { cues[name](ctx.currentTime + 0.02); } catch (e) { /* never break the game for a sound */ }
}

// ---- public API ----

/* Poll-Close Drumroll: plays the riser, then calls reveal() when it lands.
   Muted / no-audio -> reveal immediately (spec: fully playable muted,
   and mute must never slow the game down). */
function drumroll(reveal) {
    if (muted || disabled || !ensureCtx()) { reveal(); return; }
    play("drumroll");
    setTimeout(reveal, DRUMROLL_S * 1000);
}

/* One resolution batch -> at most ONE tier sound, highest wins (no stacking).
   Tier 5 (game concluded) > Tier 2 (player won delegates where they
   campaigned) > Tier 1 (any delegates awarded). */
function turnSounds(game, lastResult) {
    if (!lastResult) return;

    if (game.phase === "concluded") {
        if (endPlayedFor === game) return;           // once per game, ever
        endPlayedFor = game;
        var won = game.nominee && game.nominee.id === game.playerId;
        play(won ? "fanfare" : "somber");
        return;
    }

    var player = null;
    for (var i = 0; i < game.field.length; i++) {
        if (game.field[i].id === game.playerId) { player = game.field[i]; }
    }
    var pm = lastResult.playerMoves || null;
    var chime = false, tick = false;
    for (var c = 0; c < lastResult.contests.length; c++) {
        var contest = lastResult.contests[c];
        if (contest.awards && contest.awards.length) tick = true;
        if (pm && player && pm.effort[contest.state] > 0) {
            for (var a = 0; a < contest.awards.length; a++) {
                if (contest.awards[a].name === player.name && contest.awards[a].delegates > 0) chime = true;
            }
        }
    }
    if (chime) play("chime");
    else if (tick) play("tick");
}

function isMuted() { return muted; }

function setMuted(m) {
    muted = m;
    storeMuted(m);
    if (master) master.gain.value = m ? 0 : MASTER_VOL;  // instant — kills already-scheduled audio too
}

/* Header mute toggle — spec: always visible, top corner, speaker icon,
   single master control. */
function install() {
    var bar = document.querySelector(".topbar");
    if (!bar || document.getElementById("snd-toggle")) return;
    var btn = document.createElement("button");
    btn.id = "snd-toggle";
    btn.className = "snd-toggle";
    btn.setAttribute("aria-label", "Mute or unmute sound");
    btn.textContent = muted ? "🔇" : "🔊";
    btn.addEventListener("click", function () {
        setMuted(!muted);
        btn.textContent = muted ? "🔇" : "🔊";
    });
    bar.appendChild(btn);
}

module.exports = { install, drumroll, turnSounds, isMuted, setMuted };
