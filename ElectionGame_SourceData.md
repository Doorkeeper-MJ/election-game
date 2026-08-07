# ELECTION GAME — SOURCE DATA (extracted from ElectionSimulator_v06.xlsm)
# Hand this to Claude Code as the Step 2 data source. Real 2024 election data.

## CANDIDATES (id, name, party, status, home state, age, polling%, campaign$M, ideology 1L-10R, name-recog%, debate 1-10, endorsement pts, active Y/N, notes)
  R01 | Donald Trump | Republican | Former President | Florida | 77 | 60 | 200 | 9.5 | 99 | 7 | 95 | Y | Front-runner; 2024 nominee
  R02 | Ron DeSantis | Republican | Governor | Florida | 45 | 12 | 85 | 8 | 78 | 6 | 45 | N | Withdrew Jan 2024
  R03 | Nikki Haley | Republican | Former Governor | South Carolina | 52 | 14 | 60 | 6.5 | 72 | 8 | 38 | N | Last major challenger
  R04 | Vivek Ramaswamy | Republican | Entrepreneur | Ohio | 38 | 7 | 22 | 7.5 | 55 | 7 | 12 | N | Withdrew Jan 2024
  R05 | Chris Christie | Republican | Former Governor | New Jersey | 61 | 4.5 | 18 | 5.5 | 68 | 8 | 20 | N | Withdrew Jan 2024
  R06 | Asa Hutchinson | Republican | Former Governor | Arkansas | 73 | 1 | 4 | 5 | 35 | 6 | 5 | N | Low polling
  R07 | Tim Scott | Republican | Senator | South Carolina | 58 | 3.5 | 40 | 7 | 50 | 7 | 18 | N | Withdrew Nov 2023
  R08 | Doug Burgum | Republican | Governor | North Dakota | 67 | 0.5 | 8 | 6.5 | 25 | 5 | 4 | N | Early dropout
  D01 | Joe Biden | Democrat | President | Delaware | 81 | 45 | 180 | 3.5 | 99 | 5 | 80 | N | Withdrew July 2024
  D02 | Kamala Harris | Democrat | Vice President | California | 59 | 48 | 250 | 3 | 90 | 6 | 75 | Y | 2024 nominee
  D03 | Dean Phillips | Democrat | Representative | Minnesota | 55 | 3.5 | 8 | 4 | 30 | 5 | 8 | N | Primary challenger
  D04 | Marianne Williamson | Democrat | Author/Activist | New York | 71 | 2 | 6 | 2.5 | 42 | 5 | 5 | N | Repeat candidate
  I01 | Robert F. Kennedy Jr. | Independent | Independent | California | 70 | 14 | 25 | 5 | 70 | 6 | 15 | N | Withdrew; endorsed Trump
  I02 | Cornel West | Green | Academic | Georgia | 71 | 1.5 | 3 | 1.5 | 35 | 6 | 5 | N | Green Party candidate
  I03 | Jill Stein | Green | Physician | Massachusetts | 73 | 2 | 5 | 1 | 38 | 5 | 8 | Y | Green Party nominee
  I04 | Chase Oliver | Libertarian | Activist | Georgia | 38 | 0.5 | 2 | 8.5 | 20 | 4 | 3 | Y | Libertarian nominee

