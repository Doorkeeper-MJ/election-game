# SLICE 4 — Quick Start modal (spec + decisions)

*Built 2026-08-08. Scope: the modal only. Tooltips and menu/visual polish follow in order — they are Slice 4's remaining pieces, not part of this build.*

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

**ALL player-facing copy in `src/ui/quickStart.js` and the README's "How the
simulation works" section is DRAFT.** The structure is the deliverable of this build;
final wording is a separate pass. The draft flag is repeated in a comment at the top
of `quickStart.js` — remove both flags only when the copy pass lands.

## Standard

DoD item 4: **clear, not perfect** — a stranger isn't confused. Static help only;
no Tutorial Mode.
