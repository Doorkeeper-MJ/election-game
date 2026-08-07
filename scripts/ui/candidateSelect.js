/* ============================================================
   ui/candidateSelect.js  —  Step 11.6 candidate-selection modal

   Bare-bones overlay that gates the game until the human player
   picks a candidate. Lists everyone with primaryEligible &&
   initiallyActive, grouped by party. Click a card → EG.setPlayer(),
   hide the overlay, unlock NEXT TURN.

   API:
       EG.ui.candidateSelect.build()  — one-time: create the DOM
       EG.ui.candidateSelect.show()   — display the overlay
       EG.ui.candidateSelect.hide()   — remove the overlay
   ============================================================ */

window.EG = window.EG || {};
EG.ui = EG.ui || {};
EG.ui.candidateSelect = EG.ui.candidateSelect || {};

function formatPoll(p) {
    if (typeof p !== 'number') return p;
    var shown = Math.min(100, Math.max(0, p));
    return (shown % 1 === 0) ? String(shown) : shown.toFixed(1);
}

/* Step 15.3 — difficulty tier from starting stats.
   score = polling × 0.5 + funds × 0.1 + nameRec × 0.1. */
function difficultyTier(c) {
    var score = (c.polling || 0) * 0.5
              + (c.campaignFunds || 0) * 0.1
              + (c.nameRecognition || 0) * 0.1;
    if (score >= 40) return { label: 'FAVORITE',  cls: 'cs-diff--favorite'  };
    if (score >= 10) return { label: 'CONTENDER', cls: 'cs-diff--contender' };
    return                  { label: 'LONGSHOT',  cls: 'cs-diff--longshot'  };
}

/* Specialty preview — only render chips for specialty refs that point
   to actions actually wired in DEFS. Silently omits unimplemented refs
   like Fundraise/Policy Announcement so we don't mislead the player. */
function specialtyHTML(c) {
    if (!c.specialty) return '';
    var defs = (EG.engine && EG.engine.actions && EG.engine.actions.DEFS) || {};
    var defLabels = {};
    Object.keys(defs).forEach(function (id) {
        defLabels[defs[id].label.toLowerCase()] = defs[id].label;
    });

    var s = c.specialty;
    var chips = [];
    if (s.bonusAction && defLabels[s.bonusAction.toLowerCase()]) {
        chips.push('<span class="cs-spec-chip cs-spec-chip--bonus">+' + defLabels[s.bonusAction.toLowerCase()] + '</span>');
    }
    if (s.penaltyAction && defLabels[s.penaltyAction.toLowerCase()]) {
        chips.push('<span class="cs-spec-chip cs-spec-chip--penalty">−' + defLabels[s.penaltyAction.toLowerCase()] + '</span>');
    }
    if (chips.length === 0) return '';
    return (
        '<span class="cs-card-spec">' +
          '<span class="cs-spec-name">' + (s.name || 'Specialty') + '</span>' +
          chips.join('') +
        '</span>'
    );
}

/* Ideology bar — 0 (left) to 10 (right), marker positioned at ideology × 10%. */
function ideologyHTML(c) {
    var ideo = (typeof c.ideology === 'number') ? c.ideology : 5;
    var clamped = Math.max(0, Math.min(10, ideo));
    var pct = clamped * 10;
    return (
        '<span class="cs-card-ideo">' +
          '<span class="cs-ideo-end cs-ideo-end--left">◀</span>' +
          '<span class="cs-ideo-bar">' +
            '<span class="cs-ideo-marker" style="left:' + pct + '%"></span>' +
          '</span>' +
          '<span class="cs-ideo-end cs-ideo-end--right">▶</span>' +
          '<span class="cs-ideo-val">' + ideo.toFixed(1) + '</span>' +
        '</span>'
    );
}

function renderColumn(label, party, cls, list) {
    var rows = list.map(function (c) {
        var diff = difficultyTier(c);
        return (
            '<button type="button" class="cs-card ' + cls + '" data-id="' + c.id + '">' +
              '<span class="cs-card-stripe"></span>' +
              '<span class="cs-card-body">' +
                '<span class="cs-card-head">' +
                  '<span class="cs-card-name">' + c.name + '</span>' +
                  '<span class="cs-card-head-right">' +
                    '<span class="cs-card-poll">' + formatPoll(c.polling) + '%</span>' +
                    '<span class="cs-card-diff ' + diff.cls + '">' + diff.label + '</span>' +
                  '</span>' +
                '</span>' +
                '<span class="cs-card-sub">' + c.status + ' · ' + c.homeState + '</span>' +
                ideologyHTML(c) +
                specialtyHTML(c) +
              '</span>' +
            '</button>'
        );
    }).join('');
    return (
        '<div class="cs-col cs-col--' + party + '">' +
          '<div class="cs-col-title">' + label + '</div>' +
          '<div class="cs-col-list">' + rows + '</div>' +
        '</div>'
    );
}

EG.ui.candidateSelect.build = function () {
    if (document.getElementById('cs-overlay')) return;

    var roster = (EG.data.candidates || []).filter(function (c) {
        return c.primaryEligible && c.initiallyActive;
    });
    var reps = roster.filter(function (c) { return c.party === 'Republican'; });
    var dems = roster.filter(function (c) { return c.party === 'Democrat'; });

    var overlay = document.createElement('div');
    overlay.id = 'cs-overlay';
    overlay.className = 'cs-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'cs-title');

    overlay.innerHTML =
        '<div class="cs-panel" role="document">' +
          '<div class="cs-header">' +
            '<div class="cs-eyebrow">ELECTION 2024 · CANDIDATE SELECTION</div>' +
            '<h1 id="cs-title" class="cs-title">CHOOSE YOUR CANDIDATE</h1>' +
            '<div class="cs-subtitle">Pick a primary contender to play through the 2024 race.</div>' +
          '</div>' +
          '<div class="cs-columns">' +
            renderColumn('REPUBLICANS', 'rep', 'cs-card--rep', reps) +
            renderColumn('DEMOCRATS',  'dem', 'cs-card--dem', dems) +
          '</div>' +
        '</div>';

    overlay.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('.cs-card');
        if (!btn) return;
        var id = btn.getAttribute('data-id');
        if (!id) return;

        EG.setPlayer(id);
        EG.ui.candidateSelect.hide();

        var nextBtn = document.getElementById('btn-next-turn');
        if (nextBtn) nextBtn.disabled = false;
        var simP = document.getElementById('btn-sim-primary');
        if (simP) simP.disabled = false;
        var simR = document.getElementById('btn-sim-rest');
        if (simR) simR.disabled = false;

        var base = EG.data.candidateById && EG.data.candidateById[id];
        if (base && EG.state && EG.state.newsLog) {
            EG.state.newsLog.push('You are running as ' + base.name + '. Pick an action, then click NEXT TURN.');
            if (EG.ui.log) EG.ui.log.render();
        }
    });

    document.body.appendChild(overlay);
};

EG.ui.candidateSelect.show = function () {
    EG.ui.candidateSelect.build();
    var overlay = document.getElementById('cs-overlay');
    if (overlay) overlay.classList.add('cs-overlay--visible');
};

EG.ui.candidateSelect.hide = function () {
    var overlay = document.getElementById('cs-overlay');
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
};