## CANDIDATE SPECIALTIES (candidate, party, specialty, bonus action, bonus effect, weakness, penalty action, penalty effect)
  Donald Trump | Republican | Name Recognition | Rally | ×2 name recognition boost | Ground Game | Ground Game | −50% effectiveness
  Ron DeSantis | Republican | Ground Game | Ground Game | ×1.5 GOTV bonus | Debate Prep | Debate Prep | −1 debate score
  Nikki Haley | Republican | Debate Performance | Debate Prep | ×2 debate score boost | Fundraise | Fundraise | −25% fundraising yield
  Vivek Ramaswamy | Republican | Social Media | Rally | ×2 momentum bonus | Surrogate Deployment | Surrogate | −50% endorsement pts
  Chris Christie | Republican | Opposition Research | Opposition Research | ×1.5 damage to rival | Air War | Air War | −30% polling effect
  Tim Scott | Republican | Endorsement Network | Surrogate Deployment | ×2 endorsement pts | Opposition Research | Opp Research | −50% damage
  Joe Biden | Democrat | Incumbency | Policy Announcement | ×1.5 policy impact | Rally | Rally | −40% momentum
  Kamala Harris | Democrat | Fundraising | Fundraise | ×2 CP return on fundraise | Debate Prep | Debate Prep | −1 debate score
  Dean Phillips | Democrat | Retail Politics | Ground Game | ×1.5 GOTV in NH/IA | Air War | Air War | −40% polling effect
  Marianne Williamson | Democrat | Issue Alignment | Policy Announcement | ×2 issue score impact | Fundraise | Fundraise | −50% yield
  Robert F. Kennedy Jr. | Independent | Media Attention | Rally | ×3 name recognition | Surrogate Deployment | Surrogate | No party surrogates
  Jill Stein | Green | Issue Alignment | Policy Announcement | ×2 progressive issue boost | Air War | Air War | No TV budget
  Chase Oliver | Libertarian | Small Gov Appeal | Policy Announcement | ×2 fiscal policy boost | Ground Game | Ground Game | Minimal volunteer network

