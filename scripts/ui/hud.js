/* ============================================================
   ui/hud.js  —  Candidate HUD (left panel)

   Renders one compact card per candidate from a merged view of
   EG.data.candidateById (reference: name, party, status, home)
   and EG.state.candidates (live: cp, polling, delegates, active).

   API:
       EG.ui.hud.build()    — one-time: clear placeholders, prep list
       EG.ui.hud.render()   — read state and rebuild cards
       EG.ui.hud.demo()     — paint a sample scenario (for testing)
   ============================================================ */

window.EG = window.EG || {};
EG.ui = EG.ui || {};
EG.ui.hud = EG.ui.hud || {};

/* ---------- helpers --------------------------------------------- */
EG.ui.hud.partyClass = function (party) {
    switch (party) {
        case 'Republican': return 'hud-card--rep';
        case 'Democrat':   return 'hud-card--dem';
        default:           return 'hud-card--ind';
    }
};

EG.ui.hud.partyAbbrev = function (party) {
    switch (party) {
        case 'Republican':  return 'GOP';
        case 'Democrat':    return 'DEM';
        case 'Independent': return 'IND';
        case 'Green':       return 'GRN';
        case 'Libertarian': return 'LIB';
        default:            return party;
    }
};

function formatPoll(p) {
    if (typeof p !== 'number') return p;
    var shown = Math.min(100, Math.max(0, p));   /* display clamp; raw rt.polling stays unbounded for AI/dropout/general math */
    return (shown % 1 === 0) ? String(shown) : shown.toFixed(1);
}

/* Bucket the −100..+100 momentum score into a five-state chip:
   ↑↑ big-mo / ↗ rising / → steady / ↘ fading / ↓↓ collapsing
   Thresholds: ±15 and ±50 (per MOMENTUM_PLAN.md §4). */
EG.ui.hud.momentumChip = function (m) {
    var arrow, cls;
    if      (m >   50) { arrow = '↑↑'; cls = 'mo-big';        }
    else if (m >   15) { arrow = '↗';        cls = 'mo-rising';    }
    else if (m >= -15) { arrow = '→';        cls = 'mo-steady';    }
    else if (m >= -50) { arrow = '↘';        cls = 'mo-fading';    }
    else               { arrow = '↓↓'; cls = 'mo-collapsing'; }
    return '<span class="mo-chip ' + cls + '" title="momentum ' + m.toFixed(0) + '">' + arrow + '</span>';
};

/* ---------- build ----------------------------------------------- */
EG.ui.hud.build = function () {
    var container = document.querySelector('#panel-candidates .panel-body');
    if (!container) return;
    container.innerHTML = '';
    var list = document.createElement('div');
    list.className = 'hud-list';
    list.id = 'hud-list';
    container.appendChild(list);
};

/* ---------- render ---------------------------------------------- */
EG.ui.hud.render = function () {
    var list = document.getElementById('hud-list');
    if (!list) return;

    /* Sort: active first, then by delegates desc, then by polling desc */
    var rows = EG.state.candidates.slice().sort(function (a, b) {
        if (a.active !== b.active) return a.active ? -1 : 1;
        if (b.delegates !== a.delegates) return b.delegates - a.delegates;
        return b.polling - a.polling;
    });

    var html = '';
    rows.forEach(function (rt) {
        var base = EG.data.candidateById[rt.id];
        if (!base) return;

        var classes = ['hud-card', EG.ui.hud.partyClass(base.party)];
        if (!rt.active) classes.push('hud-card--dropped');
        if (EG.state.humanPlayerId === rt.id) classes.push('hud-card--you');

        html +=
            '<div class="' + classes.join(' ') + '" data-id="' + rt.id + '">' +
              '<div class="hud-card-stripe"></div>' +
              '<div class="hud-card-body">' +
                '<div class="hud-card-head">' +
                  '<span class="hud-card-name">' + base.name + '</span>' +
                  '<span class="hud-card-party">' + EG.ui.hud.partyAbbrev(base.party) + '</span>' +
                '</div>' +
                '<div class="hud-card-sub">' + base.status + ' · ' + base.homeState + '</div>' +
                '<div class="hud-card-stats">' +
                  '<div class="hud-stat">' +
                    '<div class="hud-stat-num">' + formatPoll(rt.polling) + '<span class="hud-stat-unit">%</span> ' +
                       EG.ui.hud.momentumChip(rt.momentum || 0) + '</div>' +
                    '<div class="hud-stat-lbl">POLL</div>' +
                  '</div>' +
                  '<div class="hud-stat">' +
                    '<div class="hud-stat-num">' + rt.cp + '</div>' +
                    '<div class="hud-stat-lbl">CP</div>' +
                  '</div>' +
                  '<div class="hud-stat">' +
                    '<div class="hud-stat-num">' + rt.delegates + '</div>' +
                    '<div class="hud-stat-lbl">DEL</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
    });

    list.innerHTML = html;
};

/* ---------- demo (for verifying Step 5) ------------------------- */
EG.ui.hud.demo = function () {
    /* Paints a recognizable scenario:
       - Trump leads with CP + delegates
       - Harris close second
       - Haley distant third
       - DeSantis drops out
       - You're playing as Trump (gold highlight) */
    EG.state.getCandidate('R01').cp        = 250;
    EG.state.getCandidate('R01').polling   = 62;
    EG.state.getCandidate('R01').delegates = 1825;

    EG.state.getCandidate('D02').cp        = 180;
    EG.state.getCandidate('D02').polling   = 49;
    EG.state.getCandidate('D02').delegates = 1956;

    EG.state.getCandidate('R03').cp        = 90;
    EG.state.getCandidate('R03').polling   = 18;
    EG.state.getCandidate('R03').delegates = 97;

    EG.state.getCandidate('R02').active = false;       // DeSantis drops
    EG.state.humanPlayerId = 'R01';                    // You are Trump

    EG.ui.hud.render();
    console.log('HUD demo applied — try EG.state.reset(); EG.ui.hud.render(); to clear.');
};
