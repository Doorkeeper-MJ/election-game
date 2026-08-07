/* ============================================================
   engine/events.js  —  Step 4 of the turn cycle: Resolve events

   Draws from the 30-card events deck with a 50% per-turn fire rate.
   Cards are drawn without replacement (the deck reshuffles when
   exhausted). Each card carries a `mechanic` block describing
   tier, targeting resolver, and effect deltas — defined in
   data/eventsDeck.js.

   Effects:
     - pollingDelta  → adjusts rt.polling (clamped at 0)
     - momentumDelta → adjusts rt.momentum (clamped −100..+100)
     - cpDelta       → adjusts rt.cp (clamped at 0)
     - forceDropout  → candidate withdraws; delegates reallocated

   Cards that hit a primary target AND its rivals use the secondary
   block (Debate Gaffe, FP Crisis, Recession Fears, Military Incident).
   Cards that hit the SAME target twice use secondary.sameTarget
   (Legal Trouble: scandal hit + base rallies offset).

   API:
       EG.engine.events.run()      — called by turn loop (step 4)
       EG.engine.events.demo(id)   — force-fire a specific card
   ============================================================ */

window.EG = window.EG || {};
EG.engine = EG.engine || {};
EG.engine.events = EG.engine.events || {};

(function () {

    var FIRE_PROBABILITY = 0.5;
    var INCUMBENT_PARTY  = 'Democrat';     /* 2024: Biden is incumbent */
    var MAX_REDRAWS      = 3;              /* per-turn retry budget on misfires */

    /* ---------- deck ------------------------------------------------ */
    function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }

    function ensureDeck() {
        if (!EG.state.eventDeck || EG.state.eventDeck.length === 0) {
            var ids = (EG.data.events || []).map(function (e) { return e.id; });
            EG.state.eventDeck    = shuffle(ids);
            EG.state.eventDiscard = [];
        }
    }

    function drawCardId() {
        ensureDeck();
        var id = EG.state.eventDeck.pop();
        if (id != null) EG.state.eventDiscard.push(id);
        return id;
    }

    /* ---------- candidate pool helpers ------------------------------ */
    function activePrimaryEligible() {
        return EG.state.candidates.filter(function (rt) {
            if (!rt.active) return false;
            var b = EG.data.candidateById[rt.id];
            return b && b.primaryEligible;
        });
    }

    function pickRandom(list) {
        return list.length === 0 ? null : list[Math.floor(Math.random() * list.length)];
    }

    function sortDesc(list, key) {
        return list.slice().sort(function (a, b) { return key(b) - key(a); });
    }

    /* ---------- resolvers ------------------------------------------- */
    /* Each resolver returns { primary: [], secondary: [] }.
       Cards that hit one set use primary[]; split-effect cards
       (frontrunner_vs_rivals, hawks_vs_doves) populate both. */
    var resolvers = {

        random_active: function () {
            var pick = pickRandom(activePrimaryEligible());
            return { primary: pick ? [pick] : [], secondary: [] };
        },

        random_dem: function () {
            var pool = activePrimaryEligible().filter(function (rt) {
                return EG.data.candidateById[rt.id].party === 'Democrat';
            });
            var pick = pickRandom(pool);
            return { primary: pick ? [pick] : [], secondary: [] };
        },

        frontrunner: function () {
            var pool = activePrimaryEligible();
            if (pool.length === 0) return { primary: [], secondary: [] };
            var sorted = pool.slice().sort(function (a, b) {
                if (b.delegates !== a.delegates) return b.delegates - a.delegates;
                return b.polling - a.polling;
            });
            return { primary: [sorted[0]], secondary: [] };
        },

        frontrunner_vs_rivals: function () {
            var pool = activePrimaryEligible();
            if (pool.length === 0) return { primary: [], secondary: [] };
            var sorted = pool.slice().sort(function (a, b) {
                if (b.delegates !== a.delegates) return b.delegates - a.delegates;
                return b.polling - a.polling;
            });
            var fr = sorted[0];
            var party = EG.data.candidateById[fr.id].party;
            var rivals = pool.filter(function (rt) {
                return rt.id !== fr.id && EG.data.candidateById[rt.id].party === party;
            });
            return { primary: [fr], secondary: rivals };
        },

        lowest: function () {
            var pool = activePrimaryEligible();
            if (pool.length === 0) return { primary: [], secondary: [] };
            var sorted = pool.slice().sort(function (a, b) { return a.polling - b.polling; });
            return { primary: [sorted[0]], secondary: [] };
        },

        oldest: function () {
            var pool = activePrimaryEligible();
            if (pool.length === 0) return { primary: [], secondary: [] };
            var sorted = sortDesc(pool, function (rt) { return EG.data.candidateById[rt.id].age; });
            return { primary: [sorted[0]], secondary: [] };
        },

        incumbent_party: function () {
            return { primary: activePrimaryEligible().filter(function (rt) {
                return EG.data.candidateById[rt.id].party === INCUMBENT_PARTY;
            }), secondary: [] };
        },

        all_active: function () {
            return { primary: activePrimaryEligible(), secondary: [] };
        },

        ideology_above_6: function () {
            return { primary: activePrimaryEligible().filter(function (rt) {
                return EG.data.candidateById[rt.id].ideology >= 6;
            }), secondary: [] };
        },

        ideology_below_4: function () {
            return { primary: activePrimaryEligible().filter(function (rt) {
                return EG.data.candidateById[rt.id].ideology < 4;
            }), secondary: [] };
        },

        ideology_moderate: function () {
            return { primary: activePrimaryEligible().filter(function (rt) {
                var i = EG.data.candidateById[rt.id].ideology;
                return i >= 4 && i < 6;
            }), secondary: [] };
        },

        ideology_extremes: function () {
            return { primary: activePrimaryEligible().filter(function (rt) {
                var i = EG.data.candidateById[rt.id].ideology;
                return i < 4 || i > 8;
            }), secondary: [] };
        },

        hawks_vs_doves: function () {
            var pool  = activePrimaryEligible();
            var hawks = pool.filter(function (rt) { return EG.data.candidateById[rt.id].ideology >= 6; });
            var doves = pool.filter(function (rt) { return EG.data.candidateById[rt.id].ideology <  4; });
            return { primary: hawks, secondary: doves };
        },

        /* Card #30 (Candidate Withdraws). Per the Step 10 revision:
           active primary-eligible candidate over age 70, weighted
           toward most-negative momentum (lowest polling as fallback).
           Human player is never the target — if they'd be the only
           pick, the caller retries with a different card. */
        elderly_struggling: function () {
            var pool = activePrimaryEligible().filter(function (rt) {
                if (rt.id === EG.state.humanPlayerId) return false;
                return EG.data.candidateById[rt.id].age > 70;
            });
            if (pool.length === 0) return { primary: [], secondary: [] };
            var sorted = pool.slice().sort(function (a, b) {
                if (a.momentum !== b.momentum) return a.momentum - b.momentum;   /* most negative first */
                return a.polling - b.polling;                                    /* fallback: lowest poll */
            });
            return { primary: [sorted[0]], secondary: [] };
        }
    };

    /* ---------- effect application ---------------------------------- */
    function applyDelta(rt, delta) {
        if (!delta) return;
        if (typeof delta.pollingDelta === 'number') {
            rt.polling = Math.max(0, rt.polling + delta.pollingDelta);
        }
        if (typeof delta.momentumDelta === 'number') {
            rt.momentum = Math.max(-100, Math.min(100, (rt.momentum || 0) + delta.momentumDelta));
        }
        if (typeof delta.cpDelta === 'number') {
            rt.cp = Math.max(0, rt.cp + delta.cpDelta);
        }
    }

    function tierTag(tier) {
        if (tier === 'black_swan') return '⚡ BLACK SWAN — ';
        if (tier === 'major')      return '⚡ ';
        return '';
    }

    function formatDelta(d) {
        if (!d) return '';
        var parts = [];
        if (typeof d.pollingDelta  === 'number') parts.push((d.pollingDelta  > 0 ? '+' : '') + d.pollingDelta  + ' poll');
        if (typeof d.momentumDelta === 'number') parts.push((d.momentumDelta > 0 ? '+' : '') + d.momentumDelta + ' mo');
        if (typeof d.cpDelta       === 'number') parts.push((d.cpDelta       > 0 ? '+' : '') + d.cpDelta       + ' CP');
        return parts.join(', ');
    }

    /* ---------- forced-dropout card (#30) --------------------------- */
    function fireForceDropout(card) {
        var res = resolvers[card.mechanic.resolver]();
        var target = res.primary[0];
        if (!target) {
            console.log('   · ' + card.name + ' — no eligible elderly struggler; redrawing');
            return false;
        }
        var base = EG.data.candidateById[target.id];
        var dels = target.delegates;

        /* Reallocate delegates proportionally (by current polling) to
           remaining same-party primary-eligible actives. */
        var pool = EG.state.candidates.filter(function (rt) {
            if (!rt.active || rt.id === target.id) return false;
            var b = EG.data.candidateById[rt.id];
            return b && b.primaryEligible && b.party === base.party;
        });
        if (dels > 0 && pool.length > 0) {
            var totalPoll = pool.reduce(function (s, rt) { return s + rt.polling; }, 0);
            if (totalPoll <= 0) totalPoll = pool.length;
            var used = 0;
            pool.forEach(function (rt, idx) {
                var share = (idx === pool.length - 1)
                    ? (dels - used)
                    : Math.floor((rt.polling / totalPoll) * dels);
                rt.delegates += share;
                used += share;
            });
        }
        target.delegates    = 0;
        target.active       = false;
        target.droppedTurn  = EG.state.turn;

        var msg = '⚡ BLACK SWAN — ' + card.name.toUpperCase() + ': ' + base.name +
                  ' withdraws (' + dels + ' delegates reallocated)';
        console.log('   · ' + msg);
        EG.state.newsLog.push(msg);
        EG.state.eventLog.push({ turn: EG.state.turn, id: card.id, target: target.id, forced: true });
        return true;
    }

    /* ---------- normal card fire ----------------------------------- */
    function fireCard(card) {
        if (card.mechanic.forceDropout) return fireForceDropout(card);

        var res = resolvers[card.mechanic.resolver]();
        if (res.primary.length === 0 && res.secondary.length === 0) {
            console.log('   · ' + card.name + ' — no eligible targets; redrawing');
            return false;
        }

        var primary    = card.mechanic.primary;
        var secondary  = card.mechanic.secondary;
        var randomSign = !!card.mechanic.randomSign;

        res.primary.forEach(function (rt) {
            if (randomSign) {
                var sign = Math.random() < 0.5 ? -1 : 1;
                applyDelta(rt, {
                    pollingDelta:  sign * Math.abs(primary.pollingDelta  || 0),
                    momentumDelta: sign * Math.abs(primary.momentumDelta || 0)
                });
            } else {
                applyDelta(rt, primary);
            }
        });

        if (secondary && secondary.sameTarget) {
            res.primary.forEach(function (rt) { applyDelta(rt, secondary); });
        } else if (secondary) {
            res.secondary.forEach(function (rt) { applyDelta(rt, secondary); });
        }

        /* News headline */
        var names = res.primary.map(function (rt) { return EG.data.candidateById[rt.id].name; });
        var label = '';
        if (names.length === 1)          label = ' — ' + names[0] + ' (' + formatDelta(primary) + ')';
        else if (names.length <= 3)      label = ' — ' + names.join(', ') + ' (' + formatDelta(primary) + ' each)';
        else                             label = ' — ' + names.length + ' candidates (' + formatDelta(primary) + ' each)';

        var msg = tierTag(card.mechanic.tier) + card.name.toUpperCase() + ': ' + card.description + label;
        console.log('   · ' + msg);
        EG.state.newsLog.push(msg);
        EG.state.eventLog.push({
            turn: EG.state.turn, id: card.id,
            targets:          res.primary.map(function (rt) { return rt.id; }),
            secondaryTargets: res.secondary.map(function (rt) { return rt.id; })
        });
        return true;
    }

    /* ---------- public entry --------------------------------------- */
    EG.engine.events.run = function () {
        if (Math.random() >= FIRE_PROBABILITY) {
            console.log('   · (quiet news cycle)');
            return;
        }
        for (var attempt = 0; attempt < MAX_REDRAWS; attempt++) {
            var id = drawCardId();
            if (id == null) return;
            var card = null;
            for (var i = 0; i < EG.data.events.length; i++) {
                if (EG.data.events[i].id === id) { card = EG.data.events[i]; break; }
            }
            if (!card || !card.mechanic) continue;
            if (fireCard(card)) return;   /* successfully fired (or genuine no-op event handled) */
        }
        console.log('   · (no event resolved this turn after ' + MAX_REDRAWS + ' draws)');
    };

    /* Force-fire a specific card by id — for verification. */
    EG.engine.events.demo = function (id) {
        var card = null;
        for (var i = 0; i < EG.data.events.length; i++) {
            if (EG.data.events[i].id === id) { card = EG.data.events[i]; break; }
        }
        if (!card) { console.warn('No event with id', id); return; }
        fireCard(card);
        if (EG.ui.hud)          EG.ui.hud.render();
        if (EG.ui.actionsPanel) EG.ui.actionsPanel.render();
        if (EG.ui.log)          EG.ui.log.render();
    };

}());
