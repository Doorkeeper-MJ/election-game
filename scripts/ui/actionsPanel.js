/* ============================================================
   ui/actionsPanel.js  —  Right-side action picker

   Shows the human player's stats, the currently staged action,
   and the four action buttons. Clicking an action stages it
   (CP not deducted until NEXT TURN is clicked); clicking the
   same one again or hitting CANCEL clears it.

   API:
       EG.ui.actionsPanel.build()    — one-time DOM setup
       EG.ui.actionsPanel.render()   — refresh from state
   ============================================================ */

window.EG = window.EG || {};
EG.ui = EG.ui || {};
EG.ui.actionsPanel = EG.ui.actionsPanel || {};

EG.ui.actionsPanel.build = function () {
    var container = document.querySelector('#panel-actions .panel-body');
    if (!container) return;
    container.innerHTML =
        '<div class="player-card" id="ap-player-card"></div>' +
        '<div class="staged-box">' +
            '<div class="staged-label">STAGED FOR THIS TURN</div>' +
            '<div class="staged-content" id="ap-staged">— none —</div>' +
        '</div>' +
        '<div class="action-list" id="ap-action-list"></div>';
};

EG.ui.actionsPanel.render = function () {
    var playerCard = document.getElementById('ap-player-card');
    var stagedEl   = document.getElementById('ap-staged');
    var actionList = document.getElementById('ap-action-list');
    if (!playerCard || !stagedEl || !actionList) return;

    var humanId = EG.state.humanPlayerId;
    if (!humanId) {
        playerCard.className = 'player-card';
        playerCard.innerHTML = '<div class="player-card-empty">No human player. Set with <code>EG.setPlayer(\'R01\')</code>.</div>';
        stagedEl.textContent = '—';
        actionList.innerHTML = '';
        return;
    }

    var rt = EG.state.getCandidate(humanId);
    var base = EG.data.candidateById[humanId];
    if (!rt || !base) return;

    /* ---- player card ---- */
    var partyCls = (base.party === 'Republican') ? 'pc-rep'
                 : (base.party === 'Democrat')   ? 'pc-dem'
                 : 'pc-ind';
    playerCard.className = 'player-card ' + partyCls;

    var mo = Math.max(-100, Math.min(100, rt.momentum || 0));
    var barLeft  = (mo >= 0) ? 50 : 50 + (mo / 2);   /* mo is negative → reduces */
    var barWidth = Math.abs(mo) / 2;                 /* −100..+100 → 0..50 % */
    var moSign   = (mo > 0) ? '+' : '';
    var fillCls  = (mo >= 0) ? 'pc-mo-fill--pos' : 'pc-mo-fill--neg';

    playerCard.innerHTML =
        '<div class="player-card-label">PLAYING AS</div>' +
        '<div class="player-card-name">' + base.name + '</div>' +
        '<div class="player-card-sub">' + EG.ui.hud.partyAbbrev(base.party) + ' · ' + base.homeState + '</div>' +
        '<div class="player-card-stats">' +
            '<span><b>' + Math.min(100, Math.max(0, rt.polling)) + '%</b> POLL</span>' +
            '<span><b>' + rt.cp + '</b> CP</span>' +
            '<span><b>' + rt.delegates + '</b> DEL</span>' +
        '</div>' +
        '<div class="player-card-momentum">' +
            '<div class="pc-mo-row">' +
                '<span class="pc-mo-label">MOMENTUM</span>' +
                EG.ui.hud.momentumChip(mo) +
                '<span class="pc-mo-value">' + moSign + mo.toFixed(0) + '</span>' +
            '</div>' +
            '<div class="pc-mo-bar">' +
                '<div class="pc-mo-bar-zero"></div>' +
                '<div class="pc-mo-bar-fill ' + fillCls + '" style="left:' + barLeft + '%;width:' + barWidth + '%;"></div>' +
            '</div>' +
        '</div>';

    /* ---- staged display ---- */
    if (rt.pendingAction) {
        var def = EG.engine.actions.DEFS[rt.pendingAction.id];
        stagedEl.innerHTML =
            '<span class="staged-name">' + def.label + '</span>' +
            '<span class="staged-cost">−' + def.cost + ' CP</span>' +
            '<button class="staged-cancel" type="button" id="ap-cancel">CANCEL</button>';
        var cancelBtn = document.getElementById('ap-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                EG.engine.actions.cancel(humanId);
                EG.ui.actionsPanel.render();
            });
        }
    } else {
        stagedEl.textContent = '— none —';
    }

    /* ---- action buttons ---- */
    var currentContest = EG.state.getCurrentContest && EG.state.getCurrentContest();
    var html = '';
    Object.keys(EG.engine.actions.DEFS).forEach(function (actionId) {
        var def = EG.engine.actions.DEFS[actionId];
        var affordable = rt.cp >= def.cost;
        var selected   = rt.pendingAction && rt.pendingAction.id === actionId;
        var tag        = EG.engine.actions.specialtyTagFor(humanId, actionId);   /* 'bonus' | 'penalty' | null */
        var aff        = EG.engine.actions.affinityFor && EG.engine.actions.affinityFor(actionId, currentContest);

        var classes = ['action-btn'];
        if (selected)                  classes.push('action-btn--selected');
        if (!affordable && !selected)  classes.push('action-btn--disabled');

        var badge = tag
            ? '<span class="action-btn-badge action-btn-badge--' + tag + '">' + tag.toUpperCase() + '</span>'
            : '';
        var descText = def.desc
            + (tag === 'bonus'   ? ' · ×1.5'
             : tag === 'penalty' ? ' · ×0.5'
             : '');

        var affLine = aff
            ? '<div class="action-btn-aff action-btn-aff--' + aff.kind + '">' +
                aff.tag + ' ×' + aff.mult.toFixed(1) +
              '</div>'
            : '';

        html += '<button class="' + classes.join(' ') + '" type="button" data-action="' + actionId + '">' +
            '<div class="action-btn-row">' +
                '<span class="action-btn-name">' + def.label + badge + '</span>' +
                '<span class="action-btn-cost">' + def.cost + ' CP</span>' +
            '</div>' +
            '<div class="action-btn-desc">' + descText + '</div>' +
            affLine +
        '</button>';
    });
    actionList.innerHTML = html;

    /* wire button clicks */
    var btns = actionList.querySelectorAll('.action-btn');
    for (var i = 0; i < btns.length; i++) {
        (function (btn) {
            btn.addEventListener('click', function () {
                if (btn.classList.contains('action-btn--disabled')) return;
                var actionId = btn.getAttribute('data-action');
                if (rt.pendingAction && rt.pendingAction.id === actionId) {
                    EG.engine.actions.cancel(humanId);          // re-click cancels
                } else {
                    EG.engine.actions.stage(humanId, actionId);
                }
                EG.ui.actionsPanel.render();
            });
        }(btns[i]));
    }
};
