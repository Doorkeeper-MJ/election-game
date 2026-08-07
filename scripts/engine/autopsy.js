/* ============================================================
   engine/autopsy.js  —  Step 15.5: deterministic narrative autopsy

   Generates a 3-paragraph story-mode recap of the just-concluded
   game by walking EG.state. Always works — no network, no key, no
   external call. Used as the default rendering in the end-game
   modal and as the fallback when the AI autopsy fails.

   Paragraph 1 — primary recap (per-party nominee declaration)
   Paragraph 2 — general election recap (EVs, swing states)
   Paragraph 3 — human player outcome (three tones)

   API:
       EG.engine.autopsy.generateTemplate()  → string (~200-300 words)
       EG.engine.autopsy.buildAIPayload()    → object (passed to autopsyAI)
   ============================================================ */

window.EG = window.EG || {};
EG.engine = EG.engine || {};
EG.engine.autopsy = EG.engine.autopsy || {};

(function () {

    /* ---- helpers ----------------------------------------------- */

    function partyLabel(party) {
        return party === 'Republican' ? 'GOP' : party === 'Democrat' ? 'DEM' : party;
    }

    function partyFull(party) {
        return party === 'Republican' ? 'Republican' : party === 'Democrat' ? 'Democratic' : party;
    }

    /* Walk newsLog (most recent first) to find how a nominee was chosen.
       Pattern matching avoids needing to thread extra state through
       convention.js. */
    function getNomineeReason(party) {
        var label = partyLabel(party);
        var log = EG.state.newsLog || [];
        for (var i = log.length - 1; i >= 0; i--) {
            var line = log[i];
            if (line.indexOf('🏛 ' + label + ' NOMINEE') !== 0) continue;

            if (/sole survivor/i.test(line))  return { type: 'sole_survivor' };
            if (/fallback/i.test(line))       return { type: 'fallback' };
            if (/deadlock/i.test(line))       return { type: 'deadlock' };

            var prev = log[i - 1] || '';
            if (/clinches on first ballot/i.test(prev)) return { type: 'clinched_first', ballot: 1 };
            var m = prev.match(/clinches\s*\(ballot (\d+)\)/i);
            if (m) return { type: 'clinched_multi', ballot: parseInt(m[1], 10) };
            if (/nominated by attrition/i.test(prev)) return { type: 'attrition' };
            return { type: 'declared' };   /* nominee found but reason unclear */
        }
        return { type: 'unknown' };
    }

    /* Second-highest primary-eligible candidate by delegate count. */
    function getRunnerUp(party, excludeId) {
        var pool = (EG.state.candidates || []).filter(function (rt) {
            var b = EG.data.candidateById[rt.id];
            return b && b.party === party && b.primaryEligible && rt.id !== excludeId;
        });
        pool.sort(function (a, b) { return b.delegates - a.delegates; });
        return pool[0] || null;
    }

    /* Sum EVs from state.generalWinner runtime field. */
    function tallyEVs() {
        var nomR = EG.state.nominees && EG.state.nominees.Republican;
        var nomD = EG.state.nominees && EG.state.nominees.Democrat;
        var evR = 0, evD = 0, statesR = 0, statesD = 0;
        (EG.state.states || []).forEach(function (s) {
            var sd = EG.data.stateByAbbr && EG.data.stateByAbbr[s.abbr];
            if (!sd || sd.isTerritory) return;
            if (!s.generalWinner) return;
            var ev = sd.electoralVotes || 0;
            if (s.generalWinner === nomR) { evR += ev; statesR++; }
            else if (s.generalWinner === nomD) { evD += ev; statesD++; }
        });
        return { evR: evR, evD: evD, statesR: statesR, statesD: statesD };
    }

    /* Swing-state calls extracted from newsLog. Returns array of
       { abbr, winnerName, margin } objects. */
    function getSwingStateCalls() {
        var log = EG.state.newsLog || [];
        for (var i = log.length - 1; i >= 0; i--) {
            if (log[i].indexOf('Swing-state calls:') !== 0) continue;
            var parts = log[i].replace('Swing-state calls:', '').split('·');
            return parts.map(function (p) {
                var m = p.trim().match(/^(\w+)\s*→\s*(.+?)\s*\(\+([\d.]+)\)/);
                if (!m) return null;
                return { abbr: m[1], winner: m[2].trim(), margin: parseFloat(m[3]) };
            }).filter(function (x) { return x; });
        }
        return [];
    }

    /* Find black-swan or otherwise dramatic newsLog entries. */
    function getDramaticEvents() {
        var log = EG.state.newsLog || [];
        return log.filter(function (line) {
            return /BLACK SWAN/i.test(line)
                || /BIG MO:/i.test(line)
                || /loses momentum/i.test(line)
                || /suspends campaign/i.test(line);
        }).slice(0, 8);  /* cap to keep narrative focused */
    }

    /* ---- paragraph builders ------------------------------------ */

    function primaryParagraph() {
        var nomR_id = EG.state.nominees && EG.state.nominees.Republican;
        var nomD_id = EG.state.nominees && EG.state.nominees.Democrat;
        var nomR    = nomR_id ? EG.state.getCandidate(nomR_id) : null;
        var nomD    = nomD_id ? EG.state.getCandidate(nomD_id) : null;
        var nomR_b  = nomR_id ? EG.data.candidateById[nomR_id] : null;
        var nomD_b  = nomD_id ? EG.data.candidateById[nomD_id] : null;

        var reasonR = nomR_id ? getNomineeReason('Republican') : null;
        var reasonD = nomD_id ? getNomineeReason('Democrat') : null;

        var parts = [];

        if (nomR_b && nomR && reasonR) {
            var ruR = getRunnerUp('Republican', nomR_id);
            var ruR_name = ruR ? (EG.data.candidateById[ruR.id] || {}).name : null;
            if (reasonR.type === 'clinched_first') {
                parts.push(nomR_b.name + ' cruised to the GOP nomination, clinching on the first convention ballot with ' + nomR.delegates.toLocaleString() + ' delegates' +
                    (ruR_name ? ' — leaving ' + ruR_name + ' a distant ' + ruR.delegates.toLocaleString() + '.' : '.'));
            } else if (reasonR.type === 'clinched_multi') {
                parts.push('The GOP race went to a brokered convention: ' + nomR_b.name + ' needed ' + reasonR.ballot + ' ballots before clinching with ' + nomR.delegates.toLocaleString() + ' delegates.');
            } else if (reasonR.type === 'attrition') {
                parts.push(nomR_b.name + ' won the GOP nomination by attrition as the field collapsed around them.');
            } else if (reasonR.type === 'sole_survivor') {
                parts.push(nomR_b.name + ' was the only GOP candidate left standing by convention time.');
            } else {
                parts.push(nomR_b.name + ' took the GOP nomination with ' + nomR.delegates.toLocaleString() + ' delegates.');
            }
        }

        if (nomD_b && nomD && reasonD) {
            var ruD = getRunnerUp('Democrat', nomD_id);
            var ruD_name = ruD && ruD.delegates > 0 ? (EG.data.candidateById[ruD.id] || {}).name : null;
            if (reasonD.type === 'clinched_first') {
                parts.push('On the Democratic side, ' + nomD_b.name + ' clinched the nomination on the first ballot with ' + nomD.delegates.toLocaleString() + ' delegates' +
                    (ruD_name ? ', leaving ' + ruD_name + ' as the runner-up.' : ', effectively unopposed.'));
            } else if (reasonD.type === 'clinched_multi') {
                parts.push('The Democratic convention turned brokered: ' + nomD_b.name + ' clinched on ballot ' + reasonD.ballot + ' with ' + nomD.delegates.toLocaleString() + ' delegates.');
            } else if (reasonD.type === 'attrition') {
                parts.push(nomD_b.name + ' was nominated on the Democratic side after the field thinned out.');
            } else if (reasonD.type === 'sole_survivor') {
                parts.push(nomD_b.name + ' was the lone Democrat still standing at convention time.');
            } else {
                parts.push(nomD_b.name + ' took the Democratic nomination with ' + nomD.delegates.toLocaleString() + ' delegates.');
            }
        }

        if (parts.length === 0) return 'The 2024 primary season ended without clear party nominees.';
        return parts.join(' ');
    }

    function generalParagraph() {
        var nomR_id = EG.state.nominees && EG.state.nominees.Republican;
        var nomD_id = EG.state.nominees && EG.state.nominees.Democrat;
        var winnerId = EG.state.nominees && EG.state.nominees.winner;

        var nomR_b   = nomR_id ? EG.data.candidateById[nomR_id] : null;
        var nomD_b   = nomD_id ? EG.data.candidateById[nomD_id] : null;
        var winner_b = winnerId ? EG.data.candidateById[winnerId] : null;

        if (!winner_b) return 'The general election produced no Electoral College majority.';

        var tally = tallyEVs();
        var winnerEV = winner_b === nomR_b ? tally.evR : tally.evD;
        var loserEV  = winner_b === nomR_b ? tally.evD : tally.evR;
        var margin = Math.abs(winnerEV - loserEV);

        var loserName = (winner_b === nomR_b ? nomD_b : nomR_b);
        loserName = loserName ? loserName.name : 'the opponent';

        var lead;
        if (margin > 100)      lead = winner_b.name + ' swept to a decisive ' + winnerEV + '–' + loserEV + ' Electoral College victory over ' + loserName + '.';
        else if (margin > 50)  lead = winner_b.name + ' carried the Electoral College ' + winnerEV + '–' + loserEV + ' against ' + loserName + ' — a comfortable margin built on the swing states.';
        else                   lead = winner_b.name + ' eked out a ' + winnerEV + '–' + loserEV + ' win over ' + loserName + ', with the race called late as the swing-state ballots were counted.';

        var swings = getSwingStateCalls();
        var swingLine = '';
        if (swings.length > 0) {
            var byWinner = {};
            swings.forEach(function (s) {
                byWinner[s.winner] = byWinner[s.winner] || [];
                byWinner[s.winner].push(s.abbr);
            });
            var parts = Object.keys(byWinner).map(function (name) {
                return name + ' carried ' + byWinner[name].join(', ');
            });
            swingLine = ' In the toss-ups, ' + parts.join('; ') + '.';
        }

        return lead + swingLine;
    }

    function humanParagraph() {
        var humanId = EG.state.humanPlayerId;
        if (!humanId) return '';

        var human = EG.data.candidateById[humanId];
        var rt = EG.state.getCandidate(humanId);
        if (!human || !rt) return '';

        var winnerId = EG.state.nominees && EG.state.nominees.winner;
        var nomR     = EG.state.nominees && EG.state.nominees.Republican;
        var nomD     = EG.state.nominees && EG.state.nominees.Democrat;

        var tone = (humanId === winnerId) ? 'PRESIDENT'
                 : (humanId === nomR || humanId === nomD) ? 'RUNNER_UP'
                 :                                          'PRIMARY_OUT';

        var tally = tallyEVs();
        var humanIsR = human.party === 'Republican';
        var humanEVs = humanIsR ? tally.evR : tally.evD;
        var humanStates = humanIsR ? tally.statesR : tally.statesD;

        if (tone === 'PRESIDENT') {
            return 'For you, running as ' + human.name + ': the whole arc paid off. From ' + human.polling + '% starting polling to ' + humanEVs + ' electoral votes and ' + humanStates + ' states carried — a complete campaign, capped by victory.';
        }

        if (tone === 'RUNNER_UP') {
            var oppId = humanIsR ? nomD : nomR;
            var oppName = (EG.data.candidateById[oppId] || {}).name || 'the opponent';
            return 'For you, running as ' + human.name + ': the nomination was the high point. You carried ' + humanStates + ' states and ' + humanEVs + ' electoral votes in the general but fell short of 270. ' + oppName + ' takes the White House.';
        }

        /* PRIMARY_OUT */
        var dropMsg = rt.droppedTurn ? 'You dropped out on turn ' + rt.droppedTurn + '.' : 'You stayed in but never claimed the nomination.';
        var winnerName = winnerId ? (EG.data.candidateById[winnerId] || {}).name : 'no candidate';
        return 'For you, running as ' + human.name + ': the campaign ended in the primary with ' + rt.delegates.toLocaleString() + ' delegates and ' + Math.min(100, Math.max(0, rt.polling)).toFixed(1) + '% final polling. ' + dropMsg + ' ' + winnerName + ' takes the White House.';
    }

    /* ---- public API -------------------------------------------- */

    EG.engine.autopsy.generateTemplate = function () {
        var paragraphs = [
            primaryParagraph(),
            generalParagraph(),
            humanParagraph()
        ].filter(function (p) { return p && p.length > 0; });
        return paragraphs.join('\n\n');
    };

    /* Structured payload for the AI autopsy module. Mirrors the
       template's data but as JSON for Claude to weave into prose. */
    EG.engine.autopsy.buildAIPayload = function () {
        var nomR_id = EG.state.nominees && EG.state.nominees.Republican;
        var nomD_id = EG.state.nominees && EG.state.nominees.Democrat;
        var winnerId = EG.state.nominees && EG.state.nominees.winner;
        var humanId = EG.state.humanPlayerId;

        var nomR = nomR_id ? EG.state.getCandidate(nomR_id) : null;
        var nomD = nomD_id ? EG.state.getCandidate(nomD_id) : null;
        var human = humanId ? EG.state.getCandidate(humanId) : null;
        var human_b = humanId ? EG.data.candidateById[humanId] : null;

        var reasonR = nomR_id ? getNomineeReason('Republican') : null;
        var reasonD = nomD_id ? getNomineeReason('Democrat') : null;

        var ruR = getRunnerUp('Republican', nomR_id);
        var ruD = getRunnerUp('Democrat', nomD_id);

        var tally = tallyEVs();
        var swings = getSwingStateCalls();
        var drama = getDramaticEvents();

        var humanTone = !humanId        ? null
                      : humanId === winnerId   ? 'won_presidency'
                      : (humanId === nomR_id || humanId === nomD_id) ? 'lost_general'
                      : 'lost_primary';

        return {
            human_player: human_b ? {
                name: human_b.name,
                party: human_b.party,
                outcome: humanTone,
                final_polling: human ? Math.min(100, Math.max(0, human.polling)) : null,
                final_delegates: human ? human.delegates : null,
                dropped_turn: human ? human.droppedTurn : null
            } : null,
            primary: {
                republican: nomR_id ? {
                    nominee: (EG.data.candidateById[nomR_id] || {}).name,
                    delegates: nomR ? nomR.delegates : 0,
                    win_reason: reasonR ? reasonR.type : null,
                    win_ballot: reasonR ? reasonR.ballot : null,
                    runner_up: ruR ? (EG.data.candidateById[ruR.id] || {}).name : null,
                    runner_up_delegates: ruR ? ruR.delegates : 0
                } : null,
                democrat: nomD_id ? {
                    nominee: (EG.data.candidateById[nomD_id] || {}).name,
                    delegates: nomD ? nomD.delegates : 0,
                    win_reason: reasonD ? reasonD.type : null,
                    win_ballot: reasonD ? reasonD.ballot : null,
                    runner_up: ruD ? (EG.data.candidateById[ruD.id] || {}).name : null,
                    runner_up_delegates: ruD ? ruD.delegates : 0
                } : null
            },
            general: {
                president_elect: winnerId ? (EG.data.candidateById[winnerId] || {}).name : null,
                president_party: winnerId ? (EG.data.candidateById[winnerId] || {}).party : null,
                gop_evs: tally.evR,
                dem_evs: tally.evD,
                gop_states: tally.statesR,
                dem_states: tally.statesD,
                margin: Math.abs(tally.evR - tally.evD),
                swing_state_calls: swings
            },
            key_events: drama
        };
    };

}());
