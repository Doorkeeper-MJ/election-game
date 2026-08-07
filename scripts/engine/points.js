/* ============================================================
   engine/points.js  —  Step 1 of the turn cycle: Earn CP

   Each active candidate earns Campaign Points (CP) per turn,
   driven by their polling, fundraising base, and name recognition.

   Formula:
       CP = 10 (base)
          + floor(polling / 5)          1 CP per 5 polling points
          + floor(campaignFunds / 20)   1 CP per $20M war chest
          + floor(nameRecognition / 20) 1 CP per 20% name recog

   Range for the 2024 field: ~11 CP (Hutchinson, Oliver) to
   ~36 CP (Trump, Harris). Front-runners earn ~3× small candidates.

   Dropped candidates earn nothing.

   API:
       EG.engine.points.calculate(rt)   — pure: CP a candidate would earn
       EG.engine.points.run()           — called by the turn loop
       EG.engine.points.demo()          — apply once + re-render (testing)
   ============================================================ */

window.EG = window.EG || {};
EG.engine = EG.engine || {};
EG.engine.points = EG.engine.points || {};

EG.engine.points.calculate = function (rt) {
    var base = EG.data.candidateById[rt.id];
    if (!base) return 0;
    return 10
         + Math.floor(rt.polling          / 5)
         + Math.floor(base.campaignFunds  / 20)
         + Math.floor(base.nameRecognition / 20);
};

EG.engine.points.run = function () {
    var earned = [];

    EG.state.candidates.forEach(function (rt) {
        if (!rt.active) return;
        var gain = EG.engine.points.calculate(rt);
        rt.cp += gain;
        var base = EG.data.candidateById[rt.id];
        earned.push({ id: rt.id, name: base ? base.name : rt.id, gain: gain, total: rt.cp });
    });

    earned.sort(function (a, b) { return b.gain - a.gain; });
    var top3 = earned.slice(0, 3)
        .map(function (e) { return e.name + ' +' + e.gain; })
        .join(', ');

    /* one terse console line, one news entry */
    console.log('   · Campaign points earned — ' + earned.length + ' active, top: ' + top3);
    EG.state.newsLog.push('CP earned · top: ' + top3);
};

EG.engine.points.demo = function () {
    EG.engine.points.run();
    if (EG.ui.hud) EG.ui.hud.render();
    if (EG.ui.log) EG.ui.log.render();
    console.log('Demo: ran points step once — check the HUD.');
};