## STATES (abbr, state, region, electoral votes, dem delegates, rep delegates, dem rule, rep rule, viability threshold%, 2020 margin, pop M, %white, %black, %hispanic, swing state)
  AL | Alabama | South | 9 | 52 | 50 | Proportional | Winner-Take-All | 15 | -25.6 | 5 | 67 | 26 | 4 | N
  AK | Alaska | West | 3 | 16 | 29 | Proportional | Hybrid | 15 | -10 | 0.7 | 60 | 3 | 7 | N
  AZ | Arizona | West | 11 | 67 | 39 | Proportional | Winner-Take-All | 15 | 0.3 | 7.2 | 55 | 5 | 32 | Y
  AR | Arkansas | South | 6 | 31 | 40 | Proportional | Winner-Take-All | 15 | -28 | 3 | 72 | 15 | 8 | N
  CA | California | West | 54 | 495 | 169 | Proportional | Proportional | 15 | 29.2 | 39.5 | 36 | 6 | 40 | N
  CO | Colorado | West | 10 | 79 | 37 | Proportional | Proportional | 15 | 13.5 | 5.8 | 68 | 4 | 22 | N
  CT | Connecticut | Northeast | 7 | 60 | 28 | Proportional | Winner-Take-All | 15 | 20 | 3.6 | 66 | 12 | 17 | N
  DE | Delaware | Northeast | 3 | 21 | 16 | Proportional | Winner-Take-All | 15 | 18.9 | 1 | 61 | 23 | 10 | N
  DC | Washington D.C. | Northeast | 3 | 46 | 19 | Proportional | Proportional | 15 | 83.6 | 0.7 | 37 | 46 | 11 | N
  FL | Florida | South | 30 | 219 | 125 | Proportional | Winner-Take-All | 15 | -3.4 | 21.5 | 53 | 17 | 27 | Y
  GA | Georgia | South | 16 | 105 | 59 | Proportional | Winner-Take-All | 15 | 0.2 | 10.7 | 52 | 33 | 10 | Y
  HI | Hawaii | West | 4 | 29 | 19 | Proportional | Proportional | 15 | 29.4 | 1.5 | 21 | 2 | 11 | N
  ID | Idaho | West | 4 | 23 | 32 | Proportional | Winner-Take-All | 15 | -30.8 | 1.8 | 83 | 1 | 13 | N
  IL | Illinois | Midwest | 19 | 155 | 67 | Proportional | Proportional | 15 | 17 | 12.7 | 60 | 14 | 17 | N
  IN | Indiana | Midwest | 11 | 73 | 58 | Proportional | Winner-Take-All | 15 | -16.1 | 6.8 | 77 | 10 | 7 | N
  IA | Iowa | Midwest | 6 | 49 | 40 | Proportional | Winner-Take-All | 15 | -8.2 | 3.2 | 85 | 4 | 6 | N
  KS | Kansas | Midwest | 6 | 37 | 39 | Proportional | Winner-Take-All | 15 | -15 | 2.9 | 74 | 6 | 12 | N
  KY | Kentucky | South | 8 | 46 | 46 | Proportional | Winner-Take-All | 15 | -26.2 | 4.5 | 84 | 9 | 4 | N
  LA | Louisiana | South | 8 | 54 | 46 | Proportional | Winner-Take-All | 15 | -18.9 | 4.6 | 57 | 33 | 5 | N
  ME | Maine | Northeast | 4 | 24 | 20 | Proportional | Hybrid | 15 | 9.1 | 1.3 | 92 | 2 | 2 | Y
  MD | Maryland | Northeast | 10 | 79 | 38 | Proportional | Winner-Take-All | 15 | 33.2 | 6.2 | 50 | 31 | 11 | N
  MA | Massachusetts | Northeast | 11 | 91 | 40 | Proportional | Proportional | 15 | 33.5 | 7 | 71 | 9 | 12 | N
  MI | Michigan | Midwest | 15 | 117 | 55 | Proportional | Winner-Take-All | 15 | 2.8 | 10.1 | 74 | 14 | 5 | Y
  MN | Minnesota | Midwest | 10 | 75 | 39 | Proportional | Winner-Take-All | 15 | 7.1 | 5.7 | 79 | 7 | 6 | Y
  MS | Mississippi | South | 6 | 36 | 40 | Proportional | Winner-Take-All | 15 | -16.6 | 3 | 57 | 38 | 3 | N
  MO | Missouri | Midwest | 10 | 68 | 54 | Proportional | Winner-Take-All | 15 | -15.4 | 6.2 | 79 | 12 | 4 | N
  MT | Montana | West | 4 | 21 | 27 | Proportional | Winner-Take-All | 15 | -16.5 | 1.1 | 85 | 1 | 4 | N
  NE | Nebraska | Midwest | 5 | 29 | 36 | Proportional | Hybrid | 15 | -19.2 | 2 | 77 | 5 | 11 | N
  NV | Nevada | West | 6 | 43 | 25 | Proportional | Proportional | 15 | 2.4 | 3.1 | 47 | 10 | 29 | Y
  NH | New Hampshire | Northeast | 4 | 24 | 22 | Proportional | Winner-Take-All | 15 | 7.4 | 1.4 | 89 | 2 | 4 | Y
  NJ | New Jersey | Northeast | 14 | 107 | 49 | Proportional | Winner-Take-All | 15 | 15.9 | 9.3 | 55 | 14 | 21 | N
  NM | New Mexico | West | 5 | 34 | 22 | Proportional | Proportional | 15 | 10.8 | 2.1 | 36 | 2 | 49 | N
  NY | New York | Northeast | 28 | 274 | 95 | Proportional | Proportional | 15 | 23.1 | 19.7 | 55 | 17 | 19 | N
  NC | North Carolina | South | 16 | 110 | 71 | Proportional | Winner-Take-All | 15 | -1.3 | 10.4 | 62 | 22 | 10 | Y
  ND | North Dakota | Midwest | 3 | 14 | 29 | Proportional | Winner-Take-All | 15 | -33.3 | 0.8 | 84 | 2 | 4 | N
  OH | Ohio | Midwest | 17 | 136 | 79 | Proportional | Winner-Take-All | 15 | -8 | 11.8 | 79 | 13 | 4 | N
  OK | Oklahoma | South | 7 | 37 | 43 | Proportional | Winner-Take-All | 15 | -33.1 | 4 | 65 | 8 | 11 | N
  OR | Oregon | West | 8 | 61 | 28 | Proportional | Proportional | 15 | 16.1 | 4.2 | 72 | 2 | 14 | N
  PA | Pennsylvania | Northeast | 19 | 186 | 71 | Proportional | Winner-Take-All | 15 | 1.2 | 13 | 75 | 11 | 8 | Y
  RI | Rhode Island | Northeast | 4 | 29 | 19 | Proportional | Winner-Take-All | 15 | 21 | 1.1 | 71 | 8 | 16 | N
  SC | South Carolina | South | 9 | 55 | 50 | Proportional | Winner-Take-All | 15 | -11.7 | 5.1 | 64 | 27 | 6 | N
  SD | South Dakota | Midwest | 3 | 15 | 29 | Proportional | Winner-Take-All | 15 | -26.2 | 0.9 | 82 | 2 | 4 | N
  TN | Tennessee | South | 11 | 64 | 58 | Proportional | Winner-Take-All | 15 | -23.2 | 6.9 | 73 | 17 | 5 | N
  TX | Texas | South | 40 | 228 | 161 | Proportional | Winner-Take-All | 15 | -5.6 | 29.1 | 42 | 13 | 40 | N
  UT | Utah | West | 6 | 29 | 40 | Proportional | Winner-Take-All | 15 | -20.5 | 3.3 | 78 | 1 | 14 | N
  VT | Vermont | Northeast | 3 | 16 | 17 | Proportional | Winner-Take-All | 15 | 35.4 | 0.6 | 91 | 2 | 2 | N
  VA | Virginia | South | 13 | 124 | 48 | Proportional | Proportional | 15 | 10.1 | 8.7 | 60 | 20 | 10 | N
  WA | Washington | West | 12 | 89 | 43 | Proportional | Proportional | 15 | 19.6 | 7.7 | 64 | 4 | 14 | N
  WV | West Virginia | South | 4 | 24 | 34 | Proportional | Winner-Take-All | 15 | -38.9 | 1.8 | 91 | 4 | 2 | N
  WI | Wisconsin | Midwest | 10 | 77 | 40 | Proportional | Winner-Take-All | 15 | 0.6 | 5.9 | 81 | 7 | 7 | Y
  WY | Wyoming | West | 3 | 14 | 29 | Proportional | Winner-Take-All | 15 | -43.4 | 0.6 | 84 | 1 | 10 | N
  PR | Puerto Rico | Territory | 0 | 69 | 23 | Proportional | Proportional | 15 | 0 | 3.3 | 16 | 12 | 99 | N
  GU | Guam | Territory | 0 | 7 | 9 | Proportional | Proportional | 15 | 0 | 0.2 | 26 | 0 | 40 | N
  VI | U.S. Virgin Islands | Territory | 0 | 7 | 9 | Proportional | Proportional | 15 | 0 | 0.1 | 15 | 76 | 8 | N
  AS | American Samoa | Territory | 0 | 6 | 9 | Proportional | Proportional | 15 | 0 | 0.06 | 2 | 1 | 3 | N
  MP | N. Mariana Islands | Territory | 0 | 6 | 9 | Proportional | Proportional | 15 | 0 | 0.05 | 3 | 1 | 3 | N
  DD | Democrats Abroad | Territory | 0 | 21 | 0 | Proportional | N/A | 15 | 0 | 0 | 0 | 0 | 0 | N
  LEGEND: |  |  |  |  |  |  |  |  |  |  |  |  |  | 
  Swing State | South | West | Midwest | Northeast |  |  |  |  |  |  |  |  |  | 

