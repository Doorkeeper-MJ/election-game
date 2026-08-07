/* ============================================================
   ui/endGameScreen.js  —  Steps 14 + 15.5: end-of-game modal

   Pops automatically from turnLoop.refreshUI when phase becomes
   'concluded'. Reads EG.state to derive:
     - EV tallies (sum electoralVotes by state.generalWinner)
     - Three-tone variant for the human player:
         TONE_PRESIDENT   — human's candidate is the called winner
         TONE_RUNNER_UP   — human's candidate was a nominee but lost
         TONE_PRIMARY_OUT — human's candidate never made the general
     - Autopsy section (Step 15.5):
         * Template autopsy rendered by default (always works)
         * Optional "✨ AI AUTOPSY" upgrade that prompts for the
           user's Claude API key and replaces the template text with
           AI-generated prose. Falls back to template on any error.

   API:
       EG.ui.endGameScreen.show()   — build (if needed) + display
       EG.ui.endGameScreen.hide()   — remove from DOM
   ============================================================ */

window.EG = window.EG || {};
EG.ui = EG.ui || {};
EG.ui.endGameScreen = EG.ui.endGameScreen || {};

(function () {

    var TOTAL_EVS     = 538;
    var WIN_THRESHOLD = 270;

    function tallyEVs() {
        var nomR = EG.state.nominees && EG.state.nominees.Republican;
        var nomD = EG.state.nominees && EG.state.nominees.Democrat;
        var evR = 0, evD = 0, statesR = 0, statesD = 0;

        EG.state.states.forEach(function (s) {
            var sd = EG.data.stateByAbbr && EG.data.stateByAbbr[s.abbr];
            if (!sd || sd.isTerritory) return;
            if (!s.generalWinner) return;
            var ev = sd.electoralVotes || 0;
            if      (s.generalWinner === nomR) { evR += ev; statesR++; }
            else if (s.generalWinner === nomD) { evD += ev; statesD++; }
        });

        return { evR: evR, evD: evD, statesR: statesR, statesD: statesD };
    }

    function classifyHumanTone() {
        var humanId = EG.state.humanPlayerId;
        var winner  = EG.state.nominees && EG.state.nominees.winner;
        var nomR    = EG.state.nominees && EG.state.nominees.Republican;
        var nomD    = EG.state.nominees && EG.state.nominees.Democrat;

        if (!humanId) return 'NONE';
        if (humanId === winner) return 'TONE_PRESIDENT';
        if (humanId === nomR || humanId === nomD) return 'TONE_RUNNER_UP';
        return 'TONE_PRIMARY_OUT';
    }

    function partyClass(party) {
        return party === 'Republican' ? 'eg-rep'
             : party === 'Democrat'   ? 'eg-dem'
             :                          'eg-ind';
    }

    function renderHumanBlock(tone, tally) {
        var humanId = EG.state.humanPlayerId;
        if (!humanId) return '';

        var human  = EG.data.candidateById[humanId];
        var rt     = EG.state.getCandidate(humanId);
        if (!human || !rt) return '';

        var humanIsR = human.party === 'Republican';
        var humanEVs = humanIsR ? tally.evR : tally.evD;
        var humanSt  = humanIsR ? tally.statesR : tally.statesD;

        if (tone === 'TONE_PRESIDENT') {
            return (
                '<div class="eg-human eg-human--won">' +
                  '<div class="eg-human-icon">🏆</div>' +
                  '<div class="eg-human-text">' +
                    '<div class="eg-human-headline">YOU WON THE PRESIDENCY</div>' +
                    '<div class="eg-human-detail">' +
                      humanEVs + ' electoral votes · ' + humanSt + ' states carried · ' +
                      rt.delegates + ' primary delegates' +
                    '</div>' +
                  '</div>' +
                '</div>'
            );
        }

        if (tone === 'TONE_RUNNER_UP') {
            var opp = humanIsR ? EG.state.nominees.Democrat : EG.state.nominees.Republican;
            var oppName = (EG.data.candidateById[opp] && EG.data.candidateById[opp].name) || 'the opponent';
            return (
                '<div class="eg-human eg-human--silver">' +
                  '<div class="eg-human-icon">🥈</div>' +
                  '<div class="eg-human-text">' +
                    '<div class="eg-human-headline">YOU LOST THE GENERAL</div>' +
                    '<div class="eg-human-detail">' +
                      'Carried ' + humanSt + ' states · ' + humanEVs + ' EVs · fell short of 270. ' +
                      oppName + ' takes the White House.' +
                    '</div>' +
                  '</div>' +
                '</div>'
            );
        }

        /* TONE_PRIMARY_OUT */
        var winnerId   = EG.state.nominees && EG.state.nominees.winner;
        var winnerBase = winnerId ? EG.data.candidateById[winnerId] : null;
        var dropMsg = (rt.droppedTurn ? 'dropped turn ' + rt.droppedTurn : 'stayed in but unnominated');
        return (
            '<div class="eg-human eg-human--out">' +
              '<div class="eg-human-icon">🚪</div>' +
              '<div class="eg-human-text">' +
                '<div class="eg-human-headline">YOUR CAMPAIGN ENDED IN THE PRIMARY</div>' +
                '<div class="eg-human-detail">' +
                  human.name + ' — ' + rt.delegates + ' primary delegates, ' +
                  Math.min(100, Math.max(0, rt.polling)).toFixed(1) + '% final polling (' + dropMsg + '). ' +
                  (winnerBase ? 'President: ' + winnerBase.name + '.' : 'No president-elect — contingent election.') +
                '</div>' +
              '</div>' +
            '</div>'
        );
    }

    function renderEvBar(evs, cls) {
        var pct = Math.min(100, (evs / TOTAL_EVS) * 100);
        var winLinePct = (WIN_THRESHOLD / TOTAL_EVS) * 100;
        return (
            '<div class="eg-ev-bar">' +
              '<div class="eg-ev-fill ' + cls + '" style="width:' + pct + '%"></div>' +
              '<div class="eg-ev-270" style="left:' + winLinePct + '%" title="270 to win"></div>' +
            '</div>'
        );
    }

    /* Step 15.5 — autopsy block.
       Body is populated from the template generator on render; the
       AI button replaces it on success or leaves it intact on failure. */
    function renderAutopsyBlock() {
        var templateText = '';
        if (EG.engine.autopsy && EG.engine.autopsy.generateTemplate) {
            try { templateText = EG.engine.autopsy.generateTemplate(); }
            catch (e) { templateText = '(Autopsy unavailable — engine/autopsy.js failed to render.)'; }
        }
        var bodyHTML = templateText.split('\n\n').map(function (p) {
            return '<p>' + escapeHTML(p) + '</p>';
        }).join('');

        return (
            '<div class="eg-autopsy">' +
              '<div class="eg-autopsy-head">' +
                '<span class="eg-autopsy-label">★ AUTOPSY</span>' +
                '<span class="eg-autopsy-source" id="eg-autopsy-source">TEMPLATE</span>' +
              '</div>' +
              '<div class="eg-autopsy-body" id="eg-autopsy-body">' + bodyHTML + '</div>' +
              '<div class="eg-autopsy-foot">' +
                '<button type="button" class="eg-ai-btn" data-action="ai-autopsy" id="eg-ai-btn">' +
                  '✨ AI AUTOPSY' +
                '</button>' +
                '<span class="eg-ai-hint">Powered by Claude · your key, your machine</span>' +
                '<button type="button" class="eg-ai-clear" data-action="clear-key" id="eg-ai-clear">Reset key</button>' +
              '</div>' +
            '</div>'
        );
    }

    function escapeHTML(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    function buildHTML() {
        var nomR_id = EG.state.nominees && EG.state.nominees.Republican;
        var nomD_id = EG.state.nominees && EG.state.nominees.Democrat;
        var winnerId = EG.state.nominees && EG.state.nominees.winner;
        var nomR_b = nomR_id ? EG.data.candidateById[nomR_id] : null;
        var nomD_b = nomD_id ? EG.data.candidateById[nomD_id] : null;
        var winnerBase = winnerId ? EG.data.candidateById[winnerId] : null;

        var tally  = tallyEVs();
        var tone   = classifyHumanTone();
        var margin = Math.abs(tally.evR - tally.evD);
        var leadParty = tally.evR > tally.evD ? 'GOP' : tally.evD > tally.evR ? 'DEM' : 'TIE';

        var winnerName = winnerBase ? winnerBase.name : 'NO MAJORITY';
        var winnerPartyClass = winnerBase ? partyClass(winnerBase.party) : '';
        var winnerPartyLabel = winnerBase ? (winnerBase.party === 'Republican' ? 'REPUBLICAN' : 'DEMOCRAT') : '';

        return (
            '<div class="eg-panel ' + winnerPartyClass + '" role="document">' +
              '<div class="eg-stripe"></div>' +
              '<div class="eg-eyebrow">ELECTION 2024 · NOV 5 · DECISION CALLED</div>' +
              '<div class="eg-reveal">' +
                (winnerBase
                  ? '<div class="eg-reveal-label">PRESIDENT-ELECT</div>' +
                    '<div class="eg-reveal-name">' + winnerName.toUpperCase() + '</div>' +
                    '<div class="eg-reveal-party">' + winnerPartyLabel + '</div>'
                  : '<div class="eg-reveal-label">NO MAJORITY</div>' +
                    '<div class="eg-reveal-name">CONTINGENT ELECTION</div>' +
                    '<div class="eg-reveal-party">DEFERRED PAST V1</div>') +
              '</div>' +

              '<div class="eg-ev-block">' +
                '<div class="eg-ev-row eg-ev-row--rep">' +
                  '<span class="eg-ev-tag">GOP</span>' +
                  '<span class="eg-ev-name">' + (nomR_b ? nomR_b.name : '—') + '</span>' +
                  renderEvBar(tally.evR, 'eg-ev-fill--rep') +
                  '<span class="eg-ev-num">' + tally.evR + '<span class="eg-ev-of">/270</span></span>' +
                '</div>' +
                '<div class="eg-ev-row eg-ev-row--dem">' +
                  '<span class="eg-ev-tag">DEM</span>' +
                  '<span class="eg-ev-name">' + (nomD_b ? nomD_b.name : '—') + '</span>' +
                  renderEvBar(tally.evD, 'eg-ev-fill--dem') +
                  '<span class="eg-ev-num">' + tally.evD + '<span class="eg-ev-of">/270</span></span>' +
                '</div>' +
              '</div>' +

              '<div class="eg-states-row">' +
                'GOP: <b>' + tally.statesR + '</b> states · DEM: <b>' + tally.statesD + '</b> states · ' +
                'Margin: <b>' + leadParty + ' +' + margin + ' EVs</b>' +
              '</div>' +

              renderAutopsyBlock() +

              renderHumanBlock(tone, tally) +

              '<div class="eg-buttons">' +
                '<button type="button" class="eg-btn eg-btn--secondary" data-action="review">REVIEW RESULTS</button>' +
                '<button type="button" class="eg-btn eg-btn--primary" data-action="replay">★ PLAY AGAIN ★</button>' +
              '</div>' +
            '</div>'
        );
    }

    /* ---- AI autopsy flow ---------------------------------------- */

    function setAIButtonState(state, label) {
        var btn = document.getElementById('eg-ai-btn');
        if (!btn) return;
        if (state === 'loading') {
            btn.disabled = true;
            btn.textContent = label || 'GENERATING…';
            btn.classList.add('eg-ai-btn--loading');
        } else if (state === 'done') {
            btn.disabled = true;
            btn.textContent = label || '✓ GENERATED';
            btn.classList.remove('eg-ai-btn--loading');
            btn.classList.add('eg-ai-btn--done');
        } else {
            btn.disabled = false;
            btn.textContent = label || '✨ AI AUTOPSY';
            btn.classList.remove('eg-ai-btn--loading', 'eg-ai-btn--done');
        }
    }

    function setAutopsySource(source) {
        var el = document.getElementById('eg-autopsy-source');
        if (el) el.textContent = source;
    }

    function setAutopsyBody(text) {
        var body = document.getElementById('eg-autopsy-body');
        if (!body) return;
        body.innerHTML = text.split('\n\n')
            .map(function (p) { return '<p>' + escapeHTML(p) + '</p>'; })
            .join('');
    }

    function showAutopsyError(message) {
        var foot = document.querySelector('.eg-autopsy-foot');
        if (!foot) return;
        var existing = document.getElementById('eg-ai-error');
        if (existing) existing.parentNode.removeChild(existing);
        var div = document.createElement('div');
        div.id = 'eg-ai-error';
        div.className = 'eg-ai-error';
        div.textContent = message;
        foot.parentNode.insertBefore(div, foot.nextSibling);
    }

    function runAIAutopsy(apiKey) {
        setAIButtonState('loading');
        showAutopsyError('');

        var payload;
        try { payload = EG.engine.autopsy.buildAIPayload(); }
        catch (e) {
            showAutopsyError('Could not assemble game data for the AI call.');
            setAIButtonState('idle');
            return;
        }

        EG.engine.autopsyAI.generate(apiKey, payload).then(function (text) {
            setAutopsyBody(text);
            setAutopsySource('CLAUDE · SONNET 4.6');
            setAIButtonState('done');
        }).catch(function (err) {
            console.warn('AI autopsy failed:', err);
            setAIButtonState('idle');
            var msg = err.message || 'Unknown error';
            if (err.status === 401 || err.errorType === 'authentication_error') {
                msg = 'API key was rejected. Use "Reset key" and try again.';
            } else if (err.status === 429 || err.errorType === 'rate_limit_error') {
                msg = 'Rate limited — wait a minute and retry.';
            } else if (err.errorType === 'network_error') {
                msg = 'Could not reach api.anthropic.com — check your connection.';
            } else if (err.errorType === 'invalid_key_format') {
                msg = 'That doesn\'t look like an Anthropic API key (expected sk-ant-...).';
            }
            showAutopsyError('AI autopsy failed: ' + msg + ' (template autopsy remains above.)');
        });
    }

    /* ---- key-prompt modal --------------------------------------- */

    function showKeyPrompt(onSubmit) {
        var existing = document.getElementById('eg-key-overlay');
        if (existing) existing.parentNode.removeChild(existing);

        var overlay = document.createElement('div');
        overlay.id = 'eg-key-overlay';
        overlay.className = 'eg-key-overlay';
        overlay.innerHTML =
            '<div class="eg-key-panel" role="document">' +
              '<div class="eg-key-title">CLAUDE API KEY</div>' +
              '<div class="eg-key-blurb">' +
                'AI autopsy uses the Claude API. Paste your own Anthropic API key — it\'s stored ' +
                'in this browser\'s <code>localStorage</code> and sent only to <code>api.anthropic.com</code>. ' +
                'Get one at <code>console.anthropic.com</code>. Each autopsy costs roughly $0.006.' +
              '</div>' +
              '<input type="password" class="eg-key-input" id="eg-key-input" placeholder="sk-ant-..." autocomplete="off" spellcheck="false" />' +
              '<div class="eg-key-buttons">' +
                '<button type="button" class="eg-key-btn eg-key-btn--secondary" data-action="cancel-key">CANCEL</button>' +
                '<button type="button" class="eg-key-btn eg-key-btn--primary" data-action="save-key">SAVE & GENERATE</button>' +
              '</div>' +
            '</div>';

        function dismiss() {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }

        overlay.addEventListener('click', function (e) {
            var btn = e.target.closest && e.target.closest('[data-action]');
            if (!btn) return;
            var act = btn.getAttribute('data-action');
            if (act === 'cancel-key') {
                dismiss();
            } else if (act === 'save-key') {
                var input = document.getElementById('eg-key-input');
                var val = input ? input.value.trim() : '';
                if (!val) {
                    input && input.focus();
                    return;
                }
                if (val.indexOf('sk-ant-') !== 0) {
                    var err = document.querySelector('.eg-key-error');
                    if (!err) {
                        err = document.createElement('div');
                        err.className = 'eg-key-error';
                        input.parentNode.insertBefore(err, input.nextSibling);
                    }
                    err.textContent = 'That doesn\'t look right — expected an sk-ant-... key.';
                    return;
                }
                EG.engine.autopsyAI.setStoredKey(val);
                dismiss();
                onSubmit(val);
            }
        });

        document.body.appendChild(overlay);
        var input = document.getElementById('eg-key-input');
        if (input) input.focus();
    }

    /* ---- top-level handlers ------------------------------------- */

    function attachHandlers(overlay) {
        overlay.addEventListener('click', function (e) {
            var btn = e.target.closest && e.target.closest('[data-action]');
            if (!btn) return;
            var act = btn.getAttribute('data-action');

            if (act === 'review') {
                EG.ui.endGameScreen.hide();
            } else if (act === 'replay') {
                EG.ui.endGameScreen.hide();
                if (EG.newGame) EG.newGame();
            } else if (act === 'ai-autopsy') {
                if (!EG.engine.autopsyAI) {
                    showAutopsyError('AI autopsy module not loaded.');
                    return;
                }
                var stored = EG.engine.autopsyAI.getStoredKey();
                if (stored) {
                    runAIAutopsy(stored);
                } else {
                    showKeyPrompt(function (key) { runAIAutopsy(key); });
                }
            } else if (act === 'clear-key') {
                if (EG.engine.autopsyAI) EG.engine.autopsyAI.clearStoredKey();
                showAutopsyError('Stored API key cleared. Click ✨ AI AUTOPSY to enter a new one.');
            }
        });
    }

    EG.ui.endGameScreen.show = function () {
        var existing = document.getElementById('eg-overlay');
        if (existing) return;     /* idempotent — already showing */

        var overlay = document.createElement('div');
        overlay.id = 'eg-overlay';
        overlay.className = 'eg-overlay eg-overlay--visible';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML = buildHTML();
        attachHandlers(overlay);
        document.body.appendChild(overlay);
    };

    EG.ui.endGameScreen.hide = function () {
        var overlay = document.getElementById('eg-overlay');
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        var keyOverlay = document.getElementById('eg-key-overlay');
        if (keyOverlay && keyOverlay.parentNode) keyOverlay.parentNode.removeChild(keyOverlay);
    };

}());
