/* ============================================================
   engine/autopsyAI.js  —  Step 15.5: Claude API autopsy (optional)

   Browser-direct call to api.anthropic.com using the user's own
   API key. Per claude-api skill guidance (2026-05-22):
     - Model: claude-sonnet-4-6 (balance of prose quality + cost)
     - max_tokens: 800 (deliberately short — 200-300 word output)
     - Headers include 'anthropic-dangerous-direct-browser-access'
       which is required for browser-origin calls
     - No prompt caching: system prompt is ~150 tokens, well below
       the 2048-token Sonnet 4.6 caching minimum
     - No streaming: short single-shot response

   API:
       EG.engine.autopsyAI.generate(apiKey, payload)
           → Promise<string>   on success
           → rejected Promise  on failure (Error with .status, .errorType)

       EG.engine.autopsyAI.getStoredKey()      — read from localStorage
       EG.engine.autopsyAI.setStoredKey(key)   — write to localStorage
       EG.engine.autopsyAI.clearStoredKey()    — remove from localStorage
   ============================================================ */

window.EG = window.EG || {};
EG.engine = EG.engine || {};
EG.engine.autopsyAI = EG.engine.autopsyAI || {};

(function () {

    var STORAGE_KEY = 'eg.claude_api_key';
    var API_ENDPOINT = 'https://api.anthropic.com/v1/messages';
    var MODEL = 'claude-sonnet-4-6';

    var SYSTEM_PROMPT =
        'You are a political analyst writing a brief autopsy of a 2024 U.S. presidential election ' +
        'simulation game. Your tone is journalistic and dramatic — like a cable-news post-mortem ' +
        'segment the morning after election night. Focus on WHY the outcome happened: key moments, ' +
        'momentum swings, decisive states, and the strategic shape of the race. Reference specific ' +
        'data points from the JSON payload. Speculate on counterfactuals where genuinely interesting. ' +
        'The human player\'s outcome (won_presidency / lost_general / lost_primary) should shape the ' +
        'closing paragraph\'s tone. Length: 200-300 words. Three paragraphs, flowing prose. No ' +
        'markdown, no bullet points, no headers — just narrative.';

    /* ---- localStorage key management --------------------------- */

    EG.engine.autopsyAI.getStoredKey = function () {
        try { return localStorage.getItem(STORAGE_KEY); }
        catch (e) { return null; }   /* private browsing / disabled storage */
    };

    EG.engine.autopsyAI.setStoredKey = function (key) {
        try { localStorage.setItem(STORAGE_KEY, key); return true; }
        catch (e) { return false; }
    };

    EG.engine.autopsyAI.clearStoredKey = function () {
        try { localStorage.removeItem(STORAGE_KEY); return true; }
        catch (e) { return false; }
    };

    /* ---- the call ---------------------------------------------- */

    EG.engine.autopsyAI.generate = async function (apiKey, payload) {
        if (!apiKey || typeof apiKey !== 'string' || apiKey.indexOf('sk-ant-') !== 0) {
            var keyErr = new Error('API key looks invalid — expected an sk-ant-... key');
            keyErr.errorType = 'invalid_key_format';
            throw keyErr;
        }
        if (!payload) {
            throw new Error('Cannot generate autopsy without game data');
        }

        var body = {
            model: MODEL,
            max_tokens: 800,
            system: SYSTEM_PROMPT,
            messages: [{
                role: 'user',
                content: 'Game state JSON. Write the autopsy.\n\n' + JSON.stringify(payload, null, 2)
            }]
        };

        var response;
        try {
            response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify(body)
            });
        } catch (netErr) {
            var nw = new Error('Network error reaching api.anthropic.com — check your connection');
            nw.errorType = 'network_error';
            nw.cause = netErr;
            throw nw;
        }

        if (!response.ok) {
            var errBody = {};
            try { errBody = await response.json(); } catch (e) { /* non-JSON error body */ }
            var msg = (errBody && errBody.error && errBody.error.message) ||
                      ('HTTP ' + response.status);
            var err = new Error(msg);
            err.status = response.status;
            err.errorType = (errBody && errBody.error && errBody.error.type) || null;
            throw err;
        }

        var data = await response.json();
        var text = (data.content || [])
            .filter(function (b) { return b.type === 'text'; })
            .map(function (b) { return b.text; })
            .join('\n')
            .trim();

        if (!text) {
            var emptyErr = new Error('API returned no text content');
            emptyErr.errorType = 'empty_response';
            throw emptyErr;
        }

        return text;
    };

}());