## PRIMARY CALENDAR (#, date, state/contest, party, type, dem delegates, rep delegates, allocation rule, notes, status)
  1 | Jan 15, 2024 | Iowa | Republican | Caucus | 0 | 40 | Proportional | First GOP contest; DNC stripped Iowa of early status | Complete
  2 | Jan 23, 2024 | New Hampshire | Republican | Primary | 0 | 22 | Winner-Take-All | First primary; traditional first-in-nation | Complete
  3 | Feb 3, 2024 | South Carolina | Democrat | Primary | 55 | 0 | Proportional | DNC moved SC to first Dem primary | Complete
  4 | Feb 8, 2024 | Nevada | Republican | Primary | 0 | 26 | Proportional | Separate caucus also held | Complete
  5 | Feb 24, 2024 | South Carolina | Republican | Primary | 0 | 50 | Winner-Take-All | Trump dominant; Haley home state | Complete
  6 | Mar 2, 2024 | Michigan | Democrat | Primary | 117 | 0 | Proportional | 'Uncommitted' protest movement notable | Complete
  7 | Mar 5, 2024 | Alabama | Both | Super Tuesday | 52 | 50 | Mixed | Super Tuesday — 16 states vote | Complete
  8 | Mar 5, 2024 | Alaska | Both | Super Tuesday | 16 | 29 | Mixed | Super Tuesday | Complete
  9 | Mar 5, 2024 | Arkansas | Both | Super Tuesday | 31 | 40 | Mixed | Super Tuesday | Complete
  10 | Mar 5, 2024 | California | Both | Super Tuesday | 495 | 169 | Proportional | Largest delegate haul | Complete
  11 | Mar 5, 2024 | Colorado | Both | Super Tuesday | 79 | 37 | Mixed | Super Tuesday | Complete
  12 | Mar 5, 2024 | Maine | Both | Super Tuesday | 24 | 20 | Mixed | Super Tuesday | Complete
  13 | Mar 5, 2024 | Massachusetts | Both | Super Tuesday | 91 | 40 | Mixed | Super Tuesday | Complete
  14 | Mar 5, 2024 | Minnesota | Both | Super Tuesday | 75 | 39 | Mixed | Super Tuesday | Complete
  15 | Mar 5, 2024 | North Carolina | Both | Super Tuesday | 110 | 71 | Mixed | Super Tuesday | Complete
  16 | Mar 5, 2024 | Oklahoma | Both | Super Tuesday | 37 | 43 | Mixed | Super Tuesday | Complete
  17 | Mar 5, 2024 | Tennessee | Both | Super Tuesday | 64 | 58 | Mixed | Super Tuesday | Complete
  18 | Mar 5, 2024 | Texas | Both | Super Tuesday | 228 | 161 | Mixed | Largest Super Tuesday state | Complete
  19 | Mar 5, 2024 | Utah | Both | Super Tuesday | 29 | 40 | Mixed | Super Tuesday | Complete
  20 | Mar 5, 2024 | Vermont | Both | Super Tuesday | 16 | 17 | Mixed | Super Tuesday | Complete
  21 | Mar 5, 2024 | Virginia | Both | Super Tuesday | 124 | 48 | Mixed | Super Tuesday | Complete
  22 | Mar 5, 2024 | Democrats Abroad | Democrat | Super Tuesday | 21 | 0 | Proportional | Overseas Dems vote | Complete
  23 | Mar 12, 2024 | Georgia | Both | Primary | 105 | 59 | Mixed |  | Complete
  24 | Mar 12, 2024 | Mississippi | Both | Primary | 36 | 40 | Mixed |  | Complete
  25 | Mar 12, 2024 | Washington | Both | Primary | 89 | 43 | Mixed |  | Complete
  26 | Mar 19, 2024 | Arizona | Both | Primary | 67 | 39 | Mixed |  | Complete
  27 | Mar 19, 2024 | Florida | Republican | Primary | 0 | 125 | Winner-Take-All | DeSantis home state | Complete
  28 | Mar 19, 2024 | Illinois | Both | Primary | 155 | 67 | Mixed |  | Complete
  29 | Mar 19, 2024 | Kansas | Democrat | Primary | 37 | 0 | Proportional |  | Complete
  30 | Mar 19, 2024 | Ohio | Both | Primary | 136 | 79 | Mixed |  | Complete
  31 | Apr 2, 2024 | Wisconsin | Both | Primary | 77 | 40 | Mixed |  | Complete
  32 | Apr 23, 2024 | Connecticut | Both | Primary | 60 | 28 | Mixed |  | Complete
  33 | Apr 23, 2024 | Delaware | Both | Primary | 21 | 16 | Mixed |  | Complete
  34 | Apr 23, 2024 | Maryland | Both | Primary | 79 | 38 | Mixed |  | Complete
  35 | Apr 23, 2024 | New York | Both | Primary | 274 | 95 | Mixed |  | Complete
  36 | Apr 23, 2024 | Pennsylvania | Both | Primary | 186 | 71 | Mixed | KEY battleground | Complete
  37 | May 7, 2024 | Indiana | Both | Primary | 73 | 58 | Mixed |  | Complete
  38 | May 7, 2024 | North Carolina (Runoff) | Both | Primary | 0 | 0 | N/A | Congressional runoffs | Complete
  39 | May 14, 2024 | West Virginia | Both | Primary | 24 | 34 | Mixed |  | Complete
  40 | May 21, 2024 | Kentucky | Both | Primary | 46 | 46 | Mixed |  | Complete
  41 | May 21, 2024 | Oregon | Both | Primary | 61 | 28 | Mixed |  | Complete
  42 | Jun 4, 2024 | New Mexico | Both | Primary | 34 | 22 | Mixed |  | Complete
  43 | Jun 4, 2024 | South Dakota | Both | Primary | 15 | 29 | Mixed |  | Complete
  44 | Jun 11, 2024 | Nevada | Democrat | Primary | 43 | 0 | Proportional |  | Complete
  45 | Jun 11, 2024 | North Dakota | Both | Primary | 14 | 29 | Mixed |  | Complete
  46 | Jun 11, 2024 | Virginia (Runoff) | Both | Primary | 0 | 0 | N/A | Congressional | Complete
  47 | Jul 13-18, 2024 | Republican National Convention | Republican | Convention | 0 | 2429 | N/A | Milwaukee, WI — Trump nominated | Complete
  48 | Aug 19-22, 2024 | Democratic National Convention | Democrat | Convention | 3933 | 0 | N/A | Chicago, IL — Harris nominated (Biden withdrew) | Complete
  49 | Nov 5, 2024 | GENERAL ELECTION | Both | General Election | 0 | 0 | Electoral College | 538 Electoral Votes — 270 to win | Complete

