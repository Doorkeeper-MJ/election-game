# FUTURE FEATURES

Post-v1 enhancements, banked. Listed roughly in order of impact-per-hour. Each item is a starting point, not a spec — design pass needed before implementation.

> ## 🔒 STANDING RULE — v1 SHIPS FIRST
> **Nothing in this file is built until v1 ships.** *"What is not finished is not."*
> The v2 seeds below were captured during MJ's **July 27, 2026 playtest** — the game working well generated a burst of ideas. **Banking them IS the discipline**: they are written down precisely so they do not become reasons v1 slips.

---

# V2 SEEDS — captured 2026-07-27 (playtest burst)

Four ideas, ordered here by **cost-to-build ascending** (which is the inverse of the order they were thought of — worth noting, since the cheapest one may be the best first move in v2).

## 4. Convention / crowd atmosphere — **CHEAPEST OF ALL FOUR**
An ambient audio bed: crowd rumble under the turn, a swell when a state is called, convention-hall roar at the nomination.

Why it is the cheapest: **pure audio files. No AI, no API, no per-play cost, no network.** It plays anywhere, including a double-clicked local build, and it degrades to silence with no code path broken. It extends the tier system already scoped in `game/SOUND_SPEC.md` rather than inventing a new subsystem — the ambient bed sits *under* the discrete tiers as a continuous layer.

**Still v2, deliberately.** v1 sound stays exactly as scoped: **Tiers 1/2/5 + Poll-Close Drumroll**, nothing more. This is held off v1 to hold scope, not because it is hard.

## 3. Era-appropriate anchor personas
Style the broadcast booth's voice to the media *feel* of whichever election **year** is being played — 1980 does not sound like 2008, which does not sound like 2016. Diction, pacing, what the era's coverage treats as significant, what it does not yet have language for. Makes each era **replayable-distinct**: the same delegate math narrated by a different decade is a different experience.

Fits the v2 Vision's multi-cycle direction (`Election Game — v2 Vision`, vault) and plays directly to MJ's screenwriter strength — writing a period voice is a craft problem, which is the kind he is best at.

> **🚨 GUARDRAIL — ORIGINAL INVENTED PERSONAS ONLY. NO REAL NAMED BROADCASTERS.**
> Invent the anchor; never imitate a real person, living or dead, by name or by unmistakable signature style. Same consent/impersonation line that governs the voice-cloning guardrail in the vault's `Seed — Voice as Medium (interactive concept)`. An era's *texture* is fair game; a person's identity is not.

Implementation shape when built: the three system prompts in `game/src/broadcast/prompts.js` gain an era-persona layer; the factual context object and its guardrails stay untouched (facts are facts in any decade).

## 2. Spoken broadcast booth
Deliver the three voices as **AUDIO**, not text. A native fit — it is called a broadcast booth, and broadcasts are heard.

Real costs to design against: generated-speech cost per line **on top of** the existing per-turn model cost; it **slows play** (you cannot skim a voice the way you skim a line of text); and it needs a **distinct, consistent voice per character** — announcer, advisor, and commentator must be instantly tellable apart by ear, which is a casting problem, not a code problem.

**Cross-link:** the vault's `Seed — Voice as Medium (interactive concept)` (02 - Creative Work, filed 2026-07-25). Note the deliberate tension: that seed **explicitly excludes the Election Game**, on the grounds that the written booth is correct as-is and audio would stack cost and slow play. This entry does not overturn that ruling — it records that MJ revisited the idea during the July 27 playtest and wants it *banked*, not adopted. **If it is ever built, the exclusion must be consciously lifted, with reasons.**

## 1. AI opponents — **the biggest, and effectively sequel territory**
Candidates (Trump et al.) driven by real strategic AI making genuine per-turn decisions, rather than resolving through the frozen deterministic engine.

