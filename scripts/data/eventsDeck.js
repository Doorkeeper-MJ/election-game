/* ============================================================
   eventsDeck.js  —  30-card random events deck

   Each event has TWO layers:
     1. Flavor (for the news log + verification):
        id, category, name, description, pollingEffect, cpEffect
     2. Mechanic (consumed by engine/events.js):
        mechanic.tier        — 'minor' | 'major' | 'black_swan'
        mechanic.resolver    — string keyed in events.js resolvers map
        mechanic.primary     — { pollingDelta, momentumDelta, cpDelta? }
        mechanic.secondary   — same shape, applied to the "rivals" set
                               (for cards that hit a target AND its rivals)
        mechanic.forceDropout — boolean, only on #30
   ============================================================ */

window.EG = window.EG || {};
EG.data = EG.data || {};

EG.data.events = [
    /* --- Economic --------------------------------------------- */
    { id:  1, category: "Economic", name: "Economic Boom",      description: "Jobs report beats expectations",   pollingEffect: "Incumbent party +3 national",           cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'incumbent_party', primary: { pollingDelta: +2, momentumDelta:  +6 } } },
    { id:  2, category: "Economic", name: "Recession Fears",    description: "GDP contracts unexpectedly",       pollingEffect: "Front-runner −2, challengers +1",       cpEffect: "None",
        mechanic: { tier: 'major', resolver: 'frontrunner_vs_rivals',
            primary:   { pollingDelta: -3, momentumDelta: -15 },
            secondary: { pollingDelta: +1, momentumDelta:  +5 } } },
    { id:  3, category: "Economic", name: "Gas Price Spike",    description: "Energy prices spike nationally",   pollingEffect: "Fiscal hawks +2",                       cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'ideology_above_6', primary: { pollingDelta: +2, momentumDelta:  +6 } } },
    { id:  4, category: "Economic", name: "Stock Market Crash", description: "Markets drop 10%",                 pollingEffect: "All incumbents −3",                     cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'all_active',      primary: { pollingDelta: -2, momentumDelta:  -6 } } },
    { id:  5, category: "Economic", name: "Housing Crisis",     description: "Affordability at record low",      pollingEffect: "Progressives +2",                       cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'ideology_below_4', primary: { pollingDelta: +2, momentumDelta:  +6 } } },

    /* --- Scandal ---------------------------------------------- */
    { id:  6, category: "Scandal", name: "Opposition Research Drop",  description: "Damaging research released",          pollingEffect: "Target −4 endorsement pts", cpEffect: "None",
        mechanic: { tier: 'major', resolver: 'random_active',   primary: { pollingDelta: -4, momentumDelta: -20 } } },
    { id:  7, category: "Scandal", name: "Dark Money Revealed",       description: "Campaign finance irregularities",     pollingEffect: "Moderates +3",              cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'ideology_moderate', primary: { pollingDelta: +2, momentumDelta:  +6 } } },
    { id:  8, category: "Scandal", name: "Social Media Leak",         description: "Private messages surface",            pollingEffect: "Target −3 polling",         cpEffect: "None",
        mechanic: { tier: 'major', resolver: 'random_active',   primary: { pollingDelta: -3, momentumDelta: -15 } } },
    { id:  9, category: "Scandal", name: "Past Statements Resurface", description: "Archival gaffe discovered",           pollingEffect: "Random −2 debate score",    cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'random_active',   primary: { pollingDelta: -2, momentumDelta:  -8 } } },
    { id: 10, category: "Scandal", name: "Legal Trouble",             description: "Indictment or lawsuit; base rallies", pollingEffect: "Target −7 (base rallies +3)", cpEffect: "None",
        mechanic: { tier: 'black_swan', resolver: 'random_active',
            primary:   { pollingDelta: -7, momentumDelta: -35 },
            secondary: { pollingDelta: +3, momentumDelta: +10, sameTarget: true } } },

    /* --- Debate/Media ----------------------------------------- */
    { id: 11, category: "Debate/Media", name: "Debate Upset",              description: "Underdog breaks through",           pollingEffect: "Lowest active cand +5",            cpEffect: "None",
        mechanic: { tier: 'major', resolver: 'lowest',          primary: { pollingDelta: +5, momentumDelta: +25 } } },
    { id: 12, category: "Debate/Media", name: "Debate Gaffe",              description: "Front-runner stumbles",             pollingEffect: "Leader −6, rivals +1 each",        cpEffect: "None",
        mechanic: { tier: 'black_swan', resolver: 'frontrunner_vs_rivals',
            primary:   { pollingDelta: -6, momentumDelta: -30 },
            secondary: { pollingDelta: +1, momentumDelta:  +8 } } },
    { id: 13, category: "Debate/Media", name: "Viral Moment",              description: "Clip goes massively viral",         pollingEffect: "Random +3 polling",                cpEffect: "None",
        mechanic: { tier: 'major', resolver: 'random_active',   primary: { pollingDelta: +3, momentumDelta: +15 } } },
    { id: 14, category: "Debate/Media", name: "Major Endorsement Covered", description: "Media saturates on endorsement",    pollingEffect: "Endorsed cand +4",                 cpEffect: "None",
        mechanic: { tier: 'major', resolver: 'random_active',   primary: { pollingDelta: +4, momentumDelta: +20 } } },
    { id: 15, category: "Debate/Media", name: "Town Hall Success",         description: "Strong retail politics showing",    pollingEffect: "Random +2 polling +10 momentum",   cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'random_active',   primary: { pollingDelta: +2, momentumDelta: +10 } } },

    /* --- Foreign Policy --------------------------------------- */
    { id: 16, category: "Foreign Policy", name: "Foreign Policy Crisis", description: "International incident erupts",      pollingEffect: "Hawks +5, doves −3",            cpEffect: "None",
        mechanic: { tier: 'black_swan', resolver: 'hawks_vs_doves',
            primary:   { pollingDelta: +5, momentumDelta: +25 },
            secondary: { pollingDelta: -3, momentumDelta: -15 } } },
    { id: 17, category: "Foreign Policy", name: "Peace Deal",            description: "Diplomatic success announced",       pollingEffect: "Incumbent party +4",            cpEffect: "None",
        mechanic: { tier: 'major', resolver: 'incumbent_party', primary: { pollingDelta: +4, momentumDelta: +20 } } },
    { id: 18, category: "Foreign Policy", name: "Military Incident",     description: "Hostile act by foreign power",       pollingEffect: "Hawks +3, doves −1",            cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'hawks_vs_doves',
            primary:   { pollingDelta: +3, momentumDelta: +10 },
            secondary: { pollingDelta: -1, momentumDelta:  -5 } } },
    { id: 19, category: "Foreign Policy", name: "Trade War Escalates",   description: "Economic nationalism surges",        pollingEffect: "Anti-globalists +2 (both extremes)", cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'ideology_extremes', primary: { pollingDelta: +2, momentumDelta:  +8 } } },
    { id: 20, category: "Foreign Policy", name: "Ally in Crisis",        description: "Major ally requests assistance",     pollingEffect: "All candidates re-evaluated ±1", cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'all_active', randomSign: true, primary: { pollingDelta: 1, momentumDelta: 3 } } },

    /* --- Endorsements ----------------------------------------- */
    { id: 21, category: "Endorsements", name: "Major Party Figure Endorses", description: "Party elder makes choice",         pollingEffect: "Endorsed +4 polling",            cpEffect: "None",
        mechanic: { tier: 'major', resolver: 'random_active',   primary: { pollingDelta: +4, momentumDelta: +20 } } },
    { id: 22, category: "Endorsements", name: "Mega-Donor Enters",           description: "Billionaire backs a candidate",    pollingEffect: "Random +4 polling +30 CP",       cpEffect: "+30 CP target",
        mechanic: { tier: 'black_swan', resolver: 'random_active',
            primary: { pollingDelta: +4, momentumDelta: +20, cpDelta: +30 } } },
    { id: 23, category: "Endorsements", name: "Celebrity Endorsement",       description: "High-profile celebrity endorses",  pollingEffect: "Endorsed +1 polling",            cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'random_active',   primary: { pollingDelta: +1, momentumDelta:  +5 } } },
    { id: 24, category: "Endorsements", name: "Union Endorsement",           description: "Major labor union backs Dem",      pollingEffect: "Random Dem +3 polling",          cpEffect: "None",
        mechanic: { tier: 'major', resolver: 'random_dem',      primary: { pollingDelta: +3, momentumDelta: +15 } } },
    { id: 25, category: "Endorsements", name: "Rival Drops and Endorses",    description: "Dropped candidate endorses",       pollingEffect: "Endorsed +5 polling",            cpEffect: "None",
        mechanic: { tier: 'major', resolver: 'random_active',   primary: { pollingDelta: +5, momentumDelta: +20 } } },

    /* --- Health ----------------------------------------------- */
    { id: 26, category: "Health", name: "Health Scare",                 description: "Candidate briefly hospitalized",       pollingEffect: "Oldest −2 polling, −20 momentum",   cpEffect: "None",
        mechanic: { tier: 'major', resolver: 'oldest',          primary: { pollingDelta: -2, momentumDelta: -20 } } },
    { id: 27, category: "Health", name: "Age/Fitness Questioned",       description: "Media scrutinizes stamina",            pollingEffect: "Oldest −2 polling",                 cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'oldest',          primary: { pollingDelta: -2, momentumDelta:  -8 } } },
    { id: 28, category: "Health", name: "Cognitive Test Demanded",      description: "Press demands health transparency",    pollingEffect: "Front-runner −2 polling",           cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'frontrunner',     primary: { pollingDelta: -2, momentumDelta:  -8 } } },
    { id: 29, category: "Health", name: "Health Cleared",               description: "Candidate passes medical review",      pollingEffect: "Oldest +2 polling +10 momentum",    cpEffect: "None",
        mechanic: { tier: 'minor', resolver: 'oldest',          primary: { pollingDelta: +2, momentumDelta: +10 } } },
    { id: 30, category: "Health", name: "Candidate Withdraws (Health)", description: "Serious illness forces dropout",       pollingEffect: "Elderly struggler exits race",      cpEffect: "None",
        mechanic: { tier: 'black_swan', resolver: 'elderly_struggling', forceDropout: true } }
];
