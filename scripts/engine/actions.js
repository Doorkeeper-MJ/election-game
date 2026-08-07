/* ============================================================
   engine/actions.js  —  Step 2 of the turn cycle: Apply actions

   Players (and later, AI) stage one action per turn. When the
   turn cycle reaches step 2, this module deducts CP and applies
   the effect for any candidate with a pendingAction, then clears
   it.

   Action defs are the SINGLE source of truth — both the engine
   and the action-picker UI read from EG.engine.actions.DEFS.

   API:
       EG.engine.actions.DEFS          — { actionId: {label, cost, desc, effect} }
       EG.engine.actions.run()         — called by turn loop (step 2)
       EG.engine.actions.stage(id, a)  — record a staged action (UI uses this)
       EG.engine.actions.cancel(id)    — clear the staged action
   ============================================================ */

window.EG = window.EG || {};
EG.engine = EG.engine || {};
EG.engine.actions = EG.engine.actions || {};

/* Four distinct investment dimensions — see PROJECT_STATUS / action-redesign notes.
   Rally = streak builder (momentum-heavy)
   Ad Buy = pure polling (broadcast money play)
   Ground Game = delegate optimizer (×1.25 next contest, lower polling)
   Debate Prep = balanced (modest polling + modest momentum) */
EG.engine.actions.DEFS = {
    rally:       { label: 'RALLY',       cost: 15, desc: '+2 polling · +5 momentum',            pollingGain: 2, momentumGain: 5 },
    ad_buy:      { label: 'AD BUY',      cost: 30, desc: '+4 polling',                          pollingGain: 4 },
    ground_game: { label: 'GROUND GAME', cost: 25, desc: '+2 polling · ×1.25 dels next contest', pollingGain: 2, contestMultDelta: 0.25 },
    debate_prep: { label: 'DEBATE PREP', cost: 20, desc: '+3 polling · +3 momentum',            pollingGain: 3, momentumGain: 3 }
};

/* Specialty lookup — 1.5 (bonus), 0.5 (penalty), or 1 (neither / unmapped).
   Specialty refs pointing to actions outside DEFS are silently ignored at
   run time; auditSpecialties() reports them once at boot. */
function specialtyMultiplier(candidateId, actionId) {
    var base = EG.data.candidateById && EG.data.candidateById[candidateId];
    var def  = EG.engine.actions.DEFS[actionId];
    if (!base || !base.specialty || !def) return 1;
    var labelNorm = def.label.toLowerCase();
    var spec = base.specialty;
    if (spec.bonusAction   && spec.bonusAction.toLowerCase()   === labelNorm) return 1.5;
    if (spec.penaltyAction && spec.penaltyAction.toLowerCase() === labelNorm) return 0.5;
    return 1;
}

/* UI helper: 'bonus' | 'penalty' | null */
EG.engine.actions.specialtyTagFor = function (candidateId, actionId) {
    var m = specialtyMultiplier(candidateId, actionId);
    if (m === 1.5) return 'bonus';
    if (m === 0.5) return 'penalty';
    return null;
};

/* Step 15.1 — Action × contest-type affinity.
   Rally favored in retail (pop<4M), Ad Buy in media markets (pop>12M),
   Ground Game in Proportional rules, Debate Prep in Caucuses. Inverse
   penalties. Only fires for Primary / Caucus / Super Tuesday types;
   Convention and General Election are neutral (1.0). */
function findContestStateLocal(contestName) {
    if (!contestName || !EG.data.stateByAbbr) return null;
    var clean = contestName.replace(/\s*\(.*\)\s*$/, '').trim();
    if (clean === 'Democrats Abroad') return EG.data.stateByAbbr.DD;
    for (var abbr in EG.data.stateByAbbr) {
        if (EG.data.stateByAbbr[abbr].name === clean) return EG.data.stateByAbbr[abbr];
    }
    return null;
}

function contestAffinityFor(actionId, contest) {
    var none = { mult: 1.0, tag: null, kind: null };
    if (!contest) return none;
    var type = contest.type;
    if (type !== 'Primary' && type !== 'Caucus' && type !== 'Super Tuesday') return none;

    var sd      = findContestStateLocal(contest.contest);
    var pop     = sd ? (sd.population || 0) : 0;
    var repRule = sd ? (sd.repRule || '') : '';
    var demRule = sd ? (sd.demRule || '') : '';
    var hasProp = repRule.indexOf('Proportional')   !== -1 || demRule.indexOf('Proportional')   !== -1;
    var hasWTA  = repRule.indexOf('Winner-Take-All') !== -1 || demRule.indexOf('Winner-Take-All') !== -1;

    if (actionId === 'rally') {
        if (pop < 4)  return { mult: 1.3, tag: 'RETAIL', kind: 'bonus'   };
        if (pop > 12) return { mult: 0.8, tag: 'MEDIA',  kind: 'penalty' };
    } else if (actionId === 'ad_buy') {
        if (pop > 12) return { mult: 1.3, tag: 'MEDIA',  kind: 'bonus'   };
        if (pop < 4)  return { mult: 0.8, tag: 'RETAIL', kind: 'penalty' };
    } else if (actionId === 'ground_game') {
        if (hasProp)               return { mult: 1.3, tag: 'PROPORTIONAL', kind: 'bonus'   };
        if (hasWTA && !hasProp)    return { mult: 0.8, tag: 'WTA',          kind: 'penalty' };
    } else if (actionId === 'debate_prep') {
        if (type === 'Caucus')        return { mult: 1.3, tag: 'CAUCUS',      kind: 'bonus'   };
        if (type === 'Super Tuesday') return { mult: 0.8, tag: 'MULTI-STATE', kind: 'penalty' };
    }
    return none;
}