## EVENTS DECK (#, category, event name, description, polling effect, CP effect)
  1 | Economic | Economic Boom | Jobs report beats expectations | Incumbent party +3 national | None
  2 | Economic | Recession Fears | GDP contracts unexpectedly | Front-runner −2, challengers +1 | None
  3 | Economic | Gas Price Spike | Energy prices spike nationally | Fiscal hawks +2 | None
  4 | Economic | Stock Market Crash | Markets drop 10% | All incumbents −3 | None
  5 | Economic | Housing Crisis | Affordability at record low | Progressives +2 | None
  6 | Scandal | Opposition Research Drop | Damaging research released | Target −4 endorsement pts | None
  7 | Scandal | Dark Money Revealed | Campaign finance irregularities | Moderates +3 | None
  8 | Scandal | Social Media Leak | Private messages surface | Target −3 polling | None
  9 | Scandal | Past Statements Resurface | Archival gaffe discovered | Random −2 debate score | None
  10 | Scandal | Legal Trouble | Indictment or lawsuit | Target −5 but base +2 | None
  11 | Debate/Media | Debate Upset | Underdog breaks through | Lowest active cand +5 | None
  12 | Debate/Media | Debate Gaffe | Front-runner stumbles | Leader −4, rivals +1 each | None
  13 | Debate/Media | Viral Moment | Clip goes massively viral | Random +3 name recog +2 poll | None
  14 | Debate/Media | Major Endorsement Covered | Media saturates on endorsement | Endorsed cand +3 | None
  15 | Debate/Media | Town Hall Success | Strong retail politics showing | Ground game +5 for 2 turns | None
  16 | Foreign Policy | Foreign Policy Crisis | International incident erupts | FP-strong candidates +3 | None
  17 | Foreign Policy | Peace Deal | Diplomatic success announced | Incumbent party +4 | None
  18 | Foreign Policy | Military Incident | Hostile act by foreign power | Hawks +3, doves −2 | None
  19 | Foreign Policy | Trade War Escalates | Economic nationalism surges | Anti-globalists +3 | None
  20 | Foreign Policy | Ally in Crisis | Major ally requests assistance | All candidates re-evaluated | None
  21 | Endorsements | Major Party Figure Endorses | Party elder makes choice | Endorsed +8 endorse pts +3 | None
  22 | Endorsements | Mega-Donor Enters | Billionaire backs a candidate | Random candidate +15 CP | None
  23 | Endorsements | Celebrity Endorsement | High-profile celebrity endorses | Endorsed +2 name recog +1 | None
  24 | Endorsements | Union Endorsement | Major labor union backs Dem | Blue-collar states +4 | None
  25 | Endorsements | Rival Drops and Endorses | Dropped candidate endorses | Endorsed +5 pts +2 del realign | None
  26 | Health | Health Scare | Candidate briefly hospitalized | Campaign paused; ±3 sympathy | None
  27 | Health | Age/Fitness Questioned | Media scrutinizes stamina | Oldest active candidate −2 | None
  28 | Health | Cognitive Test Demanded | Press demands health transparency | Front-runner must respond | None
  29 | Health | Health Cleared | Candidate passes medical review | Lingering doubts cleared +3 | None
  30 | Health | Candidate Withdraws (Health) | Serious illness forces dropout | Candidate exits; dels reallocated | None