Why this is the largest of the four, honestly:
- **It breaks testability.** Every gate this project owns — Gate A's digit-for-digit identity, the legibility counterfactual, the broadcast context fidelity — rests on the engine being deterministic and replayable at a seed. Non-deterministic opponents mean **no seed reproduces a game**, and the counterfactual ("what if the player had done nothing") stops being computable, because the opponents would have done something different too. Slice 2's entire legibility readout depends on that counterfactual.
- **Per-turn cost for every opponent.** Nine candidates × 22 turns is a different economic profile than one advisor call on demand.
- **Fairness design is a real design problem**, not a detail: an AI opponent that plays optimally is unbeatable and unfun; one that plays badly is transparent. The band between them has to be designed, tuned, and *verified* — with the verification tools this change would break.

**Verdict as captured: a different, bigger game — sequel territory, not v2 polish.** If it is ever pursued, it likely wants its own project with its own testing philosophy, keeping this one intact as the deterministic, verifiable version.

---

# V2 SEEDS — captured 2026-08-08 (scope decision, not a playtest)

## Democratic primary

**Logged, not scoped.** v1 is the **2016 Republican** primary only — not a general election, not a two-party simulator.

**Why this is v2 and not a v1 stretch: proportional allocation and superdelegates are a second rules engine, not a reskin of the existing one.** The frozen `model/` implements the allocation rules of the 2016 GOP field — a mix of winner-take-all, proportional, and hybrid, resolved contest by contest down the calendar. The Democratic side does not sit on top of that:

