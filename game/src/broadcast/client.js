/* ============================================================
   client.js — browser-direct Anthropic calls for the three voices.

   Same pattern as the old autopsy feature (Step 15.5): user's own key
   in localStorage, 'anthropic-dangerous-direct-browser-access' header,
   no streaming in v1.

   SPLIT MODELS (Slice 3 decision, 2026-07-25):
     announcer   -> claude-sonnet-4-6   (per-turn, speed/cost)
     advisor     -> claude-sonnet-4-6   (conventional inside read)
     commentator -> claude-opus-5       (the depth-of-insight voice)

   GATE-B (banked, see README): a browser-direct key is fine for a
   local single-player tool. It is NOT ship-safe for public or
   commercial release — that needs a server-side proxy.
   ============================================================ */

const PROMPTS = require("./prompts.js");
const context = require("./context.js");

const STORAGE_KEY = "eg.claude_api_key";
const API_ENDPOINT = "https://api.anthropic.com/v1/messages";

const SONNET = "claude-sonnet-4-6";
const OPUS = "claude-opus-5";   // pinned dateless snapshot (Anthropic models docs, verified 2026-07-25)

/* max_tokens is NOT a word budget — it caps thinking + visible text together,
   so the right value depends on the MODEL, not just the prompt's LENGTH rule.
   The two families here treat an omitted `thinking` field in opposite ways:

     claude-sonnet-4-6  omitted => NO thinking. The whole budget is prose.
     claude-opus-5      omitted => adaptive thinking, ON by default, billed
                                   against max_tokens before a word is written.

   Change a voice's model and you must revisit its max_tokens in the same edit. */
const VOICES = {
    // 200 is safe ONLY because Sonnet 4.6 does no thinking here: all 200 tokens
    // are prose, which comfortably covers the announcer's "under 60 words" rule.
    // This is the tightest budget of the three. Move this voice to OPUS (or any
    // thinking-by-default model) and 200 truncates on the first call — raise it
    // to ~1200 in the same commit, or the announcer starts cutting off mid-call.
    announcer:   { system: PROMPTS.ANNOUNCER,   model: SONNET, max_tokens: 200,
                   ask: "Call this turn's result." },
    // Sonnet, no thinking: 400 tokens of pure prose against 80-120 words.
    advisor:     { system: PROMPTS.ADVISOR,     model: SONNET, max_tokens: 400,
                   ask: "Where do we stand, and what do we do this turn?" },
    // Opus 5 thinks by default, so this budget is shared. 400 truncated at ~130
    // words (2026-08-06) because thinking consumed most of it; 1500 leaves room
    // for adaptive thinking plus the full 80-120 words.
    commentator: { system: PROMPTS.COMMENTATOR, model: OPUS,   max_tokens: 1500,
                   ask: "What's your read on this race right now?" }
};

function getStoredKey() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
}
function setStoredKey(key) {
    try { localStorage.setItem(STORAGE_KEY, key); return true; } catch (e) { return false; }
}
function clearStoredKey() {
    try { localStorage.removeItem(STORAGE_KEY); return true; } catch (e) { return false; }
}
function hasKey() {
    const k = getStoredKey();
    return typeof k === "string" && k.indexOf("sk-ant-") === 0;
}

// voice: "announcer" | "advisor" | "commentator"
// resolves -> { text, truncated, stopReason, outputTokens }; rejects with e.errorType
async function speak(voice, game, lastResult) {
    const spec = VOICES[voice];
    if (!spec) throw new Error("Unknown voice: " + voice);

    const apiKey = getStoredKey();
    if (!apiKey || apiKey.indexOf("sk-ant-") !== 0) {
        const e = new Error("No API key set — add one to hear the broadcast.");
        e.errorType = "no_key";
        throw e;
    }

    const payload = context.build(game, lastResult);

    let response;
    try {
        response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "anthropic-dangerous-direct-browser-access": "true"
            },
            body: JSON.stringify({
                model: spec.model,
                max_tokens: spec.max_tokens,
                system: spec.system,
                messages: [{
                    role: "user",
                    content: spec.ask + "\n\nGame state JSON (this is the whole world — nothing outside it is true):\n" +
                             JSON.stringify(payload, null, 2)
                }]
            })
        });
    } catch (netErr) {
        const e = new Error("Network error reaching api.anthropic.com");
        e.errorType = "network_error";
        throw e;
    }

    if (!response.ok) {
        let body = {};
        try { body = await response.json(); } catch (e) { /* non-JSON */ }
        const msg = (body && body.error && body.error.message) || ("HTTP " + response.status);
        const e = new Error(msg);
        e.status = response.status;
        e.errorType = (body && body.error && body.error.type) || null;
        throw e;
    }

    const data = await response.json();
    const text = (data.content || [])
        .filter(b => b.type === "text")
        .map(b => b.text)
        .join("\n")
        .trim();

    if (!text) {
        const e = new Error("API returned no text");
        e.errorType = "empty_response";
        throw e;
    }

    // A voice that hit the ceiling is cut off mid-sentence. Never let that
    // render as a finished call — the caller marks it visibly in the panel.
    // output_tokens counts thinking + visible text, so on a thinking-by-default
    // model it can read near the cap even when very little prose came back —
    // that gap IS the diagnosis, so report the number rather than just the fact.
    const truncated = data.stop_reason === "max_tokens";
    const outputTokens = (data.usage && typeof data.usage.output_tokens === "number")
        ? data.usage.output_tokens : null;
    if (truncated) {
        console.warn(
            "[broadcast] " + voice + " (" + spec.model + ") hit max_tokens — the text " +
            "below is CUT OFF, not a complete call. output_tokens=" +
            (outputTokens === null ? "(not reported)" : outputTokens) +
            " of max_tokens=" + spec.max_tokens + "; visible text was " +
            text.split(/\s+/).length + " words. If output_tokens is near the cap but " +
            "the text is short, thinking consumed the rest — raise max_tokens for " +
            "this voice in VOICES (see the model/budget note there)."
        );
    }

    return {
        text: text,
        truncated: truncated,
        stopReason: data.stop_reason || null,
        outputTokens: outputTokens
    };
}

module.exports = { speak, getStoredKey, setStoredKey, clearStoredKey, hasKey, VOICES, SONNET, OPUS };
