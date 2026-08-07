/* ============================================================
   config.js — calibration model tuning knobs (single source)

   Direct port of the constants block in GameEngine_FINAL_v06.bas
   (vault root). Every knob for the issue/perception model lives
   here — a tuning pass is a one-line change. Nothing below is
   duplicated elsewhere.
   ============================================================ */

module.exports = {
    // Authenticity multiplier bounds: Authenticity 0 maps to AUTH_MIN,
    // 10 maps to AUTH_MAX (linear in between). Bounds the "authentic
    // outsider" amplification so it can't swing wildly.
    AUTH_MIN: 0.7,
    AUTH_MAX: 1.3,

    // Scale that puts the 0-10ish calib score on the same magnitude
    // as the polling term inside awardDelegates.
    CALIB_SCALE: 10,

    // Additive resume-bonus per point of Strength / Competence above
    // or below 5 (so +/-0.5 max each at 0.1). ADDITIVE, never multiplier.
    STRCOMP_SCALE: 0.1,

    // Composite-score weights used by awardDelegates.
    W_POLL: 0.30,      // polling term
    W_MOMENTUM: 0.15,  // momentum term
    W_ISSUE: 0.10,     // calibration term (the revived dead slot)
    W_RANDOM: 0.05,    // random swing term (x20 internally = +/-5)

    // Viability threshold: share of total composite score required
    // to receive delegates in a contest (ported from AwardDelegates).
    VIABILITY: 0.15,

    /* ── Race dynamics (contest-driven momentum) ──────────────
       Separate from the calibration knobs above — these govern
       path-dependence between contests, not candidate scoring.
       Momentum feeds the score via the (pre-existing) W_MOMENTUM
       term; these control how contests move it. */
    MOM_DECAY: 0.7,         // per-contest momentum decay (v06 engine's existing 0.7)

    /* Winner gains / losers bleed, scaled by EXPECTATIONS — the
       current delegate leader is expected to win, so wins barely
       move them while losses cost dearly; for everyone else the
       reverse. This is what lets a challenger catch fire. */
    MOM_EXPECTED_GAIN: 0.1,  // leader wins (expected): token gain
    MOM_UPSET_GAIN: 72,      // non-leader wins (upset): big gain
    MOM_LEADER_BLEED: 50,    // leader loses (stumble): big bleed
    MOM_LOSE_BLEED: 0.1      // non-leader loses (expected): token bleed
};