- **Proportional allocation with a 15% threshold, split statewide and by congressional district.** That is a different allocation function, not different constants — and CD-level splits need district-level data the current model does not carry.
- **Superdelegates break the engine's core assumption that delegates are won at contests.** They are unpledged, they exist outside the calendar, and they can move without any contest occurring. There is no hook for that in a loop that awards delegates only when a state votes.
- **Different clinch threshold and a different field shape** — two serious candidates rather than nine. The viability-denominator dynamics that dominate the GOP model (see seed #2 below) are structurally absent, so the balance work would not transfer either.

*(Delegate counts and superdelegate totals above are from memory and would need verifying against the 2016 DNC rules before any build.)*

**Consequence: a second engine alongside the frozen one, not an extension of it** — which also means a second set of acceptance baselines. Nothing here is v1.

## Opponent-system cluster: opponent AI + dropouts + momentum runaway — ONE SYSTEM

**Logged as a single cluster, deliberately.** The three pieces — opponent AI (spec below), dropout logic (Aug 7 seed #2 below), and momentum runaway (Aug 7 seed #3 below) — are one system: candidates exiting on money or viability, their support redistributing, and momentum behaving differently once opponents actually contest. **Designing any one alone will produce something that has to be rebuilt when the others land.** The Aug 7 sequencing note already said this for dropouts × momentum ("build them in one pass and re-baseline once"); this entry extends it to all three. The dropout and momentum write-ups stay where they are — this cluster references them, it does not duplicate them.

### Opponent AI — deterministic heuristics in the engine, never LLM calls

**Spec direction (MJ, 2026-08-08):** opponent AI is **deterministic heuristic code in the engine** — never LLM calls. The voices stay in the broadcast layer; opponents live in the engine, so **seed-locked replay and the unkeyed build both keep working.** Per-candidate **strategy profiles**: lane preference, resource style, competence rating, and a threshold for irrational persistence — so opponents play their own best game, and those games **differ in kind, not just quality.**

This supersedes half of the July 27 verdict's reasoning: that entry assumed AI-driven (LLM/non-deterministic) opponents, and its "breaks Gate A, breaks the counterfactual" objection was about *non-determinism*. Deterministic heuristics moot that objection — a pure function of (state, seed) replays exactly, and the legibility counterfactual stays computable. What the July 27 entry got right and what still stands: the fairness-band design problem, and the scale of the work — for the structural reason below.

### The finding that sizes this cluster (engine read, 2026-08-08)

**Q: what do non-player candidates do each turn now? A: nothing.** There is no opponent decision anywhere. Per contest, every candidate is scored `polling·W_POLL + momentum·W_MOMENTUM + calib·W_ISSUE + seeded noise` (`model/engine.js:50-75`), and `model/engine.js:106` states the loop is "contests only (no actions/events/dropouts)". `polling` and `calib` are **frozen at season start** (`model/data-2016.js`); the only input that ever moves is `momentum`, fed back from contest results (`engine.js:84-104`). The only entity in the game that acts is the player, whose levers transiently touch **only their own** polling/calibration during resolution (`game/src/turnLoop.js:73-87`, `game/src/levers/`).

**Q: so are outcomes opponent-driven or scripted? A: neither — they are *structurally* driven, with zero behavior in the loop.** Not scripted: results emerge from score competition, path-dependent momentum, and seeded dice, and the player's moves genuinely move outcomes (hands-off 18% vs both-levers 41% across 200 seeds). But every opponent's trajectory is fully determined by frozen initial conditions + the momentum feedback loop + dice.

**Consequence — the one that matters:** opponent AI is **not an addition to the engine; it is a replacement for how 8 of 9 candidates' results are currently produced.** Giving opponents per-turn moves means their polling/emphasis inputs become dynamic, and the engine's entire calibration — validated against static inputs — is re-opened: Gate A baselines, the 200-seed sweeps, and the historical-fit judgment all have to be redone on top of the new behavior layer. **This cluster is a much bigger v2 than "add opponents" sounds, and that is now recorded as its true size.** It remains firmly v2 (arguably the successor's core), and per the standing rule above, none of it is built until v1 ships.

# V2 SEEDS — captured 2026-08-07 (MJ playtest)

Three items from MJ's **August 7, 2026** playtest of the 2016 GOP slice. Unlike the July 27 batch — mostly presentation and atmosphere — **all three are engine-level**. Each one touches the **frozen `model/`**, and therefore each one invalidates the acceptance baselines v1 rests on: Gate A's digit-for-digit identity at seed 20160201 (Trump 1327 / Cruz 978 / Carson 150 / Rubio 16) and the 200-seed balance sweep (hands-off 18% · emphasis-only 25.5% · effort-only 36% · both 41%). **That is the whole reason they are v2 and not v1** — the fix is small, the re-validation is not.

Ordered by cost-to-build ascending, same convention as the July 27 batch.

## 3. Momentum runaway — the leader can be floored out of his own contest — **CHEAPEST OF THE THREE**

`MOM_UPSET_GAIN: 72` and `MOM_LEADER_BLEED: 50` (`model/config.js`) are two to three orders of magnitude larger than the steady-state momentum of a candidate who is neither winning nor leading (−0.33). A challenger who starts winning as a non-leader converges on **+240**; the leader who keeps losing converges on **−166.67**. At `W_MOMENTUM: 0.15` those become **+36** and **−25** on a composite score whose entire non-momentum spread is only ~6 to ~22.

The consequence: the delegate leader's raw score can go **negative** and be floored to 0.1 by `Math.max(0.1, score)` (`model/engine.js:58`), dropping him below the 0.15 viability gate **in a contest he leads the race by hundreds of delegates.** With one candidate left above the gate, `viableTotal` reduces over the viable list alone (`engine.js:64`), so `share` is exactly 1.0 and `Math.round(totalDel * 1.0)` hands over **every delegate in the state** (`engine.js:69-70`).

**Observed — seed 20160201, 2016-03-08:** Cruz took **150 of 150** across all four states (Hawaii, Idaho, Michigan, Mississippi). Trump entered at 588–245 and left at 588–395: swept in every contest while still **193 delegates ahead**. Momentum compounds *within* the turn, because `turnLoop.js:84` runs `processContestMomentum` after each contest and that date carries four.

**A brake exists and is by design — it just engages too late.** Once the challenger passes the leader on delegates the branches invert: his wins pay `MOM_EXPECTED_GAIN` 0.1 instead of 72, his losses cost 50, and momentum decays back toward +0.33. This is the effect the Slice 1 sweep already documented (*"win rate saturates ~70% and declines past maxBump ~40 — Cruz becomes leader → `MOM_LEADER_BLEED` works against him"*, `PROJECT_STATUS.md`). Nothing brakes the run **before** the pass.

Options if revisited: **floor the delegate leader's viability** (guarantee the leader is always viable regardless of score), or **retune the two constants**. The first is a rule change and is more surgical; the second is a one-line change with wide blast radius. Either invalidates Gate A and the 200-seed sweep and needs both re-baselined.

## 2. No dropout logic — the field never collapses

`model/engine.js:106` states it plainly: *"contests only (no actions/events/dropouts)."* All nine candidates stay in the field for the entire season, and — because `totalScore` sums the **whole** field (`engine.js:62`) before the viability filter runs (`engine.js:63`) — every one of them permanently inflates a denominator they can never draw from. With nine candidates the mean score share is 11.1% against a 15% gate, so **the average candidate is structurally below the line** and typically six of nine finish Super Tuesday on exactly zero.

In the real 2016 race the field collapsed steadily and each departure redistributed its support to the survivors, which is a large part of why the historical delegate curve looks nothing like this one. Modeling that means a dropout rule *and* a redistribution rule — where does a departing candidate's polling go? — which is a design problem, not just a code one.

Related and worth folding into the same pass: **`funds` is loaded for all nine candidates in `data-2016.js` and never read by any code.** Jeb Bush carries `funds: 100.0`, four times the field, and finishes last on score. Money is currently decorative.

## 1. AI candidates that respond to the player's moves — **see V2 SEED #1 (July 27) above**

Not a new item — this is the **playtest evidence** for the AI-opponents entry already banked on July 27, recorded here because MJ hit it from the other direction. Playing the July 27 note forward: *a player can build momentum with no rival able to counter.* The frozen engine gives opponents no mechanism to respond to where the player campaigns or what they emphasize; they resolve on polling, calibration, momentum, and dice. A player who finds a working line can run it unopposed to the end of the calendar.

That is the same feature, seen as a gap rather than as an ambition — and it does not change the July 27 verdict. **Sequel territory**, for the reasons already stated there (it breaks Gate A, breaks the legibility counterfactual, and carries per-turn cost for nine candidates × 22 turns). Cross-referenced rather than duplicated so there is one home for the decision.

> **Sequencing note:** items 3 and 2 interact. Dropout logic shrinks the field, which raises everyone's score share, which changes who clears the 0.15 gate — and therefore changes how often the momentum runaway can trigger at all. **If both are built, build them in one pass and re-baseline once**, rather than tuning the constants against a nine-candidate field that is about to stop existing.

---

> **Note on tracks:** the forward enhancements above (VP pick, sound, etc.) are concepts that apply to the **active v1 play layer** (`game/` + `model/`), though their old implementation notes still reference `scripts/` paths and will need re-pointing when actually built. The **"Old 2024 Prototype — parked"** section near the bottom is different: those items belong to the sidelined prototype only.

## VP pick mechanic

Modal at the convention step (after nominee declared) to pick a running mate from non-nominee primary candidates. Geographic + ideological pairing logic to balance the ticket. Small general-election polling boost from VP's home state (lean toward carrying it) and ideology (broadens the ticket's appeal — penalty for too-similar pairing, bonus for complementary spread).

Implementation surfaces: new `engine/vpPick.js`, hook into `convention.js` post-nominee, new modal UI matching brokered-modal styling. General-election effect plumbs into `generalElection.js#simulateState` as an additive base swing keyed off VP.

Originally Step 15.6 in the v1 plan. Deferred 2026-05-22 — v1 shippable without it.

## Random events / Black Swan deck

**The largest missing subsystem in the v1 play layer, and a hard dependency for two already-designed features.** `model/engine.js:106` is explicit — *"contests only (no actions/events/dropouts)"* — and nothing in `game/` draws, fires, or resolves an event. The only match for "event" anywhere in `game/src/` is the `FACTS_RULE` in `broadcast/prompts.js` that forbids the three voices from inventing one.

**A working implementation already exists in the parked prototype:** `scripts/data/eventsDeck.js` (30 cards, each with a structured per-card mechanic — tier / resolver / deltas — of which **5 are race-shaping black swans**) and `scripts/engine/events.js` (50% per-turn fire, draw-without-replacement, full momentum coupling). So this is port-and-adapt, not design-from-zero — but the adapt half is real work: the prototype deck is written against 2024 multi-party mechanics with actions, dropouts, endorsements, and debates, none of which exist in the 2016 slice.

**The real design lives in the vault — `Election Game — v2 Vision.md`** (`06 - Leisure/Election Game/`). That note governs; this entry is a pointer to it, not a spec.

**What depends on this landing:**
- **Sound Tiers 3 (upset sting) and 4 (Black Swan klaxon)** — pre-designed and parked in `game/SOUND_SPEC.md`, awaiting exactly this deck. Tier 4 has **no other legal trigger**; the spec is emphatic that no other event may ever use that sound. Until the deck exists, v1 ships Tiers 1/2/5 + the Poll-Close Drumroll, and the ship checklist verifies that **no Tier 4 path exists**.
- Any news-ticker or upset-call layer beyond the Slice 2 legibility readout.

**Cost note:** it carries the same re-baselining tax as the Aug 7 engine-level items above. Events that move polling or momentum break Gate A's digit-for-digit identity, and they perturb the legibility counterfactual — *"what if the player had done nothing"* stops being computable once an event might have fired differently in the counterfactual run. Pairs naturally with the Aug 7 dropout item, which has the same property; if both are built, re-baseline once.

## Sound integration

> **`game/SOUND_SPEC.md` is the authoritative spec** for v1 sound scope (Tiers 1/2/5 + Poll-Close Drumroll) and for the parked Tier 3/4 designs. This entry is the original concept sketch and predates it; the tier list and implementation surfaces below are **prototype-era** and cite `scripts/` paths per the note on tracks above.

Tiered audio cues based on event importance. The newsroom-broadcast aesthetic begs for it.

- **Minor events** (campaign-points earned, single-state contest result) → quiet chime
- **Major news** (momentum threshold crossings ±40, big-state contests, debate prep) → dramatic sting
- **BLACK SWAN events** (the 5 race-shaping cards — prototype implementation at `scripts/data/eventsDeck.js`; **no equivalent exists in v1**, see *Random events / Black Swan deck* above) → urgent alarm
- **Contest wins** (clinching, convention nomination, general election call) → victory fanfare

Implementation surfaces: new `ui/sound.js` with a small WebAudio (or `<audio>` tag) registry, hooks at the same news-log push sites used by `engine/events.js`, `engine/contests.js`, `engine/turnLoop.js` momentum-threshold detection, `engine/convention.js`, `engine/generalElection.js`. Settings toggle in the header for mute. Asset constraint: must be small enough that "double-click index.html" still works — bundle as base64 data URIs or load from a `/sounds/` folder.

## Brokered convention dealmaking

Originally Step 11.5 in the banked enhancements. Instead of pure algorithmic IRV redistribution at brokered conventions, give the human player agency: spend CP to swing released delegates toward their preferred candidate (themselves if still active, or another non-eliminated candidate based on ideology proximity / pre-arranged endorsements).

Revisit-trigger: only worth building if the algorithmic IRV (verified in 15.4 via `forceBrokered`) feels too spectator-y in actual brokered plays. Under current v1 balance, brokered conventions are rare-but-possible. Watch for them in real games before designing this.

Implementation surfaces: extend `engine/convention.js#redistribute` to expose a "human player override" step between ballots; new modal UI for delegate-swing actions; CP cost curves to keep it from being a free win-condition.

## Player documentation

Four pieces, scoped separately:

- **Quick Start welcome modal** — first-launch (or on-demand via header button) in-game overlay. 4-5 short panels: what's the goal, what's a campaign point, what does each action do, what happens at conventions, what's the win condition. Reuse the candidate-select modal's visual styling.
- **Player Guide (`.md`)** — long-form reference doc in the repo. Action effects, candidate specialties, state allocation rules, contest types, momentum mechanic, event deck overview. Companion to the in-game Quick Start. Reading-while-playing reference.
- **Designer's Notes (internal `.md`)** — separate doc capturing the *why* behind design decisions: why 60 starting polling for Trump, why 47/48 general-election anchors, why specialty doesn't compound on `contestMultDelta`, why momentum drift is by design, etc. Audience: the user when they return to the codebase months later, or anyone forking the project. NOT player-facing.
- **Tutorial Mode** — guided playthrough of the first 2-3 turns. Restricted choices, hint overlays, "now click NEXT TURN" prompts. Toggle on via the candidate-select modal as an alternative entry point. Hardest to build of the four — touches turn-loop gating, modal sequencing, and state-coupled hint logic.

The Quick Start modal is the highest-impact piece; the others have diminishing returns. Build Quick Start first, evaluate whether players actually want more.

---

## Old 2024 Prototype — parked, not in active development

The items in this section belong to the **OLD `scripts/` "Election 2024" prototype**, which is sidelined as **visual reference only** — its engine is NOT used by the active game. They are **NOT v1 work**: the active v1 is the `game/` play layer on the frozen 2016 `model/` engine, and neither issue exists there (v1 is single-party 2016 — no DeSantis, no party mixing). **Action these only if we ever decide to salvage the old 2024 prototype as its own shippable thing.**

### Trump/DeSantis balance — further tuning (OLD PROTOTYPE)

Headless Node `vm` harness verification at 15.7 close showed Trump winning the GOP primary 9/10 with avg +223 delegate margin. Real-browser interactive play tells a different story: DeSantis still wins too frequently as the player's AI opponent. Likely sources of the gap between harness and live play:

- Harness ran with Hutchinson (R06) as the human; player in real games picks a different candidate, changing field dynamics and CP-spend distribution
- Interactive play means the player's choices aren't AI-optimal — opens space DeSantis fills with his Ground Game stack
- RNG patterns differ between browser `Math.random` and the seeded LCG used in the harness; specific sequences may favor DeSantis more than the seeded set tested
- Events firing differently in long real games vs the deterministic 49-turn harness runs

Next pass: instrument a few real-browser SIM RESTs with different human candidates (Haley, Ramaswamy, Christie) and tally Trump-vs-DeSantis outcomes. If DeSantis still wins >30% of the time, dial further — candidate levers documented in PROJECT_STATUS (LEADER ad_buy weight, DeSantis specialty multiplier, Trump starting polling). Resist the urge to crank multiple levers at once — see [[feedback-tune-with-harness]] memory.

### Visual party separation in left-column candidate list (OLD PROTOTYPE)

The HUD's "THE FIELD" panel (`scripts/ui/hud.js`) currently sorts active-first, then by delegates desc, then polling desc — producing an interleaved GOP/DEM list. Better readability with explicit party grouping: GOP candidates as one block (red accent), DEM candidates as another (blue accent), with a visible divider or section header between them. Within each party, keep the existing sort.

Implementation surfaces: `scripts/ui/hud.js#render` (split candidates into two filtered arrays before rendering, emit a `<h3>` or styled divider between sections); `styles/newsroom.css` for the divider styling. Could also color the panel-row stripe by party for additional visual cue. Low effort, ~30 min.

---

## Also banked from earlier sessions (lower priority)

- **Historical election data (1960–2024)** — pull real primary, convention, and general results from FEC + MIT Election Lab into `data/historical/`. Enables (a) historical-mode replays, (b) accuracy validation of the sim's outputs against real outcomes, (c) "what if" scenarios (swap candidates, perturb events). May inform a future "compare to history" view in the end-game screen.
- **Two-player hotseat mode** — one human plays the R primary, a second human plays the D primary, same screen, take turns. Converge at the general election for head-to-head. Foundation is the Step 11.6 candidate-selection modal — extend from "pick one" to "pick one per party + toggle hotseat." Affects turn loop (alternating control), HUD (per-player view), and AI gating (no AI on the human-controlled party).
