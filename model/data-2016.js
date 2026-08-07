/* ============================================================
   data-2016.js — 2016 GOP primary calibration pack

   Plain portable data per the NORTH STAR standing rule: all
   calibration data (axes, mood, salience, candidate matrices)
   lives in simple data files, never buried in engine logic.

   Sources:
   - Issue axes, 2016 mood/salience, and the 9-candidate matrix:
     vault note "06 - Leisure-Election Game.md", section
     "Historical Model — 2016 GOP Primary (calibrated)" (verbatim).
   - Candidate polling/money: GameEngine_FINAL_v06.bas
     Load2016Election (original five + the four period-realistic
     additions approved 2026-06-09).
   - Calendar: real 2016 GOP primary calendar, chronological,
     official RNC delegate totals per state/territory.
     Total = 2,472. Clinch = 1,237.
   ============================================================ */

// The six issue-axes, in matrix column order (0 end / 10 end):
//   Immigration      open .. hardline
//   Trade            free-trade .. protectionist
//   Economy/Jobs     hands-off .. top-priority interventionist
//   Foreign Policy   dovish .. hawkish
//   Establishment    insider .. outsider
//   Social Cons.     secular .. strongly socially conservative
const AXES = ["Immigration", "Trade", "Economy/Jobs", "Foreign Policy", "Establishment", "Social Conservatism"];

// 2016 electorate mood + per-axis salience (vault note section 3)
const cycle2016 = {
    year: 2016,
    party: "Republican",
    mood:     [9, 7, 8, 6, 8, 7],
    salience: [9, 7, 8, 5, 10, 5],
    delegatesToClinch: 1237
};

// The nine-candidate field.
//   polling/funds: early-2016 national polling % and money scale
//   calib.issues: positions on the six axes (vault matrix, verbatim)
//   calib strength/competence/authenticity: perception attributes (0-10)
const candidates2016 = [
    {
        id: "R16-1", name: "Donald Trump", party: "Republican",
        polling: 35.0, funds: 50.0,
        calib: { issues: [9, 9, 9, 7, 10, 5], strength: 9, competence: 7, authenticity: 10 }
    },
    {
        id: "R16-2", name: "Ted Cruz", party: "Republican",
        polling: 20.0, funds: 25.0,
        calib: { issues: [8, 5, 6, 6, 8, 9], strength: 7, competence: 7, authenticity: 7 }
    },
    {
        id: "R16-3", name: "Marco Rubio", party: "Republican",
        polling: 15.0, funds: 22.0,
        calib: { issues: [6, 3, 5, 8, 3, 8], strength: 5, competence: 7, authenticity: 4 }
    },
    {
        id: "R16-4", name: "John Kasich", party: "Republican",
        polling: 8.0, funds: 12.0,
        calib: { issues: [3, 3, 5, 7, 2, 5], strength: 4, competence: 7, authenticity: 5 }
    },
    {
        id: "R16-5", name: "Jeb Bush", party: "Republican",
        polling: 5.0, funds: 100.0,
        calib: { issues: [3, 2, 4, 8, 1, 6], strength: 3, competence: 7, authenticity: 3 }
    },
    {
        id: "R16-6", name: "Ben Carson", party: "Republican",
        polling: 10.0, funds: 28.0,
        calib: { issues: [7, 5, 5, 4, 9, 9], strength: 3, competence: 8, authenticity: 8 }
    },
    {
        id: "R16-7", name: "Chris Christie", party: "Republican",
        polling: 3.0, funds: 8.0,
        calib: { issues: [5, 4, 5, 7, 3, 5], strength: 8, competence: 7, authenticity: 6 }
    },
    {
        id: "R16-8", name: "Rand Paul", party: "Republican",
        polling: 3.0, funds: 12.0,
        calib: { issues: [6, 6, 6, 4, 7, 6], strength: 4, competence: 6, authenticity: 7 }
    },
    {
        id: "R16-9", name: "Mike Huckabee", party: "Republican",
        polling: 2.5, funds: 4.0,
        calib: { issues: [6, 5, 6, 5, 7, 10], strength: 5, competence: 7, authenticity: 7 }
    }
];