/* UI helper: { tag, mult, kind } for the upcoming contest, or null. */
EG.engine.actions.affinityFor = function (actionId, contest) {
    var c = contest || (EG.state.getCurrentContest && EG.state.getCurrentContest());
    var a = contestAffinityFor(actionId, c);
    return a.tag ? a : null;
};

/* Internal — used by run() and aiPlayer to get the raw multiplier */
EG.engine.actions._affinityMultiplier = function (actionId, contest) {
    var c = contest || (EG.state.getCurrentContest && EG.state.getCurrentContest());
    return contestAffinityFor(actionId, c).mult;
};

function applyEffect(rt, def, mult, affMult) {
    rt.polling += def.pollingGain * mult;
    if (def.momentumGain !== undefined) {
        rt.momentum = Math.max(-100, Math.min(100, rt.momentum + def.momentumGain * mult));
    }
    if (def.contestMultDelta !== undefined) {
        /* Specialty does NOT compound on next-contest delegate multiplier (affinity still does).
           Prevents DeSantis-style stacking where ×1.5 GG specialty × ×1.3 proportional affinity
           produced a ~×1.49 per-contest multiplier that no LEADER strategy could compete with. */
        rt.contestMultiplier = 1 + (def.contestMultDelta * affMult);
    }
}

EG.engine.actions.run = function () {
    /* Let the AI stage actions for non-human candidates before we apply. */
    if (EG.engine.aiPlayer && EG.engine.aiPlayer.run) EG.engine.aiPlayer.run();

    var applied = [];

    EG.state.candidates.forEach(function (rt) {
        if (!rt.active || !rt.pendingAction) return;
        var def = EG.engine.actions.DEFS[rt.pendingAction.id];
        if (!def) { rt.pendingAction = null; return; }

        var specMult = specialtyMultiplier(rt.id, rt.pendingAction.id);
        var affMult  = EG.engine.actions._affinityMultiplier(rt.pendingAction.id);
        var mult     = specMult * affMult;

        rt.cp -= def.cost;
        if (rt.cp < 0) rt.cp = 0;
        applyEffect(rt, def, mult, affMult);

        var base = EG.data.candidateById[rt.id];
        var specTag = (specMult === 1.5) ? ' (BONUS)' : (specMult === 0.5) ? ' (PENALTY)' : '';
        var affTag  = (affMult  > 1.0)   ? ' (+aff)'  : (affMult  < 1.0)   ? ' (−aff)'    : '';
        applied.push((base ? base.name : rt.id) + ' → ' + def.label + specTag + affTag);
        rt.pendingAction = null;
    });

    if (applied.length > 0) {
        console.log('   · Actions applied: ' + applied.join(', '));
        EG.state.newsLog.push('Actions · ' + applied.join(', '));
    } else {
        console.log('   · No actions staged this turn');
    }
};

/* One-shot boot audit: warn about specialty refs that point to actions
   not in DEFS so the design gap is visible. Call from main.js bootstrap. */
EG.engine.actions.auditSpecialties = function () {
    if (!EG.data || !EG.data.candidates) return;
    var valid = {};
    Object.keys(EG.engine.actions.DEFS).forEach(function (id) {
        valid[EG.engine.actions.DEFS[id].label.toLowerCase()] = true;
    });
    var unwireable = [];
    EG.data.candidates.forEach(function (c) {
        if (!c.specialty) return;
        ['bonusAction', 'penaltyAction'].forEach(function (field) {
            var name = c.specialty[field];
            if (name && !valid[name.toLowerCase()]) {
                unwireable.push(c.name + '.' + field + ' = "' + name + '"');
            }
        });
    });
    if (unwireable.length > 0) {
        console.warn(
            'Specialty audit — ' + unwireable.length + ' reference(s) point to actions not in DEFS (silently ignored):\n  · ' +
            unwireable.join('\n  · ')
        );
    }
};

/* ---------- staging helpers (called by the action panel) -------- */
EG.engine.actions.stage = function (candidateId, actionId) {
    var rt = EG.state.getCandidate(candidateId);
    if (!rt || !rt.active) return false;
    var def = EG.engine.actions.DEFS[actionId];
    if (!def) return false;
    if (rt.cp < def.cost) return false;            // can't afford right now
    rt.pendingAction = { id: actionId };
    return true;
};

EG.engine.actions.cancel = function (candidateId) {
    var rt = EG.state.getCandidate(candidateId);
    if (rt) rt.pendingAction = null;
};
