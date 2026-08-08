# SLICE 4 — Quick Start modal + tooltips (spec + decisions)

*Modal built 2026-08-08; tooltips built later the same day. Menu/visual polish is Slice 4's remaining piece.*

---

## GOVERNING PRINCIPLE — set by MJ 2026-08-08, governs future decisions

> **The modal covers what a player must know before turn one. The three broadcast
> voices cover everything learned after. Deeper system logic lives in the README,
> not in the UI.**

Consequences, in force now and for every future help-surface decision:

- The modal states **what the player controls** — never what the game does in reply.
  Momentum, engine response, viability dynamics: **deliberately excluded.** Those are
  discovered through play and narrated by the voices. Do not add them to the modal.
- Anything a player learns mid-race belongs to the broadcast layer, not to static help.
- Anything deeper than "what do I control and what am I reading" belongs in the README
  ("How the simulation works" section, `game/README.md`) — which is exactly where the
  modal's footer line points.

## Panel inventory (as built)

| # | Panel | Content rule |
|---|---|---|
| 1 | THE RACE | **First line names the subject**: 2016 Republican primary — not a general election, not a two-party simulator. Then the win condition: 1,237 delegates or the lead at calendar end. |
| 2 | THE TURN | One calendar date; every state voting that day resolves at once. |
| 3 | YOUR LEVERS | Both levers: 3 effort points across this turn's states; one issue axis or none. |
| 4 | THE GOLD READOUT | What the measured-effect line means, with a literal example of the format. |
| 5 | THE BROADCAST | Optional, off without a key — written as an **invitation**, not a deficiency notice. |

Footer: one line pointing interested players at the README's "How the simulation
works" section. One dismiss button. Re-openable from the `? HOW TO PLAY` header button.

## Decisions made in this build

1. **Levers stayed one panel, not two.** The brief allowed a split if one panel would
   crowd. Each lever fits in one bolded name + one sentence; two sub-blocks in one
   panel read clean. Split later only if playtest says otherwise.
2. **The gold readout panel is IN.** The inclusion test was "would a new player find
   it unaided?" Judgment: no — `Cruz +2 (16 vs 14)` is not self-explanatory; the
   "(real vs doing-nothing)" reading is the whole point of Slice 2's legibility work,
   and a player who misreads it as a generic bonus loses the game's core proof of
   agency. It earns a panel, not just a tooltip.
3. **"Same overlay structure as candidateSelect.js" did not survive contact with the
   code.** `game/src/ui/candidateSelect.js` is an inline panel, not an overlay — the
   play layer has no existing modal overlay (the old prototype's did; it is parked).
   The overlay here is built new (`.qs-*` styles in `newsroom.css`, alongside the
   `.bc-*` rules) using the play layer's existing visual language: `--panel` /
   `--line` / `--gold` variables, panel radius and typography, `run-btn` for dismiss.
4. **First-launch detection**: `localStorage` flag `egv1.quickstart_seen`, set on
   dismiss (✕, Escape, backdrop click, or the button — all mark it seen). If
   `localStorage` is unavailable the modal simply shows every launch — harmless
   failure mode, no error path. `localStorage` from `file://` is already a confirmed
   pattern in this project (the API key survives double-click launches).
5. **v2 seed — Democratic primary: already logged.** `FUTURE_FEATURES.md` carries a
   "V2 SEEDS — captured 2026-08-08" section with exactly the required reasoning
   (proportional allocation + superdelegates = a second rules engine, not a reskin).
   Verified present; not duplicated.

## Copy status

**Modal copy: FINAL — MJ's copy pass landed 2026-08-08** (four edits: Panel 1 no
longer opens on a negation; Panel 3 "pick one issue to run on this turn, or stay
broad"; Panel 4 standardized on "your moves"; Panel 5 billing line). Everything else
approved as written. Wording changes now go through MJ.

**README "How the simulation works" / `rules.html`: not yet through its own pass** —
content stands, but MJ has not copy-passed it the way he did the modal.

## Rules page (added 2026-08-08, MJ decision)

The modal's footer links to **`game/rules.html`** — a plain static HTML page, no
build step, same newsroom theme, works offline in the browser the player is already
in. Reason: pointing players at a `.md` file opens raw markdown in Notepad. The
README keeps the same content as **the technical front door for GitHub visitors** —
**two audiences, two documents**, decided by MJ. Drift risk is real and accepted;
both files carry an "edit one, edit both" sync comment. (Flagged against the vault's
one-home rule at decision time; MJ ruled the two-audience split worth it.)

## Tooltips (built 2026-08-08, same day, after the modal)

Static **"?" per panel** — STANDINGS, the turn panel, results, and the broadcast —
via one shared helper (`src/ui/tip.js`): a small round "?" in the panel heading,
click to toggle a short static blurb. No hover-only behavior (touch-hostile), no
per-element tooltips, no Tutorial Mode. The turn panel's tip nodes are created once
and re-appended on redraw so open/closed state survives +/− clicks.

The governing principle applies: **a tip explains what is on screen in its panel,
never what the engine does in reply.** The STANDINGS tip names what "mo" *is* (the
wind at a campaign's back right now) without teaching the mechanics; the results tip
restates the counterfactual reading in one line (the modal carries the full
explanation).

**Tooltip copy: DRAFT — not yet through MJ's pass** (unlike the modal copy, which is
FINAL). Flagged at each call site and in `tip.js`.

## Standard

DoD item 4: **clear, not perfect** — a stranger isn't confused. Static help only;
no Tutorial Mode.