// Real 2016 GOP primary calendar — chronological, official RNC
// delegate totals. All contests run proportional-with-viability in
// this validation round (the ported engine has no WTA logic yet;
// real 2016 had WTA states — assessed separately in sim output).
const calendar2016 = [
    { date: "2016-02-01", state: "Iowa", delegates: 30 },
    { date: "2016-02-09", state: "New Hampshire", delegates: 23 },
    { date: "2016-02-20", state: "South Carolina", delegates: 50 },
    { date: "2016-02-23", state: "Nevada", delegates: 30 },
    { date: "2016-03-01", state: "Alabama", delegates: 50 },
    { date: "2016-03-01", state: "Alaska", delegates: 28 },
    { date: "2016-03-01", state: "Arkansas", delegates: 40 },
    { date: "2016-03-01", state: "Georgia", delegates: 76 },
    { date: "2016-03-01", state: "Massachusetts", delegates: 42 },
    { date: "2016-03-01", state: "Minnesota", delegates: 38 },
    { date: "2016-03-01", state: "Oklahoma", delegates: 43 },
    { date: "2016-03-01", state: "Tennessee", delegates: 58 },
    { date: "2016-03-01", state: "Texas", delegates: 155 },
    { date: "2016-03-01", state: "Vermont", delegates: 16 },
    { date: "2016-03-01", state: "Virginia", delegates: 49 },
    { date: "2016-03-05", state: "Kansas", delegates: 40 },
    { date: "2016-03-05", state: "Kentucky", delegates: 46 },
    { date: "2016-03-05", state: "Louisiana", delegates: 46 },
    { date: "2016-03-05", state: "Maine", delegates: 23 },
    { date: "2016-03-06", state: "Puerto Rico", delegates: 23 },
    { date: "2016-03-08", state: "Hawaii", delegates: 19 },
    { date: "2016-03-08", state: "Idaho", delegates: 32 },
    { date: "2016-03-08", state: "Michigan", delegates: 59 },
    { date: "2016-03-08", state: "Mississippi", delegates: 40 },
    { date: "2016-03-10", state: "Virgin Islands", delegates: 9 },
    { date: "2016-03-12", state: "District of Columbia", delegates: 19 },
    { date: "2016-03-12", state: "Guam", delegates: 9 },
    { date: "2016-03-12", state: "Wyoming", delegates: 29 },
    { date: "2016-03-15", state: "Florida", delegates: 99 },
    { date: "2016-03-15", state: "Illinois", delegates: 69 },
    { date: "2016-03-15", state: "Missouri", delegates: 52 },
    { date: "2016-03-15", state: "North Carolina", delegates: 72 },
    { date: "2016-03-15", state: "Northern Mariana Islands", delegates: 9 },
    { date: "2016-03-15", state: "Ohio", delegates: 66 },
    { date: "2016-03-22", state: "American Samoa", delegates: 9 },
    { date: "2016-03-22", state: "Arizona", delegates: 58 },
    { date: "2016-03-22", state: "Utah", delegates: 40 },
    { date: "2016-04-01", state: "North Dakota", delegates: 28 },
    { date: "2016-04-05", state: "Wisconsin", delegates: 42 },
    { date: "2016-04-09", state: "Colorado", delegates: 37 },
    { date: "2016-04-19", state: "New York", delegates: 95 },
    { date: "2016-04-26", state: "Connecticut", delegates: 28 },
    { date: "2016-04-26", state: "Delaware", delegates: 16 },
    { date: "2016-04-26", state: "Maryland", delegates: 38 },
    { date: "2016-04-26", state: "Pennsylvania", delegates: 71 },
    { date: "2016-04-26", state: "Rhode Island", delegates: 19 },
    { date: "2016-05-03", state: "Indiana", delegates: 57 },
    { date: "2016-05-10", state: "Nebraska", delegates: 36 },
    { date: "2016-05-10", state: "West Virginia", delegates: 34 },
    { date: "2016-05-17", state: "Oregon", delegates: 28 },
    { date: "2016-05-24", state: "Washington", delegates: 44 },
    { date: "2016-06-07", state: "California", delegates: 172 },
    { date: "2016-06-07", state: "Montana", delegates: 27 },
    { date: "2016-06-07", state: "New Jersey", delegates: 51 },
    { date: "2016-06-07", state: "New Mexico", delegates: 24 },
    { date: "2016-06-07", state: "South Dakota", delegates: 29 }
];

module.exports = { AXES, cycle2016, candidates2016, calendar2016 };
