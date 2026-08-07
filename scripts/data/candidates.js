/* ============================================================
   candidates.js  —  the 2024 field (16 candidates, real stats)
   Source: ElectionGame_SourceData.md (extracted from VBA workbook)

   Two eligibility fields drive who actually competes:
     primaryEligible — can this candidate appear in a primary at all?
                       (false for third-party general-election candidates)
     initiallyActive — is this candidate in the race when the game
                       starts (~Jan 1, 2024)? (false for pre-game
                       withdrawers like Tim Scott + Doug Burgum)
   ============================================================ */

window.EG = window.EG || {};
EG.data = EG.data || {};

EG.data.candidates = [

    /* --- Republicans -------------------------------------------- */
    {
        id: "R01",
        name: "Donald Trump",
        party: "Republican",
        status: "Former President",
        homeState: "Florida",
        age: 77,
        polling: 60,
        campaignFunds: 200,
        ideology: 9.5,
        nameRecognition: 99,
        debateSkill: 7,
        endorsementPoints: 95,
        active: true,
        primaryEligible: true,
        initiallyActive: true,
        notes: "Front-runner; 2024 nominee",
        specialty: {
            name: "Name Recognition",
            bonusAction: "Rally",
            bonusEffect: "×2 name recognition boost",
            weakness: "Ground Game",
            penaltyAction: "Ground Game",
            penaltyEffect: "−50% effectiveness"
        }
    },
    {
        id: "R02",
        name: "Ron DeSantis",
        party: "Republican",
        status: "Governor",
        homeState: "Florida",
        age: 45,
        polling: 12,
        campaignFunds: 85,
        ideology: 8,
        nameRecognition: 78,
        debateSkill: 6,
        endorsementPoints: 45,
        active: false,
        primaryEligible: true,
        initiallyActive: true,
        notes: "Withdrew Jan 2024",
        specialty: {
            name: "Ground Game",
            bonusAction: "Ground Game",
            bonusEffect: "×1.5 GOTV bonus",
            weakness: "Debate Prep",
            penaltyAction: "Debate Prep",
            penaltyEffect: "−1 debate score"
        }
    },
    {
        id: "R03",
        name: "Nikki Haley",
        party: "Republican",
        status: "Former Governor",
        homeState: "South Carolina",
        age: 52,
        polling: 14,
        campaignFunds: 60,
        ideology: 6.5,
        nameRecognition: 72,
        debateSkill: 8,
        endorsementPoints: 38,
        active: false,
        primaryEligible: true,
        initiallyActive: true,
        notes: "Last major challenger",
        specialty: {
            name: "Debate Performance",
            bonusAction: "Debate Prep",
            bonusEffect: "×2 debate score boost",
            weakness: "Fundraise",
            penaltyAction: "Fundraise",
            penaltyEffect: "−25% fundraising yield"
        }
    },
    {
        id: "R04",
        name: "Vivek Ramaswamy",
        party: "Republican",
        status: "Entrepreneur",
        homeState: "Ohio",
        age: 38,
        polling: 7,
        campaignFunds: 22,
        ideology: 7.5,
        nameRecognition: 55,
        debateSkill: 7,
        endorsementPoints: 12,
        active: false,
        primaryEligible: true,
        initiallyActive: true,
        notes: "Withdrew Jan 2024",
        specialty: {
            name: "Social Media",
            bonusAction: "Rally",
            bonusEffect: "×2 momentum bonus",
            weakness: "Surrogate Deployment",
            penaltyAction: "Surrogate Deployment",
            penaltyEffect: "−50% endorsement pts"
        }
    },
    {
        id: "R05",
        name: "Chris Christie",
        party: "Republican",
        status: "Former Governor",
        homeState: "New Jersey",
        age: 61,
        polling: 4.5,
        campaignFunds: 18,
        ideology: 5.5,
        nameRecognition: 68,
        debateSkill: 8,
        endorsementPoints: 20,
        active: false,
        primaryEligible: true,
        initiallyActive: true,
        notes: "Withdrew Jan 2024",
        specialty: {
            name: "Opposition Research",
            bonusAction: "Opposition Research",
            bonusEffect: "×1.5 damage to rival",
            weakness: "Air War",
            penaltyAction: "Air War",
            penaltyEffect: "−30% polling effect"
        }
    },
    {
        id: "R06",
        name: "Asa Hutchinson",
        party: "Republican",
        status: "Former Governor",
        homeState: "Arkansas",
        age: 73,
        polling: 1,
        campaignFunds: 4,
        ideology: 5,
        nameRecognition: 35,
        debateSkill: 6,
        endorsementPoints: 5,
        active: false,
        primaryEligible: true,
        initiallyActive: true,
        notes: "Low polling",
        specialty: null
    },
    {
        id: "R07",
        name: "Tim Scott",
        party: "Republican",
        status: "Senator",
        homeState: "South Carolina",
        age: 58,
        polling: 3.5,
        campaignFunds: 40,
        ideology: 7,
        nameRecognition: 50,
        debateSkill: 7,
        endorsementPoints: 18,
        active: false,
        primaryEligible: true,
        initiallyActive: false,
        notes: "Withdrew Nov 2023 — pre-game dropout",
        specialty: {
            name: "Endorsement Network",
            bonusAction: "Surrogate Deployment",
            bonusEffect: "×2 endorsement pts",
            weakness: "Opposition Research",
            penaltyAction: "Opposition Research",
            penaltyEffect: "−50% damage"
        }
    },
    {
        id: "R08",
        name: "Doug Burgum",
        party: "Republican",
        status: "Governor",
        homeState: "North Dakota",
        age: 67,
        polling: 0.5,
        campaignFunds: 8,
        ideology: 6.5,
        nameRecognition: 25,
        debateSkill: 5,
        endorsementPoints: 4,
        active: false,
        primaryEligible: true,
        initiallyActive: false,
        notes: "Withdrew Dec 2023 — pre-game dropout",
        specialty: null
    },

    /* --- Democrats ---------------------------------------------- */
    {
        id: "D01",
        name: "Joe Biden",
        party: "Democrat",
        status: "President",
        homeState: "Delaware",
        age: 81,
        polling: 45,
        campaignFunds: 180,
        ideology: 3.5,
        nameRecognition: 99,
        debateSkill: 5,
        endorsementPoints: 80,
        active: false,
        primaryEligible: true,
        initiallyActive: false,
        notes: "Withdrew July 2024 — pre-game dropout for v1 alt-history (Harris carries DEM side from start)",
        specialty: {
            name: "Incumbency",
            bonusAction: "Policy Announcement",
            bonusEffect: "×1.5 policy impact",
            weakness: "Rally",
            penaltyAction: "Rally",
            penaltyEffect: "−40% momentum"
        }
    },
    {
        id: "D02",
        name: "Kamala Harris",
        party: "Democrat",
        status: "Vice President",
        homeState: "California",
        age: 59,
        polling: 48,
        campaignFunds: 250,
        ideology: 3,
        nameRecognition: 90,
        debateSkill: 6,
        endorsementPoints: 75,
        active: true,
        primaryEligible: true,
        initiallyActive: true,
        notes: "2024 nominee. v1 alt-history: in primary from start (real arc was post-Biden-withdrawal)",
        specialty: {
            name: "Fundraising",
            bonusAction: "Fundraise",
            bonusEffect: "×2 CP return on fundraise",
            weakness: "Debate Prep",
            penaltyAction: "Debate Prep",
            penaltyEffect: "−1 debate score"
        }
    },
    {
        id: "D03",
        name: "Dean Phillips",
        party: "Democrat",
        status: "Representative",
        homeState: "Minnesota",
        age: 55,
        polling: 3.5,
        campaignFunds: 8,
        ideology: 4,
        nameRecognition: 30,
        debateSkill: 5,
        endorsementPoints: 8,
        active: false,
        primaryEligible: true,
        initiallyActive: true,
        notes: "Primary challenger",
        specialty: {
            name: "Retail Politics",
            bonusAction: "Ground Game",
            bonusEffect: "×1.5 GOTV in NH/IA",
            weakness: "Air War",
            penaltyAction: "Air War",
            penaltyEffect: "−40% polling effect"
        }
    },
    {
        id: "D04",
        name: "Marianne Williamson",
        party: "Democrat",
        status: "Author/Activist",
        homeState: "New York",
        age: 71,
        polling: 2,
        campaignFunds: 6,
        ideology: 2.5,
        nameRecognition: 42,
        debateSkill: 5,
        endorsementPoints: 5,
        active: false,
        primaryEligible: true,
        initiallyActive: true,
        notes: "Repeat candidate",
        specialty: {
            name: "Issue Alignment",
            bonusAction: "Policy Announcement",
            bonusEffect: "×2 issue score impact",
            weakness: "Fundraise",
            penaltyAction: "Fundraise",
            penaltyEffect: "−50% yield"
        }
    },

    /* --- Independents / Third Parties (general-election only) --- */
    {
        id: "I01",
        name: "Robert F. Kennedy Jr.",
        party: "Independent",
        status: "Independent",
        homeState: "California",
        age: 70,
        polling: 14,
        campaignFunds: 25,
        ideology: 5,
        nameRecognition: 70,
        debateSkill: 6,
        endorsementPoints: 15,
        active: false,
        primaryEligible: false,
        initiallyActive: true,
        notes: "Switched from Dem to Indy before Iowa; withdrew Aug 2024 endorsing Trump",
        specialty: {
            name: "Media Attention",
            bonusAction: "Rally",
            bonusEffect: "×3 name recognition",
            weakness: "Surrogate Deployment",
            penaltyAction: "Surrogate Deployment",
            penaltyEffect: "No party surrogates"
        }
    },
    {
        id: "I02",
        name: "Cornel West",
        party: "Green",
        status: "Academic",
        homeState: "Georgia",
        age: 71,
        polling: 1.5,
        campaignFunds: 3,
        ideology: 1.5,
        nameRecognition: 35,
        debateSkill: 6,
        endorsementPoints: 5,
        active: false,
        primaryEligible: false,
        initiallyActive: true,
        notes: "Green Party candidate",
        specialty: null
    },
    {
        id: "I03",
        name: "Jill Stein",
        party: "Green",
        status: "Physician",
        homeState: "Massachusetts",
        age: 73,
        polling: 2,
        campaignFunds: 5,
        ideology: 1,
        nameRecognition: 38,
        debateSkill: 5,
        endorsementPoints: 8,
        active: true,
        primaryEligible: false,
        initiallyActive: true,
        notes: "Green Party nominee",
        specialty: {
            name: "Issue Alignment",
            bonusAction: "Policy Announcement",
            bonusEffect: "×2 progressive issue boost",
            weakness: "Air War",
            penaltyAction: "Air War",
            penaltyEffect: "No TV budget"
        }
    },
    {
        id: "I04",
        name: "Chase Oliver",
        party: "Libertarian",
        status: "Activist",
        homeState: "Georgia",
        age: 38,
        polling: 0.5,
        campaignFunds: 2,
        ideology: 8.5,
        nameRecognition: 20,
        debateSkill: 4,
        endorsementPoints: 3,
        active: true,
        primaryEligible: false,
        initiallyActive: true,
        notes: "Libertarian nominee",
        specialty: {
            name: "Small Gov Appeal",
            bonusAction: "Policy Announcement",
            bonusEffect: "×2 fiscal policy boost",
            weakness: "Ground Game",
            penaltyAction: "Ground Game",
            penaltyEffect: "Minimal volunteer network"
        }
    }
];

/* Quick lookup helpers (built once at load) */
EG.data.candidateById = {};
EG.data.candidates.forEach(function (c) { EG.data.candidateById[c.id] = c; });
