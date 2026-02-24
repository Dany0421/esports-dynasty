<<<<<<< HEAD
// Project Nexus – Step 1 Foundation
// Goal: lock in a FUTURE-PROOF Player data model (stats with caps/ranges + role bias + traits)
// This file keeps your current league/team generator vibe, BUT upgrades the schema so
// meta/training/environment/finance can plug in later without refactors.

// --- Teams, name pools ---
const TEAM_NAMES = [
  'Sentinels', 'Cloud9', 'NRG', 'Evil Geniuses', '100 Thieves', 'FURIA',
  'LOUD', 'Leviatán', 'G2 Esports', 'Fnatic', 'Team Liquid', 'DRX'
];

const CHALLENGER_TEAM_NAMES = [
  'M80', 'The Guard', 'Shopify Rebellion', 'Oxygen Esports', 'Ghost Gaming', 'KRÜ Esports'
];

// Single pool of gaming tags (one tag per player, no first/last). Deduplicated; assignment avoids repeats via usedPlayerNames.
const GAMING_NAMES = [
  'TenZ', 's1mple', 'ZywOo', 'cNed', 'Chronicle', 'Leo', 'Aspas', 'Less', 'saadhak', 'pANcada',
  'Tyson', 'Sacy', 'stax', 'Rb', 'MaKo', 'BuZz', 'Foxy9', 'Sayaplayer', 'Zombs', 'dapr',
  'ShahZaM', 'SicK', 'ScreaM', 'shroud', 'n0thing', 'autimatic', 'nitr0', 'EliGE', 'Twistzz', 'NAF',
  'Stewie', 'dev1ce', 'Faker', 'Niko', 'coldzera', 'fer', 'Hiko', 'Skadoodle', 'mixwell', 'Karrigan',
  'syrsoN', 'ropz', 'broky', 'rain', 'Jame', 'qikert', 'FL1T', 'n0rb3r7', 'buster', 'Perfecto',
  'B1T', 'sdy', 'electroNic', 'Magisk', 'dupreeh', 'Ax1Le', 'interz', 'HObbit', 'degster', 'm0NESY',
  'huNter', 'jL', 'torzsi', 'frozen', 'oskar', 'ISSAA', 'yekindar', 'Jabbi', 'stavn', 'TeSeS',
  'refrezh', 'sjuush', 'blameF', 'k0nfig', 'gla1ve', 'Xyp9x', 'Lucky', 'es3tag', 'Brollan', 'REZ',
  'hampus', 'Plopski', 'LNZ', 'f0rest', 'GeT_RiGhT', 'Markeloff', 'Edward', 'Zeus', 'flamie', 'electronic',
  'B1ad3', 'arT', 'junior', 'KSCERATO', 'yuurih', 'VINI', 'saffee', 'drop', 'NEKIZ', 'chelo',
  'soulz', 'vsm', 'heat', 'frz', 'RgLMeister', 'Mazin', 'jzz', 'kiNgg', 'Shyy', 'Melser',
  'Keen', 'bnj', 'Lucian', 'Luken', 'Nozwer', 'keznit', 'Daveey', 'Delz1k', 'Axed', 'Shanks',
  'penny', 'Derke', 'Alfajer', 'Shao', 'Boaster', 'Enzo', 'Soulcas', 'L1NK', 'Koldamenta', 'nAts',
  'Redgar', 'd3ffo', 'Sheydos', 'Sayf', 'Boo', 'Mistic', 'doma', 'AtaKaptan', 'qRaxz', 'BraveAF',
  'Jinggg', 'f0rsakeN', 'd4v41', 'mindfreak', 'Benkai', 'something', 'Davai', 'cGR', 'Laz', 'Crws',
  'Sylvan', 'Genghsta', 'Lakia', 'Bazzi', 'Munchkin', 'Meddo', 'Xeta', 'Bounty', 'Seoldam', 'Estrella',
  'Efina', 'Tsog', 'BcJ', 'Aproto', 'Oxy', 'Poach', 'Verno', 'YaBoiDre', 'brawk', 'thwifo',
  'Wedid', 'Oderus', 'Trick', 'Zik', 'Relyks', 'Android', 'mitch', 'Shinobi', 'Ace', 'Blaze',
  'Cipher', 'Dex', 'Echo', 'Flux', 'Grim', 'Havoc', 'Ion', 'Jade', 'Kite', 'Lynx',
  'Mirage', 'Nova', 'Onyx', 'Prism', 'Quake', 'Raven', 'Storm', 'Titan', 'Umbra', 'Vex',
  'Wraith', 'Xero', 'Yuri', 'Zen', 'Apex', 'Blitz', 'Cinder', 'Drift', 'Ember', 'Frost',
  'Ghost', 'Hex', 'Inferno', 'Jet', 'Kilo', 'Luna', 'Maze', 'Nyx', 'Orbit', 'Pulse',
  'Quill', 'Rift', 'Slash', 'Tracer', 'Void', 'Warp', 'Zero', 'Axon', 'Bolt', 'Dune',
  'Edge', 'Fade', 'Glitch', 'Haze', 'Index', 'Jolt', 'Karma'
];

// --- Core stat keys (stable, do not rename later unless you migrate saves) ---
const STAT_KEYS = [
  'aim', 'reaction', 'gameSense', 'positioning', 'utilityIQ', 'decisionSpeed',
  'adaptability', 'consistency', 'mental', 'communication'
];

// --- Role definitions (for affinity scoring; NOT gameplay yet) ---
// We keep your weights idea, but treat it as an AFFINITY model.
const ROLES = {
  Duelist: {
    core: ['aim', 'reaction', 'decisionSpeed'],
    secondary: ['mental', 'consistency'],
    soft: ['communication'],
    minStat: { aim: 65 }
  },
  Initiator: {
    core: ['utilityIQ', 'gameSense', 'communication'],
    secondary: ['decisionSpeed', 'adaptability'],
    soft: ['aim'],
    minStat: { communication: 60 }
  },
  Controller: {
    core: ['utilityIQ', 'consistency', 'mental'],
    secondary: ['gameSense', 'positioning'],
    soft: ['communication'],
    minStat: { consistency: 60 }
  },
  Sentinel: {
    core: ['positioning', 'gameSense', 'mental'],
    secondary: ['consistency', 'utilityIQ'],
    soft: ['communication'],
    minStat: { mental: 60 }
  }
};

const ROLE_WEIGHTS = { core: 1.4, secondary: 1.0, soft: 0.6 };

// --- Traits pool (just to seed structure; we can expand later) ---
const TRAITS_POOL = [
  'Late Bloomer',
  'Early Peak',
  'Adaptive',
  'Fragile Confidence',
  'Role Fluid',
  'Learner'
];

// --- ID + RNG helpers ---
let playerIdCounter = 1;
const usedPlayerNames = new Set();

function getAvailableGamingName() {
  const available = GAMING_NAMES.filter(n => !usedPlayerNames.has(n));
  const name = available.length > 0 ? pickRandom(available) : ('Player' + playerIdCounter);
  usedPlayerNames.add(name);
  return name;
}

function registerUsedPlayerNamesFromTeams(teams) {
  if (!teams || !Array.isArray(teams)) return;
  teams.forEach(team => {
    (team.players || []).forEach(p => {
      if (p.firstName) usedPlayerNames.add(p.firstName);
    });
  });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function chance(p) {
  return Math.random() < p;
}

// --- MAP POOL (10 maps, 7 in rotation per season) ---
const ALL_MAPS = [
  { id: 'ascent', name: 'Ascent', inRotation: true },
  { id: 'bind', name: 'Bind', inRotation: true },
  { id: 'haven', name: 'Haven', inRotation: true },
  { id: 'split', name: 'Split', inRotation: true },
  { id: 'fracture', name: 'Fracture', inRotation: true },
  { id: 'pearl', name: 'Pearl', inRotation: true },
  { id: 'lotus', name: 'Lotus', inRotation: true },
  { id: 'icebox', name: 'Icebox', inRotation: false },
  { id: 'sunset', name: 'Sunset', inRotation: false },
  { id: 'corrode', name: 'Corrode', inRotation: false }
];

function getActiveMapPool() {
  const active = ALL_MAPS.filter(m => m.inRotation);
  return active.map(m => m.name);
}

function assignMapToMatch(seasonOrPool) {
  const pool = Array.isArray(seasonOrPool) ? seasonOrPool : (seasonOrPool && seasonOrPool.activeMapPool) || getActiveMapPool();
  if (!pool || pool.length === 0) return '—';
  return pool[randomInt(0, pool.length - 1)];
}

function rotateMapPool() {
  const active = ALL_MAPS.filter(m => m.inRotation).slice();
  const inactive = ALL_MAPS.filter(m => !m.inRotation).slice();
  if (active.length < 2 || inactive.length < 2) return { mapsAdded: [], mapsRemoved: [] };
  const toRemove = [];
  for (let i = 0; i < 2; i++) {
    const idx = randomInt(0, active.length - 1);
    toRemove.push(active.splice(idx, 1)[0]);
  }
  const toAdd = [];
  for (let i = 0; i < 2; i++) {
    const idx = randomInt(0, inactive.length - 1);
    toAdd.push(inactive.splice(idx, 1)[0]);
  }
  toRemove.forEach(m => { m.inRotation = false; });
  toAdd.forEach(m => { m.inRotation = true; });
  return {
    mapsAdded: toAdd.map(m => m.name),
    mapsRemoved: toRemove.map(m => m.name)
  };
}

// --- AGE (esports: short careers, peak 22-25) ---
function generatePlayerAge() {
  const roll = Math.random() * 100;
  if (roll < 30) return randomInt(17, 19);   // 30% prospects
  if (roll < 70) return randomInt(20, 23);   // 40% prime
  if (roll < 90) return randomInt(24, 25);   // 20% experienced
  return randomInt(26, 27);                  // 10% veterans
}

function getAgePhase(age) {
  if (age == null) return 'peak';
  if (age <= 21) return 'growth';
  if (age <= 25) return 'peak';
  if (age <= 27) return 'decline';
  return 'retirement';
}

// --- STAT RANGE MODEL (critical for your design) ---
// Each stat is: { current, minCap, maxCap }
// current must always stay within [minCap, maxCap].
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function makeStatRange({ current, minCap, maxCap }) {
  const min = clamp(minCap, 1, 99);
  const max = clamp(maxCap, min, 99);
  return {
    current: clamp(current, min, max),
    minCap: min,
    maxCap: max
  };
}

// Generate a cap RANGE first, then pick a current inside it.
// This lets environment/meta/mental later adjust "effective cap" without changing biology.
function generateStatRange({ baseMin = 40, baseMax = 98, capWidthMin = 8, capWidthMax = 18 }) {
  const maxCap = randomInt(baseMin + capWidthMin, baseMax);
  const width = randomInt(capWidthMin, capWidthMax);
  const minCap = clamp(maxCap - width, 1, 98);
  const current = randomInt(minCap, maxCap);
  return makeStatRange({ current, minCap, maxCap });
}

// Role-biased range generation: core stats tend to have higher caps and higher current.
// Enforce role minStat so the biased player qualifies for that role.
function generateStatRangeForRole(statKey, roleKey) {
  const role = ROLES[roleKey];
  const isCore = role.core.includes(statKey);
  const isSecondary = role.secondary.includes(statKey);
  const isSoft = role.soft.includes(statKey);
  const minForRole = role.minStat && role.minStat[statKey] !== undefined ? role.minStat[statKey] : 0;

  // Tune these numbers later, but keep the idea stable.
  let opts;
  if (isCore) {
    opts = { baseMin: Math.max(55, minForRole), baseMax: 98, capWidthMin: 10, capWidthMax: 20 };
  } else if (isSecondary) {
    opts = { baseMin: Math.max(48, minForRole), baseMax: 92, capWidthMin: 8, capWidthMax: 18 };
  } else if (isSoft) {
    opts = { baseMin: Math.max(42, minForRole), baseMax: 86, capWidthMin: 8, capWidthMax: 16 };
  } else {
    opts = { baseMin: Math.max(40, minForRole), baseMax: 88, capWidthMin: 8, capWidthMax: 16 };
  }
  const range = generateStatRange(opts);
  if (minForRole > 0 && range.current < minForRole) {
    return makeStatRange({ current: minForRole, minCap: range.minCap, maxCap: Math.max(range.maxCap, minForRole) });
  }
  return range;
}

// --- Affinity scoring should read CURRENT values only (for now). ---
function scoreForRole(statsCurrent, roleKey, options) {
  const role = ROLES[roleKey];
  const ignoreMinStat = options && options.ignoreMinStat;

  if (!ignoreMinStat) {
    for (const [stat, minVal] of Object.entries(role.minStat || {})) {
      if ((statsCurrent[stat] || 0) < minVal) return -1;
    }
  }

  let score = 0;
  for (const s of role.core) score += (statsCurrent[s] || 0) * ROLE_WEIGHTS.core;
  for (const s of role.secondary) score += (statsCurrent[s] || 0) * ROLE_WEIGHTS.secondary;
  for (const s of role.soft) score += (statsCurrent[s] || 0) * ROLE_WEIGHTS.soft;
  return score;
}

function getPrimaryAndSecondaryRole(statsCurrent, options) {
  const allScores = {};
  for (const roleKey of Object.keys(ROLES)) {
    const s = scoreForRole(statsCurrent, roleKey, options || {});
    allScores[roleKey] = s >= 0 ? s : -1;
  }

  const eligible = Object.entries(allScores).filter(([, v]) => v >= 0);
  if (eligible.length === 0) {
    const first = Object.keys(ROLES)[0];
    return { primary: first, secondary: first, allScores };
  }

  eligible.sort((a, b) => b[1] - a[1]);
  const primary = eligible[0][0];
  const secondary = eligible.length > 1 ? eligible[1][0] : eligible[0][0];
  return { primary, secondary, allScores };
}

// FlexPotential based on how close 2nd role is to 1st (rare high flex)
function getFlexPotential(allScores, primary) {
  const scores = Object.entries(allScores)
    .filter(([, v]) => v >= 0)
    .sort((a, b) => b[1] - a[1]);

  if (scores.length < 2) return 'Low';
  const primaryEntry = scores.find(([r]) => r === primary);
  const pScore = primaryEntry ? primaryEntry[1] : 0;
  const secondScore = scores[1][1];
  const ratio = pScore ? secondScore / pScore : 0;

  if (ratio >= 0.94 && chance(0.18)) return 'High';
  if (ratio >= 0.82) return 'Medium';
  return 'Low';
}

// --- Traits seeding (structure only; logic later) ---
function seedTraits(flexPotential) {
  const traits = [];

  // Keep it light for now; just make sure the array exists.
  if (flexPotential === 'High' && chance(0.35)) traits.push('Role Fluid');
  if (chance(0.18)) traits.push('Adaptive');
  if (chance(0.12)) traits.push('Fragile Confidence');
  if (chance(0.10)) traits.push('Late Bloomer');

  // Ensure unique traits
  return [...new Set(traits)];
}

// --- Player creation (this is the step-1 deliverable) ---
function createPlayer(roleBias = null, ageOverride = null) {
  // Build stat ranges (slightly lower base for youth replacements if ageOverride is set)
  const stats = {};
  const isYouth = ageOverride != null && ageOverride <= 20;
  for (const k of STAT_KEYS) {
    if (isYouth && roleBias == null) {
      stats[k] = generateStatRange({ baseMin: 35, baseMax: 82, capWidthMin: 8, capWidthMax: 16 });
    } else {
      stats[k] = roleBias
        ? generateStatRangeForRole(k, roleBias)
        : generateStatRange({ baseMin: 40, baseMax: 90, capWidthMin: 8, capWidthMax: 18 });
    }
  }

  // Affinity uses current values
  const statsCurrent = Object.fromEntries(
    STAT_KEYS.map(k => [k, stats[k].current])
  );

  const { primary, secondary, allScores } = getPrimaryAndSecondaryRole(statsCurrent);
  const flexPotential = getFlexPotential(allScores, primary);
  const traits = seedTraits(flexPotential);

  const id = playerIdCounter++;
  const firstName = getAvailableGamingName();
  const lastName = '';
  const age = ageOverride != null ? ageOverride : generatePlayerAge();
  const overall = STAT_KEYS.reduce((sum, k) => sum + stats[k].current, 0) / STAT_KEYS.length;
  let salary;
  if (overall >= 80) salary = randomInt(15000, 25000);
  else if (overall >= 70) salary = randomInt(8000, 15000);
  else if (overall >= 60) salary = randomInt(4000, 8000);
  else salary = randomInt(2000, 4000);
  return {
    id,
    firstName,
    lastName,
    age,
    contractYears: randomInt(1, 3),
    salary,
    transferListed: false,

    // Step 1 schema
    stats, // { aim: {current,minCap,maxCap}, ... }
    roleBias: {
      primaryRoleBias: primary,
      secondaryRoleBias: secondary,
      flexPotential
    },
    traits,

    // Optional debug info (keep for dev; can remove later)
    roleScores: allScores
  };
}

function getPlayerDisplayName(p) {
  if (!p) return '';
  return ((p.firstName || '') + (p.lastName ? ' ' + p.lastName : '')).trim();
}

// Each team: 5 starters, 3 bench. At least 1 of each role.
function createTeam(teamName, tier = 'Main') {
  const requiredRoles = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];
  const players = [];

  for (const role of requiredRoles) {
    players.push(createPlayer(role));
  }

  for (let i = 0; i < 4; i++) {
    players.push(createPlayer(null));
  }

  const starters = players.slice(0, 5);
  const bench = players.slice(5, 8);

  return {
    name: teamName,
    starters,
    bench,
    players,
    youthAcademy: [],
    tier,
    prestige: tier === 'Main' ? 60 + Math.floor(Math.random() * 20) : 30 + Math.floor(Math.random() * 15),
    budgetMultiplier: tier === 'Main' ? 1.0 : 0.7
  };
}

// --- Youth Academy: prospect pool (14-17yo, no transfer fee, salary only) ---
window.Nexus = window.Nexus || {};
window.Nexus.YOUTH_MARKET = window.Nexus.YOUTH_MARKET || [];

function createYouthProspect() {
  // Mostly 16–17; 15 is rare (~8%)
  const age = chance(0.08) ? 15 : (chance(0.5) ? 16 : 17);
  const stats = {};
  STAT_KEYS.forEach(k => {
    const current = randomInt(35, 55);
    const maxCap = randomInt(70, 95);
    const minCap = Math.max(30, current - 10);
    stats[k] = { current, minCap, maxCap };
  });
  const statsCurrent = Object.fromEntries(STAT_KEYS.map(k => [k, stats[k].current]));
  const { primary, secondary, allScores } = getPrimaryAndSecondaryRole(statsCurrent, { ignoreMinStat: true });
  const roleRankings = Object.entries(allScores)
    .filter(([, score]) => score >= 0)
    .sort((a, b) => b[1] - a[1])
    .map(([role, score]) => ({ role, score }));
  const flexPotential = getFlexPotential(allScores, primary);
  const id = playerIdCounter++;
  return {
    id,
    firstName: getAvailableGamingName(),
    lastName: '',
    age,
    stats,
    roleBias: { primaryRoleBias: primary, secondaryRoleBias: secondary, flexPotential },
    roleRankings,
    roleScores: allScores,
    isYouth: true,
    salary: randomInt(2000, 4000),
    contractYears: 3
  };
}

function ensureYouthProspectRoleBias(prospect) {
  if (!prospect || !prospect.stats || typeof getPrimaryAndSecondaryRole !== 'function') return;
  var statsCurrent = {};
  var keys = typeof STAT_KEYS !== 'undefined' ? STAT_KEYS : ['aim', 'reaction', 'gameSense', 'positioning', 'utilityIQ', 'decisionSpeed', 'adaptability', 'consistency', 'mental', 'communication'];
  keys.forEach(function(k) {
    statsCurrent[k] = (prospect.stats[k] && prospect.stats[k].current != null) ? prospect.stats[k].current : 50;
  });
  if (Object.keys(statsCurrent).length === 0) return;
  var res = getPrimaryAndSecondaryRole(statsCurrent, { ignoreMinStat: true });
  var flexPotential = typeof getFlexPotential === 'function' ? getFlexPotential(res.allScores, res.primary) : 'Low';
  prospect.roleBias = { primaryRoleBias: res.primary, secondaryRoleBias: res.secondary, flexPotential: flexPotential };
  prospect.roleScores = res.allScores;
}

function prospectToFullPlayer(prospect) {
  const p = { ...prospect };
  delete p.roleRankings;
  delete p.isYouth;
  if (!p.traits) p.traits = seedTraits((p.roleBias && p.roleBias.flexPotential) || 'Low');
  if (p.transferListed === undefined) p.transferListed = false;
  if (p.stats && typeof getPrimaryAndSecondaryRole === 'function') {
    const statsCurrent = Object.fromEntries(
      (typeof STAT_KEYS !== 'undefined' ? STAT_KEYS : []).map(function(k) { return [k, (p.stats[k] && p.stats[k].current != null) ? p.stats[k].current : 50]; })
    );
    const keys = Object.keys(statsCurrent);
    if (keys.length > 0) {
      const res = getPrimaryAndSecondaryRole(statsCurrent, { ignoreMinStat: true });
      const flexPotential = typeof getFlexPotential === 'function' ? getFlexPotential(res.allScores, res.primary) : 'Low';
      p.roleBias = { primaryRoleBias: res.primary, secondaryRoleBias: res.secondary, flexPotential: flexPotential };
      p.roleScores = res.allScores;
    }
  }
  return p;
}

function promoteYouthToRoster(team, prospect) {
  if (!team || !prospect || (prospect.age !== 17 && prospect.age != null)) return { success: false, message: 'Only 17-year-olds can be promoted' };
  const academy = team.youthAcademy || [];
  const idx = academy.findIndex(p => p.id === prospect.id);
  if (idx === -1) return { success: false, message: 'Prospect not in your academy' };
  if ((team.players || []).length >= MAX_ROSTER_SIZE) return { success: false, message: 'Roster full (12 players max)' };
  academy.splice(idx, 1);
  const player = prospectToFullPlayer(prospect);
  team.players = team.players || [];
  team.players.push(player);
  team.starters = team.players.slice(0, 5);
  team.bench = team.players.slice(5, 8);
  if (Array.isArray(team.reserveSlots)) {
    const emptyIdx = team.reserveSlots.findIndex(s => !s);
    if (emptyIdx >= 0) team.reserveSlots[emptyIdx] = player;
    else if (Array.isArray(team.benchSlots)) {
      const bi = team.benchSlots.findIndex(s => !s);
      if (bi >= 0) team.benchSlots[bi] = player;
    }
  }
  if (team.sponsorContract) {
    team.sponsorContract.youthPromotedThisSeason = (team.sponsorContract.youthPromotedThisSeason || 0) + 1;
  }
  return { success: true, message: 'Promoted ' + getPlayerDisplayName(player) + ' to roster' };
}

function signYouthToAcademy(team, prospect) {
  const market = window.Nexus.YOUTH_MARKET || [];
  if (!team || !prospect || !market.includes(prospect)) return { success: false, message: 'Prospect not available' };
  const academy = team.youthAcademy || [];
  const maxSlots = typeof getMaxYouthAcademySlots === 'function' ? getMaxYouthAcademySlots(team) : MAX_YOUTH_ACADEMY;
  if (academy.length >= maxSlots) return { success: false, message: 'Academy full (' + maxSlots + ' max)' };
  const salary = prospect.salary || 4000;
  if (team.finance) {
    const newMonthly = (team.finance.monthlyCost || 0) + salary;
    const runway = newMonthly > 0 ? Math.floor((team.finance.capital || 0) / newMonthly) : 99;
    if (runway < 3) return { success: false, message: 'Cannot afford wages (runway < 3 months)' };
  }
  const idx = market.indexOf(prospect);
  if (idx >= 0) market.splice(idx, 1);
  academy.push(prospect);
  if (team.finance && team.finance.monthlyCost != null) team.finance.monthlyCost += salary;
  return { success: true, message: 'Signed ' + getPlayerDisplayName(prospect) + ' to academy' };
}

function trainYouthProspect({ team, prospect, statKey, environment, season }) {
  if (!prospect || (!prospect.isYouth && !(team.youthAcademy && team.youthAcademy.includes(prospect)))) {
    return { success: false, message: 'Not a youth prospect' };
  }
  if (!team.youthAcademy || !team.youthAcademy.includes(prospect)) {
    return { success: false, message: 'Prospect not in your academy' };
  }
  const stat = prospect.stats && prospect.stats[statKey];
  if (!stat) {
    return { success: false, message: 'Invalid stat' };
  }
  if (stat.current >= stat.maxCap) {
    return { success: false, message: 'Already at max for this stat' };
  }
  var currentMatchday = (season && season.currentMatchday != null) ? season.currentMatchday : 0;
  if (prospect.lastTrainingMatchday !== currentMatchday) {
    prospect.lastTrainingMatchday = currentMatchday;
    prospect.ticksThisMatchday = 0;
    prospect.statsTrainedThisMatchday = [];
  }
  if (prospect.ticksThisMatchday == null) prospect.ticksThisMatchday = 0;
  if (!Array.isArray(prospect.statsTrainedThisMatchday)) prospect.statsTrainedThisMatchday = [];
  if (prospect.ticksThisMatchday >= 3) {
    return { success: false, message: 'Max 3 ticks per matchday for this player' };
  }
  if (prospect.statsTrainedThisMatchday.indexOf(statKey) >= 0) {
    return { success: false, message: 'Already trained this stat this matchday' };
  }
  const distance = stat.maxCap - stat.current;
  const baseGrowth = 0.04 * distance;
  const coachQuality = (environment && environment.coachQuality != null) ? environment.coachQuality : 50;
  const coachFactor = coachQuality / 100;
  const facilityTierLevel = (team && (team.facilityTierLevel != null ? team.facilityTierLevel : 1)) || 1;
  const facilityBonus = 1 + ((facilityTierLevel - 1) * 0.05);
  const finalGrowth = baseGrowth * coachFactor * facilityBonus;
  stat.current = Math.min(stat.current + finalGrowth, stat.maxCap);
  prospect.ticksThisMatchday = (prospect.ticksThisMatchday || 0) + 1;
  prospect.statsTrainedThisMatchday = prospect.statsTrainedThisMatchday || [];
  prospect.statsTrainedThisMatchday.push(statKey);

  if (team && currentMatchday != null) {
    if (!team.youthTrainingHistory) team.youthTrainingHistory = [];
    var dayObj = team.youthTrainingHistory.find(function(d) { return d.matchday === currentMatchday; });
    if (!dayObj) {
      dayObj = { matchday: currentMatchday, entries: [] };
      team.youthTrainingHistory.push(dayObj);
    }
    dayObj.entries.push({
      playerId: prospect.id,
      playerName: getPlayerDisplayName(prospect),
      statKey: statKey,
      growth: finalGrowth
    });
    team.youthTrainingHistory.sort(function(a, b) { return (b.matchday || 0) - (a.matchday || 0); });
    team.youthTrainingHistory = team.youthTrainingHistory.slice(0, 5);
  }

  return { success: true, growth: finalGrowth, newValue: stat.current };
}

window.Nexus.trainYouthProspect = trainYouthProspect;

function generateYouthMarket() {
  const count = randomInt(12, 15);
  const prospects = [];
  for (let i = 0; i < count; i++) prospects.push(createYouthProspect());
  return prospects;
}

// Build leagues
const LEAGUE = TEAM_NAMES.map(name => createTeam(name));
const CHALLENGER_LEAGUE = CHALLENGER_TEAM_NAMES.map(name => createTeam(name, 'Challenger'));

// --- Aging & retirement (esports: short careers) ---
window.Nexus = window.Nexus || {};
window.Nexus.RETIRED_PLAYERS = window.Nexus.RETIRED_PLAYERS || [];
window.Nexus.FREE_AGENTS = window.Nexus.FREE_AGENTS || [];

function checkRetirement(player) {
  const age = player.age != null ? player.age : 20;
  if (age >= 29) return true;
  if (age >= 28) return chance(0.8);
  if (age === 27) {
    let avgRatio = 0;
    STAT_KEYS.forEach(k => {
      const s = player.stats[k];
      if (s && s.maxCap) avgRatio += s.current / s.maxCap;
    });
    avgRatio /= STAT_KEYS.length;
    if (avgRatio < 0.85) return chance(0.4);
  }
  return false;
}

function processRetirements(teams) {
  const retired = [];
  const minRoster = 8;
  (teams || []).forEach(team => {
    const toRemove = [];
    (team.players || []).forEach(p => {
      if (checkRetirement(p)) {
        toRemove.push(p);
        retired.push({ player: p, team });
        window.Nexus.RETIRED_PLAYERS.push(p);
        if (typeof console !== 'undefined' && console.log) console.log(getPlayerDisplayName(p) + ' retired at age ' + (p.age || '?'));
      }
    });
    team.players = (team.players || []).filter(p => !toRemove.includes(p));
    team.starters = team.players.slice(0, 5);
    team.bench = team.players.slice(5, 8);
    toRemove.forEach(p => {
      if (team.finance && team.finance.monthlyCost != null) team.finance.monthlyCost -= (p.salary || 0);
    });
    while (team.players.length < minRoster) {
      const roleNeeded = (toRemove.length > 0 && toRemove[0] && toRemove[0].roleBias && toRemove[0].roleBias.primaryRoleBias)
        ? toRemove.shift().roleBias.primaryRoleBias
        : 'Duelist';
      const seventeenYos = (team.youthAcademy || []).filter(p => p.age === 17);
      const matching = seventeenYos.filter(p => {
        const rb = p.roleBias || {};
        return rb.primaryRoleBias === roleNeeded || rb.secondaryRoleBias === roleNeeded;
      });
      if (matching.length > 0 && chance(0.8)) {
        const chosen = pickRandom(matching);
        const result = promoteYouthToRoster(team, chosen);
        if (result.success) continue;
      }
      const youth = createPlayer(roleNeeded, randomInt(17, 20));
      if (!youth.roleBias) youth.roleBias = { primaryRoleBias: roleNeeded, secondaryRoleBias: roleNeeded, flexPotential: 'Low' };
      youth.roleBias.primaryRoleBias = roleNeeded;
      team.players.push(youth);
      team.starters = team.players.slice(0, 5);
      team.bench = team.players.slice(5, 8);
      if (team.finance && team.finance.monthlyCost != null) team.finance.monthlyCost += (youth.salary || 3000);
    }
  });
  return retired;
}

function incrementPlayerAges(teams) {
  (teams || []).forEach(team => {
    (team.players || []).forEach(p => {
      p.age = (p.age != null ? p.age : 20) + 1;
    });
    const academy = team.youthAcademy || [];
    academy.forEach(p => { p.age = (p.age != null ? p.age : 16) + 1; });
    const evicted = academy.filter(p => (p.age || 0) >= 18);
    evicted.forEach(p => {
      if (team.finance && team.finance.monthlyCost != null) team.finance.monthlyCost -= (p.salary || 0);
      (window.Nexus.FREE_AGENTS = window.Nexus.FREE_AGENTS || []).push(prospectToFullPlayer(p));
    });
    team.youthAcademy = academy.filter(p => (p.age || 0) < 18);
  });
}

function applyAgeBasedGrowth(player, environment, meta) {
  const age = player.age != null ? player.age : 22;
  STAT_KEYS.forEach(statKey => {
    const stat = player.stats[statKey];
    if (!stat) return;
    if (age <= 21) {
      const gap = stat.maxCap - stat.current;
      if (gap > 0) stat.current = Math.min(stat.maxCap, stat.current + Math.max(0, Math.floor(gap * 0.05)));
    } else if (age >= 26) {
      const gap = stat.current - stat.minCap;
      if (gap > 0) stat.current = Math.max(stat.minCap, stat.current - Math.max(0, Math.floor(gap * 0.03)));
    }
  });
}

// Expose for console / UI
window.Nexus = window.Nexus || {};
window.Nexus.LEAGUE = LEAGUE;
window.Nexus.CHALLENGER_LEAGUE = CHALLENGER_LEAGUE;
window.Nexus.ROLES = ROLES;
window.Nexus.STAT_KEYS = STAT_KEYS;
window.Nexus.createPlayer = createPlayer;
window.Nexus.getPlayerDisplayName = getPlayerDisplayName;
window.Nexus.createTeam = createTeam;
window.Nexus.getAgePhase = getAgePhase;
window.Nexus.generatePlayerAge = generatePlayerAge;
window.Nexus.checkRetirement = checkRetirement;
window.Nexus.processRetirements = processRetirements;
window.Nexus.incrementPlayerAges = incrementPlayerAges;
window.Nexus.applyAgeBasedGrowth = applyAgeBasedGrowth;

// Optional: render a simple list into #app if present
function render() {
  const el = document.getElementById('app');
  if (!el) return;
  // If the app already has the full layout (sidebar + content), don't overwrite
  if (el.querySelector('.layout') || el.classList.contains('layout')) return;

  let html = '<h1>Project Nexus – League</h1>';

  LEAGUE.forEach(team => {
    html += `<section class="team"><h2>${team.name}</h2>`;

    html += '<h3>Starters (5)</h3><ul>';
    team.starters.forEach(p => {
      html += `<li><strong>${getPlayerDisplayName(p)}</strong> – ${p.roleBias.primaryRoleBias} / ${p.roleBias.secondaryRoleBias} (flex: ${p.roleBias.flexPotential})</li>`;
    });
    html += '</ul>';

    html += '<h3>Bench (3)</h3><ul>';
    team.bench.forEach(p => {
      html += `<li><strong>${getPlayerDisplayName(p)}</strong> – ${p.roleBias.primaryRoleBias} / ${p.roleBias.secondaryRoleBias} (flex: ${p.roleBias.flexPotential})</li>`;
    });
    html += '</ul></section>';
  });

  el.innerHTML = html;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', render);
} else {
  render();
}

// ------------------------------
// Project Nexus – Step 2
// Effective Cap Engine
// This layer introduces CONTEXT without touching biology (minCap / maxCap remain sacred).
// We compute an EFFECTIVE CAP based on environment, mental state, and meta alignment.
// ------------------------------

// 1. GLOBAL CONTEXT MODELS

// Environment model (can later belong to Team/Org)
function createEnvironment({
  coachQuality = 50,        // affects growth access to cap
  infrastructure = 50,      // affects stability
  psychologySupport = 50,   // mental recovery rate
  pressure = 50             // high pressure reduces effective cap if mental low
} = {}) {
  return { coachQuality, infrastructure, psychologySupport, pressure };
}

// Simple meta model (expand later with patches/map pool/etc.)
function createMeta({
  favoredRoles = [],        // e.g. ['Duelist', 'Initiator']
  tempo = 50                // fast meta favors high reaction/decisionSpeed
} = {}) {
  return { favoredRoles, tempo };
}

// 2. EFFECTIVE CAP CALCULATION

function calculateEffectiveCap({ player, statKey, environment, meta }) {
  const stat = player.stats[statKey];
  const baseMax = stat.maxCap;

  let modifier = 0;

  // Environment influence (access to ceiling)
  // Coach quality gives up to +5% access to cap range
  const coachBoost = (environment.coachQuality - 50) / 50; // -1 to +1
  modifier += coachBoost * 0.05 * baseMax;

  // Pressure vs Mental interaction (psychology reduces effective pressure)
  const mental = (player.stats.mental && player.stats.mental.current != null) ? player.stats.mental.current : 50;
  const rawPressure = environment.pressure != null ? environment.pressure : 50;
  const psychSupport = environment.psychologySupport != null ? environment.psychologySupport : 50;
  const psychTier = PSYCHOLOGY_TIERS && PSYCHOLOGY_TIERS.find(function(t) { return t.support === psychSupport; });
  const pressureReduction = (psychTier && psychTier.pressureReduction != null) ? psychTier.pressureReduction : 0;
  const effectivePressure = rawPressure * (1 - pressureReduction);
  const pressureImpact = (effectivePressure - mental) / 100;
  modifier -= pressureImpact * 0.05 * baseMax;

  // Meta alignment bonus (if stat aligns with favored role bias)
  if (meta.favoredRoles.includes(player.roleBias.primaryRoleBias)) {
    modifier += 0.03 * baseMax;
  }

  // Tempo meta example: fast tempo rewards reaction/decisionSpeed
  if (meta.tempo > 60 && (statKey === 'reaction' || statKey === 'decisionSpeed')) {
    modifier += 0.04 * baseMax;
  }

  const effectiveMax = Math.max(stat.minCap, Math.min(baseMax + modifier, 99));

  return Math.round(effectiveMax);
}

// 3. EFFECTIVE CURRENT VALUE

function calculateEffectiveCurrent({ player, statKey, environment, meta }) {
  const stat = player.stats[statKey];
  const effectiveCap = calculateEffectiveCap({ player, statKey, environment, meta });

  // Current cannot exceed effective cap
  return Math.min(stat.current, effectiveCap);
}

// 4. TESTING LAYER (for console)

function debugPlayerEffectiveStats(player, environment, meta) {
  const output = {};

  for (const key of Object.keys(player.stats)) {
    output[key] = {
      baseCurrent: player.stats[key].current,
      effectiveCurrent: calculateEffectiveCurrent({ player, statKey: key, environment, meta }),
      effectiveCap: calculateEffectiveCap({ player, statKey: key, environment, meta })
    };
  }

  return output;
}

// Expose Step 2
window.Nexus = window.Nexus || {};
window.Nexus.createEnvironment = createEnvironment;
window.Nexus.createMeta = createMeta;
window.Nexus.calculateEffectiveCap = calculateEffectiveCap;
window.Nexus.calculateEffectiveCurrent = calculateEffectiveCurrent;
window.Nexus.debugPlayerEffectiveStats = debugPlayerEffectiveStats;

// ------------------------------
// Project Nexus – Meta Evolution System
// Patch-based meta states for role viability, tempo, and playstyles.
// ------------------------------

const META_PATCHES = [
  {
    id: 'aggressive-entry',
    name: 'Aggressive Entry Meta',
    description: 'Entry fraggers and initiators dominate; sentinels struggle.',
    favoredRoles: ['Duelist', 'Initiator'],
    nerfedRoles: ['Sentinel'],
    tempo: 75,
    aggressionLevel: 80,
    statBonuses: { aim: 1.10, reaction: 1.08, decisionSpeed: 1.05, positioning: 0.95, utilityIQ: 0.97 },
    mapPoolFavored: [],
    patchNumber: 1,
    releaseDate: '2024-S1'
  },
  {
    id: 'utility-heavy',
    name: 'Utility Heavy Meta',
    description: 'Smokes and info reign; raw aim less decisive.',
    favoredRoles: ['Controller', 'Initiator'],
    nerfedRoles: ['Duelist'],
    tempo: 45,
    aggressionLevel: 30,
    statBonuses: { utilityIQ: 1.12, gameSense: 1.10, communication: 1.08, aim: 0.88, reaction: 0.92 },
    mapPoolFavored: [],
    patchNumber: 2,
    releaseDate: '2024-S2'
  },
  {
    id: 'five-stack-rush',
    name: 'Five-Stack Rush Meta',
    description: 'Multiple duelists and maximum aggression.',
    favoredRoles: ['Duelist', 'Duelist'],
    nerfedRoles: ['Sentinel', 'Controller'],
    tempo: 90,
    aggressionLevel: 95,
    statBonuses: { aim: 1.15, reaction: 1.12, decisionSpeed: 1.10, utilityIQ: 0.90, mental: 0.92 },
    mapPoolFavored: [],
    patchNumber: 3,
    releaseDate: '2024-S3'
  },
  {
    id: 'post-plant-control',
    name: 'Post-Plant Control',
    description: 'Sentinel and controller lockdown after plant.',
    favoredRoles: ['Sentinel', 'Controller'],
    nerfedRoles: ['Duelist'],
    tempo: 40,
    aggressionLevel: 35,
    statBonuses: { positioning: 1.12, utilityIQ: 1.10, consistency: 1.08, reaction: 0.92, decisionSpeed: 0.95 },
    mapPoolFavored: [],
    patchNumber: 4,
    releaseDate: '2024-S4'
  },
  {
    id: 'anti-eco-aggression',
    name: 'Anti-Eco Aggression',
    description: 'Duelist-led snowball on eco rounds.',
    favoredRoles: ['Duelist'],
    nerfedRoles: ['Controller'],
    tempo: 85,
    aggressionLevel: 82,
    statBonuses: { aim: 1.10, reaction: 1.08, decisionSpeed: 1.06, utilityIQ: 0.94 },
    mapPoolFavored: [],
    patchNumber: 5,
    releaseDate: '2024-S5'
  },
  {
    id: 'tactical-patience',
    name: 'Tactical Patience',
    description: 'Slow defaults and controller/sentinel value.',
    favoredRoles: ['Controller', 'Sentinel'],
    nerfedRoles: ['Duelist', 'Initiator'],
    tempo: 35,
    aggressionLevel: 28,
    statBonuses: { gameSense: 1.12, positioning: 1.10, mental: 1.08, reaction: 0.90, decisionSpeed: 0.92 },
    mapPoolFavored: [],
    patchNumber: 6,
    releaseDate: '2024-S6'
  },
  {
    id: 'double-initiator',
    name: 'Double Initiator Meta',
    description: 'Info and flash-heavy compositions.',
    favoredRoles: ['Initiator', 'Controller'],
    nerfedRoles: ['Duelist'],
    tempo: 50,
    aggressionLevel: 45,
    statBonuses: { utilityIQ: 1.10, communication: 1.10, gameSense: 1.06, aim: 0.92 },
    mapPoolFavored: [],
    patchNumber: 7,
    releaseDate: '2024-S7'
  },
  {
    id: 'sentinel-anchor',
    name: 'Sentinel Anchor',
    description: 'Site anchors and lurkers rewarded.',
    favoredRoles: ['Sentinel', 'Controller'],
    nerfedRoles: ['Initiator'],
    tempo: 38,
    aggressionLevel: 32,
    statBonuses: { positioning: 1.12, mental: 1.10, consistency: 1.08, communication: 0.94 },
    mapPoolFavored: [],
    patchNumber: 8,
    releaseDate: '2024-S8'
  },
  {
    id: 'flex-adapt',
    name: 'Flex & Adapt',
    description: 'Adaptability and role flexibility rewarded.',
    favoredRoles: ['Initiator', 'Controller', 'Sentinel', 'Duelist'],
    nerfedRoles: [],
    tempo: 55,
    aggressionLevel: 50,
    statBonuses: { adaptability: 1.15, gameSense: 1.06, communication: 1.05 },
    mapPoolFavored: [],
    patchNumber: 9,
    releaseDate: '2024-S9'
  },
  {
    id: 'pick-meta',
    name: 'First Pick & Info',
    description: 'First pick and info duels decide rounds.',
    favoredRoles: ['Initiator', 'Sentinel'],
    nerfedRoles: ['Duelist'],
    tempo: 58,
    aggressionLevel: 55,
    statBonuses: { gameSense: 1.10, positioning: 1.08, reaction: 1.05, aim: 0.95 },
    mapPoolFavored: [],
    patchNumber: 10,
    releaseDate: '2024-S10'
  }
];

let _currentMetaPatch = null;
let _recentPatchIds = [];

function getRandomMetaPatch() {
  const eligible = META_PATCHES.filter(p => !_recentPatchIds.includes(p.id));
  const pool = eligible.length >= 2 ? eligible : META_PATCHES;
  const chosen = pool[randomInt(0, pool.length - 1)];
  _currentMetaPatch = chosen;
  _recentPatchIds = [_recentPatchIds[1] || null, chosen.id].filter(Boolean);
  return chosen;
}

function getCurrentMeta() {
  if (!_currentMetaPatch) {
    return getRandomMetaPatch();
  }
  return _currentMetaPatch;
}

function setCurrentMetaPatch(patchOrId) {
  if (typeof patchOrId === 'string') {
    _currentMetaPatch = META_PATCHES.find(p => p.id === patchOrId) || _currentMetaPatch;
  } else if (patchOrId && patchOrId.id) {
    _currentMetaPatch = patchOrId;
  }
  return _currentMetaPatch;
}

window.Nexus.META_PATCHES = META_PATCHES;
window.Nexus.getRandomMetaPatch = getRandomMetaPatch;
window.Nexus.getCurrentMeta = getCurrentMeta;
window.Nexus.setCurrentMetaPatch = setCurrentMetaPatch;

// ------------------------------
// Project Nexus – Step 3
// Training & Growth Engine
// This system moves CURRENT toward EFFECTIVE CAP over time.
// Biology (minCap/maxCap) is never changed here.
// ------------------------------

// 1. TRAINING PLANS

const TRAINING_PLANS = {
  Mechanical: ['aim', 'reaction', 'decisionSpeed'],
  Tactical: ['utilityIQ', 'gameSense'],
  Positional: ['positioning', 'consistency'],
  Mental: ['mental'],
  Communication: ['communication'],
  Adaptive: ['adaptability']
};

const PLAYER_TRAINING_PLAN_KEYS = Object.keys(TRAINING_PLANS);

function getTrainingPlansForRole(roleKey) {
  const role = ROLES[roleKey];
  if (!role) return PLAYER_TRAINING_PLAN_KEYS;
  const roleStats = [...(role.core || []), ...(role.secondary || [])];
  return PLAYER_TRAINING_PLAN_KEYS.filter(planKey => {
    const planStats = TRAINING_PLANS[planKey] || [];
    return planStats.some(s => roleStats.includes(s));
  });
}

function pickAITrainingPlan(player) {
  const flex = (player.roleBias && player.roleBias.flexPotential) || 'Low';
  if (flex === 'High') {
    return PLAYER_TRAINING_PLAN_KEYS[Math.floor(Math.random() * PLAYER_TRAINING_PLAN_KEYS.length)];
  }
  const primary = (player.roleBias && player.roleBias.primaryRoleBias) || 'Duelist';
  const secondary = (player.roleBias && player.roleBias.secondaryRoleBias) || primary;
  const plansPrimary = getTrainingPlansForRole(primary);
  const plansSecondary = getTrainingPlansForRole(secondary);
  const combined = [...new Set([...plansPrimary, ...plansSecondary])];
  if (combined.length === 0) return PLAYER_TRAINING_PLAN_KEYS[0];
  return combined[Math.floor(Math.random() * combined.length)];
}

// 2. GROWTH CALCULATION

function getRoleGrowthMultiplier(player, statKey) {
  const primary = player.roleBias.primaryRoleBias;
  const secondary = player.roleBias.secondaryRoleBias;
  const flex = (player.roleBias && player.roleBias.flexPotential) || 'Low';

  if (ROLES[primary].core.includes(statKey)) return 1.0;
  if (ROLES[secondary].core.includes(statKey)) return flex === 'High' ? 0.9 : 0.75;
  return flex === 'High' ? 0.7 : 0.4;
}

function getTraitGrowthModifier(player, statKey) {
  let modifier = 1.0;

  if (player.traits.includes('Late Bloomer')) {
    modifier *= 0.85; // slower early growth (expand later by age logic)
  }

  if (player.traits.includes('Adaptive') && statKey === 'adaptability') {
    modifier *= 1.2;
  }

  if (player.traits.includes('Role Fluid')) {
    modifier *= 1.1;
  }

  return modifier;
}

function growStat({ player, statKey, environment, meta, growthMultiplier }) {
  const stat = player.stats[statKey];

  const effectiveCap = calculateEffectiveCap({ player, statKey, environment, meta });

  if (stat.current >= effectiveCap) return 0;

  const distance = effectiveCap - stat.current;

  const baseGrowth = 0.02 * distance; // 2% of gap per cycle

  const roleMultiplier = getRoleGrowthMultiplier(player, statKey);
  const traitMultiplier = getTraitGrowthModifier(player, statKey);

  const coachQuality = (environment && environment.coachQuality != null) ? environment.coachQuality : 50;
  const coachFactor = coachQuality / 100;

  let growth = baseGrowth * roleMultiplier * traitMultiplier * coachFactor;
  const mult = growthMultiplier != null ? growthMultiplier : 1;
  growth *= mult;

  stat.current = Math.min(stat.current + growth, effectiveCap);

  return growth;
}

// 3. TRAINING TICK (WEEKLY SIM)

function trainPlayer({ player, trainingPlan, environment, meta, growthMultiplier }) {
  const statsToTrain = TRAINING_PLANS[trainingPlan] || [];

  let totalGrowth = 0;

  statsToTrain.forEach(statKey => {
    totalGrowth += growStat({ player, statKey, environment, meta, growthMultiplier });
  });

  return totalGrowth;
}

// 4. DEBUG

function debugTrainingCycle(player, trainingPlan, environment, meta) {
  const before = JSON.parse(JSON.stringify(player.stats));
  const growth = trainPlayer({ player, trainingPlan, environment, meta });

  return {
    growthTotal: growth,
    before,
    after: player.stats
  };
}

// Expose Step 3
window.Nexus = window.Nexus || {};
window.Nexus.TRAINING_PLANS = TRAINING_PLANS;
window.Nexus.trainPlayer = trainPlayer;
window.Nexus.debugTrainingCycle = debugTrainingCycle;

// ------------------------------
// Project Nexus – Step 4
// Role Assignment & Mismatch Engine
// This layer introduces REAL role forcing consequences.
// It does NOT change biology.
// It modifies effective performance + growth when player is used outside affinity.
// ------------------------------

// 1. ROLE ASSIGNMENT

function assignRole(player, roleKey) {
  player.assignedRole = roleKey;
}

// 2. ROLE FIT CALCULATION

function getRoleFitMultiplier(player) {
  const assigned = player.assignedRole;
  if (!assigned) return 1.0;

  const { primaryRoleBias, secondaryRoleBias, flexPotential } = player.roleBias;

  if (assigned === primaryRoleBias) return 1.0;
  if (assigned === secondaryRoleBias) return 0.9;

  // Off-role penalties
  let basePenalty = 0.75;

  if (flexPotential === 'High') basePenalty = 0.9;
  else if (flexPotential === 'Medium') basePenalty = 0.82;

  if (player.traits.includes('Role Fluid')) basePenalty += 0.05;

  return basePenalty;
}

// 3. EFFECTIVE CURRENT WITH ROLE IMPACT + META FAVORED/NERFED

const META_FAVORED_BONUS = 1.12;   // +12% when role is in meta.favoredRoles
const META_NERFED_PENALTY = 0.90;  // -10% when role is in meta.nerfedRoles

function calculateRoleAdjustedCurrent({ player, statKey, environment, meta }) {
  const baseEffective = calculateEffectiveCurrent({ player, statKey, environment, meta });
  let value = baseEffective * getRoleFitMultiplier(player);

  const role = player.assignedRole || player.roleBias.primaryRoleBias;
  if (meta && Array.isArray(meta.favoredRoles) && meta.favoredRoles.includes(role)) {
    value *= META_FAVORED_BONUS;
  }
  if (meta && Array.isArray(meta.nerfedRoles) && meta.nerfedRoles.includes(role)) {
    value *= META_NERFED_PENALTY;
  }

  return Math.round(Math.max(0, Math.min(99, value)));
}

// 4. GROWTH PENALTY IF FORCED ROLE

function getRoleGrowthPenalty(player) {
  const assigned = player.assignedRole;
  if (!assigned) return 1.0;

  const { primaryRoleBias, secondaryRoleBias } = player.roleBias;

  if (assigned === primaryRoleBias) return 1.0;
  if (assigned === secondaryRoleBias) return 0.85;

  return 0.6; // heavy penalty for off-role growth
}

// Override growth multiplier hook (call this inside growStat if desired)
function getTotalGrowthMultiplier(player, statKey) {
  const roleGrowth = getRoleGrowthMultiplier(player, statKey);
  const traitGrowth = getTraitGrowthModifier(player, statKey);
  const rolePenalty = getRoleGrowthPenalty(player);

  return roleGrowth * traitGrowth * rolePenalty;
}

// 5. DEBUG

function debugRoleImpact(player, environment, meta) {
  const output = {};

  for (const key of Object.keys(player.stats)) {
    output[key] = {
      adjustedCurrent: calculateRoleAdjustedCurrent({ player, statKey: key, environment, meta })
    };
  }

  return output;
}

// Expose Step 4
window.Nexus = window.Nexus || {};
window.Nexus.assignRole = assignRole;
window.Nexus.calculateRoleAdjustedCurrent = calculateRoleAdjustedCurrent;
window.Nexus.debugRoleImpact = debugRoleImpact;
window.Nexus.getRoleFitMultiplier = getRoleFitMultiplier;

// ------------------------------
// Project Nexus – Step 5
// Team Synergy Engine
// This layer evaluates a 5-player lineup and produces a synergy profile.
// It does NOT simulate matches yet — it builds the tactical identity layer.
// ------------------------------

// 1. COMPOSITION ANALYSIS

function analyzeComposition(players) {
  const roleCount = {};
  players.forEach(p => {
    const role = p.assignedRole || p.roleBias.primaryRoleBias;
    roleCount[role] = (roleCount[role] || 0) + 1;
  });

  return roleCount;
}

// 2. COMMUNICATION DEPENDENCY SCORE

function calculateTeamCommunication(players) {
  const total = players.reduce((sum, p) => sum + p.stats.communication.current, 0);
  return total / players.length;
}

// Utility-heavy comps need higher comm
function getUtilityDependency(roleCount) {
  const initiators = roleCount['Initiator'] || 0;
  const controllers = roleCount['Controller'] || 0;

  return (initiators * 0.15) + (controllers * 0.1);
}

// 3. TEMPO COMPATIBILITY

function calculateTeamTempoProfile(players) {
  const avgReaction = players.reduce((sum, p) => sum + p.stats.reaction.current, 0) / players.length;
  const avgDecision = players.reduce((sum, p) => sum + p.stats.decisionSpeed.current, 0) / players.length;

  return (avgReaction + avgDecision) / 2;
}

// 4. RHYTHM CONFLICT DETECTION

function detectRhythmConflicts(players) {
  const aggressivePlayers = players.filter(p => p.roleBias.primaryRoleBias === 'Duelist');
  const slowIGLs = players.filter(p =>
    p.roleBias.primaryRoleBias === 'Controller' &&
    p.stats.decisionSpeed.current < 55
  );

  if (aggressivePlayers.length > 0 && slowIGLs.length > 0) {
    return -0.08; // conflict penalty
  }

  return 0;
}

// 5. FINAL SYNERGY SCORE

function calculateTeamSynergy(players, meta, environment) {
  if (players.length !== 5) {
    throw new Error('Synergy requires exactly 5 players.');
  }

  const roleCount = analyzeComposition(players);
  const avgComm = calculateTeamCommunication(players);
  const utilityDependency = getUtilityDependency(roleCount);
  const tempoProfile = calculateTeamTempoProfile(players);
  const rhythmPenalty = detectRhythmConflicts(players);

  let synergy = 1.0;

  // Communication check
  if (avgComm < 55 && utilityDependency > 0.2) {
    synergy -= 0.1;
  }

  // Balanced comp bonus
  if (
    roleCount['Duelist'] >= 1 &&
    roleCount['Initiator'] >= 1 &&
    roleCount['Controller'] >= 1 &&
    roleCount['Sentinel'] >= 1
  ) {
    synergy += 0.05;
  }

  // Meta alignment: 2+ players on favored roles → comp bonus
  if (meta && Array.isArray(meta.favoredRoles) && meta.favoredRoles.length > 0) {
    const favoredCount = players.filter(p => {
      const role = p.assignedRole || p.roleBias.primaryRoleBias;
      return meta.favoredRoles.includes(role);
    }).length;
    if (favoredCount >= 2) {
      synergy += 0.05;
    }
  }

  synergy += rhythmPenalty;

  // Psychology support synergy bonus
  if (environment && environment.psychologySupport != null && PSYCHOLOGY_TIERS) {
    const psychTier = PSYCHOLOGY_TIERS.find(function(t) { return t.support === environment.psychologySupport; });
    if (psychTier && psychTier.synergyBonus != null) {
      synergy += psychTier.synergyBonus;
    }
  }

  return {
    synergyMultiplier: Math.round(synergy * 100) / 100,
    avgCommunication: Math.round(avgComm),
    tempoProfile: Math.round(tempoProfile),
    roleDistribution: roleCount
  };
}

// 6. DEBUG

function debugTeamSynergy(team) {
  return calculateTeamSynergy(team.starters);
}

// Expose Step 5
window.Nexus = window.Nexus || {};
window.Nexus.calculateTeamSynergy = calculateTeamSynergy;
window.Nexus.debugTeamSynergy = debugTeamSynergy;

// ------------------------------
// Project Nexus – Step 6
// AI Lineup Logic + Match Core Engine
// This layer:
// 1) Prevents AI from making stupid comps
// 2) Converts all previous systems into match power
// 3) Produces win probability + match result
// ------------------------------

// PART 1 — SMART AI LINEUP SELECTION

// Required structure rule: At least 1 Duelist, 1 Controller, 1 Sentinel
const REQUIRED_CORE_ROLES = ['Duelist', 'Controller', 'Sentinel'];

function shouldTeamAdaptToMeta(team, meta) {
  const nerfed = (meta && meta.nerfedRoles) || [];
  if (nerfed.length === 0) return false;
  const count = team.starters.filter(p => {
    const role = p.assignedRole || p.roleBias.primaryRoleBias;
    return nerfed.includes(role);
  }).length;
  return count >= 3;
}

function buildBestLineup(team, meta) {
  const allPlayers = [...team.players];

  function roleStrength(player, role) {
    const roleDef = ROLES[role];
    let total = 0;
    roleDef.core.forEach(stat => {
      total += player.stats[stat].current;
    });
    return total;
  }

  function metaAwareScore(player) {
    let s = getPlayerOverall(player);
    const favored = (meta && meta.favoredRoles) || [];
    const nerfed = (meta && meta.nerfedRoles) || [];
    const role = player.roleBias.primaryRoleBias;
    const sec = player.roleBias.secondaryRoleBias;
    if (favored.includes(role) || favored.includes(sec)) s += 15;
    if (nerfed.includes(role) || nerfed.includes(sec)) s -= 15;
    return s;
  }

  const lineup = [];

  // Ensure required roles exist
  REQUIRED_CORE_ROLES.forEach(role => {
    const candidates = allPlayers
      .filter(p => p.roleBias.primaryRoleBias === role || p.roleBias.secondaryRoleBias === role)
      .sort((a, b) => roleStrength(b, role) - roleStrength(a, role));

    if (candidates.length > 0) {
      const chosen = candidates[0];
      assignRole(chosen, role);
      lineup.push(chosen);
      allPlayers.splice(allPlayers.indexOf(chosen), 1);
    }
  });

  // Fill remaining slots by overall strength (meta-aware when meta provided)
  while (lineup.length < 5 && allPlayers.length > 0) {
    const sortBy = meta ? metaAwareScore : getPlayerOverall;
    const best = allPlayers
      .sort((a, b) => sortBy(b) - sortBy(a))[0];

    assignRole(best, best.roleBias.primaryRoleBias);
    lineup.push(best);
    allPlayers.splice(allPlayers.indexOf(best), 1);
  }

  return lineup;
}

function adaptLineupToMeta(team, meta) {
  const newLineup = buildBestLineup(team, meta);
  const bench = team.players.filter(p => !newLineup.includes(p));
  team.starters = newLineup;
  team.bench = bench;
  team.players = [...newLineup, ...bench];
}

// PART 2 — PLAYER POWER CALCULATION

function getPlayerOverall(player) {
  const avg = STAT_KEYS.reduce((sum, key) => sum + player.stats[key].current, 0) / STAT_KEYS.length;
  return Math.round(avg);
}

function calculatePlayerMatchPower({ player, environment, meta, teamTrainingBoosts }) {
  let total = 0;
  const infrastructure = (environment && environment.infrastructure != null) ? environment.infrastructure : 50;
  const varianceReduction = (infrastructure - 50) / 100;

  STAT_KEYS.forEach(statKey => {
    let adjusted = calculateRoleAdjustedCurrent({
      player,
      statKey,
      environment,
      meta
    });
    if (meta && meta.statBonuses && meta.statBonuses[statKey] != null) {
      adjusted *= meta.statBonuses[statKey];
    }
    if (teamTrainingBoosts && teamTrainingBoosts[statKey]) {
      adjusted *= teamTrainingBoosts[statKey];
    }
    var reducedVariance = 1 + (Math.random() - 0.5) * 0.2 * (1 - varianceReduction);
    adjusted *= reducedVariance;
    total += adjusted;
  });

  return total / STAT_KEYS.length;
}

// PART 3 — TEAM MATCH POWER

const TEAM_TRAINING_PLAN_KEYS = ['Fast Execute', 'Default Heavy', 'Contact Play', 'Utility Spam', 'Anti-Strat', 'Post-Plant'];

const TEAM_TRAINING_PLANS = {
  'Fast Execute': {
    description: 'Aggressive site takes with explosive utility',
    boosts: { decisionSpeed: 1.15, aim: 1.08, utilityIQ: 1.05 }
  },
  'Default Heavy': {
    description: 'Slow defaults with late-round executes',
    boosts: { gameSense: 1.12, positioning: 1.10, consistency: 1.08 }
  },
  'Contact Play': {
    description: 'High tempo duels and first-bloods',
    boosts: { aim: 1.15, reaction: 1.12, mental: 1.05 }
  },
  'Utility Spam': {
    description: 'Info denial and ability-heavy rounds',
    boosts: { utilityIQ: 1.15, communication: 1.10, gameSense: 1.08 }
  },
  'Anti-Strat': {
    description: 'Read opponents and counter their setups',
    boosts: { adaptability: 1.15, gameSense: 1.10, positioning: 1.08 }
  },
  'Post-Plant': {
    description: 'Focus on winning after plant',
    boosts: { positioning: 1.12, mental: 1.10, consistency: 1.10 }
  }
};

const COACH_TIERS = [
  { level: 1, quality: 50, monthlySalary: 0, upgradeCost: 0, name: 'Standard Coach', description: 'Basic training staff' },
  { level: 2, quality: 65, monthlySalary: 20000, upgradeCost: 150000, name: 'Experienced Coach', description: 'Proven track record with mid-tier teams' },
  { level: 3, quality: 80, monthlySalary: 40000, upgradeCost: 350000, name: 'Elite Coach', description: 'Top-tier tactical mind and player development' },
  { level: 4, quality: 95, monthlySalary: 70000, upgradeCost: 750000, name: 'World-Class Coach', description: 'Championship-winning legendary coach' }
];

const FACILITY_TIERS = [
  { level: 1, infrastructure: 50, seasonalMaintenance: 0, upgradeCost: 0, name: 'Basic Setup', description: 'Shared office space, minimal equipment', prestigeBonus: 0, youthSlotsBonus: 0 },
  { level: 2, infrastructure: 65, seasonalMaintenance: 50000, upgradeCost: 200000, name: 'Gaming House', description: 'Dedicated team house with practice rooms', prestigeBonus: 5, youthSlotsBonus: 0 },
  { level: 3, infrastructure: 80, seasonalMaintenance: 100000, upgradeCost: 500000, name: 'Pro Facility', description: 'Full training complex with analysts and physios', prestigeBonus: 10, youthSlotsBonus: 2 },
  { level: 4, infrastructure: 95, seasonalMaintenance: 180000, upgradeCost: 1000000, name: 'State-of-the-Art HQ', description: 'World-class campus with recovery centers', prestigeBonus: 20, youthSlotsBonus: 4 }
];

const PSYCHOLOGY_TIERS = [
  { level: 1, support: 50, seasonalCost: 0, upgradeCost: 0, name: 'Basic Support', description: 'Standard player wellness check-ins', pressureReduction: 0, synergyBonus: 0 },
  { level: 2, support: 65, seasonalCost: 30000, upgradeCost: 120000, name: 'Sports Psychologist', description: 'Dedicated mental performance coach', pressureReduction: 0.10, synergyBonus: 0.02 },
  { level: 3, support: 80, seasonalCost: 60000, upgradeCost: 280000, name: 'Mental Performance Team', description: 'Full psychology staff with individual sessions', pressureReduction: 0.20, synergyBonus: 0.04 },
  { level: 4, support: 95, seasonalCost: 100000, upgradeCost: 600000, name: 'Elite Wellness Program', description: 'World-class mental health and performance optimization', pressureReduction: 0.30, synergyBonus: 0.06 }
];

const SPONSOR_TIERS = [
  { id: 'local-tech', name: 'Local Tech Startup', tier: 'Easy', totalPay: 250000, rules: [{ type: 'minWins', value: 3, description: 'Win at least 3 matches' }], description: 'Low-risk partnership with modest expectations' },
  { id: 'regional-brand', name: 'Regional Esports Brand', tier: 'Medium', totalPay: 400000, rules: [{ type: 'minWins', value: 6, description: 'Win at least 6 matches' }, { type: 'minPlacement', value: 8, description: 'Finish in top 8' }], description: 'Balanced risk with reasonable performance targets' },
  { id: 'gaming-peripheral', name: 'Gaming Peripherals Co.', tier: 'Medium', totalPay: 450000, rules: [{ type: 'minWins', value: 7, description: 'Win at least 7 matches' }, { type: 'useYouth', value: 1, description: 'Promote 1 youth player during season' }], description: 'Invest in young talent for brand visibility' },
  { id: 'fortune-500', name: 'Fortune 500 Tech Giant', tier: 'Hard', totalPay: 600000, rules: [{ type: 'minWins', value: 8, description: 'Win at least 8 matches' }, { type: 'minPlacement', value: 4, description: 'Finish in top 4' }], description: 'Elite partnership demanding championship contention' },
  { id: 'global-bank', name: 'Global Banking Group', tier: 'Hard', totalPay: 700000, rules: [{ type: 'minWins', value: 9, description: 'Win at least 9 matches' }, { type: 'minPlacement', value: 3, description: 'Finish in top 3' }, { type: 'useYouth', value: 1, description: 'Promote 1 youth player during season' }], description: 'Premium sponsorship for elite organizations only' }
];

window.Nexus.COACH_TIERS = COACH_TIERS;
window.Nexus.FACILITY_TIERS = FACILITY_TIERS;
window.Nexus.PSYCHOLOGY_TIERS = PSYCHOLOGY_TIERS;
window.Nexus.SPONSOR_TIERS = SPONSOR_TIERS;

function getCoachTier(team) {
  const level = (team && (team.coachTierLevel != null ? team.coachTierLevel : 1)) || 1;
  return COACH_TIERS[Math.min(level - 1, COACH_TIERS.length - 1)] || COACH_TIERS[0];
}

function getFacilityTier(team) {
  const level = (team && (team.facilityTierLevel != null ? team.facilityTierLevel : 1)) || 1;
  return FACILITY_TIERS[Math.min(level - 1, FACILITY_TIERS.length - 1)] || FACILITY_TIERS[0];
}

function getPsychologyTier(team) {
  const level = (team && (team.psychologyLevel != null ? team.psychologyLevel : 1)) || 1;
  return PSYCHOLOGY_TIERS[Math.min(level - 1, PSYCHOLOGY_TIERS.length - 1)] || PSYCHOLOGY_TIERS[0];
}

function getMaxYouthAcademySlots(team) {
  return 4 + (getFacilityTier(team).youthSlotsBonus || 0);
}

function upgradePsychology(team) {
  const currentLevel = team.psychologyLevel != null ? team.psychologyLevel : 1;
  if (currentLevel >= 4) return { success: false, message: 'Already at max level' };
  const nextTier = PSYCHOLOGY_TIERS[currentLevel];
  const upgradeCost = nextTier.upgradeCost;
  if (!team.finance || (team.finance.capital || 0) < upgradeCost) {
    return { success: false, message: 'Insufficient funds' };
  }
  team.finance.capital -= upgradeCost;
  team.psychologyLevel = currentLevel + 1;
  return { success: true, message: 'Upgraded to ' + nextTier.name, newLevel: team.psychologyLevel };
}

function syncTeamEnvironmentFromTiers(team, environmentMap) {
  if (!team || !environmentMap || !team.name) return;
  const env = environmentMap[team.name] || { coachQuality: 50, infrastructure: 50, psychologySupport: 50, pressure: 50 };
  const coach = getCoachTier(team);
  const facility = getFacilityTier(team);
  const psych = getPsychologyTier(team);
  environmentMap[team.name] = Object.assign({}, env, { coachQuality: coach.quality, infrastructure: facility.infrastructure, psychologySupport: psych.support });
}

function syncPressureToPrestige(team, environmentMap) {
  if (!team || !environmentMap || !environmentMap[team.name]) return;
  const prestige = team.prestige != null ? team.prestige : 50;
  const env = environmentMap[team.name];
  const newPressure = 50 + Math.floor((prestige - 50) * 0.4);
  env.pressure = Math.max(30, Math.min(80, newPressure));
}

function selectSponsor(team, sponsorId) {
  const sponsor = SPONSOR_TIERS.find(s => s.id === sponsorId);
  if (!sponsor) return { success: false, message: 'Sponsor not found' };
  if (!team.finance) return { success: false, message: 'No finance' };
  team.sponsorContract = {
    sponsorId: sponsor.id,
    name: sponsor.name,
    totalPay: sponsor.totalPay,
    upfrontPaid: Math.floor(sponsor.totalPay * 0.5),
    bonusPending: Math.floor(sponsor.totalPay * 0.5),
    rules: sponsor.rules,
    rulesCompleted: [],
    youthPromotedThisSeason: 0
  };
  const upfront = team.sponsorContract.upfrontPaid;
  team.finance.capital += upfront;
  team.finance.revenueThisSeason = (team.finance.revenueThisSeason || 0) + upfront;
  return { success: true, message: 'Signed with ' + sponsor.name + ' ($' + upfront.toLocaleString() + ' upfront)', upfront: upfront };
}

function checkSponsorRules(team, seasonStandings) {
  if (!team.sponsorContract) return { allMet: true, metRules: [], failedRules: [] };
  const contract = team.sponsorContract;
  const metRules = [];
  const failedRules = [];
  contract.rules.forEach(rule => {
    let met = false;
    if (rule.type === 'minWins') {
      const standing = seasonStandings[team.name];
      met = standing && standing.wins >= rule.value;
    } else if (rule.type === 'minPlacement') {
      const sorted = window.Nexus.getSortedStandings(seasonStandings);
      const position = sorted.findIndex(s => s.teamName === team.name) + 1;
      met = position > 0 && position <= rule.value;
    } else if (rule.type === 'useYouth') {
      met = (contract.youthPromotedThisSeason || 0) >= rule.value;
    }
    if (met) metRules.push(rule); else failedRules.push(rule);
  });
  return { allMet: failedRules.length === 0, metRules, failedRules };
}

function applySponsorSeasonEnd(team, seasonStandings) {
  if (!team.sponsorContract) return { bonus: 0, penalty: 0 };
  const contract = team.sponsorContract;
  const check = checkSponsorRules(team, seasonStandings);
  if (check.allMet) {
    const bonus = contract.bonusPending;
    if (team.finance) {
      team.finance.capital += bonus;
      team.finance.revenueThisSeason = (team.finance.revenueThisSeason || 0) + bonus;
    }
    team.sponsorContract = null;
    return { success: true, bonus: bonus, penalty: 0, message: 'All sponsor rules met! Received $' + bonus.toLocaleString() + ' bonus.' };
  } else {
    const penalty = Math.floor(contract.upfrontPaid * 0.5);
    if (team.finance) team.finance.capital -= penalty;
    team.sponsorContract = null;
    return { success: false, bonus: 0, penalty: penalty, failedRules: check.failedRules, message: 'Failed sponsor rules. Refunded $' + penalty.toLocaleString() + '.' };
  }
}

window.Nexus.selectSponsor = selectSponsor;
window.Nexus.checkSponsorRules = checkSponsorRules;
window.Nexus.applySponsorSeasonEnd = applySponsorSeasonEnd;
window.Nexus.getCoachTier = getCoachTier;
window.Nexus.getFacilityTier = getFacilityTier;
window.Nexus.getPsychologyTier = getPsychologyTier;
window.Nexus.upgradePsychology = upgradePsychology;
window.Nexus.getMaxYouthAcademySlots = getMaxYouthAcademySlots;
window.Nexus.syncTeamEnvironmentFromTiers = syncTeamEnvironmentFromTiers;
window.Nexus.syncPressureToPrestige = syncPressureToPrestige;

function calculateTeamMatchPower({ team, environment, meta }) {
  const nexus = window.Nexus || {};
  const userTeam =
    (nexus.getUserTeam && nexus.getUserTeam()) ||
    (nexus.LEAGUE && nexus.LEAGUE[0]) ||
    null;

  let lineup;
  if (userTeam && team && team.name === userTeam.name) {
    // For the player: always use chosen starters (roster page), never auto-picked lineup
    const slots = (team.starterSlots && team.starterSlots.length)
      ? team.starterSlots
      : (team.starters || team.players || []);
    lineup = (slots || []).filter(Boolean).slice(0, 5);
  } else {
    // For AI teams: keep automatic best lineup
    lineup = buildBestLineup(team, meta);
  }

  const synergyData = calculateTeamSynergy(lineup, meta, environment);
  const synergyMultiplier = synergyData.synergyMultiplier;

  const boosts = (team.activeTeamTraining && TEAM_TRAINING_PLANS[team.activeTeamTraining])
    ? TEAM_TRAINING_PLANS[team.activeTeamTraining].boosts
    : {};

  const playerPowers = lineup.map(function(p) {
    const matchPower = calculatePlayerMatchPower({ player: p, environment, meta, teamTrainingBoosts: boosts });
    return { player: p, matchPower: matchPower };
  });

  // Derive 0–10 style match ratings per player (relative to their own team this match)
  if (playerPowers.length > 0) {
    const powers = playerPowers.map(x => x.matchPower || 0);
    const mean = powers.reduce((s, v) => s + v, 0) / powers.length;
    const variance = powers.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / powers.length;
    const std = Math.sqrt(variance);
    playerPowers.forEach(function(x) {
      let rating;
      if (std > 0) {
        const z = (x.matchPower - mean) / std;
        rating = 6 + 1.5 * z;
      } else {
        rating = 6;
      }
      rating = Math.max(0, Math.min(10, rating));
      x.rating = Math.round(rating * 10) / 10;
    });
  }

  const avgPower = playerPowers.length > 0
    ? playerPowers.reduce(function(sum, x) { return sum + x.matchPower; }, 0) / playerPowers.length
    : 0;

  const shortHandedPenalty = lineup.length < 5 ? 0.85 : 1;
  const finalPower = (avgPower * synergyMultiplier) * shortHandedPenalty;

  return {
    finalPower,
    synergy: synergyData,
    lineup,
    playerPowers: playerPowers
  };
}

function getTeamTrainingMatchModifier(team) {
  if (!team || !team.activeTeamTraining) return 1.0;
  return 1.0;
}

// PART 4 — WIN PROBABILITY ENGINE

function calculateWinProbability(powerA, powerB) {
  const diff = powerA - powerB;

  // Logistic scaling — avoids extreme blowouts
  const probabilityA = 1 / (1 + Math.exp(-diff / 8));

  return probabilityA;
}

// Valorant-style round score: first to 13, or OT (12-12) then win by 2 (14-12, 15-13, 16-14)
function generateMatchScore(winnerName, teamA, teamB) {
  const teamAWon = winnerName === teamA.name;
  const isOvertime = Math.random() < 0.15;

  if (isOvertime) {
    const otVariants = [[14, 12], [15, 13], [16, 14]];
    const [winScore, loseScore] = otVariants[Math.floor(Math.random() * otVariants.length)];
    return {
      scoreA: teamAWon ? winScore : loseScore,
      scoreB: teamAWon ? loseScore : winScore
    };
  }

  const winnerRounds = 13;
  const loserRounds = Math.floor(Math.random() * 13);
  return {
    scoreA: teamAWon ? winnerRounds : loserRounds,
    scoreB: teamAWon ? loserRounds : winnerRounds
  };
}

function simulateMatch({ teamA, teamB, environmentA, environmentB, meta }) {
  const powerAData = calculateTeamMatchPower({ team: teamA, environment: environmentA, meta });
  const powerBData = calculateTeamMatchPower({ team: teamB, environment: environmentB, meta });

  const probA = calculateWinProbability(powerAData.finalPower, powerBData.finalPower);

  const roll = Math.random();

  const winner = roll < probA ? teamA.name : teamB.name;
  const { scoreA, scoreB } = generateMatchScore(winner, teamA, teamB);

  const playerPerformances = {};
  if (powerAData.playerPowers && powerAData.playerPowers.length) {
    playerPerformances[teamA.name] = powerAData.playerPowers.slice();
  }
  if (powerBData.playerPowers && powerBData.playerPowers.length) {
    playerPerformances[teamB.name] = powerBData.playerPowers.slice();
  }

  return {
    winner,
    scoreA,
    scoreB,
    playerPerformances,
    stage: undefined,
    probabilityA: Math.round(probA * 100) + '%',
    teamAPower: powerAData.finalPower.toFixed(2),
    teamBPower: powerBData.finalPower.toFixed(2),
    teamASynergy: powerAData.synergy,
    teamBSynergy: powerBData.synergy
  };
}

var MVP_ROLE_WEIGHTS = { Duelist: 0.40, Controller: 0.30, Sentinel: 0.20, Initiator: 0.10 };

function pickMatchMVP(winningTeamName, playerPerformances) {
  var list = (playerPerformances && playerPerformances[winningTeamName]) ? playerPerformances[winningTeamName] : [];
  if (!list.length) return null;

  var roll = Math.random();
  var roleWeights = MVP_ROLE_WEIGHTS;
  var pickedRole = 'Duelist';
  if (roll < roleWeights.Duelist) pickedRole = 'Duelist';
  else if (roll < roleWeights.Duelist + roleWeights.Controller) pickedRole = 'Controller';
  else if (roll < roleWeights.Duelist + roleWeights.Controller + roleWeights.Sentinel) pickedRole = 'Sentinel';
  else pickedRole = 'Initiator';

  var byRole = list.filter(function(x) {
    var p = x.player;
    var primary = (p && (p.assignedRole || (p.roleBias && p.roleBias.primaryRoleBias))) || '';
    return primary === pickedRole;
  });
  var pool = byRole.length > 0 ? byRole : list;

  var totalPower = 0;
  var weights = pool.map(function(x) {
    var noise = 0.9 + Math.random() * 0.2;
    var w = Math.max(0.01, (x.matchPower || 0) * noise);
    totalPower += w;
    return w;
  });
  var i = 0;
  var r = Math.random() * totalPower;
  for (; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) break;
  }
  i = Math.min(i, pool.length - 1);
  return pool[i] && pool[i].player ? pool[i].player : (list[0] && list[0].player) || null;
}

function analyzeMetaImpactOnRoster(team, meta) {
  if (!team || !team.players || !meta) return { buffed: 0, nerfed: 0 };
  const favored = (meta.favoredRoles && meta.favoredRoles.slice()) || [];
  const nerfed = (meta.nerfedRoles && meta.nerfedRoles.slice()) || [];
  let buffed = 0;
  let nerfedCount = 0;
  team.players.forEach(p => {
    const role = p.assignedRole || p.roleBias.primaryRoleBias;
    if (favored.includes(role)) buffed++;
    if (nerfed.includes(role)) nerfedCount++;
  });
  return { buffed, nerfed: nerfedCount };
}

// Expose Step 6
window.Nexus = window.Nexus || {};
function runPostMetaShiftAdaptation(season, newMeta, userTeamName) {
  if (!season || !season.teams || !newMeta) return;
  season.teams.forEach(team => {
    if (userTeamName && team.name === userTeamName) return;
    if (shouldTeamAdaptToMeta(team, newMeta)) adaptLineupToMeta(team, newMeta);
  });
}

window.Nexus.analyzeMetaImpactOnRoster = analyzeMetaImpactOnRoster;
window.Nexus.buildBestLineup = buildBestLineup;
window.Nexus.shouldTeamAdaptToMeta = shouldTeamAdaptToMeta;
window.Nexus.adaptLineupToMeta = adaptLineupToMeta;
window.Nexus.runPostMetaShiftAdaptation = runPostMetaShiftAdaptation;
window.Nexus.calculateTeamMatchPower = calculateTeamMatchPower;
window.Nexus.simulateMatch = simulateMatch;
window.Nexus.TEAM_TRAINING_PLAN_KEYS = TEAM_TRAINING_PLAN_KEYS;
window.Nexus.TEAM_TRAINING_PLANS = TEAM_TRAINING_PLANS;

// ------------------------------
// Project Nexus – Step 7 (Refactor)
// MATCHDAY SYSTEM
// Instead of one match at a time,
// we simulate full matchdays.
// Every team plays once per matchday.
// No more boring "other teams only" streak.
// ------------------------------

// PART 1 — ROUND ROBIN (CIRCLE METHOD)
// Produces structured matchdays (shuffled per career for variety)

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateMatchdays(teams) {
  let teamList = shuffleArray(teams);

  if (teamList.length % 2 !== 0) {
    teamList = [...teamList, { name: 'BYE' }];
  }

  const totalRounds = teamList.length - 1;
  const half = teamList.length / 2;
  const matchdays = [];

  for (let round = 0; round < totalRounds; round++) {
    const dayMatches = [];

    for (let i = 0; i < half; i++) {
      const teamA = teamList[i];
      const teamB = teamList[teamList.length - 1 - i];

      if (teamA.name !== 'BYE' && teamB.name !== 'BYE') {
        dayMatches.push({ teamA, teamB });
      }
    }

    matchdays.push(dayMatches);

    const fixed = teamList[0];
    const rest = teamList.slice(1);
    rest.unshift(rest.pop());
    teamList.splice(1, teamList.length - 1, ...rest);
  }

  return matchdays;
}

// PART 2 — SEASON MODEL UPDATE

function createSeason(teams) {
  const standings = {};

  teams.forEach(team => {
    standings[team.name] = {
      teamName: team.name,
      played: 0,
      wins: 0,
      losses: 0,
      points: 0
    };
  });

  return {
    teams,
    standings,
    matchdays: generateMatchdays(teams),
    currentMatchday: 0,
    playedMatchResults: []
  };
}

// PART 3 — PLAY FULL MATCHDAY

function checkForMetaShift(season) {
  if (season.matchdaysUntilMetaShift == null) season.matchdaysUntilMetaShift = 4;
  season.matchdaysUntilMetaShift--;
  if (season.matchdaysUntilMetaShift <= 0) {
    const current = getCurrentMeta();
    if (season.metaHistory == null) season.metaHistory = [];
    season.metaHistory.push({ atMatchday: season.currentMatchday, metaId: current.id, metaName: current.name || current.id });
    getRandomMetaPatch();
    season.matchdaysUntilMetaShift = 4;
    return getCurrentMeta();
  }
  return null;
}

function fillEmptyRosterSlotsForMatch(team) {
  if (!team || !Array.isArray(team.starterSlots) || team.starterSlots.length !== 5) return;
  const starterSlots = team.starterSlots;
  const benchSlots = team.benchSlots || [];
  const reserveSlots = team.reserveSlots || [];
  for (let i = 0; i < 5; i++) {
    if (starterSlots[i]) continue;
    const bj = benchSlots.findIndex(s => s != null);
    if (bj >= 0) {
      starterSlots[i] = benchSlots[bj];
      benchSlots[bj] = null;
    } else {
      const rj = reserveSlots.findIndex(s => s != null);
      if (rj >= 0) {
        starterSlots[i] = reserveSlots[rj];
        reserveSlots[rj] = null;
      }
    }
  }
  for (let i = 0; i < (benchSlots.length || 0); i++) {
    if (benchSlots[i]) continue;
    const rj = reserveSlots.findIndex(s => s != null);
    if (rj >= 0) {
      benchSlots[i] = reserveSlots[rj];
      reserveSlots[rj] = null;
    }
  }
  const starters = starterSlots.filter(Boolean);
  const bench = benchSlots.filter(Boolean);
  const reserves = reserveSlots.filter(Boolean);
  team.players = [...starters, ...bench, ...reserves];
  team.starters = team.players.slice(0, 5);
  team.bench = team.players.slice(5, 8);
}
window.Nexus.fillEmptyRosterSlotsForMatch = fillEmptyRosterSlotsForMatch;

function playNextMatchday(season, environmentMap, meta) {
  if (season.currentMatchday >= season.matchdays.length) {
    return { finished: true };
  }

  const keys = window.Nexus.TEAM_TRAINING_PLAN_KEYS || [];
  const userTeam = (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
  if (keys.length && season.teams) {
    season.teams.forEach(team => {
      if (team === userTeam) return;
      team.activeTeamTraining = keys[Math.floor(Math.random() * keys.length)];
    });
  }

  const todayMatches = season.matchdays[season.currentMatchday];
  const results = [];

  todayMatches.forEach(match => {
    if (window.Nexus.fillEmptyRosterSlotsForMatch) {
      window.Nexus.fillEmptyRosterSlotsForMatch(match.teamA);
      window.Nexus.fillEmptyRosterSlotsForMatch(match.teamB);
    }
    const result = simulateMatch({
      teamA: match.teamA,
      teamB: match.teamB,
      environmentA: environmentMap[match.teamA.name],
      environmentB: environmentMap[match.teamB.name],
      meta
    });
    result.stage = 'regular';

    updateStandings(season.standings, result, match);
    applyMatchRevenue(match.teamA, result.winner === match.teamA.name);
    applyMatchRevenue(match.teamB, result.winner === match.teamB.name);
    results.push({ match, result });
  });

  season.playedMatchResults[season.currentMatchday] = results;
  season.currentMatchday++;

  const newMeta = checkForMetaShift(season);

  return {
    finished: false,
    matchdayResults: results,
    newMeta: newMeta || undefined
  };
}

// PART 4 — UPDATE STANDINGS (unchanged logic)

function updateStandings(standings, result, match) {
  const teamAName = match.teamA.name;
  const teamBName = match.teamB.name;

  standings[teamAName].played++;
  standings[teamBName].played++;

  if (result.winner === teamAName) {
    standings[teamAName].wins++;
    standings[teamAName].points += 3;
    standings[teamBName].losses++;
  } else {
    standings[teamBName].wins++;
    standings[teamBName].points += 3;
    standings[teamAName].losses++;
  }
}

// PART 5 — SORT TABLE

function getSortedStandings(standings) {
  return Object.values(standings)
    .sort((a, b) => b.points - a.points || b.wins - a.wins);
}

// Expose Step 7
window.Nexus = window.Nexus || {};
window.Nexus.createSeason = createSeason;
window.Nexus.playNextMatchday = playNextMatchday;
window.Nexus.checkForMetaShift = checkForMetaShift;
window.Nexus.getSortedStandings = getSortedStandings;
window.Nexus.ALL_MAPS = ALL_MAPS;
window.Nexus.getActiveMapPool = getActiveMapPool;
window.Nexus.assignMapToMatch = assignMapToMatch;
window.Nexus.rotateMapPool = rotateMapPool;

// -------------------------------------------------
// Project Nexus – Step 8
// SPLIT FORMAT (Elite Esports Structure)
// 11 Matchdays Regular Season
// Then: Top 6 → Championship Playoffs | Bottom 6 → Relegation Split
// -------------------------------------------------

// PART 1 — EXTEND SEASON STATE

function createSeasonWithSplit(teams) {
  const baseSeason = createSeason(teams);
  const activeMapPool = getActiveMapPool();
  (baseSeason.matchdays || []).forEach(day => {
    (day || []).forEach(match => {
      match.map = assignMapToMatch(activeMapPool);
    });
  });

  return {
    ...baseSeason,
    phase: 'regular',
    playoffsBracket: null,
    relegationCandidates: null,
    challengerPromotion: null,
    relegationResults: null,
    matchdaysUntilMetaShift: 4,
    metaHistory: [],
    transferMarket: [],
    transferMarketRefreshCountdown: 3,
    activeMapPool
  };
}

function createChallengerSeasonFromTeams(teams) {
  if (!teams || teams.length === 0) return null;
  const baseSeason = createSeason(teams);
  const activeMapPool = getActiveMapPool();
  (baseSeason.matchdays || []).forEach(day => {
    (day || []).forEach(match => {
      match.map = assignMapToMatch(activeMapPool);
    });
  });
  return {
    ...baseSeason,
    phase: 'regular'
  };
}

// PART 2 — TRANSITION TO SPLIT (Top 6 playoffs, Bottom 2 vs Challenger Top 2)

function transitionToSplit(season, environmentMap, meta) {
  const sorted = getSortedStandings(season.standings);

  const top6 = sorted.slice(0, 6).map(t => season.teams.find(team => team.name === t.teamName));
  const bottom2 = sorted.slice(10, 12).map(t => season.teams.find(team => team.name === t.teamName)).filter(Boolean);

  season.phase = 'playoffs';
  season.playoffsBracket = createPlayoffBracket(top6);
  season.relegationCandidates = bottom2;

  const challengerSeason = window.Nexus.CHALLENGER_SEASON;
  const challengerTeams = window.Nexus.CHALLENGER_LEAGUE || [];
  if (challengerSeason && challengerSeason.standings && challengerTeams.length) {
    const challengerSorted = getSortedStandings(challengerSeason.standings);
    season.challengerPromotion = challengerSorted.slice(0, 2).map(t =>
      challengerTeams.find(team => team.name === t.teamName)
    ).filter(Boolean);
    if (window.Nexus.applyPlacementBonus) window.Nexus.applyPlacementBonus(challengerSeason);
  }
}

// PART 3 — PLAYOFF BRACKET (Single Elim: 1v6, 2v5, 3v4)

function createPlayoffBracket(topTeams) {
  return {
    round: 1,
    matches: [
      { teamA: topTeams[0], teamB: topTeams[5] },
      { teamA: topTeams[1], teamB: topTeams[4] },
      { teamA: topTeams[2], teamB: topTeams[3] }
    ],
    finalists: []
  };
}

function playPlayoffRound(season, environmentMap, meta) {
  const bracket = season.playoffsBracket;
  const winners = [];
  const roundResults = [];

  bracket.matches.forEach(match => {
    const result = simulateMatch({
      teamA: match.teamA,
      teamB: match.teamB,
      environmentA: environmentMap[match.teamA.name],
      environmentB: environmentMap[match.teamB.name],
      meta
    });
    result.stage = 'playoffs';

    const winnerTeam = season.teams.find(t => t.name === result.winner);
    winners.push(winnerTeam);
    roundResults.push({ match, result });
  });

  if (winners.length === 3) {
    bracket.finalists = [winners[0], winners[1]];
    bracket.round = 2;
    bracket.matches = [
      { teamA: winners[0], teamB: winners[1] }
    ];
    return { finished: false, playoffWinners: winners, roundResults };
  }

  if (winners.length === 1) {
    season.champion = winners[0];
    if (season.champion) {
      if (season.champion.finance) {
        const prize = 500000;
        const championTax = Math.round(prize * 0.35);
        season.champion.finance.capital += prize;
        season.champion.finance.revenueThisSeason += prize;
        season.champion.finance.capital -= championTax;
        season.champion.finance.revenueThisSeason -= championTax;
        const userTeam = window.Nexus && window.Nexus.getUserTeam && window.Nexus.getUserTeam();
        if (userTeam && season.champion.name === userTeam.name && window.Nexus && typeof window.Nexus.onFinanceExpense === 'function') {
          window.Nexus.onFinanceExpense('Player bonuses (champions): -$' + championTax.toLocaleString());
        }
      }
      season.champion.prestige = (season.champion.prestige || 50) + 30;
    }
    season.phase = 'relegation';
    return { finished: false, champion: season.champion, playoffWinners: winners, roundResults };
  }

  return { finished: false, roundResults };
}

// PART 4 — RELEGATION TOURNAMENT (Bottom 2 Main vs Top 2 Challenger)

function resolveRelegationTournament({
  mainTeams,
  challengerTeams,
  environmentMap,
  meta
}) {
  const results = [];
  const matchResults = [];
  const safeMain = Array.isArray(mainTeams) ? mainTeams : [];
  const safeChallenger = Array.isArray(challengerTeams) ? challengerTeams : [];

  for (let i = 0; i < 2; i++) {
    const main = safeMain[i];
    const challenger = safeChallenger[i];
    if (!main || !challenger || !main.name || !challenger.name) continue;

    const matchResult = simulateMatch({
      teamA: main,
      teamB: challenger,
      environmentA: environmentMap[main.name],
      environmentB: environmentMap[challenger.name],
      meta
    });
    matchResult.stage = 'relegation';

    const mainWins = matchResult.winner === main.name;

    if (!mainWins) {
      if (challenger.finance) {
        const prize = 200000;
        const championTax = Math.round(prize * 0.35);
        challenger.finance.capital += prize;
        challenger.finance.revenueThisSeason = (challenger.finance.revenueThisSeason || 0) + prize;
        challenger.finance.capital -= championTax;
        challenger.finance.revenueThisSeason -= championTax;
        const userTeam = window.Nexus && window.Nexus.getUserTeam && window.Nexus.getUserTeam();
        if (userTeam && challenger.name === userTeam.name && window.Nexus && typeof window.Nexus.onFinanceExpense === 'function') {
          window.Nexus.onFinanceExpense('Player bonuses (champions): -$' + championTax.toLocaleString());
        }
      }
      main.tier = 'Challenger';
      main.prestige = Math.max(1, (main.prestige || 50) - 10);
      main.budgetMultiplier = 0.75;

      challenger.tier = 'Main';
      challenger.prestige = (challenger.prestige || 30) + 15;
      challenger.budgetMultiplier = 1.0;
      if (window.Nexus.syncPressureToPrestige && environmentMap) {
        window.Nexus.syncPressureToPrestige(main, environmentMap);
        window.Nexus.syncPressureToPrestige(challenger, environmentMap);
      }
    } else {
      if (main.finance) {
        const prize = 100000;
        const championTax = Math.round(prize * 0.35);
        main.finance.capital += prize;
        main.finance.revenueThisSeason = (main.finance.revenueThisSeason || 0) + prize;
        main.finance.capital -= championTax;
        main.finance.revenueThisSeason -= championTax;
        const userTeam = window.Nexus && window.Nexus.getUserTeam && window.Nexus.getUserTeam();
        if (userTeam && main.name === userTeam.name && window.Nexus && typeof window.Nexus.onFinanceExpense === 'function') {
          window.Nexus.onFinanceExpense('Player bonuses (champions): -$' + championTax.toLocaleString());
        }
      }
    }

    results.push({
      mainTeam: main.name,
      challengerTeam: challenger.name,
      winner: matchResult.winner
    });
    matchResults.push({
      match: { teamA: main, teamB: challenger, map: 'Relegation series' },
      result: matchResult
    });
  }

  return { results, matchResults };
}

// PART 5 — UNIFIED STAGE FLOW

function playNextStage(season, environmentMap, meta) {
  if (season.phase === 'regular') {
    const result = playNextMatchday(season, environmentMap, meta);

    if (result.finished) {
      transitionToSplit(season, environmentMap, meta);
      return { finished: false, phase: 'playoffs', matchdayResults: result.matchdayResults, newMeta: result.newMeta };
    }

    return { ...result, phase: 'regular' };
  }

  if (season.phase === 'playoffs') {
    return playPlayoffRound(season, environmentMap, meta);
  }

  if (season.phase === 'relegation') {
    const rel = resolveRelegationTournament({
      mainTeams: season.relegationCandidates,
      challengerTeams: season.challengerPromotion,
      environmentMap,
      meta
    });
    season.relegationResults = rel.results;
    season.phase = 'finished';
    return { finished: true, relegationResults: rel.results, relegationMatchResults: rel.matchResults };
  }

  return { finished: true };
}

// Expose Step 8
window.Nexus = window.Nexus || {};
window.Nexus.createSeasonWithSplit = createSeasonWithSplit;
window.Nexus.createChallengerSeasonFromTeams = createChallengerSeasonFromTeams;
window.Nexus.playNextStage = playNextStage;
window.Nexus.transitionToSplit = transitionToSplit;
window.Nexus.resolveRelegationTournament = resolveRelegationTournament;

// -------------------------------------------------
// Project Nexus – Step 9
// Financial System – Season Economy Model
// 1 season = 1 split (~3 months). Monthly costs tick 3x; seasonal once at start.
// -------------------------------------------------

function initializeFinance(team) {
  const baseCapital = team.tier === 'Main' ? 1150000 : 550000;
  team.finance = {
    capital: baseCapital,
    monthlyCost: team.tier === 'Main' ? 180000 : 70000,
    seasonalCost: team.tier === 'Main' ? 200000 : 80000,
    revenuePerWin: team.tier === 'Main' ? 60000 : 25000,
    revenueThisSeason: 0,
    get transferBudget() { return Math.floor((this.capital || 0) * 0.3); }
  };
}

function applyMonthlyCosts(team) {
  if (!team.finance) return;
  const coach = typeof getCoachTier === 'function' ? getCoachTier(team) : { monthlySalary: 0 };
  const amount = (team.finance.monthlyCost || 0) + (coach.monthlySalary || 0);
  team.finance.capital -= amount;
  return amount;
}

function applySeasonalCost(team) {
  if (!team.finance) return 0;
  const prestige = team.prestige != null ? team.prestige : 50;
  const baseCost = Math.round(team.finance.seasonalCost * (0.7 + prestige / 100));
  const facility = typeof getFacilityTier === 'function' ? getFacilityTier(team) : { seasonalMaintenance: 0 };
  const psych = typeof getPsychologyTier === 'function' ? getPsychologyTier(team) : { seasonalCost: 0 };
  const maintenance = facility.seasonalMaintenance || 0;
  const psychologyCost = psych.seasonalCost || 0;
  const effectiveCost = baseCost + maintenance + psychologyCost;
  team.finance.capital -= effectiveCost;
  return effectiveCost;
}

function getOrdinalSuffix(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  const r = n % 10;
  if (r === 1) return 'st';
  if (r === 2) return 'nd';
  if (r === 3) return 'rd';
  return 'th';
}

function applyPlacementBonus(season) {
  if (!season || !season.standings || !season.teams) return;
  const sorted = window.Nexus.getSortedStandings(season.standings);
  if (!sorted || sorted.length === 0) return;
  const isMainLeague = season.teams.length === 12;
  const mainBonuses = {
    1: 300000, 2: 200000, 3: 150000, 4: 100000, 5: 75000, 6: 50000,
    7: 30000, 8: 25000, 9: 20000, 10: 15000, 11: 10000, 12: 5000
  };
  const challengerBonuses = {
    1: 100000, 2: 75000, 3: 40000, 4: 20000, 5: 10000, 6: 5000
  };
  const bonuses = isMainLeague ? mainBonuses : challengerBonuses;
  sorted.forEach((standing, index) => {
    const position = index + 1;
    const bonus = bonuses[position];
    if (bonus != null && bonus > 0) {
      const team = season.teams.find(t => t.name === standing.teamName);
      if (team && team.finance) {
        team.finance.capital += bonus;
        team.finance.revenueThisSeason = (team.finance.revenueThisSeason || 0) + bonus;
        const tier = isMainLeague ? 'Main' : 'Challenger';
        const suffix = getOrdinalSuffix(position);
        if (typeof console !== 'undefined' && console.log) {
          console.log('[' + tier + '] ' + team.name + ' received $' + bonus.toLocaleString() + ' for finishing ' + position + suffix);
        }
      }
    }
  });
}

function applyPrestigeChanges(season, environmentMap) {
  if (!season || !season.standings || !season.teams || !environmentMap) return;
  const sorted = window.Nexus.getSortedStandings(season.standings);
  if (!sorted || sorted.length === 0) return;
  const isMainLeague = season.teams.length === 12;
  const mainPrestige = { 1: 25, 2: 12, 3: 8, 4: 5, 5: 2, 6: 2, 7: 0, 8: 0, 9: 0, 10: -5, 11: -5, 12: -10 };
  const challengerPrestige = { 1: 15, 2: 10, 3: 3, 4: 3, 5: 0, 6: 0 };
  const prestigeByPosition = isMainLeague ? mainPrestige : challengerPrestige;
  sorted.forEach((standing, index) => {
    const position = index + 1;
    const prestigeChange = prestigeByPosition[position] != null ? prestigeByPosition[position] : 0;
    const team = season.teams.find(t => t.name === standing.teamName);
    if (team) {
      team.prestige = Math.max(10, Math.min(100, (team.prestige || 50) + prestigeChange));
      if (window.Nexus.syncPressureToPrestige) window.Nexus.syncPressureToPrestige(team, environmentMap);
    }
  });
}

function applyMatchRevenue(team, didWin) {
  if (!team.finance) return;
  if (didWin) {
    team.finance.capital += team.finance.revenuePerWin;
    team.finance.revenueThisSeason = (team.finance.revenueThisSeason || 0) + team.finance.revenuePerWin;
  }
}

function checkBankruptcy(team) {
  return team.finance && team.finance.capital <= 0;
}

// -------------------------------------------------
// Transfer Market – Contracts & Valuation
// -------------------------------------------------
function initializeContractForPlayer(player) {
  if (player.contractYears != null && player.salary != null) return;
  const overall = window.Nexus.getPlayerOverall ? window.Nexus.getPlayerOverall(player) : (STAT_KEYS.reduce((s, k) => s + (player.stats[k] && player.stats[k].current) || 0, 0) / STAT_KEYS.length);
  if (player.contractYears == null) player.contractYears = randomInt(1, 3);
  if (player.salary == null) {
    if (overall >= 80) player.salary = randomInt(15000, 25000);
    else if (overall >= 70) player.salary = randomInt(8000, 15000);
    else if (overall >= 60) player.salary = randomInt(4000, 8000);
    else player.salary = randomInt(2000, 4000);
  }
  if (player.transferListed == null) player.transferListed = false;
}

function calculatePlayerValue(player) {
  const overall = getPlayerOverall(player);
  let baseValue = overall * 1000;
  const age = player.age != null ? player.age : 22;
  if (age <= 21) baseValue *= 1.5;
  else if (age <= 25) baseValue *= 1.2;
  else if (age <= 27) baseValue *= 0.7;
  else baseValue *= 0.3;
  const role = (player.roleBias && player.roleBias.primaryRoleBias) || '';
  const aim = (player.stats && player.stats.aim && player.stats.aim.current) || 0;
  const utilityIQ = (player.stats && player.stats.utilityIQ && player.stats.utilityIQ.current) || 0;
  if (role === 'Duelist' && aim >= 85) baseValue *= 1.3;
  else if (role === 'Controller' && utilityIQ >= 80) baseValue *= 1.2;
  const flex = (player.roleBias && player.roleBias.flexPotential) || 'Low';
  if (flex === 'High') baseValue *= 1.2;
  else if (flex === 'Medium') baseValue *= 1.1;
  return Math.round(baseValue);
}

const MAX_ROSTER_SIZE = 12;
const MIN_ROSTER_SIZE = 8;
const MAX_YOUTH_ACADEMY = 6;

function generateTransferMarket(allTeams, userTeamName, skipPlayerIds) {
  const skip = new Set(skipPlayerIds || []);
  const listings = [];
  (allTeams || []).forEach(team => {
    if (team.name === userTeamName || !team.players) return;
    const bench = team.players.slice(5);
    const starters = team.players.slice(0, 5);
    bench.forEach((p, i) => {
      if (skip.has(p.id)) return;
      if (i < 2 && chance(0.7)) {
        p.transferListed = true;
        listings.push({
          player: p,
          team,
          askingPrice: Math.round(calculatePlayerValue(p) * 1.2),
          listedSince: 0
        });
      }
    });
    starters.forEach(p => {
      if (skip.has(p.id)) return;
      const age = p.age != null ? p.age : 22;
      const salary = p.salary || 5000;
      const monthlyCost = (team.finance && team.finance.monthlyCost) || 180000;
      if (age >= 27 && chance(0.4)) {
        p.transferListed = true;
        listings.push({ player: p, team, askingPrice: Math.round(calculatePlayerValue(p) * 1.2), listedSince: 0 });
      } else if (salary > monthlyCost * 0.15 && chance(0.3)) {
        p.transferListed = true;
        listings.push({ player: p, team, askingPrice: Math.round(calculatePlayerValue(p) * 1.2), listedSince: 0 });
      }
    });
  });
  return listings.slice(0, 20);
}

function refreshTransferMarket(season, allTeams, userTeamName) {
  if (!season) return;
  season.transferMarket = season.transferMarket || [];
  season.transferMarketRefreshCountdown = season.transferMarketRefreshCountdown != null ? season.transferMarketRefreshCountdown : 3;
  const current = season.transferMarket;
  const unlistCount = Math.floor(current.length * (0.3 + Math.random() * 0.2));
  for (let i = 0; i < unlistCount && current.length > 0; i++) {
    const idx = randomInt(0, current.length - 1);
    const entry = current[idx];
    if (entry && entry.team && entry.player && window.Nexus.recordTransferEvent) {
      window.Nexus.recordTransferEvent({ teamName: entry.team.name, direction: 'out', playerName: getPlayerDisplayName(entry.player), playerId: entry.player.id, how: 'market_refresh' });
    }
    if (entry && entry.player) entry.player.transferListed = false;
    current.splice(idx, 1);
  }
  const existingIds = current.map(e => e.player && e.player.id).filter(Boolean);
  const newListings = generateTransferMarket(allTeams, userTeamName, existingIds);
  const matchday = season.currentMatchday != null ? season.currentMatchday : 0;
  newListings.forEach(entry => {
    entry.listedSince = matchday;
    current.push(entry);
  });
  season.transferMarket = current.slice(0, 20);
  season.transferMarketRefreshCountdown = 3;
}

function canAffordPlayer(userTeam, askingPrice, playerSalary) {
  if (!userTeam || !userTeam.finance) return { canAfford: false, reason: 'No finance data' };
  if (userTeam.finance.capital < askingPrice) return { canAfford: false, reason: 'Insufficient funds' };
  if ((userTeam.players || []).length >= MAX_ROSTER_SIZE) return { canAfford: false, reason: 'Roster full (12 players max)' };
  const newMonthly = (userTeam.finance.monthlyCost || 0) + (playerSalary || 0);
  const capitalAfter = userTeam.finance.capital - askingPrice;
  const runway = newMonthly > 0 ? Math.floor(capitalAfter / newMonthly) : 99;
  if (runway < 3) return { canAfford: false, reason: 'Cannot afford wages (runway < 3 months)' };
  return { canAfford: true, reason: '' };
}

function buyPlayer(args) {
  const { userTeam, sellerTeam, player, askingPrice, season } = args || {};
  if (!userTeam || !sellerTeam || !player || askingPrice == null) return { success: false, message: 'Invalid args' };
  const salary = player.salary || 5000;
  const check = canAffordPlayer(userTeam, askingPrice, salary);
  if (!check.canAfford) return { success: false, message: check.reason };
  if (!(sellerTeam.players || []).includes(player)) return { success: false, message: 'Player no longer available' };
  userTeam.finance.capital -= askingPrice;
  sellerTeam.finance.capital += askingPrice;
  sellerTeam.players = sellerTeam.players.filter(p => p !== player);
  userTeam.players = userTeam.players || [];
  userTeam.players.push(player);
  player.transferListed = false;
  userTeam.starters = userTeam.players.slice(0, 5);
  userTeam.bench = userTeam.players.slice(5, 8);
  sellerTeam.starters = sellerTeam.players.slice(0, 5);
  sellerTeam.bench = sellerTeam.players.slice(5, 8);
  if (userTeam.finance.monthlyCost != null) userTeam.finance.monthlyCost += salary;
  if (sellerTeam.finance.monthlyCost != null) sellerTeam.finance.monthlyCost -= salary;
  if (sellerTeam !== userTeam && season && (sellerTeam.players || []).length < MIN_ROSTER_SIZE) {
    const replaced = aiBuyReplacement(sellerTeam, player, season);
    if (replaced) {
      sellerTeam.starters = sellerTeam.players.slice(0, 5);
      sellerTeam.bench = sellerTeam.players.slice(5, 8);
    }
  }
  while ((sellerTeam.players || []).length < MIN_ROSTER_SIZE) {
    const youth = createPlayer(null, randomInt(17, 20));
    sellerTeam.players.push(youth);
    sellerTeam.starters = sellerTeam.players.slice(0, 5);
    sellerTeam.bench = sellerTeam.players.slice(5, 8);
    if (sellerTeam.finance.monthlyCost != null) sellerTeam.finance.monthlyCost += (youth.salary || 3000);
  }
  if (window.Nexus.recordTransferEvent) {
    window.Nexus.recordTransferEvent({ teamName: sellerTeam.name, direction: 'out', playerName: getPlayerDisplayName(player), playerId: player.id, how: 'transfer', otherTeam: userTeam.name });
    window.Nexus.recordTransferEvent({ teamName: userTeam.name, direction: 'in', playerName: getPlayerDisplayName(player), playerId: player.id, how: 'transfer', otherTeam: sellerTeam.name });
  }
  return { success: true, message: 'Signed ' + getPlayerDisplayName(player) + ' for $' + askingPrice.toLocaleString() };
}

function sellPlayer(args) {
  const { userTeam, player, askingPrice } = args || {};
  if (!userTeam || !player) return { success: false, message: 'Invalid args' };
  const players = userTeam.players || [];
  if (players.length <= MIN_ROSTER_SIZE) return { success: false, message: 'Must keep at least 8 players' };
  if (!players.includes(player)) return { success: false, message: 'Player not in your team' };
  const fee = Math.round((askingPrice != null ? askingPrice : calculatePlayerValue(player)) * 0.8);
  userTeam.finance.capital += fee;
  userTeam.players = players.filter(p => p !== player);
  userTeam.starters = userTeam.players.slice(0, 5);
  userTeam.bench = userTeam.players.slice(5, 8);
  if (userTeam.finance.monthlyCost != null) userTeam.finance.monthlyCost -= (player.salary || 0);
  if (Array.isArray(userTeam.starterSlots)) {
    for (let i = 0; i < userTeam.starterSlots.length; i++) if (userTeam.starterSlots[i] === player) userTeam.starterSlots[i] = null;
  }
  if (Array.isArray(userTeam.benchSlots)) {
    for (let i = 0; i < userTeam.benchSlots.length; i++) if (userTeam.benchSlots[i] === player) userTeam.benchSlots[i] = null;
  }
  if (Array.isArray(userTeam.reserveSlots)) {
    for (let i = 0; i < userTeam.reserveSlots.length; i++) if (userTeam.reserveSlots[i] === player) userTeam.reserveSlots[i] = null;
  }
  player.contractYears = null;
  (window.Nexus.FREE_AGENTS = window.Nexus.FREE_AGENTS || []).push(player);
  if (window.Nexus.recordTransferEvent) {
    window.Nexus.recordTransferEvent({ teamName: userTeam.name, direction: 'out', playerName: getPlayerDisplayName(player), playerId: player.id, how: 'free_agents' });
  }
  return { success: true, message: 'Released ' + getPlayerDisplayName(player) + ' ($' + fee.toLocaleString() + ' received)' };
}

function signFreeAgent(userTeam, player, salaryOffered) {
  const freeAgents = window.Nexus.FREE_AGENTS || [];
  if (!userTeam || !player || !freeAgents.includes(player)) return { success: false, message: 'Player not available' };
  if ((userTeam.players || []).length >= MAX_ROSTER_SIZE) return { success: false, message: 'Roster full (12 players max)' };
  const salary = salaryOffered != null ? salaryOffered : (player.salary || 5000);
  const newMonthly = (userTeam.finance.monthlyCost || 0) + salary;
  const runway = newMonthly > 0 ? Math.floor((userTeam.finance.capital || 0) / newMonthly) : 99;
  if (runway < 3) return { success: false, message: 'Cannot afford wages (runway < 3 months)' };
  const idx = freeAgents.indexOf(player);
  if (idx >= 0) freeAgents.splice(idx, 1);
  player.salary = salary;
  player.contractYears = 2;
  userTeam.players = userTeam.players || [];
  userTeam.players.push(player);
  userTeam.starters = userTeam.players.slice(0, 5);
  userTeam.bench = userTeam.players.slice(5, 8);
  if (userTeam.finance.monthlyCost != null) userTeam.finance.monthlyCost += salary;
  if (window.Nexus.recordTransferEvent) {
    window.Nexus.recordTransferEvent({ teamName: userTeam.name, direction: 'in', playerName: getPlayerDisplayName(player), playerId: player.id, how: 'free_agents' });
  }
  return { success: true, message: 'Signed ' + getPlayerDisplayName(player) + ' (free agent)' };
}

function aiBuyReplacement(sellerTeam, lostPlayer, season) {
  if (!sellerTeam || !season || (sellerTeam.players || []).length >= MAX_ROSTER_SIZE) return false;
  const primary = (lostPlayer.roleBias && lostPlayer.roleBias.primaryRoleBias) || '';
  const secondary = (lostPlayer.roleBias && lostPlayer.roleBias.secondaryRoleBias) || '';
  const candidates = [];
  (season.transferMarket || []).forEach(entry => {
    if (!entry.player || !entry.team || entry.team === sellerTeam) return;
    if (!(entry.team.players || []).includes(entry.player)) return;
    const price = entry.askingPrice != null ? entry.askingPrice : 0;
    const salary = entry.player.salary || 5000;
    const check = canAffordPlayer(sellerTeam, price, salary);
    if (!check.canAfford) return;
    if ((sellerTeam.players || []).length >= MAX_ROSTER_SIZE - 1) return;
    const p = entry.player;
    const roleMatch = (p.roleBias && (p.roleBias.primaryRoleBias === primary || p.roleBias.primaryRoleBias === secondary || p.roleBias.secondaryRoleBias === primary || p.roleBias.secondaryRoleBias === secondary));
    candidates.push({ source: 'market', entry, player: p, team: entry.team, price, salary, roleMatch });
  });
  (window.Nexus.FREE_AGENTS || []).forEach(p => {
    if (!p) return;
    const salary = p.salary || 5000;
    const check = canAffordPlayer(sellerTeam, 0, salary);
    if (!check.canAfford) return;
    if ((sellerTeam.players || []).length >= MAX_ROSTER_SIZE - 1) return;
    const roleMatch = (p.roleBias && (p.roleBias.primaryRoleBias === primary || p.roleBias.primaryRoleBias === secondary || p.roleBias.secondaryRoleBias === primary || p.roleBias.secondaryRoleBias === secondary));
    candidates.push({ source: 'fa', player: p, team: null, price: 0, salary, roleMatch });
  });
  if (candidates.length === 0) return false;
  candidates.sort((a, b) => (b.roleMatch ? 1 : 0) - (a.roleMatch ? 1 : 0));
  const roleMatched = candidates.filter(c => c.roleMatch);
  const pool = roleMatched.length > 0 ? roleMatched : candidates;
  const chosen = pool[randomInt(0, pool.length - 1)];
  if (chosen.source === 'market') {
    const { entry, player, team, price } = chosen;
    sellerTeam.finance.capital -= price;
    team.finance.capital += price;
    team.players = (team.players || []).filter(x => x !== player);
    team.starters = (team.players || []).slice(0, 5);
    team.bench = (team.players || []).slice(5, 8);
    sellerTeam.players = sellerTeam.players || [];
    sellerTeam.players.push(player);
    sellerTeam.starters = sellerTeam.players.slice(0, 5);
    sellerTeam.bench = sellerTeam.players.slice(5, 8);
    if (sellerTeam.finance.monthlyCost != null) sellerTeam.finance.monthlyCost += (player.salary || 5000);
    if (team.finance.monthlyCost != null) team.finance.monthlyCost -= (player.salary || 5000);
    player.transferListed = false;
    season.transferMarket = (season.transferMarket || []).filter(e => e !== entry);
    return true;
  }
  if (chosen.source === 'fa') {
    const result = signFreeAgent(sellerTeam, chosen.player, chosen.player.salary);
    return result.success;
  }
  return false;
}

function _playerSharesRoleWith(rosterPlayer, incomingPlayer) {
  const a = rosterPlayer.roleBias || {};
  const b = incomingPlayer.roleBias || {};
  const pa = a.primaryRoleBias; const sa = a.secondaryRoleBias;
  const pb = b.primaryRoleBias; const sb = b.secondaryRoleBias;
  if (!pa && !pb) return true;
  return (pa && (pa === pb || pa === sb)) || (sa && (sa === pb || sa === sb));
}

/** Pick who to sell when buying incoming: prefer primary role match, then secondary, then flex High (by rating), then flex Medium. */
function _pickPlayerToSellForIncoming(roster, incoming, getOverall) {
  const incPr = incoming.roleBias && incoming.roleBias.primaryRoleBias;
  const incSr = incoming.roleBias && incoming.roleBias.secondaryRoleBias;
  let tier = roster.filter(p => (p.roleBias && p.roleBias.primaryRoleBias) === incPr);
  if (tier.length) { tier.sort((a, b) => getOverall(a) - getOverall(b)); return tier[0]; }
  tier = roster.filter(p => _playerSharesRoleWith(p, incoming) && (p.roleBias && p.roleBias.primaryRoleBias) !== incPr);
  if (tier.length) { tier.sort((a, b) => getOverall(a) - getOverall(b)); return tier[0]; }
  tier = roster.filter(p => (p.roleBias && p.roleBias.flexPotential) === 'High');
  if (tier.length) { tier.sort((a, b) => getOverall(a) - getOverall(b)); return tier[0]; }
  tier = roster.filter(p => (p.roleBias && p.roleBias.flexPotential) === 'Medium');
  if (tier.length) { tier.sort((a, b) => getOverall(a) - getOverall(b)); return tier[0]; }
  roster = roster.slice();
  roster.sort((a, b) => getOverall(a) - getOverall(b));
  return roster[0];
}

function _canReplaceWithIncoming(roster, incoming) {
  return roster.some(p => {
    const pr = p.roleBias && p.roleBias.primaryRoleBias;
    const sr = p.roleBias && p.roleBias.secondaryRoleBias;
    const incPr = incoming.roleBias && incoming.roleBias.primaryRoleBias;
    const incSr = incoming.roleBias && incoming.roleBias.secondaryRoleBias;
    if (pr === incPr) return true;
    if (pr === incSr || sr === incPr || (sr && sr === incSr)) return true;
    const flex = p.roleBias && p.roleBias.flexPotential;
    if (flex === 'High' || flex === 'Medium') return true;
    return false;
  });
}

function _aiSellPlayer(team, player) {
  if (!team || !player || !(team.players || []).includes(player)) return;
  const players = team.players || [];
  if (players.length <= MIN_ROSTER_SIZE) return;
  const fee = Math.round((typeof calculatePlayerValue === 'function' ? calculatePlayerValue(player) : 10000) * 0.8);
  team.finance.capital += fee;
  team.players = players.filter(p => p !== player);
  team.starters = team.players.slice(0, 5);
  team.bench = team.players.slice(5, 8);
  if (team.finance.monthlyCost != null) team.finance.monthlyCost -= (player.salary || 0);
  if (Array.isArray(team.starterSlots)) { for (let i = 0; i < team.starterSlots.length; i++) if (team.starterSlots[i] === player) team.starterSlots[i] = null; }
  if (Array.isArray(team.benchSlots)) { for (let i = 0; i < team.benchSlots.length; i++) if (team.benchSlots[i] === player) team.benchSlots[i] = null; }
  if (Array.isArray(team.reserveSlots)) { for (let i = 0; i < team.reserveSlots.length; i++) if (team.reserveSlots[i] === player) team.reserveSlots[i] = null; }
  player.contractYears = null;
  (window.Nexus.FREE_AGENTS = window.Nexus.FREE_AGENTS || []).push(player);
  if (window.Nexus.recordTransferEvent) {
    window.Nexus.recordTransferEvent({ teamName: team.name, direction: 'out', playerName: getPlayerDisplayName(player), playerId: player.id, how: 'free_agents' });
  }
}

/** AI buys one player (transfer or FA) and sells one of same role so roster size and market flow stay consistent. */
function aiInteractWithMarket(buyerTeam, season) {
  if (!buyerTeam || !season) return false;
  const roster = buyerTeam.players || [];
  if (roster.length <= MIN_ROSTER_SIZE) return false;

  const candidates = [];
  (season.transferMarket || []).forEach(entry => {
    if (!entry.player || !entry.team || entry.team === buyerTeam) return;
    if (!(entry.team.players || []).includes(entry.player)) return;
    const price = entry.askingPrice != null ? entry.askingPrice : 0;
    const salary = entry.player.salary || 5000;
    if (!canAffordPlayer(buyerTeam, price, salary).canAfford) return;
    if (!_canReplaceWithIncoming(roster, entry.player)) return;
    candidates.push({ source: 'market', entry, player: entry.player, team: entry.team, price, salary });
  });
  (window.Nexus.FREE_AGENTS || []).forEach(p => {
    if (!p) return;
    const salary = p.salary || 5000;
    if (!canAffordPlayer(buyerTeam, 0, salary).canAfford) return;
    if (!_canReplaceWithIncoming(roster, p)) return;
    candidates.push({ source: 'fa', player: p, team: null, price: 0, salary });
  });
  if (candidates.length === 0) return false;

  const chosen = candidates[randomInt(0, candidates.length - 1)];
  const incoming = chosen.player;
  const getOverall = typeof getPlayerOverall === 'function' ? getPlayerOverall : function(p) { return 70; };
  const sellHim = _pickPlayerToSellForIncoming(roster, incoming, getOverall);
  if (!sellHim) return false;
  _aiSellPlayer(buyerTeam, sellHim);

  if (chosen.source === 'market') {
    const { entry, player, team, price } = chosen;
    buyerTeam.finance.capital -= price;
    team.finance.capital += price;
    team.players = (team.players || []).filter(x => x !== player);
    team.starters = (team.players || []).slice(0, 5);
    team.bench = (team.players || []).slice(5, 8);
    buyerTeam.players = buyerTeam.players || [];
    buyerTeam.players.push(player);
    buyerTeam.starters = buyerTeam.players.slice(0, 5);
    buyerTeam.bench = buyerTeam.players.slice(5, 8);
    if (buyerTeam.finance.monthlyCost != null) buyerTeam.finance.monthlyCost += (player.salary || 5000);
    if (team.finance.monthlyCost != null) team.finance.monthlyCost -= (player.salary || 5000);
    player.transferListed = false;
    season.transferMarket = (season.transferMarket || []).filter(e => e !== entry);
    return true;
  }
  if (chosen.source === 'fa') {
    const result = signFreeAgent(buyerTeam, chosen.player, chosen.player.salary);
    return result.success;
  }
  return false;
}

window.Nexus = window.Nexus || {};
window.Nexus.initializeFinance = initializeFinance;
window.Nexus.initializeContractForPlayer = initializeContractForPlayer;
window.Nexus.calculatePlayerValue = calculatePlayerValue;
window.Nexus.getPlayerOverall = getPlayerOverall;
window.Nexus.generateTransferMarket = generateTransferMarket;
window.Nexus.refreshTransferMarket = refreshTransferMarket;
window.Nexus.canAffordPlayer = canAffordPlayer;
window.Nexus.buyPlayer = buyPlayer;
window.Nexus.sellPlayer = sellPlayer;
window.Nexus.signFreeAgent = signFreeAgent;
window.Nexus.aiBuyReplacement = aiBuyReplacement;
window.Nexus.aiInteractWithMarket = aiInteractWithMarket;
window.Nexus.MAX_ROSTER_SIZE = MAX_ROSTER_SIZE;
window.Nexus.MIN_ROSTER_SIZE = MIN_ROSTER_SIZE;

function generateJobOffers(userTeam, seasonOutcome, cycleCount, allTeams, season) {
  const offers = [];
  const otherTeams = (allTeams || []).filter(t => t && t.name !== userTeam.name);
  const userSalary = userTeam.finance && userTeam.finance.monthlyCost != null ? userTeam.finance.monthlyCost : 100000;

  if (seasonOutcome === 'bankrupt') {
    const promotedNames = (season && (season.challengerPromotion || []).map(t => t.name)) || [];
    const challengerExcludingPromoted = otherTeams.filter(t => t.tier === 'Challenger' && promotedNames.indexOf(t.name) === -1);
    const mainPool = otherTeams.filter(t => t.tier === 'Main');
    const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);
    const fromChallenger = shuffle(challengerExcludingPromoted).slice(0, 2);
    const fromMain = shuffle(mainPool).slice(0, 1);
    fromChallenger.forEach(t => offers.push({ team: t, salary: Math.round(userSalary * 0.85), reason: 'Rebuilding opportunity' }));
    fromMain.forEach(t => offers.push({ team: t, salary: Math.round(userSalary * 0.9), reason: 'Stability after bankruptcy' }));
    while (offers.length < 1) {
      const fallback = otherTeams.filter(t => !offers.some(o => o.team === t));
      if (fallback.length === 0) break;
      const pick = fallback[Math.floor(Math.random() * fallback.length)];
      offers.push({ team: pick, salary: Math.round(userSalary * 0.85), reason: 'New opportunity' });
    }
    return offers.slice(0, 3);
  }

  if (!cycleCount || cycleCount === 1) return [];
  if (seasonOutcome === 'champion') {
    const topTeams = otherTeams
      .filter(t => t.tier === 'Main' && (t.prestige || 50) >= 70)
      .sort((a, b) => (b.prestige || 0) - (a.prestige || 0))
      .slice(0, 3);
    for (let i = 0; i < Math.min(2, topTeams.length); i++) {
      if (chance(0.6)) {
        offers.push({
          team: topTeams[i],
          salary: Math.round(userSalary * 1.3),
          reason: 'Impressed by championship win'
        });
      }
    }
  } else if (seasonOutcome === 'playoffs') {
    const similarTeams = otherTeams
      .filter(t => t.tier === (userTeam.tier || 'Main') && Math.abs((t.prestige || 50) - (userTeam.prestige || 50)) < 15)
      .sort(() => Math.random() - 0.5);
    if (similarTeams.length > 0 && chance(0.4)) {
      offers.push({
        team: similarTeams[0],
        salary: Math.round(userSalary * 1.15),
        reason: 'Looking for experienced manager'
      });
    }
  } else if (seasonOutcome === 'mid') {
    const rebuilding = otherTeams
      .filter(t => t.tier === 'Main')
      .sort(() => Math.random() - 0.5);
    if (rebuilding.length > 0 && chance(0.35)) {
      offers.push({
        team: rebuilding[0],
        salary: Math.round(userSalary * 1.05),
        reason: 'Rebuilding project'
      });
    }
  } else if (seasonOutcome === 'relegated') {
    const challengerTeams = otherTeams
      .filter(t => t.tier === 'Challenger')
      .sort(() => Math.random() - 0.5);
    if (challengerTeams.length > 0) {
      offers.push({
        team: challengerTeams[0],
        salary: Math.round(userSalary * 0.9),
        reason: 'Rebuilding project'
      });
    }
    if (challengerTeams.length > 1 && chance(0.5)) {
      offers.push({
        team: challengerTeams[1],
        salary: Math.round(userSalary * 0.85),
        reason: 'Staying in the scene'
      });
    }
  }

  return offers.slice(0, 3);
}

function acceptJobOffer(offer, league, challengerLeague) {
  const allTeams = [...(league || []), ...(challengerLeague || [])];
  const userCurrentTeam = league && league[0];
  const newTeam = offer && offer.team;
  if (!userCurrentTeam || !newTeam) return { league, challengerLeague };
  const userIdx = allTeams.indexOf(userCurrentTeam);
  const newIdx = allTeams.indexOf(newTeam);
  if (userIdx === -1 || newIdx === -1) return { league, challengerLeague };
  [allTeams[userIdx], allTeams[newIdx]] = [allTeams[newIdx], allTeams[userIdx]];
  const mainTeams = allTeams.filter(t => t.tier === 'Main');
  const challTeams = allTeams.filter(t => t.tier === 'Challenger');
  const newUserIdx = mainTeams.indexOf(newTeam);
  if (newUserIdx >= 0) {
    [mainTeams[0], mainTeams[newUserIdx]] = [mainTeams[newUserIdx], mainTeams[0]];
    return { league: mainTeams, challengerLeague: challTeams };
  }
  const challIdx = challTeams.indexOf(newTeam);
  if (challIdx >= 0) {
    [challTeams[0], challTeams[challIdx]] = [challTeams[challIdx], challTeams[0]];
    return { league: mainTeams, challengerLeague: challTeams };
  }
  return { league: mainTeams, challengerLeague: challTeams };
}

function decrementContracts(teams) {
  (teams || []).forEach(team => {
    const toRemove = [];
    (team.players || []).forEach(p => {
      p.contractYears = (p.contractYears != null ? p.contractYears : 1) - 1;
      if (p.contractYears <= 0) {
        toRemove.push(p);
        p.contractYears = null;
        (window.Nexus.FREE_AGENTS = window.Nexus.FREE_AGENTS || []).push(p);
        if (typeof console !== 'undefined' && console.log) console.log(getPlayerDisplayName(p) + ' contract expired, now free agent');
      }
    });
    team.players = (team.players || []).filter(p => !toRemove.includes(p));
    team.starters = team.players.slice(0, 5);
    team.bench = team.players.slice(5, 8);
    toRemove.forEach(p => {
      if (team.finance && team.finance.monthlyCost != null) team.finance.monthlyCost -= (p.salary || 0);
    });
    while ((team.players || []).length < MIN_ROSTER_SIZE) {
      const roleNeeded = (toRemove.length > 0 && toRemove[0] && toRemove[0].roleBias && toRemove[0].roleBias.primaryRoleBias)
        ? toRemove.shift().roleBias.primaryRoleBias
        : 'Duelist';
      const seventeenYos = (team.youthAcademy || []).filter(p => p.age === 17);
      const matching = seventeenYos.filter(p => {
        const rb = p.roleBias || {};
        return rb.primaryRoleBias === roleNeeded || rb.secondaryRoleBias === roleNeeded;
      });
      if (matching.length > 0 && chance(0.8)) {
        const chosen = matching[randomInt(0, matching.length - 1)];
        const result = promoteYouthToRoster(team, chosen);
        if (result.success) continue;
      }
      const youth = createPlayer(roleNeeded, randomInt(17, 20));
      if (!youth.roleBias) youth.roleBias = { primaryRoleBias: roleNeeded, secondaryRoleBias: roleNeeded, flexPotential: 'Low' };
      youth.roleBias.primaryRoleBias = roleNeeded;
      team.players.push(youth);
      team.starters = team.players.slice(0, 5);
      team.bench = team.players.slice(5, 8);
      if (team.finance.monthlyCost != null) team.finance.monthlyCost += (youth.salary || 3000);
    }
    // Clear slot arrays so expired players (no longer in team.players) don't get synced back
    const inRoster = new Set(team.players || []);
    if (Array.isArray(team.starterSlots)) {
      for (let i = 0; i < team.starterSlots.length; i++) {
        if (team.starterSlots[i] && !inRoster.has(team.starterSlots[i])) team.starterSlots[i] = null;
      }
    }
    if (Array.isArray(team.benchSlots)) {
      for (let i = 0; i < team.benchSlots.length; i++) {
        if (team.benchSlots[i] && !inRoster.has(team.benchSlots[i])) team.benchSlots[i] = null;
      }
    }
    if (Array.isArray(team.reserveSlots)) {
      for (let i = 0; i < team.reserveSlots.length; i++) {
        if (team.reserveSlots[i] && !inRoster.has(team.reserveSlots[i])) team.reserveSlots[i] = null;
      }
    }
    // Put any players in team.players that aren't in a slot yet (e.g. new youth) into null slot positions
    const inSlots = new Set([
      ...(team.starterSlots || []).filter(Boolean),
      ...(team.benchSlots || []).filter(Boolean),
      ...(team.reserveSlots || []).filter(Boolean)
    ]);
    const orphans = (team.players || []).filter(p => !inSlots.has(p));
    if (orphans.length > 0 && Array.isArray(team.reserveSlots)) {
      let oi = 0;
      const fillSlot = (arr) => {
        for (let i = 0; i < arr.length && oi < orphans.length; i++) {
          if (!arr[i]) { arr[i] = orphans[oi++]; inSlots.add(arr[i]); }
        }
      };
      fillSlot(team.reserveSlots);
      if (Array.isArray(team.benchSlots)) fillSlot(team.benchSlots);
      if (Array.isArray(team.starterSlots)) fillSlot(team.starterSlots);
    }
  });
}

function offerContractRenewal(player, yearsOffered, salaryOffered) {
  const current = player.salary || 5000;
  let chanceVal = 0.6;
  if (salaryOffered >= current * 1.1) chanceVal += 0.2;
  else if (salaryOffered < current) chanceVal -= 0.3;
  const age = player.age != null ? player.age : 22;
  if (age >= 27) chanceVal += 0.15;
  if (age < 22) chanceVal += 0.1;
  const accepted = Math.random() < Math.max(0, Math.min(1, chanceVal));
  if (accepted) {
    player.contractYears = yearsOffered;
    player.salary = salaryOffered;
    return { accepted: true };
  }
  return { accepted: false, reason: 'wants higher salary' };
}

window.Nexus.generateJobOffers = generateJobOffers;
window.Nexus.acceptJobOffer = acceptJobOffer;
window.Nexus.decrementContracts = decrementContracts;
window.Nexus.offerContractRenewal = offerContractRenewal;
window.Nexus.applyMonthlyCosts = applyMonthlyCosts;
window.Nexus.applySeasonalCost = applySeasonalCost;
window.Nexus.applyMatchRevenue = applyMatchRevenue;
window.Nexus.applyPlacementBonus = applyPlacementBonus;
window.Nexus.applyPrestigeChanges = applyPrestigeChanges;
window.Nexus.checkBankruptcy = checkBankruptcy;
window.Nexus.MAX_YOUTH_ACADEMY = MAX_YOUTH_ACADEMY;
window.Nexus.createYouthProspect = createYouthProspect;
window.Nexus.generateYouthMarket = generateYouthMarket;
window.Nexus.ensureYouthProspectRoleBias = ensureYouthProspectRoleBias;
window.Nexus.promoteYouthToRoster = promoteYouthToRoster;
window.Nexus.signYouthToAcademy = signYouthToAcademy;
window.Nexus.prospectToFullPlayer = prospectToFullPlayer;

// ============================================================
// PROJECT NEXUS – ECONOMY TIMELINE REFACTOR PATCH
// Timeline model, monthly tick hook, bankruptcy guard,
// sponsor at split end, dashboard hook, tier finance refresh.
// ============================================================

function attachTimeline(season) {
  season.timeline = {
    totalMonths: 3,
    currentMonth: 1,
    monthMatchdays: [4, 8, 11],
    monthTriggered: []
  };
}

const _originalCreateSeasonWithSplit = window.Nexus.createSeasonWithSplit;
window.Nexus.createSeasonWithSplit = function(teams) {
  const season = _originalCreateSeasonWithSplit(teams);
  attachTimeline(season);
  if (season.metaHistory && window.Nexus.getCurrentMeta) {
    const initial = window.Nexus.getCurrentMeta();
    if (initial && initial.id) season.metaHistory.push({ atMatchday: 0, metaId: initial.id, metaName: initial.name || initial.id });
  }
  const userTeam = (window.Nexus.getUserTeam && window.Nexus.getUserTeam()) || (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
  season.teams.forEach(team => {
    const effectiveCost = window.Nexus.applySeasonalCost ? window.Nexus.applySeasonalCost(team) : 0;
    if (team.finance) team.finance.revenueThisSeason = 0;
    if (userTeam && team.name === userTeam.name && effectiveCost > 0 && window.Nexus.onFinanceExpense) {
      window.Nexus.onFinanceExpense('Facility maintenance: -$' + effectiveCost.toLocaleString(), 5000);
    }
  });
  return season;
};

function processMonthlyTick(season) {
  const timeline = season.timeline;
  if (!timeline) return;
  const md = season.currentMatchday;
  if (timeline.monthMatchdays.includes(md) && !timeline.monthTriggered.includes(md)) {
    timeline.monthTriggered.push(md);
    const userTeam = (window.Nexus.getUserTeam && window.Nexus.getUserTeam()) || (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
    season.teams.forEach(team => {
      window.Nexus.applyMonthlyCosts(team);
      if (userTeam && team.name === userTeam.name && team.finance && window.Nexus.onFinanceExpense) {
        var coach = window.Nexus.getCoachTier && window.Nexus.getCoachTier(team);
        var amount = (team.finance.monthlyCost || 0) + (coach && coach.monthlySalary || 0);
        if (amount > 0) window.Nexus.onFinanceExpense('Monthly costs: -$' + amount.toLocaleString(), 5000);
      }
    });
    timeline.currentMonth++;
  }
}

function isAnyTeamBankrupt(season) {
  return season.teams.some(team => window.Nexus.checkBankruptcy(team));
}

const _originalPlayNextStage = window.Nexus.playNextStage;
window.Nexus.playNextStage = function(season, environmentMap, meta) {
  const result = _originalPlayNextStage(season, environmentMap, meta);
  if (result && result.finished && season.phase === 'finished' && isAnyTeamBankrupt(season)) {
    result.bankrupt = true;
    season.bankrupt = true;
  }
  if (season.phase === 'regular' && result.matchdayResults && !result.finished) {
    const mainMdJustPlayed = season.currentMatchday - 1;
    if ([0, 2, 4, 6, 10].indexOf(mainMdJustPlayed) !== -1) {
      const chSeason = window.Nexus.CHALLENGER_SEASON;
      if (chSeason && chSeason.currentMatchday < (chSeason.matchdays || []).length && window.Nexus.playNextMatchday) {
        window.Nexus.playNextMatchday(chSeason, environmentMap, meta);
      }
    }
    processMonthlyTick(season);
    // Every 5 matchdays, 50% chance one AI team interacts with market (transfer list or free agents); not the same team as last time
    if (mainMdJustPlayed > 0 && mainMdJustPlayed % 5 === 0 && chance(0.5)) {
      const league = window.Nexus.LEAGUE || [];
      const challengerLeague = window.Nexus.CHALLENGER_LEAGUE || [];
      const allTeams = [...league, ...(challengerLeague || [])];
      const userTeam = league.length > 0 ? league[0] : null;
      const lastBuyerName = season.lastAiMarketBuyerTeamName || '';
      const aiPool = allTeams.filter(function(t) { return t && t !== userTeam && t.name !== lastBuyerName; });
      if (aiPool.length > 0) {
        const picked = aiPool[randomInt(0, aiPool.length - 1)];
        if (window.Nexus.aiInteractWithMarket && window.Nexus.aiInteractWithMarket(picked, season)) {
          season.lastAiMarketBuyerTeamName = picked.name;
        }
      }
    }
  } else if (season.phase === 'regular') {
    processMonthlyTick(season);
  }
  if (season.phase === 'regular' && season.currentMatchday === 2 && !season.aiYouthSignDone) {
    season.aiYouthSignDone = true;
    const Nexus = window.Nexus;
    const league = Nexus.LEAGUE || [];
    const challengerLeague = Nexus.CHALLENGER_LEAGUE || [];
    const allTeams = [...league, ...challengerLeague];
    const userTeam = league.length > 0 ? league[0] : null;
    allTeams.forEach(team => {
      if (team === userTeam) return;
      const academy = team.youthAcademy || [];
      var maxYouth = (Nexus.getMaxYouthAcademySlots && Nexus.getMaxYouthAcademySlots(team)) || 4;
      if (academy.length >= maxYouth) return;
      const players = team.players || [];
      const avgAge = players.length ? players.reduce((s, p) => s + (p.age != null ? p.age : 20), 0) / players.length : 0;
      if (avgAge <= 24 || !chance(0.5)) return;
      const market = Nexus.YOUTH_MARKET || [];
      const shuffled = market.slice().sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffled.length; i++) {
        const prospect = shuffled[i];
        const salary = prospect.salary || 4000;
        const newMonthly = (team.finance && team.finance.monthlyCost || 0) + salary;
        const runway = newMonthly > 0 && team.finance ? Math.floor((team.finance.capital || 0) / newMonthly) : 99;
        if (runway >= 3 && Nexus.signYouthToAcademy) {
          const res = Nexus.signYouthToAcademy(team, prospect);
          if (res.success) break;
        }
      }
    });
  }
  if (season.phase === 'regular' && result.matchdayResults && !result.finished) {
    const league = window.Nexus.LEAGUE || [];
    const userTeam = league.length > 0 ? league[0] : null;
    const mainMdJustPlayed = season.currentMatchday - 1;
    const currentMeta = meta || (window.Nexus.getCurrentMeta ? window.Nexus.getCurrentMeta() : null);
    if (userTeam && window.Nexus.trainPlayer) {
      const env = environmentMap && userTeam.name ? (environmentMap[userTeam.name] || {}) : {};
      (userTeam.players || []).forEach(player => {
        if (player.assignedTrainingPlan && window.Nexus.TRAINING_PLANS && window.Nexus.TRAINING_PLANS[player.assignedTrainingPlan]) {
          window.Nexus.trainPlayer({ player, trainingPlan: player.assignedTrainingPlan, environment: env, meta: currentMeta });
        }
      });
    }
    if (userTeam && (userTeam.youthAcademy || []).length > 0 && window.Nexus.trainYouthProspect && typeof ROLES !== 'undefined') {
      const env = environmentMap && userTeam.name ? (environmentMap[userTeam.name] || {}) : {};
      const seasonForMd = { currentMatchday: mainMdJustPlayed };
      (userTeam.youthAcademy || []).forEach(prospect => {
        if (prospect.lastTrainingMatchday === mainMdJustPlayed) return;
        const primaryRole = (prospect.roleBias && prospect.roleBias.primaryRoleBias) || 'Duelist';
        const roleDef = ROLES[primaryRole];
        const coreStats = (roleDef && roleDef.core) ? roleDef.core.slice(0, 3) : ['aim', 'reaction', 'decisionSpeed'];
        coreStats.forEach(statKey => {
          if (prospect.stats && prospect.stats[statKey] && prospect.stats[statKey].current < prospect.stats[statKey].maxCap) {
            window.Nexus.trainYouthProspect({ team: userTeam, prospect, statKey, environment: env, season: seasonForMd });
          }
        });
      });
    }
    const AI_TRAINING_GROWTH_MULTIPLIER = 0.75;
    (season.teams || []).forEach(team => {
      if (!team || team === userTeam || (userTeam && team.name === userTeam.name)) return;
      const aiEnv = (environmentMap && team.name && environmentMap[team.name]) ? environmentMap[team.name] : { coachQuality: 50 };
      if (aiEnv.coachQuality == null) aiEnv.coachQuality = 50;
      (team.players || []).forEach(player => {
        if (!player.stats) return;
        const plan = (player.assignedTrainingPlan && window.Nexus.TRAINING_PLANS && window.Nexus.TRAINING_PLANS[player.assignedTrainingPlan])
          ? player.assignedTrainingPlan
          : (typeof pickAITrainingPlan === 'function' ? pickAITrainingPlan(player) : PLAYER_TRAINING_PLAN_KEYS[Math.floor(Math.random() * PLAYER_TRAINING_PLAN_KEYS.length)]);
        if (window.Nexus.trainPlayer) {
          window.Nexus.trainPlayer({ player, trainingPlan: plan, environment: aiEnv, meta: currentMeta, growthMultiplier: AI_TRAINING_GROWTH_MULTIPLIER });
        }
      });
    });
  }
  if (result.finished && season.phase === 'finished') {
    if (window.Nexus.applyPlacementBonus) window.Nexus.applyPlacementBonus(season);
    if (window.Nexus.applyPrestigeChanges) window.Nexus.applyPrestigeChanges(season, environmentMap);
    var userTeamSponsor = (window.Nexus.getUserTeam && window.Nexus.getUserTeam()) || (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
    (season.teams || []).forEach(function(t) {
      if (window.Nexus.applySponsorSeasonEnd) {
        var sponsorResult = window.Nexus.applySponsorSeasonEnd(t, season.standings);
        if (userTeamSponsor && t.name === userTeamSponsor.name) {
          if (sponsorResult.success && sponsorResult.message) {
            window.Nexus.showNotification(sponsorResult.message, 'success', 8000);
          } else if (sponsorResult.penalty > 0 && sponsorResult.message) {
            window.Nexus.showNotification(sponsorResult.message, 'error', 10000);
            if (window.Nexus.onFinanceExpense) window.Nexus.onFinanceExpense('Sponsor penalty: -$' + sponsorResult.penalty.toLocaleString(), 8000);
          }
        }
      }
    });
    const CAPITAL_SOFT_CAP = 1600000;
    const CAPITAL_TAX_RATE = 0.12;
    const userTeam = (window.Nexus.getUserTeam && window.Nexus.getUserTeam()) || (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
    season.teams.forEach(team => {
      if (!team.finance || team.finance.capital <= CAPITAL_SOFT_CAP) return;
      const excess = team.finance.capital - CAPITAL_SOFT_CAP;
      const tax = Math.floor(excess * CAPITAL_TAX_RATE);
      team.finance.capital -= tax;
      if (userTeam && team.name === userTeam.name && tax > 0 && window.Nexus.onFinanceExpense) {
        window.Nexus.onFinanceExpense('Excess capital adjustment: -$' + tax.toLocaleString(), 5000);
      }
    });
  }
  return result;
};

window.Nexus.getTimelineInfo = function(season) {
  if (!season || !season.timeline) return null;
  return {
    currentMonth: season.timeline.currentMonth,
    totalMonths: season.timeline.totalMonths
  };
};

function reinitializeFinanceForTier(team) {
  window.Nexus.initializeFinance(team);
}

const _originalResolveRelegationTournament = window.Nexus.resolveRelegationTournament;
window.Nexus.resolveRelegationTournament = function(args) {
  const results = _originalResolveRelegationTournament(args);
  const { mainTeams, challengerTeams } = args;
  [...mainTeams, ...challengerTeams].forEach(team => reinitializeFinanceForTier(team));
  return results;
};

// -------------------------------------------------
// Project Nexus – Save/Load (localStorage)
// -------------------------------------------------

const NEXUS_SAVE_KEY = 'nexusSave';

function buildSeasonSnapshot(season) {
  if (!season) return null;
  const snap = {
    phase: season.phase,
    currentMatchday: season.currentMatchday,
    standings: season.standings,
    matchdays: (season.matchdays || []).map(day =>
      day.map(m => ({ teamA: m.teamA.name, teamB: m.teamB.name, map: m.map }))
    ),
    playedMatchResults: (season.playedMatchResults || []).map(day =>
      (day || []).map(r => ({
        teamA: r.match.teamA.name,
        teamB: r.match.teamB.name,
        map: r.match.map,
        winner: r.result.winner,
        scoreA: r.result.scoreA,
        scoreB: r.result.scoreB
      }))
    ),
    relegationResults: season.relegationResults || null,
    champion: season.champion ? season.champion.name : null,
    timeline: season.timeline || null,
    matchdaysUntilMetaShift: season.matchdaysUntilMetaShift,
    metaHistory: season.metaHistory || [],
    activeMapPool: season.activeMapPool || null,
    lastAiMarketBuyerTeamName: season.lastAiMarketBuyerTeamName || null
  };
  if (season.playoffsBracket) {
    snap.playoffsBracket = {
      round: season.playoffsBracket.round,
      matches: season.playoffsBracket.matches.map(m => ({ teamA: m.teamA.name, teamB: m.teamB.name })),
      finalists: (season.playoffsBracket.finalists || []).map(t => t.name)
    };
  } else snap.playoffsBracket = null;
  snap.relegationCandidates = (season.relegationCandidates || []).map(t => t.name);
  snap.challengerPromotion = (season.challengerPromotion || []).map(t => t.name);
  return snap;
}

function restoreSeasonFromSnapshot(snap, mainTeams, challengerLeague) {
  if (!snap || !mainTeams) return null;
  const allTeams = [...mainTeams, ...(challengerLeague || [])];
  const findTeam = name => allTeams.find(t => t.name === name);

  const matchdays = (snap.matchdays || []).map(day =>
    day.map(m => ({
      teamA: findTeam(m.teamA),
      teamB: findTeam(m.teamB),
      map: m.map
    })).filter(m => m.teamA && m.teamB)
  );

  const playedMatchResults = (snap.playedMatchResults || []).map(day =>
    (day || []).map(r => {
      const teamA = findTeam(r.teamA);
      const teamB = findTeam(r.teamB);
      return {
        match: { teamA, teamB, map: r.map },
        result: { winner: r.winner, scoreA: r.scoreA, scoreB: r.scoreB }
      };
    })
  );

  let playoffsBracket = null;
  if (snap.playoffsBracket && snap.playoffsBracket.matches) {
    playoffsBracket = {
      round: snap.playoffsBracket.round,
      matches: snap.playoffsBracket.matches.map(m => ({
        teamA: findTeam(m.teamA),
        teamB: findTeam(m.teamB)
      })).filter(m => m.teamA && m.teamB),
      finalists: (snap.playoffsBracket.finalists || []).map(name => findTeam(name)).filter(Boolean)
    };
  }

  const activeMapPool = snap.activeMapPool && snap.activeMapPool.length ? snap.activeMapPool : getActiveMapPool();
  const season = {
    teams: mainTeams,
    standings: snap.standings || {},
    matchdays,
    currentMatchday: snap.currentMatchday || 0,
    playedMatchResults,
    phase: snap.phase || 'regular',
    playoffsBracket,
    relegationCandidates: (snap.relegationCandidates || []).map(name => findTeam(name)).filter(Boolean),
    challengerPromotion: (snap.challengerPromotion || []).map(name => findTeam(name)).filter(Boolean),
    relegationResults: snap.relegationResults || null,
    champion: snap.champion ? findTeam(snap.champion) : null,
    timeline: snap.timeline || null,
    matchdaysUntilMetaShift: snap.matchdaysUntilMetaShift != null ? snap.matchdaysUntilMetaShift : 4,
    metaHistory: Array.isArray(snap.metaHistory) ? snap.metaHistory : [],
    activeMapPool,
    lastAiMarketBuyerTeamName: snap.lastAiMarketBuyerTeamName || null
  };
  return season;
}

function restoreChallengerSeasonFromSnapshot(snap, challengerTeams) {
  if (!snap || !challengerTeams || challengerTeams.length === 0) return null;
  const findTeam = name => challengerTeams.find(t => t.name === name);
  const matchdays = (snap.matchdays || []).map(day =>
    day.map(m => ({
      teamA: findTeam(m.teamA),
      teamB: findTeam(m.teamB),
      map: m.map
    })).filter(m => m.teamA && m.teamB)
  );
  const playedMatchResults = (snap.playedMatchResults || []).map(day =>
    (day || []).map(r => {
      const teamA = findTeam(r.teamA);
      const teamB = findTeam(r.teamB);
      return {
        match: { teamA, teamB, map: r.map },
        result: { winner: r.winner, scoreA: r.scoreA, scoreB: r.scoreB }
      };
    })
  );
  return {
    teams: challengerTeams,
    standings: snap.standings || {},
    matchdays,
    currentMatchday: snap.currentMatchday || 0,
    playedMatchResults,
    phase: 'regular'
  };
}

// -------------------------------------------------
// Project Nexus – UI Wiring Layer
// Connects existing HTML buttons to Nexus core logic
// Does NOT modify engine logic.
// Pure bridge layer.
// -------------------------------------------------

function initUI() {
  if (!document.getElementById('app') || !document.querySelector('.menu__item')) return;

  // ===== ROUTING SYSTEM (SPA) =====
  const routeButtons = document.querySelectorAll('.menu__item');
  const pages = document.querySelectorAll('.page');

  const pageTitles = {
    overview: 'Overview',
    roster: 'Roster',
    development: 'Development',
    market: 'Market',
    youth: 'Youth Academy',
    season: 'Season',
    career: 'Career',
    operations: 'Operations'
  };

  const pageSubtitles = {
    overview: 'Organizational status & competitive outlook',
    roster: 'Starting lineup & bench',
    development: 'Training programs & growth',
    market: 'Scouting & transfers',
    youth: 'Academy slots & youth market',
    season: 'League standings & schedule',
    career: 'Season summary & playoff outcome',
    operations: 'Organization management'
  };

  routeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;

      routeButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      pages.forEach(p => {
        p.classList.toggle('is-active', p.dataset.page === route);
      });

      const titleEl = document.getElementById('uiPageTitle');
      const subEl = document.getElementById('uiPageSubtitle');
      if (titleEl) titleEl.textContent = pageTitles[route] || btn.textContent;
      if (subEl) subEl.textContent = pageSubtitles[route] || '';

      if (route === 'career') updateCareerUI(season);
      if (route === 'roster') {
        updateRosterUI();
        const team = userTeamRef();
        const finalYear = (team && team.players) ? team.players.filter(p => (p.contractYears != null ? p.contractYears : 1) === 1) : [];
        if (finalYear.length > 0 && document.getElementById('nexus-contract-toast') == null) {
          const content = document.getElementById('app') || document.body;
          const toast = document.createElement('div');
          toast.id = 'nexus-contract-toast';
          toast.className = 'toast toast--contract';
          toast.textContent = finalYear.length + ' player(s) in final year of contract — consider renewals.';
          content.insertBefore(toast, content.firstChild);
          setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3500);
        }
      }
      if (route === 'market') renderTransferMarket(season, userTeamRef());
      if (route === 'youth' && typeof updateYouthAcademyUI === 'function') updateYouthAcademyUI(userTeamRef());
      if (route === 'development' && typeof updateDevelopmentUI === 'function') updateDevelopmentUI();
      if (route === 'operations' && typeof updateOperationsUI === 'function') updateOperationsUI();
    });
  });

  const marketRole = document.getElementById('marketFilterRole');
  const marketAge = document.getElementById('marketFilterAge');
  const marketPrice = document.getElementById('marketFilterPrice');
  [marketRole, marketAge, marketPrice].forEach(el => {
    if (el) el.addEventListener('change', () => { if (season) renderTransferMarket(season, userTeamRef()); });
  });

  // ===== GAME STATE (shared across UI) — load or init fresh =====
  let league, challengerLeague, season, challengerSeason = null, seasonHistory = [], cycleCount = 1, environmentMap, meta;
  let transferHistory = [];
  let pendingSeasonEnd = null;
  let pendingAfterMatchResult = null;
  let currentJobOffers = [];
  let openMarketPlayerModalRef = null;
  let openOtherTeamRosterModalRef = null;
  let pendingBankruptcy = false;
  let isBankruptcyJobOffers = false;
  let pendingBankruptcyOnLoad = false;
  const userTeamRef = () => league && league[0];

  window.Nexus.recordTransferEvent = function(ev) {
    if (ev && ev.teamName) {
      transferHistory.push(ev);
      if (transferHistory.length > 80) transferHistory = transferHistory.slice(-80);
    }
  };

  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(NEXUS_SAVE_KEY) : null;
  if (saved) {
    try {
      const loaded = JSON.parse(saved);
      league = loaded.mainTeams || null;
      challengerLeague = loaded.challengerTeams || [];
      if (!league || !Array.isArray(league) || league.length === 0) throw new Error('No main teams');
      window.Nexus.LEAGUE = league;
      window.Nexus.CHALLENGER_LEAGUE = challengerLeague;
      seasonHistory = loaded.seasonHistory || [];
      cycleCount = loaded.cycleCount || 1;
      environmentMap = loaded.environmentMap || {};
      transferHistory = Array.isArray(loaded.transferHistory) ? loaded.transferHistory : [];
      if (loaded.pendingBankruptcy === true) pendingBankruptcyOnLoad = true;
      if (loaded.metaId && Nexus.setCurrentMetaPatch) Nexus.setCurrentMetaPatch(loaded.metaId);
      meta = Nexus.getCurrentMeta ? Nexus.getCurrentMeta() : Nexus.createMeta({ favoredRoles: ['Duelist'], tempo: 65 });
      season = restoreSeasonFromSnapshot(loaded.seasonSnapshot, league, challengerLeague);
      if (!season) throw new Error('Restore season failed');
      challengerSeason = restoreChallengerSeasonFromSnapshot(loaded.challengerSeasonSnapshot, challengerLeague);
      if (!challengerSeason && challengerLeague && challengerLeague.length && Nexus.createChallengerSeasonFromTeams)
        challengerSeason = Nexus.createChallengerSeasonFromTeams(challengerLeague);
      if (challengerSeason) window.Nexus.CHALLENGER_SEASON = challengerSeason;
      window.Nexus.YOUTH_MARKET = (loaded.youthMarket && loaded.youthMarket.length) ? loaded.youthMarket : (Nexus.generateYouthMarket ? Nexus.generateYouthMarket() : []);
      (window.Nexus.YOUTH_MARKET || []).forEach(function(p) {
        if (Nexus.ensureYouthProspectRoleBias) Nexus.ensureYouthProspectRoleBias(p);
      });
      [league, challengerLeague].forEach(teams => {
        (teams || []).forEach(team => {
          team.youthAcademy = team.youthAcademy || [];
          (team.youthAcademy || []).forEach(function(p) {
            if (Nexus.ensureYouthProspectRoleBias) Nexus.ensureYouthProspectRoleBias(p);
          });
        });
      });
      [league, challengerLeague].forEach(teams => {
        (teams || []).forEach(team => {
          if (Nexus.syncTeamEnvironmentFromTiers) Nexus.syncTeamEnvironmentFromTiers(team, environmentMap);
        });
      });
      [league, challengerLeague].forEach(teams => {
        (teams || []).forEach(team => {
          if (Nexus.syncPressureToPrestige) Nexus.syncPressureToPrestige(team, environmentMap);
        });
      });
      registerUsedPlayerNamesFromTeams(league);
      registerUsedPlayerNamesFromTeams(challengerLeague);
      [league, challengerLeague].forEach(teams => {
        (teams || []).forEach(team => {
          (team.players || []).forEach(p => {
            if (p.age == null) p.age = 20;
            if (Nexus.initializeContractForPlayer) Nexus.initializeContractForPlayer(p);
          });
        });
      });
      var teamKeys = Nexus.TEAM_TRAINING_PLAN_KEYS || [];
      var userTeamForTraining = league && league[0];
      if (teamKeys.length) {
        [league, challengerLeague].forEach(teams => {
          (teams || []).forEach(team => {
            if (!team.activeTeamTraining || !teamKeys.includes(team.activeTeamTraining)) {
              team.activeTeamTraining = team === userTeamForTraining ? teamKeys[0] : teamKeys[Math.floor(Math.random() * teamKeys.length)];
            }
          });
        });
      }
      var userTeam = league && league[0];
      if (userTeam && userTeam.players) {
        var ps = userTeam.players;
        userTeam.starterSlots = [];
        for (var i = 0; i < 5; i++) userTeam.starterSlots.push(ps[i] || null);
        userTeam.benchSlots = [];
        for (var j = 0; j < 5; j++) userTeam.benchSlots.push(ps[5 + j] || null);
        userTeam.reserveSlots = [];
        for (var k = 0; k < 6; k++) userTeam.reserveSlots.push(ps[10 + k] || null);
      }
      if (season && season.transferMarket == null) season.transferMarket = [];
      if (season && season.transferMarketRefreshCountdown == null) season.transferMarketRefreshCountdown = 3;
      if (season && Nexus.refreshTransferMarket && league && league[0] && (season.transferMarket.length === 0 || !season.transferMarket))
        Nexus.refreshTransferMarket(season, [...league, ...(challengerLeague || [])], league[0].name);
      if (season.phase === 'finished') {
        var userTeamForEnd = league && league[0];
        if (userTeamForEnd && !(season.bankrupt && Nexus.checkBankruptcy && Nexus.checkBankruptcy(userTeamForEnd))) {
          var useChallengerForPositionLoad = userTeamForEnd.tier === 'Challenger' && challengerSeason && challengerSeason.standings;
          var standingsForPositionLoad = useChallengerForPositionLoad ? challengerSeason.standings : season.standings;
          var sortedLoad = Nexus.getSortedStandings(standingsForPositionLoad);
          var posIndexLoad = sortedLoad.findIndex(function(t) { return t.teamName === userTeamForEnd.name; });
          var positionLoad = posIndexLoad === -1 ? null : posIndexLoad + 1;
          var recLoad = standingsForPositionLoad[userTeamForEnd.name] ? { w: standingsForPositionLoad[userTeamForEnd.name].wins, l: standingsForPositionLoad[userTeamForEnd.name].losses } : { w: 0, l: 0 };
          var outcomeLoad = '—';
          var champNameLoad = season.champion != null ? (typeof season.champion === 'object' ? season.champion.name : season.champion) : null;
          if (champNameLoad === userTeamForEnd.name) outcomeLoad = 'Championship: Winner';
          else if (season.relegationCandidates && season.relegationCandidates.some(function(t) { return t.name === userTeamForEnd.name; })) {
            var relLoad = (season.relegationResults || []).find(function(r) { return r.mainTeam === userTeamForEnd.name; });
            outcomeLoad = relLoad ? (relLoad.winner === userTeamForEnd.name ? 'Relegation: Stayed in Main' : 'Relegation: Relegated to Challenger') : 'Relegation: Stayed in Main';
          } else if (season.challengerPromotion && season.challengerPromotion.some(function(t) { return t.name === userTeamForEnd.name; })) {
            var relLoad2 = (season.relegationResults || []).find(function(r) { return r.challengerTeam === userTeamForEnd.name; });
            outcomeLoad = relLoad2 ? (relLoad2.winner === userTeamForEnd.name ? 'Challenger Championship: Promoted to Main' : 'Challenger Championship: Stayed in Challenger') : 'Challenger Championship: Stayed in Challenger';
          } else if (userTeamForEnd.tier === 'Challenger') {
            outcomeLoad = 'Challenger: ' + (positionLoad === 1 ? '1st' : positionLoad === 2 ? '2nd' : positionLoad === 3 ? '3rd' : (positionLoad + 'th'));
          } else outcomeLoad = 'Championship Playoffs: Eliminated';
          var currentMainTeamsLoad = [...league, ...(challengerLeague || [])].filter(function(t) { return t.tier === 'Main'; });
          if (currentMainTeamsLoad.length === 12) {
            pendingSeasonEnd = { season: season, result: { finished: true }, position: positionLoad, rec: recLoad, outcome: outcomeLoad };
          }
        }
      }
    } catch (e) {
      league = null;
    }
  }

  if (!league) {
    league = window.Nexus.LEAGUE;
    challengerLeague = window.Nexus.CHALLENGER_LEAGUE || [];
    meta = Nexus.getCurrentMeta ? Nexus.getCurrentMeta() : Nexus.createMeta({ favoredRoles: ['Duelist'], tempo: 65 });
    environmentMap = {};
    league.forEach(team => {
      environmentMap[team.name] = Nexus.createEnvironment({
        coachQuality: 50 + Math.floor(Math.random() * 20),
        infrastructure: 50,
        psychologySupport: 50,
        pressure: 50
      });
    });
    (challengerLeague || []).forEach(team => {
      environmentMap[team.name] = Nexus.createEnvironment({
        coachQuality: 35 + Math.floor(Math.random() * 25),
        infrastructure: 40,
        psychologySupport: 40,
        pressure: 45
      });
    });
    [league, challengerLeague].forEach(teams => {
      (teams || []).forEach(team => {
        if (team.coachTierLevel == null) team.coachTierLevel = 1;
        if (team.facilityTierLevel == null) team.facilityTierLevel = 1;
        if (team.psychologyLevel == null) team.psychologyLevel = 1;
        if (Nexus.syncTeamEnvironmentFromTiers) Nexus.syncTeamEnvironmentFromTiers(team, environmentMap);
      });
    });
    league.forEach(team => Nexus.initializeFinance(team));
    (challengerLeague || []).forEach(team => Nexus.initializeFinance(team));
    const layoutEl = document.querySelector('.layout');
    const teamSelEl = document.getElementById('teamSelectionScreen');
    if (layoutEl) layoutEl.style.display = 'none';
    if (teamSelEl) teamSelEl.style.display = 'flex';
    renderTeamSelection(league);
  }

  function renderTeamSelection(teams) {
    const screen = document.getElementById('teamSelectionScreen');
    const grid = document.getElementById('teamSelectionGrid');
    if (!screen || !grid) return;
    grid.innerHTML = '';
    (teams || []).forEach((team, idx) => {
      const card = document.createElement('div');
      card.className = 'team-card';
      const prestige = team.prestige != null ? team.prestige : 50;
      const budget = team.finance ? team.finance.capital : 1100000;
      const avgOverall = team.players && team.players.length
        ? Math.round(team.players.reduce((sum, p) => sum + (Nexus.getPlayerOverall ? Nexus.getPlayerOverall(p) : 70), 0) / team.players.length)
        : 70;
      card.innerHTML = `
        <div class="team-card__name">${team.name}</div>
        <div class="team-card__stats">
          <div class="stat"><span class="stat__label">Prestige</span><span class="stat__value">${prestige}</span></div>
          <div class="stat"><span class="stat__label">Budget</span><span class="stat__value">$${(budget / 1000000).toFixed(1)}M</span></div>
          <div class="stat"><span class="stat__label">Squad Rating</span><span class="stat__value">${avgOverall}</span></div>
        </div>
        <button type="button" class="btn btn--select" data-team-index="${idx}">Select</button>
      `;
      card.querySelector('.btn--select').addEventListener('click', () => selectTeam(idx));
      grid.appendChild(card);
    });
    screen.style.display = 'flex';
  }

  function selectTeam(teamIndex) {
    if (league == null || !league[teamIndex]) return;
    [league[0], league[teamIndex]] = [league[teamIndex], league[0]];
    window.Nexus.LEAGUE = league;
    const layoutEl = document.querySelector('.layout');
    const teamSelEl = document.getElementById('teamSelectionScreen');
    if (teamSelEl) teamSelEl.style.display = 'none';
    if (layoutEl) layoutEl.style.display = 'flex';
    season = Nexus.createSeasonWithSplit(league);
    challengerSeason = Nexus.createChallengerSeasonFromTeams && Nexus.createChallengerSeasonFromTeams(challengerLeague || []);
    if (challengerSeason) window.Nexus.CHALLENGER_SEASON = challengerSeason;
    const teamTrainingKeys = Nexus.TEAM_TRAINING_PLAN_KEYS || [];
    const allTeamsForTraining = [...league, ...(challengerLeague || [])];
    const userTeamObj = league[0];
    if (teamTrainingKeys.length) {
      userTeamObj.activeTeamTraining = (userTeamObj.activeTeamTraining && teamTrainingKeys.includes(userTeamObj.activeTeamTraining))
        ? userTeamObj.activeTeamTraining : teamTrainingKeys[0];
      allTeamsForTraining.forEach(team => {
        if (team === userTeamObj) return;
        team.activeTeamTraining = teamTrainingKeys[Math.floor(Math.random() * teamTrainingKeys.length)];
      });
    }
    if (Nexus.initializeMomentum) Nexus.initializeMomentum(season);
    if (Nexus.refreshTransferMarket) Nexus.refreshTransferMarket(season, [...league, ...(challengerLeague || [])], league[0].name);
    window.Nexus.YOUTH_MARKET = (Nexus.generateYouthMarket && Nexus.generateYouthMarket()) || [];
    setupContractOfferModal();
    setupPlayerDetailModal();
    setupMarketPlayerModal();
    setupYouthAcademyPlayerModal();
    setupOtherTeamRosterModal();
    updateFixtureUI(season);
    updateStandingsUI(season);
    updateScheduleUI(season);
    updateCareerUI(season);
    updateFinanceUI(league[0]);
    updateRosterUI();
    updateCycleUI();
    saveGameState();
  }

  function saveGameState() {
    const snapshot = buildSeasonSnapshot(season);
    const challengerSnapshot = challengerSeason ? buildSeasonSnapshot(challengerSeason) : null;
    const payload = {
      mainTeams: league,
      challengerTeams: challengerLeague,
      seasonSnapshot: snapshot,
      challengerSeasonSnapshot: challengerSnapshot,
      seasonHistory,
      cycleCount,
      environmentMap,
      transferHistory: transferHistory || [],
      metaId: meta && meta.id ? meta.id : null,
      meta: meta && meta.tempo != null ? { favoredRoles: meta.favoredRoles, tempo: meta.tempo } : { favoredRoles: ['Duelist'], tempo: 65 },
      youthMarket: window.Nexus.YOUTH_MARKET || [],
      pendingBankruptcy: pendingBankruptcy || undefined
    };
    try {
      localStorage.setItem(NEXUS_SAVE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      return false;
    }
  }

  function updateCycleUI() {
    const el = document.getElementById('uiCycle');
    if (el) el.textContent = String(cycleCount);
    const tierEl = document.getElementById('uiTier');
    if (tierEl && userTeamRef()) tierEl.textContent = userTeamRef().tier || 'Main';
  }

  // ===== META CHANGED NOTIFICATION =====
  function showMetaChangedNotification() {
    const existing = document.getElementById('nexus-meta-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'nexus-meta-toast';
    toast.className = 'toast toast--meta';
    toast.textContent = 'Meta changed!';
    const content = document.querySelector('.content');
    if (content) {
      content.insertBefore(toast, content.firstChild);
      setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2500);
    }
  }

  function showMapRotationNotification(mapsAdded, mapsRemoved) {
    const existing = document.getElementById('nexus-map-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'nexus-map-toast';
    toast.className = 'toast toast--maps';
    const added = (mapsAdded || []).join(', ');
    const removed = (mapsRemoved || []).join(', ');
    toast.innerHTML = '<strong>Map Rotation</strong><br><span class="toast__added">+ ' + added + '</span><br><span class="toast__removed">− ' + removed + '</span>';
    const content = document.querySelector('.content');
    if (content) {
      content.insertBefore(toast, content.firstChild);
      setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4000);
    }
  }

  function continueSeasonTransition() {
    const data = pendingSeasonEnd;
    if (!data) return;
    pendingSeasonEnd = null;
    const { season: finishedSeason, result: finishResult, position, rec, outcome } = data;
    const prevChampion = finishedSeason.champion != null
      ? (typeof finishedSeason.champion === 'object' ? finishedSeason.champion.name : finishedSeason.champion)
      : null;
    const relegationResults = (finishResult.relegationResults && finishResult.relegationResults.length)
      ? finishResult.relegationResults
      : (finishedSeason.relegationResults || []);
    cycleCount++;
    const allTeams = [...league, ...(challengerLeague || [])];
    const currentMainTeams = allTeams.filter(t => t.tier === 'Main');
    const userTeamForPromo = league && league[0] ? league[0] : null;
    // AI teams: 60% chance to promote each 17yo from academy to roster (before they age to 18)
    allTeams.forEach(team => {
      if (team === userTeamForPromo) return;
      const academy = team.youthAcademy || [];
      const seventeenYos = academy.filter(p => (p.age || 0) === 17);
      seventeenYos.forEach(prospect => {
        if ((team.players || []).length >= MAX_ROSTER_SIZE) return;
        if (!chance(0.6)) return;
        if (Nexus.promoteYouthToRoster) {
          const res = Nexus.promoteYouthToRoster(team, prospect);
          if (res.success) return;
        }
      });
    });
    Nexus.incrementPlayerAges(allTeams);
    allTeams.forEach(team => {
      (team.players || []).forEach(player => {
        if (Nexus.applyAgeBasedGrowth) Nexus.applyAgeBasedGrowth(player, environmentMap[team.name] || {}, meta);
      });
    });
    const retirementsRaw = Nexus.processRetirements ? Nexus.processRetirements(allTeams) : [];
    const retirements = Array.isArray(retirementsRaw) && retirementsRaw.length > 0 && retirementsRaw[0].player != null
      ? retirementsRaw.map(r => r.player)
      : retirementsRaw;
    const retiredCount = retirements.length;
    const userTeamForRetired = userTeamRef();
    const userRetiredCount = Array.isArray(retirementsRaw) && retirementsRaw[0] && retirementsRaw[0].team != null
      ? retirementsRaw.filter(r => r.team === userTeamForRetired).length
      : 0;
    if (Nexus.decrementContracts) Nexus.decrementContracts(allTeams);
    // Cap free agents after new season inflows (no contract + youth 18+); keep best 30 by overall
    const freeAgents = window.Nexus.FREE_AGENTS || [];
    if (freeAgents.length > 30) {
      const getOverall = window.Nexus.getPlayerOverall || (p => (p.stats && typeof STAT_KEYS !== 'undefined' ? Math.round(STAT_KEYS.reduce((s, k) => s + ((p.stats[k] && p.stats[k].current) || 0), 0) / STAT_KEYS.length) : 70));
      window.Nexus.FREE_AGENTS = freeAgents
        .slice()
        .sort((a, b) => getOverall(b) - getOverall(a))
        .slice(0, 30);
    }
    const winsFinished = rec && typeof rec.w === 'number' ? rec.w : 0;
    const lossesFinished = rec && typeof rec.l === 'number' ? rec.l : 0;
    const gpFinished = winsFinished + lossesFinished;
    const winRateFinished = gpFinished > 0 ? winsFinished / gpFinished : null;
    seasonHistory.push({
      cycle: cycleCount,
      champion: prevChampion,
      position,
      record: rec,
      outcome,
      retiredCount,
      winRate: winRateFinished
    });
    if (Nexus.getRandomMetaPatch) Nexus.getRandomMetaPatch();
    meta = Nexus.getCurrentMeta ? Nexus.getCurrentMeta() : meta;
    const mapRotation = Nexus.rotateMapPool ? Nexus.rotateMapPool() : null;
    season = Nexus.createSeasonWithSplit(currentMainTeams);
    const currentChallengerTeams = allTeams.filter(t => t.tier === 'Challenger');
    challengerSeason = Nexus.createChallengerSeasonFromTeams && Nexus.createChallengerSeasonFromTeams(currentChallengerTeams);
    if (challengerSeason) window.Nexus.CHALLENGER_SEASON = challengerSeason;
    if (Nexus.initializeMomentum) Nexus.initializeMomentum(season);
    if (Nexus.refreshTransferMarket) Nexus.refreshTransferMarket(season, allTeams, (league && league[0]) ? league[0].name : null);
    window.Nexus.YOUTH_MARKET = (Nexus.generateYouthMarket && Nexus.generateYouthMarket()) || [];
    let mapsText = '—';
    if (mapRotation && (mapRotation.mapsAdded.length || mapRotation.mapsRemoved.length)) {
      const added = (mapRotation.mapsAdded || []).join(', ');
      const removed = (mapRotation.mapsRemoved || []).join(', ');
      mapsText = '+ ' + (added || '—') + ' | − ' + (removed || '—');
      showMapRotationNotification(mapRotation.mapsAdded, mapRotation.mapsRemoved);
    }
    if (typeof console !== 'undefined' && console.log) {
      console.log('[Season end] prevChampion:', prevChampion, 'relegationResults:', relegationResults.length, 'retiredCount:', retiredCount);
    }
    const mainStandingsFinal = Nexus.getSortedStandings(finishedSeason.standings || {});
    const mainTop4 = mainStandingsFinal.slice(0, 8).map((t, idx) =>
      (idx + 1) + '. ' + t.teamName + ' — ' + (t.wins || 0) + 'W-' + (t.losses || 0) + 'L'
    ).join('\n');
    const mainBottom2 = mainStandingsFinal.slice(-2).map((t, idx, arr) => {
      const pos = mainStandingsFinal.length - arr.length + idx + 1;
      return pos + '. ' + t.teamName + ' — ' + (t.wins || 0) + 'W-' + (t.losses || 0) + 'L';
    }).join('\n');
    let challengerTop2 = '—';
    if (challengerSeason && challengerSeason.standings) {
      const chSorted = Nexus.getSortedStandings(challengerSeason.standings || {});
      challengerTop2 = chSorted.slice(0, 4).map((t, idx) =>
        (idx + 1) + '. ' + t.teamName + ' — ' + (t.wins || 0) + 'W-' + (t.losses || 0) + 'L'
      ).join('\n');
    }
    const retiredText = retiredCount > 0
      ? (retiredCount <= 5
        ? retirements.map(p => getPlayerDisplayName(p) + ' (' + (p.age || '?') + ')').join(', ')
        : retiredCount + ' players')
      : 'None';
    const relegationText = relegationResults.length
      ? relegationResults.map(r => r.mainTeam + ' vs ' + r.challengerTeam + ' → ' + r.winner).join('\n')
      : '—';
    const winRatePercent = winRateFinished != null ? Math.round(winRateFinished * 100) + '%' : '—';
    const seasonNumber = (data && data.season && data.season.cycle) ? data.season.cycle : (cycleCount - 1);

    const userTeam = userTeamRef();
    pendingAfterMatchResult = function() {
      updateFixtureUI(season);
      updateStandingsUI(season);
      updateScheduleUI(season);
      updateCareerUI(season);
      updateFinanceUI(userTeam);
      updateCycleUI();
      saveGameState();
      if (userRetiredCount > 0) {
        showNotification(userRetiredCount === 1
          ? '1 player from your team retired last season.'
          : userRetiredCount + ' players from your team retired last season.', 'info', 10000);
      }
    };

    showSeasonStatsPage({
      seasonNumber,
      nextSeasonNumber: cycleCount,
      championName: prevChampion || '—',
      retiredText,
      relegationText,
      mapsText,
      mainTop4Text: mainTop4 || '—',
      mainBottom2Text: mainBottom2 || '—',
      challengerTop2Text: challengerTop2,
      winRateText: winRatePercent
    });
  }

  function renderJobOffers(offers, userTeam) {
    const modal = document.getElementById('jobOffersModal');
    const list = document.getElementById('jobOffersList');
    if (!modal || !list) return;
    if (!offers || offers.length === 0) {
      modal.style.display = 'none';
      return;
    }
    list.innerHTML = '';
    offers.forEach((offer, idx) => {
      const card = document.createElement('div');
      card.className = 'job-offer-card';
      const budget = offer.team.finance ? offer.team.finance.capital : 0;
      const prestige = offer.team.prestige != null ? offer.team.prestige : 50;
      card.innerHTML = `
        <div class="job-offer-card__header">
          <strong>${offer.team.name}</strong>
          <span class="badge badge--tier">${offer.team.tier || 'Main'}</span>
        </div>
        <div class="job-offer-card__info">
          <div class="info-row"><span>Prestige</span><span>${prestige}</span></div>
          <div class="info-row"><span>Budget</span><span>$${(budget || 0).toLocaleString()}</span></div>
          <div class="info-row"><span>Salary</span><span>$${(offer.salary || 0).toLocaleString()}/month</span></div>
        </div>
        <p class="job-offer-card__reason">"${offer.reason || ''}"</p>
        <button type="button" class="btn btn--accept" data-offer-index="${idx}">Accept Offer</button>
      `;
      const btn = card.querySelector('.btn--accept');
      btn.addEventListener('click', () => {
        const selectedOffer = currentJobOffers[parseInt(btn.getAttribute('data-offer-index'), 10)];
        if (!selectedOffer) return;
        const confirmMsg = 'Accept ' + selectedOffer.team.name + "'s offer? You will leave " + (userTeam ? userTeam.name : '') + '.';
        showConfirm(confirmMsg, () => {
          const userTeam = userTeamRef();
          if (isBankruptcyJobOffers && userTeam && userTeam.finance) {
            userTeam.finance.capital = (userTeam.finance.capital || 0) + 300000;
            pendingBankruptcy = false;
            isBankruptcyJobOffers = false;
          }
          const result = Nexus.acceptJobOffer(selectedOffer, league, challengerLeague);
          league = result.league;
          challengerLeague = result.challengerLeague;
          window.Nexus.LEAGUE = league;
          window.Nexus.CHALLENGER_LEAGUE = challengerLeague;
          const jobModal = document.getElementById('jobOffersModal');
          if (jobModal) jobModal.style.display = 'none';
          showNotification('You are now manager of ' + selectedOffer.team.name + '!', 'success');
          currentJobOffers = [];
          continueSeasonTransition();
        });
      });
      list.appendChild(card);
    });
  }

  const btnDeclineOffers = document.getElementById('btnDeclineAllOffers');
  if (btnDeclineOffers) {
    btnDeclineOffers.addEventListener('click', () => {
      const jobModal = document.getElementById('jobOffersModal');
      if (jobModal) jobModal.style.display = 'none';
      currentJobOffers = [];
      if (isBankruptcyJobOffers) {
        isBankruptcyJobOffers = false;
        const bm = document.getElementById('bankruptcyModal');
        if (bm) bm.style.display = 'flex';
      } else {
        continueSeasonTransition();
      }
    });
  }
  const jobModalOverlay = document.querySelector('#jobOffersModal .modal__overlay');
  if (jobModalOverlay) {
    jobModalOverlay.addEventListener('click', () => {
      document.getElementById('jobOffersModal').style.display = 'none';
      currentJobOffers = [];
      if (isBankruptcyJobOffers) {
        isBankruptcyJobOffers = false;
        const bm = document.getElementById('bankruptcyModal');
        if (bm) bm.style.display = 'flex';
      } else {
        continueSeasonTransition();
      }
    });
  }

  const btnBankruptcyJobOffers = document.getElementById('btnBankruptcyJobOffers');
  const btnBankruptcyNewCareer = document.getElementById('btnBankruptcyNewCareer');
  if (btnBankruptcyJobOffers) {
    btnBankruptcyJobOffers.addEventListener('click', () => {
      const bm = document.getElementById('bankruptcyModal');
      if (bm) bm.style.display = 'none';
      const userTeam = userTeamRef();
      if (!userTeam) return;
      const allTeams = [...(league || []), ...(challengerLeague || [])];
      let offers = Nexus.generateJobOffers ? Nexus.generateJobOffers(userTeam, 'bankrupt', cycleCount, allTeams, season) : [];
      if (offers.length === 0) {
        const other = allTeams.filter(t => t && t.name !== userTeam.name);
        const userSalary = userTeam.finance && userTeam.finance.monthlyCost != null ? userTeam.finance.monthlyCost : 100000;
        if (other.length) offers = [{ team: other[0], salary: Math.round(userSalary * 0.85), reason: 'New opportunity' }];
      }
      currentJobOffers = offers;
      isBankruptcyJobOffers = true;
      renderJobOffers(currentJobOffers, userTeam);
      const jobModal = document.getElementById('jobOffersModal');
      if (jobModal) jobModal.style.display = 'flex';
    });
  }
  if (btnBankruptcyNewCareer) {
    btnBankruptcyNewCareer.addEventListener('click', () => {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(NEXUS_SAVE_KEY);
      window.location.reload();
    });
  }

  function showMatchResultPage(match, matchResult, seasonData) {
    const overlay = document.getElementById('matchResultPage');
    const content = document.getElementById('matchResultPageContent');
    if (!overlay || !content) return;
    const teamA = match.teamA;
    const teamB = match.teamB;
    const scoreStr = (matchResult.scoreA != null && matchResult.scoreB != null)
      ? (matchResult.scoreA + ' – ' + matchResult.scoreB)
      : '—';
    const stage = matchResult && matchResult.stage;
    const titleEl = document.getElementById('matchResultTitle');
    if (titleEl) {
      if (stage === 'playoffs') titleEl.textContent = 'Playoffs Result';
      else if (stage === 'relegation') titleEl.textContent = 'Relegation Result';
      else titleEl.textContent = 'Match Result';
    }
    document.getElementById('matchResultTeamA').textContent = teamA ? teamA.name : '—';
    document.getElementById('matchResultScore').textContent = scoreStr;
    document.getElementById('matchResultTeamB').textContent = teamB ? teamB.name : '—';
    document.getElementById('matchResultMap').textContent = match.map || '—';
    const mvp = (typeof pickMatchMVP === 'function')
      ? pickMatchMVP(matchResult.winner, matchResult.playerPerformances)
      : null;
    document.getElementById('matchResultMVP').textContent = mvp ? (typeof getPlayerDisplayName === 'function' ? getPlayerDisplayName(mvp) : (mvp.firstName || 'Player')) : '—';
    const mainList = document.getElementById('matchResultMainStandings');
    mainList.innerHTML = '';
    const chList = document.getElementById('matchResultChallengerStandings');
    chList.innerHTML = '';

    // Per-player ratings: our team vs opponent
    const userTeam = userTeamRef();
    const perf = (matchResult && matchResult.playerPerformances) || {};
    let ourKey = null;
    let oppKey = null;
    if (userTeam && (teamA === userTeam || teamB === userTeam)) {
      ourKey = userTeam.name;
      const oppTeam = teamA === userTeam ? teamB : teamA;
      oppKey = oppTeam && oppTeam.name;
    } else {
      // Fallback: treat teamA as "our" and teamB as "opponent"
      ourKey = teamA && teamA.name;
      oppKey = teamB && teamB.name;
    }
    const ourList = (ourKey && perf[ourKey]) ? perf[ourKey].slice() : [];
    const oppList = (oppKey && perf[oppKey]) ? perf[oppKey].slice() : [];

    const sortByRating = function(a, b) {
      const ra = (a && typeof a.rating === 'number') ? a.rating : (a.matchPower || 0);
      const rb = (b && typeof b.rating === 'number') ? b.rating : (b.matchPower || 0);
      return rb - ra;
    };

    ourList.sort(sortByRating);
    oppList.sort(sortByRating);

    ourList.forEach(function(x) {
      if (!x || !x.player) return;
      const row = document.createElement('div');
      row.className = 'match-result__standings-row';
      const name = typeof getPlayerDisplayName === 'function'
        ? getPlayerDisplayName(x.player)
        : (x.player.firstName || 'Player');
      const ratingVal = (typeof x.rating === 'number') ? x.rating.toFixed(1) : null;
      const ratingStr = ratingVal != null ? (ratingVal + '/10') : '—';
      row.textContent = name + ' — ' + ratingStr;
      mainList.appendChild(row);
    });

    oppList.forEach(function(x) {
      if (!x || !x.player) return;
      const row = document.createElement('div');
      row.className = 'match-result__standings-row';
      const name = typeof getPlayerDisplayName === 'function'
        ? getPlayerDisplayName(x.player)
        : (x.player.firstName || 'Player');
      const ratingVal = (typeof x.rating === 'number') ? x.rating.toFixed(1) : null;
      const ratingStr = ratingVal != null ? (ratingVal + '/10') : '—';
      row.textContent = name + ' — ' + ratingStr;
      chList.appendChild(row);
    });
    content.classList.remove('match-result--playoffs', 'match-result--relegation');
    if (stage === 'playoffs') content.classList.add('match-result--playoffs');
    else if (stage === 'relegation') content.classList.add('match-result--relegation');
    overlay.classList.remove('is-hidden');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function hideMatchResultPage() {
    const overlay = document.getElementById('matchResultPage');
    if (overlay) {
      overlay.classList.add('is-hidden');
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  const matchResultContinueBtn = document.getElementById('matchResultContinue');
  if (matchResultContinueBtn) {
    matchResultContinueBtn.addEventListener('click', function() {
      hideMatchResultPage();
      if (typeof pendingAfterMatchResult === 'function') {
        pendingAfterMatchResult();
        pendingAfterMatchResult = null;
      }
    });
  }

  function showSeasonStatsPage(args) {
    const {
      seasonNumber,
      nextSeasonNumber,
      championName,
      retiredText,
      relegationText,
      mapsText,
      mainTop4Text,
      mainBottom2Text,
      challengerTop2Text,
      winRateText
    } = args || {};
    const overlay = document.getElementById('seasonStatsPage');
    const content = document.getElementById('seasonStatsPageContent');
    if (!overlay || !content) return;
    const titleEl = document.getElementById('seasonStatsTitle');
    const subtitleEl = document.getElementById('seasonStatsSubtitle');
    const champEl = document.getElementById('seasonStatsChampion');
    const retiredEl = document.getElementById('seasonStatsRetired');
    const relegEl = document.getElementById('seasonStatsRelegation');
    const mapsEl = document.getElementById('seasonStatsMaps');
    const mainTop4El = document.getElementById('seasonStatsMainTop4');
    const mainBottom2El = document.getElementById('seasonStatsMainBottom2');
    const challTop2El = document.getElementById('seasonStatsChallengerTop2');
    const winRateEl = document.getElementById('seasonStatsWinRate');
    if (!titleEl || !subtitleEl || !champEl || !retiredEl || !relegEl || !mapsEl || !mainTop4El || !mainBottom2El || !challTop2El || !winRateEl) return;
    const prevLabel = seasonNumber != null ? seasonNumber : cycleCount - 1;
    const nextLabel = nextSeasonNumber != null ? nextSeasonNumber : cycleCount;
    titleEl.textContent = 'Season ' + prevLabel + ' Complete';
    subtitleEl.textContent = 'Season ' + prevLabel + ' finished. Season ' + nextLabel + ' started.';
    champEl.textContent = championName || '—';
    retiredEl.textContent = retiredText || '—';
    relegEl.textContent = relegationText || '—';
    mapsEl.textContent = mapsText || '—';
    mainTop4El.textContent = mainTop4Text || '—';
    mainBottom2El.textContent = mainBottom2Text || '—';
    challTop2El.textContent = challengerTop2Text || '—';
    winRateEl.textContent = winRateText || '—';
    overlay.classList.remove('is-hidden');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function hideSeasonStatsPage() {
    const overlay = document.getElementById('seasonStatsPage');
    if (!overlay) return;
    overlay.classList.add('is-hidden');
    overlay.setAttribute('aria-hidden', 'true');
  }

  const seasonStatsContinueBtn = document.getElementById('seasonStatsContinue');
  if (seasonStatsContinueBtn) {
    seasonStatsContinueBtn.addEventListener('click', function() {
      hideSeasonStatsPage();
      if (typeof pendingAfterMatchResult === 'function') {
        pendingAfterMatchResult();
        pendingAfterMatchResult = null;
      }
    });
  }

  function handleSeasonFinished(result) {
    const userTeam = userTeamRef();
    const isBankrupt = result.bankrupt && userTeam && Nexus.checkBankruptcy(userTeam);

    if (isBankrupt) {
      pendingBankruptcy = true;
      updateFixtureUI(season);
      updateStandingsUI(season);
      updateScheduleUI(season);
      updateCareerUI(season);
      updateFinanceUI(userTeam);
      updateCycleUI();
      saveGameState();
      var bankruptcyModalEl = document.getElementById('bankruptcyModal');
      if (bankruptcyModalEl) bankruptcyModalEl.style.display = 'flex';
      return;
    }

    const useChallengerForPosition = userTeam.tier === 'Challenger' && challengerSeason && challengerSeason.standings;
    const standingsForPosition = useChallengerForPosition ? challengerSeason.standings : season.standings;
    const sorted = Nexus.getSortedStandings(standingsForPosition);
    const posIndex = sorted.findIndex(t => t.teamName === userTeam.name);
    const position = posIndex === -1 ? null : posIndex + 1;
    const rec = userTeam && standingsForPosition[userTeam.name]
      ? { w: standingsForPosition[userTeam.name].wins, l: standingsForPosition[userTeam.name].losses }
      : { w: 0, l: 0 };
    let outcome = '—';
    if (season.champion && season.champion.name === userTeam.name) outcome = 'Championship: Winner';
    else if (season.relegationCandidates && season.relegationCandidates.some(t => t.name === userTeam.name)) {
      const rel = (season.relegationResults || []).find(r => r.mainTeam === userTeam.name);
      outcome = rel ? (rel.winner === userTeam.name ? 'Relegation: Stayed in Main' : 'Relegation: Relegated to Challenger') : 'Relegation: Stayed in Main';
    } else if (season.challengerPromotion && season.challengerPromotion.some(t => t.name === userTeam.name)) {
      const rel = (season.relegationResults || []).find(r => r.challengerTeam === userTeam.name);
      outcome = rel ? (rel.winner === userTeam.name ? 'Challenger Championship: Promoted to Main' : 'Challenger Championship: Stayed in Challenger') : 'Challenger Championship: Stayed in Challenger';
    } else if (userTeam.tier === 'Challenger') {
      outcome = 'Challenger: ' + (position === 1 ? '1st' : position === 2 ? '2nd' : position === 3 ? '3rd' : (position + 'th'));
    } else outcome = 'Championship Playoffs: Eliminated';

    const allTeams = [...league, ...(challengerLeague || [])];
    const currentMainTeams = allTeams.filter(t => t.tier === 'Main');
    if (currentMainTeams.length !== 12) {
      showNotification('Season Finished (relegation/promotion applied). Cycle ' + cycleCount + '. Unable to start next season – team count mismatch.', 'info');
      updateFixtureUI(season);
      updateStandingsUI(season);
      updateScheduleUI(season);
      updateCareerUI(season);
      updateFinanceUI(userTeam);
      updateCycleUI();
      saveGameState();
      return;
    }

    const seasonOutcome = (season.champion && season.champion.name === userTeam.name)
      ? 'champion'
      : (outcome.indexOf('Relegated to Challenger') !== -1
        ? 'relegated'
        : (outcome.indexOf('Promoted to Main') !== -1
          ? 'promoted'
          : (position >= 2 && position <= 6 && !useChallengerForPosition ? 'playoffs' : 'mid')));
    pendingSeasonEnd = { season, result, position, rec, outcome };
    const offers = Nexus.generateJobOffers ? Nexus.generateJobOffers(userTeam, seasonOutcome, cycleCount, allTeams) : [];
    if (offers.length > 0) {
      currentJobOffers = offers;
      renderJobOffers(offers, userTeam);
      const jobModal = document.getElementById('jobOffersModal');
      if (jobModal) jobModal.style.display = 'flex';
      return;
    }
    continueSeasonTransition();
  }

  // ===== SIMULATE STAGE BUTTON =====
  const simBtn = document.getElementById('btnSim');
  if (simBtn) {
    simBtn.addEventListener('click', () => {
      const previousPhase = season ? season.phase : null;
      const result = Nexus.playNextStage(season, environmentMap, meta);
      if (result.newMeta) {
        meta = result.newMeta;
        showMetaChangedNotification();
      }
      if (result.newMeta && Nexus.runPostMetaShiftAdaptation) Nexus.runPostMetaShiftAdaptation(season, result.newMeta, (league && league[0]) ? league[0].name : null);

      if (result.finished && season.phase === 'finished') {
        handleSeasonFinished(result);
        return;
      }

      const runPostStageUpdates = () => {
        const wasRegular = season.phase === 'regular';
        const wasMatchday = result.matchdayResults && result.matchdayResults.length > 0;
        if (wasRegular && wasMatchday) {
          if (season.transferMarketRefreshCountdown != null) {
            season.transferMarketRefreshCountdown--;
            if (season.transferMarketRefreshCountdown <= 0 && Nexus.refreshTransferMarket && league && league[0]) {
              Nexus.refreshTransferMarket(season, [...league, ...(challengerLeague || [])], league[0].name);
            }
          }
          saveGameState();
        }

        if (result.matchdayResults) console.log('Matchday Results:', result.matchdayResults);
        if (result.playoffWinners) console.log('Playoff winners:', result.playoffWinners);
        if (result.champion) console.log('Champion:', result.champion.name);
        if (result.relegationResults) console.log('Relegation:', result.relegationResults);
        updateFixtureUI(season);
        updateStandingsUI(season);
        updateScheduleUI(season);
        updateCareerUI(season);
        updateFinanceUI(userTeamRef());
        updateCycleUI();
      };

      const userTeam = userTeamRef();
      if (previousPhase === 'regular' && result.matchdayResults && result.matchdayResults.length && userTeam) {
        const ourMatch = result.matchdayResults.find(r => r.match.teamA === userTeam || r.match.teamB === userTeam);
        if (ourMatch) {
          pendingAfterMatchResult = runPostStageUpdates;
          showMatchResultPage(ourMatch.match, ourMatch.result, season);
          return;
        }
      }

      if (previousPhase === 'playoffs' && result.roundResults && result.roundResults.length && userTeam) {
        const ourPlayoff = result.roundResults.find(r => r.match.teamA === userTeam || r.match.teamB === userTeam);
        if (ourPlayoff) {
          pendingAfterMatchResult = runPostStageUpdates;
          showMatchResultPage(ourPlayoff.match, ourPlayoff.result, season);
          return;
        }
      }

      if (previousPhase === 'relegation' && result.relegationMatchResults && result.relegationMatchResults.length && userTeam) {
        const ourRel = result.relegationMatchResults.find(r => r.match.teamA === userTeam || r.match.teamB === userTeam);
        if (ourRel) {
          pendingAfterMatchResult = runPostStageUpdates;
          showMatchResultPage(ourRel.match, ourRel.result, season);
          return;
        }
      }

      runPostStageUpdates();
    });
  }

  if (pendingSeasonEnd) {
    var data = pendingSeasonEnd;
    var userTeamFlush = userTeamRef();
    var champNameFlush = data.season.champion != null ? (typeof data.season.champion === 'object' ? data.season.champion.name : data.season.champion) : null;
    var seasonOutcomeFlush = (champNameFlush === (userTeamFlush && userTeamFlush.name)) ? 'champion' : (data.outcome.indexOf('Relegated to Challenger') !== -1 ? 'relegated' : (data.outcome.indexOf('Promoted to Main') !== -1 ? 'promoted' : (data.position >= 2 && data.position <= 6 ? 'playoffs' : 'mid')));
    var allTeamsFlush = [...league, ...(challengerLeague || [])];
    var offersFlush = Nexus.generateJobOffers ? Nexus.generateJobOffers(userTeamFlush, seasonOutcomeFlush, cycleCount, allTeamsFlush) : [];
    if (offersFlush.length > 0) {
      currentJobOffers = offersFlush;
      renderJobOffers(offersFlush, userTeamFlush);
      var jobModalFlush = document.getElementById('jobOffersModal');
      if (jobModalFlush) jobModalFlush.style.display = 'flex';
    } else {
      continueSeasonTransition();
    }
  }

  if (pendingBankruptcyOnLoad) {
    pendingBankruptcy = true;
    pendingBankruptcyOnLoad = false;
    var bankruptcyModalOnLoad = document.getElementById('bankruptcyModal');
    if (bankruptcyModalOnLoad) bankruptcyModalOnLoad.style.display = 'flex';
  }

  // ===== OPERATIONS (Coaches, Facilities, Sponsors) =====
  var operationsTabBtns = document.querySelectorAll('.operations-tab');
  var operationsPanels = document.querySelectorAll('.operations-panel');
  var activeOperationsPanel = 'coaches';

  function updateOperationsUI() {
    var userTeam = userTeamRef();
    if (!userTeam) return;
    var coachesEl = document.getElementById('operationsCoaches');
    var facilitiesEl = document.getElementById('operationsFacilities');
    var psychologyEl = document.getElementById('operationsPsychology');
    var sponsorsEl = document.getElementById('operationsSponsors');
    if (!coachesEl || !facilitiesEl || !psychologyEl || !sponsorsEl) return;

    if (activeOperationsPanel === 'coaches') {
      var coachTiers = window.Nexus.COACH_TIERS || [];
      var currentCoach = (userTeam.coachTierLevel != null ? userTeam.coachTierLevel : 1);
      coachesEl.innerHTML = '<div class="operations-tier-list">' + coachTiers.map(function(tier, i) {
        var isCurrent = (i + 1) === currentCoach;
        var isLocked = (i + 1) > currentCoach;
        var nextLevel = currentCoach < coachTiers.length ? coachTiers[currentCoach] : null;
        var canUpgrade = nextLevel && (userTeam.finance && (userTeam.finance.capital || 0) >= (nextLevel.upgradeCost || 0));
        var cardClass = 'operations-tier-card' + (isCurrent ? ' is-current' : '') + (isLocked ? ' is-locked' : '');
        var btnHtml = '';
        if ((i + 1) === currentCoach) btnHtml = '<span class="operations-badge">Current</span>';
        else if ((i + 1) === currentCoach + 1 && canUpgrade) btnHtml = '<button type="button" class="btn btn--primary operations-upgrade-btn" data-coach-level="' + (i + 1) + '">Upgrade — $' + (tier.upgradeCost || 0).toLocaleString() + '</button>';
        else if (isLocked) btnHtml = '<span class="operations-cost">$' + (tier.upgradeCost || 0).toLocaleString() + ' to unlock</span>';
        return '<div class="' + cardClass + '"><div class="operations-tier-card__header"><strong>' + (tier.name || 'Tier ' + (i + 1)) + '</strong><span class="operations-tier-level">Level ' + (i + 1) + '</span></div><p class="operations-tier-desc">' + (tier.description || '') + '</p><div class="operations-tier-stats"><span>Quality: ' + (tier.quality || 50) + '</span><span>Salary: $' + (tier.monthlySalary || 0).toLocaleString() + '/mo</span></div>' + btnHtml + '</div>';
      }).join('') + '</div>';
      coachesEl.querySelectorAll('.operations-upgrade-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var level = parseInt(btn.getAttribute('data-coach-level'), 10);
          var tier = (window.Nexus.COACH_TIERS || [])[level - 1];
          if (!tier || !userTeamRef() || !userTeamRef().finance) return;
          if ((userTeamRef().finance.capital || 0) < (tier.upgradeCost || 0)) { showNotification('Cannot afford upgrade.', 'error'); return; }
          userTeamRef().coachTierLevel = level;
          userTeamRef().finance.capital -= tier.upgradeCost;
          if (window.Nexus.syncTeamEnvironmentFromTiers) window.Nexus.syncTeamEnvironmentFromTiers(userTeamRef(), environmentMap);
          if (window.Nexus.syncPressureToPrestige) window.Nexus.syncPressureToPrestige(userTeamRef(), environmentMap);
          saveGameState();
          showNotification('Upgraded to ' + (tier.name || 'Level ' + level) + '!', 'success');
          updateOperationsUI();
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
        });
      });
    }

    if (activeOperationsPanel === 'facilities') {
      var facilityTiers = window.Nexus.FACILITY_TIERS || [];
      var currentFacility = (userTeam.facilityTierLevel != null ? userTeam.facilityTierLevel : 1);
      facilitiesEl.innerHTML = '<div class="operations-tier-list">' + facilityTiers.map(function(tier, i) {
        var isCurrent = (i + 1) === currentFacility;
        var isLocked = (i + 1) > currentFacility;
        var nextLevel = currentFacility < facilityTiers.length ? facilityTiers[currentFacility] : null;
        var canUpgrade = nextLevel && (userTeam.finance && (userTeam.finance.capital || 0) >= (nextLevel.upgradeCost || 0));
        var cardClass = 'operations-tier-card' + (isCurrent ? ' is-current' : '') + (isLocked ? ' is-locked' : '');
        var btnHtml = '';
        if ((i + 1) === currentFacility) btnHtml = '<span class="operations-badge">Current</span>';
        else if ((i + 1) === currentFacility + 1 && canUpgrade) btnHtml = '<button type="button" class="btn btn--primary operations-upgrade-btn" data-facility-level="' + (i + 1) + '">Upgrade — $' + (tier.upgradeCost || 0).toLocaleString() + '</button>';
        else if (isLocked) btnHtml = '<span class="operations-cost">$' + (tier.upgradeCost || 0).toLocaleString() + ' to unlock</span>';
        var extra = [];
        if (tier.prestigeBonus) extra.push('+' + tier.prestigeBonus + ' Prestige');
        if (tier.youthSlotsBonus) extra.push('+' + tier.youthSlotsBonus + ' youth slot(s)');
        if (tier.seasonalMaintenance) extra.push('$' + tier.seasonalMaintenance.toLocaleString() + '/season maintenance');
        return '<div class="' + cardClass + '"><div class="operations-tier-card__header"><strong>' + (tier.name || 'Tier ' + (i + 1)) + '</strong><span class="operations-tier-level">Level ' + (i + 1) + '</span></div><p class="operations-tier-desc">' + (tier.description || '') + '</p><div class="operations-tier-stats"><span>Infrastructure: ' + (tier.infrastructure || 50) + '</span>' + (extra.length ? '<span>' + extra.join(' · ') + '</span>' : '') + '</div>' + btnHtml + '</div>';
      }).join('') + '</div>';
      facilitiesEl.querySelectorAll('.operations-upgrade-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var level = parseInt(btn.getAttribute('data-facility-level'), 10);
          var tier = (window.Nexus.FACILITY_TIERS || [])[level - 1];
          if (!tier || !userTeamRef() || !userTeamRef().finance) return;
          if ((userTeamRef().finance.capital || 0) < (tier.upgradeCost || 0)) { showNotification('Cannot afford upgrade.', 'error'); return; }
          var oldTier = window.Nexus.getFacilityTier && window.Nexus.getFacilityTier(userTeamRef());
          userTeamRef().facilityTierLevel = level;
          userTeamRef().finance.capital -= tier.upgradeCost;
          if (userTeamRef().prestige != null) userTeamRef().prestige = (userTeamRef().prestige || 50) + (tier.prestigeBonus || 0) - (oldTier && oldTier.prestigeBonus || 0);
          else userTeamRef().prestige = 50 + (tier.prestigeBonus || 0);
          if (window.Nexus.syncTeamEnvironmentFromTiers) window.Nexus.syncTeamEnvironmentFromTiers(userTeamRef(), environmentMap);
          if (window.Nexus.syncPressureToPrestige) window.Nexus.syncPressureToPrestige(userTeamRef(), environmentMap);
          saveGameState();
          showNotification('Upgraded to ' + (tier.name || 'Level ' + level) + '!', 'success');
          updateOperationsUI();
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
        });
      });
    }

    if (activeOperationsPanel === 'psychology') {
      var psychologyTiers = window.Nexus.PSYCHOLOGY_TIERS || [];
      var currentPsych = (userTeam.psychologyLevel != null ? userTeam.psychologyLevel : 1);
      psychologyEl.innerHTML = '<div class="operations-tier-list">' + psychologyTiers.map(function(tier, i) {
        var isCurrent = (i + 1) === currentPsych;
        var isLocked = (i + 1) > currentPsych;
        var nextLevel = currentPsych < psychologyTiers.length ? psychologyTiers[currentPsych] : null;
        var canUpgrade = nextLevel && (userTeam.finance && (userTeam.finance.capital || 0) >= (nextLevel.upgradeCost || 0));
        var cardClass = 'operations-tier-card' + (isCurrent ? ' is-current' : '') + (isLocked ? ' is-locked' : '');
        var btnHtml = '';
        if ((i + 1) === currentPsych) btnHtml = '<span class="operations-badge">Current</span>';
        else if ((i + 1) === currentPsych + 1 && canUpgrade) btnHtml = '<button type="button" class="btn btn--primary operations-upgrade-btn btnUpgradePsychology" data-psychology-level="' + (i + 1) + '">Upgrade — $' + (tier.upgradeCost || 0).toLocaleString() + '</button>';
        else if (isLocked) btnHtml = '<span class="operations-cost">$' + (tier.upgradeCost || 0).toLocaleString() + ' to unlock</span>';
        var extra = [];
        if (tier.pressureReduction > 0) extra.push((tier.pressureReduction * 100) + '% pressure reduction');
        if (tier.synergyBonus > 0) extra.push('+' + (tier.synergyBonus * 100) + '% synergy');
        if (tier.seasonalCost) extra.push('$' + tier.seasonalCost.toLocaleString() + '/season');
        return '<div class="' + cardClass + '"><div class="operations-tier-card__header"><strong>' + (tier.name || 'Tier ' + (i + 1)) + '</strong><span class="operations-tier-level">Level ' + (i + 1) + '</span></div><p class="operations-tier-desc">' + (tier.description || '') + '</p><div class="operations-tier-stats"><span>Support: ' + (tier.support || 50) + '</span>' + (extra.length ? '<span>' + extra.join(' · ') + '</span>' : '') + '</div>' + btnHtml + '</div>';
      }).join('') + '</div>';
      psychologyEl.querySelectorAll('.operations-upgrade-btn, .btnUpgradePsychology').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var result = window.Nexus.upgradePsychology && window.Nexus.upgradePsychology(userTeamRef());
          if (!result || !result.success) {
            showNotification(result && result.message ? result.message : 'Could not upgrade psychology.', 'error');
            return;
          }
          if (window.Nexus.syncTeamEnvironmentFromTiers) window.Nexus.syncTeamEnvironmentFromTiers(userTeamRef(), environmentMap);
          saveGameState();
          showNotification(result.message || 'Psychology upgraded!', 'success');
          updateOperationsUI();
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
        });
      });
    }

    if (activeOperationsPanel === 'sponsors') {
      var sponsorTiers = window.Nexus.SPONSOR_TIERS || [];
      var contract = userTeam.sponsorContract;
      var canSelect = !contract && season && (season.currentMatchday == null || season.currentMatchday === 0);
      if (contract) {
        sponsorsEl.innerHTML = '<div class="operations-sponsor-current"><h3>Current sponsor</h3><div class="operations-sponsor-card is-active"><strong>' + contract.name + '</strong><p>50% upfront received. 50% bonus at season end if objectives met.</p><p class="operations-locked">Locked until next season</p></div></div>';
      } else {
        sponsorsEl.innerHTML = '<div class="operations-sponsor-list">' + (canSelect ? '<p class="operations-hint">Choose one sponsor at the start of the season. You will receive 50% upfront and 50% at season end if you meet the objectives.</p>' : '<p class="operations-locked">Sponsor selection is available at the start of the season (matchday 0).</p>') + sponsorTiers.map(function(s) {
          var rulesText = (s.rules || []).map(function(r) { return r.description; }).join(' · ');
          return '<div class="operations-sponsor-card"><div class="operations-sponsor-card__header"><strong>' + s.name + '</strong><span class="operations-sponsor-tier">' + (s.tier || '') + '</span></div><p class="operations-sponsor-desc">' + (s.description || '') + '</p><p class="operations-sponsor-rules">' + rulesText + '</p><div class="operations-sponsor-pay">$' + (s.totalPay || 0).toLocaleString() + ' total (50% upfront, 50% at season end)</div>' + (canSelect ? '<button type="button" class="btn btn--primary operations-select-sponsor" data-sponsor-id="' + (s.id || '') + '">Select</button>' : '') + '</div>';
        }).join('') + '</div>';
        sponsorsEl.querySelectorAll('.operations-select-sponsor').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-sponsor-id');
            if (!id || !userTeamRef()) return;
            var result = window.Nexus.selectSponsor && window.Nexus.selectSponsor(userTeamRef(), id);
            if (result && result.success) {
              showNotification(result.message || 'Sponsor signed.', 'success');
              saveGameState();
              updateOperationsUI();
              if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
            } else {
              showNotification(result && result.message ? result.message : 'Could not sign sponsor.', 'error');
            }
          });
        });
      }
    }
  }

  if (operationsTabBtns.length) {
    operationsTabBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tab = btn.getAttribute('data-operations-tab');
        if (!tab) return;
        operationsTabBtns.forEach(function(b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        operationsPanels.forEach(function(p) {
          p.classList.toggle('is-visible', p.getAttribute('data-panel') === tab);
        });
        activeOperationsPanel = tab;
        updateOperationsUI();
      });
    });
  }
  operationsPanels.forEach(function(p) {
    p.classList.toggle('is-visible', p.getAttribute('data-panel') === activeOperationsPanel);
  });

  // ===== SAVE BUTTON =====
  const saveBtn = document.getElementById('btnSave');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const ok = saveGameState();
      if (ok) saveBtn.textContent = 'Saved!';
      else saveBtn.textContent = 'Save failed';
      setTimeout(() => { saveBtn.textContent = 'Save'; }, 1500);
    });
  }

  const newCareerBtn = document.getElementById('btnNewCareer');
  if (newCareerBtn) {
    newCareerBtn.addEventListener('click', () => {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(NEXUS_SAVE_KEY);
      window.location.reload();
    });
  }

  function updateOverviewAgeUI() {
    const avgEl = document.getElementById('uiAvgAge');
    const pillsEl = document.getElementById('uiAgePills');
    if (!avgEl || !pillsEl) return;
    const yourTeam = league && league[0];
    if (!yourTeam || !yourTeam.players || !yourTeam.players.length) {
      avgEl.textContent = '—';
      pillsEl.innerHTML = '';
      return;
    }
    const ages = yourTeam.players.map(p => p.age != null ? p.age : 20);
    const avg = Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);
    avgEl.textContent = avg;
    const growth = ages.filter(a => a <= 21).length;
    const peak = ages.filter(a => a >= 22 && a <= 25).length;
    const decline = ages.filter(a => a >= 26 && a <= 27).length;
    const retirement = ages.filter(a => a >= 28).length;
    pillsEl.innerHTML = [
      growth ? '<span class="age-pill age-pill--growth">' + growth + ' growth</span>' : '',
      peak ? '<span class="age-pill age-pill--peak">' + peak + ' peak</span>' : '',
      decline ? '<span class="age-pill age-pill--decline">' + decline + ' decline</span>' : '',
      retirement ? '<span class="age-pill age-pill--retirement">' + retirement + ' retirement</span>' : ''
    ].filter(Boolean).join(' ');
  }

  // ===== FIXTURE UI (next match / stage) =====
  function updateFixtureUI(seasonData) {
    updateOverviewAgeUI();
    const teamNameEl = document.getElementById('uiTeamName');
    const oppEl = document.getElementById('uiOpponent');
    const badgeLeft = document.getElementById('uiBadgeLeft');
    const badgeRight = document.getElementById('uiBadgeRight');
    if (!teamNameEl || !oppEl) return;

    const currentMeta = meta && meta.name ? meta : (Nexus.getCurrentMeta ? Nexus.getCurrentMeta() : null);
    const metaNameEl = document.getElementById('uiMetaName');
    const metaDescEl = document.getElementById('uiMetaDesc');
    if (metaNameEl) metaNameEl.textContent = currentMeta && currentMeta.name ? currentMeta.name : '—';
    if (metaDescEl) metaDescEl.textContent = currentMeta && currentMeta.description ? currentMeta.description : (currentMeta ? 'Tempo: ' + currentMeta.tempo + ' | Aggression: ' + (currentMeta.aggressionLevel != null ? currentMeta.aggressionLevel : '—') : '');

    const userTeam = league[0];
    const teamPlanKeys = window.Nexus.TEAM_TRAINING_PLAN_KEYS || [];
    if (userTeam && teamPlanKeys.length && (userTeam.activeTeamTraining == null || userTeam.activeTeamTraining === '' || !teamPlanKeys.includes(userTeam.activeTeamTraining))) {
      userTeam.activeTeamTraining = teamPlanKeys[0];
    }
    const trainingEl = document.getElementById('uiActiveTeamTraining');
    const trainingDescEl = document.getElementById('uiActiveTeamTrainingDesc');
    const planName = (userTeam && userTeam.activeTeamTraining) ? userTeam.activeTeamTraining : '—';
    if (trainingEl) trainingEl.textContent = planName;
    if (trainingDescEl) {
      const plans = window.Nexus.TEAM_TRAINING_PLANS;
      const desc = (planName !== '—' && plans && plans[planName] && plans[planName].description) ? ' — ' + plans[planName].description : '';
      trainingDescEl.textContent = desc;
    }
    const phase = seasonData.phase || 'regular';
    const matchdayInfoEl = document.getElementById('uiMatchdayInfo');

    const fixturePanel = document.getElementById('fixturePanel');
    const titleEl = document.getElementById('uiFixtureTitle');
    if (fixturePanel) {
      fixturePanel.classList.remove('panel--playoffs', 'panel--relegation');
      if (phase === 'playoffs') fixturePanel.classList.add('panel--playoffs');
      else if (phase === 'relegation') fixturePanel.classList.add('panel--relegation');
    }
    if (titleEl) {
      if (phase === 'finished') titleEl.textContent = 'Season complete';
      else if (phase === 'playoffs' && seasonData.playoffsBracket) {
        const r = seasonData.playoffsBracket.round;
        titleEl.textContent = r === 2 ? 'Championship – Final' : 'Championship – Quarterfinals';
      } else if (phase === 'relegation') titleEl.textContent = 'Relegation – Decider';
      else titleEl.textContent = 'Next Fixture';
    }

    if (phase === 'finished') {
      if (matchdayInfoEl) matchdayInfoEl.textContent = 'Season finished';
      teamNameEl.textContent = seasonData.champion ? seasonData.champion.name : '—';
      oppEl.textContent = 'Season complete';
      if (badgeLeft) { badgeLeft.textContent = '—'; badgeLeft.classList.remove('badge--you'); }
      if (badgeRight) badgeRight.textContent = '—';
      return;
    }

    if (phase === 'playoffs' && seasonData.playoffsBracket) {
      if (matchdayInfoEl) matchdayInfoEl.textContent = 'Playoffs';
      const bracket = seasonData.playoffsBracket;
      const nextMatch = bracket.matches[0];
      if (nextMatch) {
        teamNameEl.textContent = nextMatch.teamA.name;
        oppEl.textContent = nextMatch.teamB.name;
        const isYou = nextMatch.teamA.name === userTeam.name || nextMatch.teamB.name === userTeam.name;
        if (badgeLeft) { badgeLeft.textContent = isYou ? 'YOU' : 'OPP'; badgeLeft.classList.toggle('badge--you', isYou); }
        if (badgeRight) badgeRight.textContent = 'OPP';
      } else {
        teamNameEl.textContent = 'Playoffs';
        oppEl.textContent = 'Round ' + bracket.round;
        if (badgeLeft) { badgeLeft.textContent = 'OPP'; badgeLeft.classList.remove('badge--you'); }
        if (badgeRight) badgeRight.textContent = 'OPP';
      }
      return;
    }

    if (phase === 'relegation' && seasonData.relegationCandidates && seasonData.challengerPromotion) {
      if (matchdayInfoEl) matchdayInfoEl.textContent = 'Relegation';
      const main = seasonData.relegationCandidates;
      const chall = seasonData.challengerPromotion;
      const ourTeamIn = main.some(t => t.name === userTeam.name) || chall.some(t => t.name === userTeam.name);
      const firstMain = main[0];
      const firstChall = chall[0];
      const secondMain = main[1];
      const secondChall = chall[1];
      if (firstMain && firstChall) {
        teamNameEl.textContent = firstMain.name + ' vs ' + firstChall.name;
        oppEl.textContent = (secondMain && secondChall) ? (secondMain.name + ' vs ' + secondChall.name) : 'Relegation Tournament (2 matches)';
        if (badgeLeft) { badgeLeft.textContent = ourTeamIn ? 'YOU' : 'OPP'; badgeLeft.classList.toggle('badge--you', ourTeamIn); }
        if (badgeRight) badgeRight.textContent = 'OPP';
      } else {
        teamNameEl.textContent = 'Relegation';
        oppEl.textContent = 'Main vs Challenger';
        if (badgeLeft) { badgeLeft.textContent = 'OPP'; badgeLeft.classList.remove('badge--you'); }
        if (badgeRight) badgeRight.textContent = 'OPP';
      }
      return;
    }

    // Regular season: show fixture from manager's league only (Main or Challenger)
    const isChallengerManager = userTeam.tier === 'Challenger';
    const dataForFixture = (isChallengerManager && challengerSeason && challengerSeason.teams && challengerSeason.teams.some(t => t.name === userTeam.name))
      ? challengerSeason
      : seasonData;
    const finished = dataForFixture.currentMatchday >= (dataForFixture.matchdays || []).length;
    if (matchdayInfoEl && !finished) {
      const md = (dataForFixture.currentMatchday || 0) + 1;
      matchdayInfoEl.textContent = 'Matchday ' + md + ' / ' + (dataForFixture.matchdays || []).length;
    }
    if (finished) {
      teamNameEl.textContent = '—';
      oppEl.textContent = 'Regular season complete';
      if (badgeLeft) { badgeLeft.textContent = '—'; badgeLeft.classList.remove('badge--you'); }
      if (badgeRight) badgeRight.textContent = '—';
      return;
    }

    const todayMatches = (dataForFixture.matchdays || [])[dataForFixture.currentMatchday] || [];
    const ourMatch = todayMatches.find(m =>
      m.teamA.name === userTeam.name || m.teamB.name === userTeam.name
    );

    if (ourMatch) {
      if (ourMatch.teamA.name === userTeam.name) {
        teamNameEl.textContent = ourMatch.teamA.name;
        oppEl.textContent = ourMatch.teamB.name;
      } else {
        teamNameEl.textContent = ourMatch.teamB.name;
        oppEl.textContent = ourMatch.teamA.name;
      }
      const mapEl = document.getElementById('uiFixtureMap');
      if (mapEl) {
        mapEl.textContent = ourMatch.map || '—';
        mapEl.style.display = '';
      }
      if (badgeLeft) { badgeLeft.textContent = 'YOU'; badgeLeft.classList.add('badge--you'); }
      if (badgeRight) badgeRight.textContent = 'OPP';
    } else {
      teamNameEl.textContent = '—';
      oppEl.textContent = 'Matchday ' + (dataForFixture.currentMatchday + 1) + ' (no your game)';
      const mapEl = document.getElementById('uiFixtureMap');
      if (mapEl) { mapEl.textContent = '—'; mapEl.style.display = ''; }
      if (badgeLeft) { badgeLeft.textContent = 'OPP'; badgeLeft.classList.remove('badge--you'); }
      if (badgeRight) badgeRight.textContent = 'OPP';
    }
  }

  // ===== CAREER PAGE UI =====
  let pastSeasonModalSetupDone = false;
  function openPastSeasonModal(entry, displaySeasonNum) {
    const modal = document.getElementById('pastSeasonDetailModal');
    const titleEl = document.getElementById('pastSeasonDetailTitle');
    const summaryEl = document.getElementById('pastSeasonDetailSummary');
    const textEl = document.getElementById('pastSeasonDetailText');
    if (!modal || !titleEl || !summaryEl || !textEl) return;
    const seasonLabel = displaySeasonNum != null ? displaySeasonNum : entry.cycle;
    titleEl.textContent = 'Season ' + seasonLabel;
    const rec = entry.record || { w: 0, l: 0 };
    const posStr = entry.position != null ? entry.position + (entry.position === 1 ? 'st' : entry.position === 2 ? 'nd' : entry.position === 3 ? 'rd' : 'th') : '—';
    const winRate = entry.winRate != null ? Math.round(entry.winRate * 100) + '%' : '—';
    summaryEl.innerHTML = ''
      + '<div class="career-row"><span class="career-k">Position</span><span class="career-v">' + posStr + '</span></div>'
      + '<div class="career-row"><span class="career-k">Record</span><span class="career-v">' + rec.w + 'W - ' + rec.l + 'L</span></div>'
      + '<div class="career-row"><span class="career-k">Win rate</span><span class="career-v">' + winRate + '</span></div>'
      + '<div class="career-row"><span class="career-k">Outcome</span><span class="career-v">' + (entry.outcome || '—') + '</span></div>'
      + (entry.champion ? '<div class="career-past-champ">Champion: ' + entry.champion + '</div>' : '');
    var summaryText = (entry.champion ? 'Champion: ' + entry.champion + '\n\n' : '') + 'Season ' + seasonLabel + ' finished.';
    if (entry.retiredCount > 0) summaryText += '\n\nRetired: ' + entry.retiredCount + ' players';
    textEl.textContent = summaryText;
    modal.classList.remove('is-hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closePastSeasonModal() {
    const modal = document.getElementById('pastSeasonDetailModal');
    if (!modal) return;
    modal.classList.add('is-hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
  function updateCareerUI(seasonData) {
    const teamEl = document.getElementById('careerTeam');
    const posEl = document.getElementById('careerPosition');
    const recEl = document.getElementById('careerRecord');
    const winRateEl = document.getElementById('careerWinRate');
    const outEl = document.getElementById('careerOutcome');
    if (!teamEl || !posEl || !recEl || !outEl) return;

    const userTeam = league[0];
    if (!userTeam) {
      teamEl.textContent = '—';
      posEl.textContent = '—';
      recEl.textContent = '—';
      outEl.textContent = '—';
      return;
    }

    teamEl.textContent = userTeam.name + ' (' + (userTeam.tier || 'Main') + ')';

    const isChallengerManager = userTeam.tier === 'Challenger';
    const standings = (isChallengerManager && challengerSeason && challengerSeason.standings) ? challengerSeason.standings : seasonData.standings;
    const phase = seasonData.phase || 'regular';

    if (!standings || !standings[userTeam.name]) {
      posEl.textContent = '—';
      recEl.textContent = '0W - 0L';
      if (winRateEl) winRateEl.textContent = '—';
    } else {
      const sorted = Nexus.getSortedStandings(standings);
      const posIndex = sorted.findIndex(t => t.teamName === userTeam.name);
      const position = posIndex === -1 ? '—' : (posIndex + 1) + (posIndex === 0 ? 'st' : posIndex === 1 ? 'nd' : posIndex === 2 ? 'rd' : 'th');
      posEl.textContent = position;
      const s = standings[userTeam.name];
      recEl.textContent = (s.wins || 0) + 'W - ' + (s.losses || 0) + 'L';
      if (winRateEl) {
        const w = s.wins || 0;
        const l = s.losses || 0;
        const total = w + l;
        winRateEl.textContent = total > 0 ? (Math.round((w / total) * 100) + '%') : '—';
      }
    }

    let outcome = '—';
    if (phase === 'regular') {
      outcome = isChallengerManager ? 'Challenger – in progress' : 'Season in progress';
    } else if (phase === 'playoffs' && seasonData.playoffsBracket) {
      const r = seasonData.playoffsBracket.round;
      outcome = 'Championship Playoffs – Round ' + r + (r === 1 ? ' (Quarterfinals)' : ' (Final)');
    } else if (phase === 'finished') {
      if (seasonData.champion && seasonData.champion.name === userTeam.name) {
        outcome = 'Championship: Winner';
      } else if (seasonData.relegationCandidates && seasonData.relegationCandidates.some(t => t.name === userTeam.name)) {
        const rel = (seasonData.relegationResults || []).find(r => r.mainTeam === userTeam.name);
        outcome = rel ? (rel.winner === userTeam.name ? 'Relegation: Stayed in Main' : 'Relegation: Relegated to Challenger') : 'Relegation: Stayed in Main';
      } else if (seasonData.challengerPromotion && seasonData.challengerPromotion.some(t => t.name === userTeam.name)) {
        const rel = (seasonData.relegationResults || []).find(r => r.challengerTeam === userTeam.name);
        outcome = rel ? (rel.winner === userTeam.name ? 'Challenger Championship: Promoted to Main' : 'Challenger Championship: Stayed in Challenger') : 'Challenger Championship: Stayed in Challenger';
      } else {
        outcome = 'Championship Playoffs: Eliminated';
      }
    } else if (phase === 'relegation') {
      const inMain = seasonData.relegationCandidates && seasonData.relegationCandidates.some(t => t.name === userTeam.name);
      const inChall = seasonData.challengerPromotion && seasonData.challengerPromotion.some(t => t.name === userTeam.name);
      if (inMain) outcome = 'Relegation tournament (Main) – pending';
      else if (inChall) outcome = 'Challenger Championship – pending';
      else outcome = '—';
    }
    outEl.textContent = outcome;

    const retiredTotalEl = document.getElementById('careerRetiredTotal');
    if (retiredTotalEl) {
      const totalRetired = (seasonHistory || []).reduce((sum, e) => sum + (e.retiredCount || 0), 0);
      retiredTotalEl.textContent = totalRetired;
    }

    const pastEl = document.getElementById('careerPastSeasons');
    if (pastEl) {
      if (!seasonHistory || seasonHistory.length === 0) {
        pastEl.innerHTML = '<div class="schedule-day">No past seasons yet.</div>';
      } else {
        pastEl.innerHTML = '';
        if (!pastSeasonModalSetupDone) {
          var pastModal = document.getElementById('pastSeasonDetailModal');
          var pastCloseBtn = document.getElementById('pastSeasonDetailModalClose');
          if (pastModal && pastCloseBtn) {
            pastCloseBtn.addEventListener('click', closePastSeasonModal);
            pastModal.addEventListener('click', function(e) { if (e.target === pastModal) closePastSeasonModal(); });
          }
          pastSeasonModalSetupDone = true;
        }
        seasonHistory.slice().reverse().forEach((entry, i) => {
          const displayNum = i + 1;
          const card = document.createElement('div');
          card.className = 'career-past-card career-past-card--clickable';
          const rec = entry.record || { w: 0, l: 0 };
          const winRate = entry.winRate != null ? Math.round(entry.winRate * 100) + '%' : '—';
          card.innerHTML = `
            <div class="career-past-header">Season ${displayNum}</div>
            <div class="career-past-row"><span>Position</span><span>${entry.position != null ? entry.position + (entry.position === 1 ? 'st' : entry.position === 2 ? 'nd' : entry.position === 3 ? 'rd' : 'th') : '—'}</span></div>
            <div class="career-past-row"><span>Record</span><span>${rec.w}W - ${rec.l}L</span></div>
            <div class="career-past-row"><span>Win rate</span><span>${winRate}</span></div>
            <div class="career-past-row"><span>Outcome</span><span>${entry.outcome || '—'}</span></div>
            ${(entry.retiredCount && entry.retiredCount > 0) ? '<div class="career-past-row"><span>Retired</span><span>' + entry.retiredCount + ' players</span></div>' : ''}
            ${entry.champion ? '<div class="career-past-champ">Champion: ' + entry.champion + '</div>' : ''}
          `;
          card.addEventListener('click', function() { openPastSeasonModal(entry, displayNum); });
          pastEl.appendChild(card);
        });
      }
    }
  }

  // ===== STANDINGS UI =====
  function renderStandingsBlock(container, seasonData, blockTitle, isAppend) {
    const phase = seasonData.phase || 'regular';
    let sorted = Nexus.getSortedStandings(seasonData.standings || {});
    let title = blockTitle || '';
    if (phase === 'relegation' && seasonData.relegationCandidates && !blockTitle) {
      title = 'Relegation: bottom 2 vs Challenger top 2 — ';
    } else if (!blockTitle) {
      if (phase === 'playoffs') title = 'Regular season (final) ';
      if (phase === 'finished' && seasonData.champion) title = 'Champion: ' + seasonData.champion.name + ' — ';
    }
    if (!isAppend) container.innerHTML = '';
    if (title) {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'schedule-day';
      titleDiv.textContent = title;
      container.appendChild(titleDiv);
    }
    const allTeamsForLookup = (seasonData.teams && seasonData.teams.length) ? seasonData.teams : [...(league || []), ...(challengerLeague || [])];
    sorted.forEach((team, index) => {
      const row = document.createElement('div');
      row.className = 'list-row';
      const teamName = team.teamName;
      const fullTeam = (seasonData.teams || []).find(t => t && t.name === teamName) || allTeamsForLookup.find(t => t && t.name === teamName);
      const isUserTeam = userTeamRef && userTeamRef() && userTeamRef().name === teamName;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'standings-team-name';
      btn.setAttribute('data-team-name', teamName);
      btn.textContent = index + 1 + '. ' + teamName;
      btn.disabled = !!isUserTeam;
      const recordSpan = document.createElement('span');
      recordSpan.textContent = team.wins + 'W - ' + team.losses + 'L';
      row.appendChild(btn);
      row.appendChild(recordSpan);
      if (fullTeam && !isUserTeam && typeof openOtherTeamRosterModalRef === 'function') {
        btn.addEventListener('click', () => openOtherTeamRosterModalRef(fullTeam));
      }
      if (isUserTeam) btn.title = 'Your team';
      container.appendChild(row);
    });
  }

  function updateStandingsUI(seasonData) {
    const container = document.getElementById('standings');
    if (!container) return;

    const phase = seasonData.phase || 'regular';
    let mainTitle = '';
    if (phase === 'relegation' && seasonData.relegationCandidates) mainTitle = 'Relegation: bottom 2 vs Challenger top 2 — ';
    else {
      if (phase === 'playoffs') mainTitle = 'Regular season (final) ';
      if (phase === 'finished' && seasonData.champion) mainTitle = 'Champion: ' + seasonData.champion.name + ' — ';
    }
    renderStandingsBlock(container, seasonData, mainTitle || 'Main League', false);

    if (challengerSeason && challengerSeason.teams && challengerSeason.teams.length) {
      const chTitle = document.createElement('div');
      chTitle.className = 'schedule-day';
      chTitle.style.marginTop = '1rem';
      chTitle.textContent = 'Challenger League';
      container.appendChild(chTitle);
      const chSorted = Nexus.getSortedStandings(challengerSeason.standings || {});
      const allTeamsForLookup = [...(league || []), ...(challengerLeague || [])];
      chSorted.forEach((team, index) => {
        const row = document.createElement('div');
        row.className = 'list-row';
        const teamName = team.teamName;
        const fullTeam = (challengerSeason.teams || []).find(t => t && t.name === teamName) || allTeamsForLookup.find(t => t && t.name === teamName);
        const isUserTeam = userTeamRef && userTeamRef() && userTeamRef().name === teamName;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'standings-team-name';
        btn.setAttribute('data-team-name', teamName);
        btn.textContent = index + 1 + '. ' + teamName;
        btn.disabled = !!isUserTeam;
        const recordSpan = document.createElement('span');
        recordSpan.textContent = team.wins + 'W - ' + team.losses + 'L';
        row.appendChild(btn);
        row.appendChild(recordSpan);
        if (fullTeam && !isUserTeam && typeof openOtherTeamRosterModalRef === 'function') {
          btn.addEventListener('click', () => openOtherTeamRosterModalRef(fullTeam));
        }
        if (isUserTeam) btn.title = 'Your team';
        container.appendChild(row);
      });
    }
  }

  // ===== FINANCE DASHBOARD =====
  function updateFinanceUI(userTeam) {
    if (!userTeam || !userTeam.finance) return;
    const capEl = document.getElementById('uiCapital');
    const costEl = document.getElementById('uiCost');
    const revEl = document.getElementById('uiRevenue');
    const runwayEl = document.getElementById('uiRunway');
    if (capEl) capEl.textContent = '$' + userTeam.finance.capital.toLocaleString();
    if (costEl) costEl.textContent = '$' + userTeam.finance.monthlyCost.toLocaleString();
    if (revEl) revEl.textContent = '$' + (userTeam.finance.revenueThisSeason != null ? userTeam.finance.revenueThisSeason : 0).toLocaleString();
    if (runwayEl) {
      const months = userTeam.finance.monthlyCost > 0
        ? Math.floor(userTeam.finance.capital / userTeam.finance.monthlyCost)
        : 0;
      runwayEl.textContent = months + ' month' + (months !== 1 ? 's' : '');
    }
  }

  // ===== ROSTER UI (your team = LEAGUE[0]) =====
  function getMetaBadgeForPlayer(player, meta) {
    if (!meta) return '';
    const role = player.assignedRole || player.roleBias.primaryRoleBias;
    const favored = (meta.favoredRoles && meta.favoredRoles) || [];
    const nerfed = (meta.nerfedRoles && meta.nerfedRoles) || [];
    if (favored.includes(role)) return '<span class="badge badge--meta">META</span>';
    if (nerfed.includes(role)) return '<span class="badge badge--nerfed">NERFED</span>';
    return '';
  }

  function getAgePhaseClass(age) {
    const phase = Nexus.getAgePhase ? Nexus.getAgePhase(age) : 'peak';
    return 'age-badge--' + phase;
  }

  function getAgeAndRetirementBadges(player) {
    const age = player.age != null ? player.age : 20;
    const phaseClass = getAgePhaseClass(age);
    let badges = '<span class="age-badge ' + phaseClass + '">' + age + '</span>';
    if (age >= 28) badges += ' <span class="badge badge--retirement">Last Season</span>';
    else if (age >= 27) badges += ' <span class="badge badge--retiring">Retiring Soon</span>';
    return badges;
  }

  const BENCH_SLOT_COUNT = 5;
  const RESERVE_SLOT_COUNT = 6;
  const BENCH_COUNT_FOR_MATCH = 3;
  const RESERVE_COUNT_FOR_MATCH = 4;

  function ensureUserTeamSlots(team) {
    if (!team || team !== league[0]) return;
    const players = team.players || [];
    if (!Array.isArray(team.starterSlots) || team.starterSlots.length !== 5) {
      team.starterSlots = [];
      for (let i = 0; i < 5; i++) team.starterSlots.push(players[i] || null);
      team.benchSlots = [];
      for (let i = 0; i < BENCH_SLOT_COUNT; i++) team.benchSlots.push(players[5 + i] || null);
      team.reserveSlots = [];
      for (let i = 0; i < RESERVE_SLOT_COUNT; i++) team.reserveSlots.push(null);
      return;
    }
    if (!Array.isArray(team.benchSlots) || team.benchSlots.length !== BENCH_SLOT_COUNT || !Array.isArray(team.reserveSlots) || team.reserveSlots.length !== RESERVE_SLOT_COUNT) {
      const bench = (team.benchSlots || []).filter(Boolean);
      const res = (team.reserves || []).concat((team.reserveSlots || []).filter(Boolean));
      team.benchSlots = [];
      for (let i = 0; i < BENCH_SLOT_COUNT; i++) team.benchSlots.push(bench[i] || null);
      team.reserveSlots = [];
      for (let i = 0; i < RESERVE_SLOT_COUNT; i++) team.reserveSlots.push(res[i] || null);
    }
    const inStarters = (team.starterSlots || []).filter(Boolean);
    const inBench = (team.benchSlots || []).filter(Boolean);
    const inReserveSlots = (team.reserveSlots || []).filter(Boolean);
    players.forEach(p => {
      if (!p || inStarters.includes(p) || inBench.includes(p) || inReserveSlots.includes(p)) return;
      const rj = (team.reserveSlots || []).findIndex(s => s == null);
      if (rj >= 0) team.reserveSlots[rj] = p;
    });
  }

  function syncUserTeamPlayersFromSlots(team) {
    if (!team || team !== league[0] || !Array.isArray(team.starterSlots)) return;
    const starters = (team.starterSlots || []).filter(Boolean);
    const bench = (team.benchSlots || []).filter(Boolean);
    const reserves = (team.reserveSlots || []).filter(Boolean);
    team.players = [...starters, ...bench, ...reserves];
    team.starters = team.players.slice(0, 5);
    team.bench = team.players.slice(5, 8);
  }

  function updateRosterUI() {
    const startingEl = document.getElementById('startingRoster');
    const benchEl = document.getElementById('benchRoster');
    const reserveEl = document.getElementById('reserveRoster');
    const impactEl = document.getElementById('rosterMetaImpact');
    const warningEl = document.getElementById('rosterContractWarning');
    const warningTextEl = document.getElementById('rosterContractWarningText');
    if (!startingEl || !benchEl) return;

    const yourTeam = league[0];
    if (!yourTeam) return;

    ensureUserTeamSlots(yourTeam);
    syncUserTeamPlayersFromSlots(yourTeam);
    const starterSlots = yourTeam.starterSlots || [];
    const benchSlots = yourTeam.benchSlots || [];
    const reserveSlots = yourTeam.reserveSlots || [];
    const allPlayers = yourTeam.players;
    const finalYearPlayers = allPlayers.filter(p => (p.contractYears != null ? p.contractYears : 1) === 1);
    if (warningEl && warningTextEl) {
      if (finalYearPlayers.length > 0) {
        warningEl.classList.remove('is-hidden');
        const names = finalYearPlayers.map(p => getPlayerDisplayName(p)).join(', ');
        warningTextEl.textContent = finalYearPlayers.length + ' player(s) entering final year of contract: ' + names + '. Consider offering renewals.';
      } else {
        warningEl.classList.add('is-hidden');
        warningTextEl.textContent = '';
      }
    }

    const currentMeta = meta && (meta.name || meta.id) ? meta : (Nexus.getCurrentMeta ? Nexus.getCurrentMeta() : null);
    if (Nexus.analyzeMetaImpactOnRoster && currentMeta && impactEl) {
      const impact = Nexus.analyzeMetaImpactOnRoster(yourTeam, currentMeta);
      impactEl.textContent = impact.buffed + ' buffed, ' + impact.nerfed + ' nerfed by current meta.';
    } else if (impactEl) {
      impactEl.textContent = '—';
    }

    startingEl.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const p = starterSlots[i];
      const card = document.createElement('div');
      if (p) {
        card.className = 'player-card player-card--clickable';
        const badge = getMetaBadgeForPlayer(p, currentMeta);
        const ageBadges = getAgeAndRetirementBadges(p);
        const years = p.contractYears != null ? p.contractYears : 1;
        const salary = p.salary != null ? p.salary : 5000;
        const isFinalYear = years === 1;
        const contractClass = isFinalYear ? 'player-card__contract player-card__contract--final' : 'player-card__contract';
        const playerIdx = allPlayers.indexOf(p);
        card.dataset.playerIndex = playerIdx;
        card.innerHTML = `
          <div class="player-card__header">
            <strong>${getPlayerDisplayName(p)}</strong>
            <span class="player-card__badges">${ageBadges} ${badge}</span>
          </div>
          <span class="player-role-primary">Primary: ${p.roleBias.primaryRoleBias}</span>
          <span class="player-role-secondary">Secondary: ${p.roleBias.secondaryRoleBias}</span>
          <span class="player-flex">Flex: ${p.roleBias.flexPotential}</span>
          <div class="${contractClass}">Contract: ${years} year(s) left · $${salary.toLocaleString()}/mo</div>
          <button type="button" class="btn btn--offer-contract" data-player-index="${playerIdx}">Offer new contract</button>
        `;
      } else {
        card.className = 'player-card player-card--empty';
        card.innerHTML = '<div class="player-card__empty">Empty slot</div>';
        card.dataset.slotType = 'starter';
        card.dataset.slotIndex = String(i);
      }
      startingEl.appendChild(card);
    }

    benchEl.innerHTML = '';
    for (let i = 0; i < BENCH_SLOT_COUNT; i++) {
      const p = benchSlots[i];
      if (!p && i >= BENCH_COUNT_FOR_MATCH) continue;
      const row = document.createElement('div');
      if (p) {
        row.className = 'bench-row bench-row--clickable';
        const playerIdx = allPlayers.indexOf(p);
        row.dataset.playerIndex = playerIdx;
        const badge = getMetaBadgeForPlayer(p, currentMeta);
        const years = p.contractYears != null ? p.contractYears : 1;
        const salary = p.salary != null ? p.salary : 5000;
        const isFinalYear = years === 1;
        const contractClass = isFinalYear ? 'player-contract-info player-contract-info--final' : 'player-contract-info';
        row.innerHTML = `
          <span class="bench-row__name">${getPlayerDisplayName(p)} <span class="age-badge ${getAgePhaseClass(p.age)}">${p.age != null ? p.age : '?'}</span></span>
          <span class="bench-row__role">Primary: ${p.roleBias.primaryRoleBias}</span>
          <span class="bench-row__role bench-row__role--sec">Secondary: ${p.roleBias.secondaryRoleBias}</span>
          <span class="${contractClass}">${years}y · $${salary.toLocaleString()}/mo</span>
          ${badge ? '<span class="bench-badge">' + badge + '</span>' : ''}
          <span class="bench-row__actions">
            <button type="button" class="btn btn--offer-contract" data-player-index="${playerIdx}">Renew</button>
            <button type="button" class="btn btn--small btn--add-to-starters" data-player-index="${playerIdx}">Add to starters</button>
            <button type="button" class="btn btn--small btn--add-to-reserves" data-player-index="${playerIdx}">Add to reserves</button>
          </span>
        `;
      } else {
        row.className = 'bench-row bench-row--empty';
        row.innerHTML = '<span class="bench-row__name">Empty slot</span>';
        row.dataset.slotType = 'bench';
        row.dataset.slotIndex = String(i);
      }
      benchEl.appendChild(row);
    }

    if (reserveEl) {
      reserveEl.innerHTML = '';
      for (let i = 0; i < RESERVE_SLOT_COUNT; i++) {
        const p = reserveSlots[i];
        if (!p && i >= RESERVE_COUNT_FOR_MATCH) continue;
        const row = document.createElement('div');
        if (p) {
          row.className = 'reserve-row reserve-row--clickable';
          const playerIdx = allPlayers.indexOf(p);
          if (playerIdx < 0) continue;
          row.dataset.playerIndex = playerIdx;
          const badge = getMetaBadgeForPlayer(p, currentMeta);
          const years = p.contractYears != null ? p.contractYears : 1;
          const salary = p.salary != null ? p.salary : 5000;
          const isFinalYear = years === 1;
          const contractClass = isFinalYear ? 'player-contract-info player-contract-info--final' : 'player-contract-info';
          row.innerHTML = `
            <span class="reserve-row__name">${getPlayerDisplayName(p)} <span class="age-badge ${getAgePhaseClass(p.age)}">${p.age != null ? p.age : '?'}</span></span>
            <span class="reserve-row__role">Primary: ${p.roleBias.primaryRoleBias}</span>
            <span class="reserve-row__role reserve-row__role--sec">Secondary: ${p.roleBias.secondaryRoleBias}</span>
            <span class="${contractClass}">${years}y · $${salary.toLocaleString()}/mo</span>
            ${badge ? '<span class="reserve-badge">' + badge + '</span>' : ''}
            <span class="reserve-row__actions">
              <button type="button" class="btn btn--offer-contract" data-player-index="${playerIdx}">Renew</button>
              <button type="button" class="btn btn--small btn--add-to-bench" data-player-index="${playerIdx}">Add to bench</button>
            </span>
          `;
        } else {
          row.className = 'reserve-row reserve-row--empty';
          row.innerHTML = '<span class="reserve-row__name">Empty slot</span>';
          row.dataset.slotType = 'reserve';
          row.dataset.slotIndex = String(i);
        }
        reserveEl.appendChild(row);
      }
    }
  }

  function formatStatKey(k) {
    if (k === 'utilityIQ') return 'Utility IQ';
    return (k || '').replace(/([A-Z])/g, ' $1').replace(/^\w/, s => s.toUpperCase()).trim();
  }

  function buildPlayerStatsHTML(player) {
    if (!player || !player.stats) return '';
    const keys = typeof STAT_KEYS !== 'undefined' ? STAT_KEYS : ['aim', 'reaction', 'gameSense', 'positioning', 'utilityIQ', 'decisionSpeed', 'adaptability', 'consistency', 'mental', 'communication'];
    return keys.map(k => {
      const raw = player.stats[k] && player.stats[k].current != null ? player.stats[k].current : null;
      const v = raw != null ? Math.round(raw) : '—';
      return '<div class="player-detail-stat"><span class="player-detail-stat__label">' + formatStatKey(k) + '</span><span class="player-detail-stat__value">' + v + '</span></div>';
    }).join('');
  }

  function setupPlayerDetailModal() {
    const modal = document.getElementById('playerDetailModal');
    const nameEl = document.getElementById('playerDetailName');
    const ageEl = document.getElementById('playerDetailAge');
    const rolePrimaryEl = document.getElementById('playerDetailRolePrimary');
    const roleSecondaryEl = document.getElementById('playerDetailRoleSecondary');
    const roleFlexEl = document.getElementById('playerDetailRoleFlex');
    const statsEl = document.getElementById('playerDetailStats');
    const contractEl = document.getElementById('playerDetailContract');
    const moveToBenchBtn = document.getElementById('playerDetailMoveToBench');
    const moveToStarterBtn = document.getElementById('playerDetailMoveToStarter');
    const offerContractBtn = document.getElementById('playerDetailOfferContract');
    const sellBtn = document.getElementById('playerDetailSell');
    const closeBtn = document.getElementById('playerDetailClose');
    const rosterPage = document.querySelector('[data-page="roster"]');
    if (!modal || !nameEl || !statsEl || !rosterPage) return;

    let detailPlayer = null;

    function openDetailModal(player) {
      detailPlayer = player;
      const yourTeam = league && league[0];
      if (!yourTeam || !player) return;
      ensureUserTeamSlots(yourTeam);
      const inStarters = (yourTeam.starterSlots || []).indexOf(player) >= 0;
      const inBench = (yourTeam.benchSlots || []).indexOf(player) >= 0;
      const inReserves = (yourTeam.reserveSlots || []).indexOf(player) >= 0;
      nameEl.textContent = getPlayerDisplayName(player);
      ageEl.textContent = 'Age ' + (player.age != null ? player.age : '—');
      if (rolePrimaryEl) rolePrimaryEl.textContent = (player.roleBias && player.roleBias.primaryRoleBias) ? player.roleBias.primaryRoleBias : '—';
      if (roleSecondaryEl) roleSecondaryEl.textContent = (player.roleBias && player.roleBias.secondaryRoleBias) ? player.roleBias.secondaryRoleBias : '—';
      if (roleFlexEl) roleFlexEl.textContent = (player.roleBias && player.roleBias.flexPotential) ? player.roleBias.flexPotential : '—';
      statsEl.innerHTML = buildPlayerStatsHTML(player);
      const years = player.contractYears != null ? player.contractYears : 1;
      const salary = player.salary != null ? player.salary : 5000;
      contractEl.textContent = years + ' year(s) left · $' + salary.toLocaleString() + '/mo';
      moveToBenchBtn.style.display = (inStarters || inReserves) ? 'inline-block' : 'none';
      moveToStarterBtn.style.display = inBench ? 'inline-block' : 'none';
      modal.classList.remove('is-hidden');
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeDetailModal() {
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();
      }
      detailPlayer = null;
      modal.classList.add('is-hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    rosterPage.addEventListener('click', function(e) {
      if (e.target.closest('.btn--offer-contract') || e.target.closest('.btn--add-to-starters') || e.target.closest('.btn--add-to-reserves') || e.target.closest('.btn--add-to-bench')) return;
      const card = e.target.closest('.player-card--clickable');
      const row = e.target.closest('.bench-row--clickable');
      const reserveRow = e.target.closest('.reserve-row--clickable');
      const el = card || row || reserveRow;
      if (!el) return;
      const yourTeam = league && league[0];
      if (!yourTeam || !yourTeam.players) return;
      const idx = parseInt(el.dataset.playerIndex, 10);
      const player = yourTeam.players[idx];
      if (player) openDetailModal(player);
    });

    function movePlayerToBench(player) {
      const yourTeam = league && league[0];
      if (!yourTeam || yourTeam !== league[0] || !Array.isArray(yourTeam.starterSlots)) return;
      ensureUserTeamSlots(yourTeam);
      const starterSlots = yourTeam.starterSlots;
      const benchSlots = yourTeam.benchSlots;
      const reserveSlots = yourTeam.reserveSlots || [];
      const si = starterSlots.indexOf(player);
      if (si >= 0) {
        starterSlots[si] = null;
        const bj = benchSlots.findIndex(s => s == null);
        if (bj >= 0) benchSlots[bj] = player;
      } else {
        const rj = reserveSlots.indexOf(player);
        if (rj < 0) return;
        reserveSlots[rj] = null;
        const bj = benchSlots.findIndex(s => s == null);
        if (bj >= 0) benchSlots[bj] = player;
      }
      syncUserTeamPlayersFromSlots(yourTeam);
      updateRosterUI();
      closeDetailModal();
    }

    function movePlayerToStarter(player) {
      const yourTeam = league && league[0];
      if (!yourTeam || yourTeam !== league[0] || !Array.isArray(yourTeam.starterSlots)) return;
      ensureUserTeamSlots(yourTeam);
      const starterSlots = yourTeam.starterSlots;
      const benchSlots = yourTeam.benchSlots;
      const reserveSlots = yourTeam.reserveSlots || [];
      const si = starterSlots.findIndex(s => s == null);
      if (si < 0) return;
      const bj = benchSlots.indexOf(player);
      if (bj >= 0) {
        benchSlots[bj] = null;
        starterSlots[si] = player;
      } else {
        const rj = reserveSlots.indexOf(player);
        if (rj >= 0) {
          reserveSlots[rj] = null;
          starterSlots[si] = player;
        }
      }
      syncUserTeamPlayersFromSlots(yourTeam);
      updateRosterUI();
      closeDetailModal();
    }

    function movePlayerToReserves(player) {
      const yourTeam = league && league[0];
      if (!yourTeam || yourTeam !== league[0] || !Array.isArray(yourTeam.benchSlots)) return;
      ensureUserTeamSlots(yourTeam);
      const benchSlots = yourTeam.benchSlots;
      const reserveSlots = yourTeam.reserveSlots || [];
      const bj = benchSlots.indexOf(player);
      if (bj < 0) return;
      benchSlots[bj] = null;
      const rj = reserveSlots.findIndex(s => s == null);
      if (rj >= 0) reserveSlots[rj] = player;
      syncUserTeamPlayersFromSlots(yourTeam);
      updateRosterUI();
      closeDetailModal();
    }

    rosterPage.addEventListener('click', function(e) {
      const addStarters = e.target.closest('.btn--add-to-starters');
      const addReserves = e.target.closest('.btn--add-to-reserves');
      const addBench = e.target.closest('.btn--add-to-bench');
      const yourTeam = league && league[0];
      if (!yourTeam || !yourTeam.players) return;
      if (addStarters) {
        const idx = parseInt(addStarters.getAttribute('data-player-index'), 10);
        const player = yourTeam.players[idx];
        if (player) movePlayerToStarter(player);
        return;
      }
      if (addReserves) {
        const idx = parseInt(addReserves.getAttribute('data-player-index'), 10);
        const player = yourTeam.players[idx];
        if (player) movePlayerToReserves(player);
        return;
      }
      if (addBench) {
        const idx = parseInt(addBench.getAttribute('data-player-index'), 10);
        const player = yourTeam.players[idx];
        if (player) movePlayerToBench(player);
        return;
      }
    });

    moveToBenchBtn.addEventListener('click', () => { if (detailPlayer) movePlayerToBench(detailPlayer); });
    moveToStarterBtn.addEventListener('click', () => { if (detailPlayer) movePlayerToStarter(detailPlayer); });
    offerContractBtn.addEventListener('click', () => {
      if (!detailPlayer) return;
      const playerToOffer = detailPlayer;
      closeDetailModal();
      document.dispatchEvent(new CustomEvent('nexus:openContractOffer', { detail: { player: playerToOffer } }));
    });
    sellBtn.addEventListener('click', () => {
      if (!detailPlayer) return;
      const yourTeam = league && league[0];
      if (!yourTeam || !yourTeam.players) return;
      const playerToSell = detailPlayer;
      const name = getPlayerDisplayName(playerToSell);
      const estimatedFee = Math.round((typeof calculatePlayerValue === 'function' ? calculatePlayerValue(playerToSell) : 10000) * 0.8);
      showConfirm('Sell ' + name + '? You will receive approximately $' + estimatedFee.toLocaleString() + ' (80% of value). Continue?', function() {
        const result = Nexus.sellPlayer({ userTeam: yourTeam, player: playerToSell });
        closeDetailModal();
        if (result && result.success) {
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
          updateRosterUI();
          showNotification(result.message || ('Sold ' + name), 'success');
        } else {
          showNotification(result && result.message ? result.message : 'Could not sell player.', 'error');
        }
      });
    });
    closeBtn.addEventListener('click', closeDetailModal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeDetailModal(); });
  }

  function setupContractOfferModal() {
    const modal = document.getElementById('contractOfferModal');
    const playerNameEl = document.getElementById('contractOfferPlayerName');
    const yearsEl = document.getElementById('contractOfferYears');
    const salaryEl = document.getElementById('contractOfferSalary');
    const cancelBtn = document.getElementById('contractOfferCancel');
    const confirmBtn = document.getElementById('contractOfferConfirm');
    const rosterPage = document.querySelector('[data-page="roster"]');
    if (!modal || !playerNameEl || !yearsEl || !salaryEl || !cancelBtn || !confirmBtn || !rosterPage) return;

    let currentPlayer = null;

    function openModal(player) {
      currentPlayer = player;
      playerNameEl.textContent = getPlayerDisplayName(player);
      const currentSalary = player.salary != null ? player.salary : 5000;
      salaryEl.value = Math.round(currentSalary * 1.1);
      yearsEl.value = '2';
      modal.classList.remove('is-hidden');
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();
      }
      currentPlayer = null;
      modal.classList.add('is-hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    rosterPage.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn--offer-contract');
      if (!btn) return;
      const yourTeam = league && league[0];
      if (!yourTeam || !yourTeam.players) return;
      const idx = parseInt(btn.getAttribute('data-player-index'), 10);
      const player = yourTeam.players[idx];
      if (player) openModal(player);
    });
    document.addEventListener('nexus:openContractOffer', function(e) {
      if (e.detail && e.detail.player) openModal(e.detail.player);
    });

    cancelBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', () => {
      if (!currentPlayer) return;
      const player = currentPlayer;
      const playerName = getPlayerDisplayName(player);
      const yourTeam = league && league[0];
      const years = parseInt(yearsEl.value, 10) || 2;
      const salary = parseInt(salaryEl.value, 10) || player.salary || 5000;
      const oldSalary = player.salary != null ? player.salary : 0;
      const result = Nexus.offerContractRenewal ? Nexus.offerContractRenewal(player, years, salary) : { accepted: false, reason: 'Not available' };
      closeModal();
      if (result.accepted) {
        if (yourTeam && yourTeam.finance && yourTeam.finance.monthlyCost != null) {
          yourTeam.finance.monthlyCost += (salary - oldSalary);
        }
        if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
        updateRosterUI();
        showNotification(playerName + ' accepted the new contract (' + years + ' years, $' + salary.toLocaleString() + '/mo).', 'success');
      } else {
        showNotification(playerName + ' declined: ' + (result.reason || 'wants higher salary') + '.', 'info');
      }
    });
  }

  function setupMarketPlayerModal() {
    const modal = document.getElementById('marketPlayerModal');
    const nameEl = document.getElementById('marketPlayerName');
    const metaEl = document.getElementById('marketPlayerMeta');
    const statsEl = document.getElementById('marketPlayerStats');
    const priceEl = document.getElementById('marketPlayerPrice');
    const closeBtn = document.getElementById('marketPlayerModalClose');
    const buyBtn = document.getElementById('marketPlayerModalBuy');
    if (!modal || !nameEl || !statsEl || !priceEl || !buyBtn) return;

    let marketModalContext = null;

    function closeMarketModal() {
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();
      }
      marketModalContext = null;
      modal.classList.add('is-hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    openMarketPlayerModalRef = function(data) {
      if (!data) return;
      marketModalContext = data;
      const player = data.type === 'listing' ? data.listing.player : (data.type === 'buyFromClub' ? data.player : data.player);
      if (!player) return;
      nameEl.textContent = getPlayerDisplayName(player);
      if (metaEl) metaEl.textContent = 'Age ' + (player.age != null ? player.age : '—') + ' · Primary: ' + (player.roleBias ? player.roleBias.primaryRoleBias : '—') + ' · Secondary: ' + (player.roleBias ? player.roleBias.secondaryRoleBias : '—');
      statsEl.innerHTML = buildPlayerStatsHTML(player);
      const errEl = document.getElementById('marketPlayerError');
      if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
      if (data.type === 'listing') {
        const listing = data.listing;
        priceEl.innerHTML = '<strong>Transfer fee: $' + (listing.askingPrice || 0).toLocaleString() + '</strong><br><span class="salary">Salary: $' + (player.salary || 0).toLocaleString() + '/mo</span>';
        buyBtn.textContent = 'Buy';
      } else if (data.type === 'buyFromClub') {
        const baseValue = (window.Nexus.calculatePlayerValue && window.Nexus.calculatePlayerValue(player)) || 0;
        const askPrice = Math.round(baseValue * 1.15);
        priceEl.innerHTML = '<strong>Transfer fee: $' + askPrice.toLocaleString() + '</strong> <span class="salary">(15% markup)</span><br><span class="salary">Salary: $' + (player.salary || 0).toLocaleString() + '/mo</span>';
        buyBtn.textContent = 'Buy from club';
      } else {
        priceEl.innerHTML = '<strong>Free agent</strong><br><span class="salary">Salary: $' + (player.salary || 0).toLocaleString() + '/mo</span>';
        buyBtn.textContent = 'Sign (Free)';
      }
      modal.classList.remove('is-hidden');
      modal.setAttribute('aria-hidden', 'false');
    };

    buyBtn.addEventListener('click', () => {
      if (!marketModalContext) return;
      const { type, listing, player, seasonData, userTeam, sellerTeam } = marketModalContext;
      if (type === 'listing') {
        if (!userTeam || !listing) return;
        const errEl = document.getElementById('marketPlayerError');
        if (errEl) errEl.style.display = 'none';
        const check = Nexus.canAffordPlayer(userTeam, listing.askingPrice, listing.player.salary || 5000);
        if (!check.canAfford) {
          if (errEl) { errEl.textContent = check.reason || 'Cannot afford this transfer.'; errEl.style.display = 'block'; }
          return;
        }
        const result = Nexus.buyPlayer({ userTeam, sellerTeam: listing.team, player: listing.player, askingPrice: listing.askingPrice });
        if (result.success) {
          closeMarketModal();
          showNotification(result.message || 'Player signed.', 'success');
          if (seasonData && seasonData.transferMarket) seasonData.transferMarket = seasonData.transferMarket.filter(e => e !== listing);
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
          if (typeof updateRosterUI === 'function') updateRosterUI();
          renderTransferMarket(seasonData, userTeamRef());
        } else {
          if (errEl) { errEl.textContent = result.message || 'Transfer failed.'; errEl.style.display = 'block'; }
        }
      } else if (type === 'buyFromClub') {
        if (!userTeam || !sellerTeam || !player) return;
        const errEl = document.getElementById('marketPlayerError');
        if (errEl) errEl.style.display = 'none';
        const askPrice = Math.round(((Nexus.calculatePlayerValue && Nexus.calculatePlayerValue(player)) || 0) * 1.15);
        const check = Nexus.canAffordPlayer(userTeam, askPrice, player.salary || 5000);
        if (!check.canAfford) {
          if (errEl) { errEl.textContent = check.reason || 'Cannot afford this transfer.'; errEl.style.display = 'block'; }
          return;
        }
        const result = Nexus.buyPlayer({ userTeam, sellerTeam, player, askingPrice: askPrice, season: seasonData });
        if (result.success) {
          closeMarketModal();
          showNotification(result.message || 'Player signed from club.', 'success');
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
          if (typeof updateRosterUI === 'function') updateRosterUI();
          if (typeof updateStandingsUI === 'function' && seasonData) updateStandingsUI(seasonData);
        } else {
          if (errEl) { errEl.textContent = result.message || 'Transfer failed.'; errEl.style.display = 'block'; }
        }
      } else {
        if (!userTeam || !player) return;
        const errEl = document.getElementById('marketPlayerError');
        if (errEl) errEl.style.display = 'none';
        const result = Nexus.signFreeAgent(userTeam, player, player.salary);
        if (result.success) {
          closeMarketModal();
          showNotification(result.message || 'Free agent signed.', 'success');
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
          if (typeof updateRosterUI === 'function') updateRosterUI();
          renderTransferMarket(seasonData, userTeamRef());
        } else {
          if (errEl) { errEl.textContent = result.message || 'Signing failed.'; errEl.style.display = 'block'; }
        }
      }
    });
    closeBtn.addEventListener('click', closeMarketModal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeMarketModal(); });
  }

  function setupOtherTeamRosterModal() {
    const modal = document.getElementById('otherTeamRosterModal');
    const titleEl = document.getElementById('otherTeamRosterTitle');
    const startersEl = document.getElementById('otherTeamStarters');
    const benchEl = document.getElementById('otherTeamBench');
    const reservesEl = document.getElementById('otherTeamReserves');
    const closeBtn = document.getElementById('otherTeamRosterModalClose');
    if (!modal || !titleEl || !startersEl || !benchEl || !reservesEl) return;

    function closeRosterModal() {
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();
      }
      modal.classList.add('is-hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    function renderPlayerRow(p, sectionLabel) {
      const row = document.createElement('div');
      row.className = 'list-row list-row--clickable other-team-player-row';
      const rb = p.roleBias || {};
      const age = p.age != null ? p.age : '—';
      row.innerHTML = `
        <span class="other-team-player-name">${getPlayerDisplayName(p)}</span>
        <span class="age-badge age-badge--prime">${age}</span>
        <span>Primary: ${rb.primaryRoleBias || '—'}</span>
        <span>Secondary: ${rb.secondaryRoleBias || '—'}</span>
      `;
      row.addEventListener('click', () => {
        closeRosterModal();
        if (openMarketPlayerModalRef) {
          openMarketPlayerModalRef({
            type: 'buyFromClub',
            player: p,
            sellerTeam: currentOtherTeam,
            seasonData: season,
            userTeam: userTeamRef()
          });
        }
      });
      return row;
    }

    let currentOtherTeam = null;

    openOtherTeamRosterModalRef = function(team) {
      if (!team || !team.players) return;
      currentOtherTeam = team;
      titleEl.textContent = team.name || 'Roster';
      const starters = team.players.slice(0, 5);
      const bench = team.players.slice(5, 8);
      const reserves = team.players.slice(8);

      startersEl.innerHTML = '';
      starters.forEach(p => startersEl.appendChild(renderPlayerRow(p, 'Starters')));

      benchEl.innerHTML = '';
      bench.forEach(p => benchEl.appendChild(renderPlayerRow(p, 'Bench')));

      reservesEl.innerHTML = '';
      reserves.forEach(p => reservesEl.appendChild(renderPlayerRow(p, 'Reserves')));

      modal.classList.remove('is-hidden');
      modal.setAttribute('aria-hidden', 'false');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeRosterModal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeRosterModal(); });
  }

  function setupYouthAcademyPlayerModal() {
    const modal = document.getElementById('youthAcademyPlayerModal');
    const nameEl = document.getElementById('youthAcademyPlayerName');
    const ageEl = document.getElementById('youthAcademyPlayerAge');
    const rolePrimaryEl = document.getElementById('youthAcademyPlayerRolePrimary');
    const roleSecondaryEl = document.getElementById('youthAcademyPlayerRoleSecondary');
    const roleFlexEl = document.getElementById('youthAcademyPlayerRoleFlex');
    const statsEl = document.getElementById('youthAcademyPlayerStats');
    const salaryEl = document.getElementById('youthAcademyPlayerSalary');
    const promoteBtn = document.getElementById('youthAcademyPlayerPromote');
    const releaseBtn = document.getElementById('youthAcademyPlayerRelease');
    const closeBtn = document.getElementById('youthAcademyPlayerClose');
    const academyListings = document.getElementById('youthAcademyListings');
    if (!modal || !nameEl || !statsEl || !promoteBtn || !releaseBtn) return;

    let currentProspect = null;
    let currentUserTeam = null;

    function openYouthModal(prospect, userTeam) {
      currentProspect = prospect;
      currentUserTeam = userTeam;
      if (!prospect || !userTeam) return;
      nameEl.textContent = getPlayerDisplayName(prospect);
      ageEl.textContent = 'Age ' + (prospect.age != null ? prospect.age : '—');
      if (rolePrimaryEl) rolePrimaryEl.textContent = (prospect.roleBias && prospect.roleBias.primaryRoleBias) ? prospect.roleBias.primaryRoleBias : '—';
      if (roleSecondaryEl) roleSecondaryEl.textContent = (prospect.roleBias && prospect.roleBias.secondaryRoleBias) ? prospect.roleBias.secondaryRoleBias : '—';
      if (roleFlexEl) roleFlexEl.textContent = (prospect.roleBias && prospect.roleBias.flexPotential) ? prospect.roleBias.flexPotential : '—';
      statsEl.innerHTML = buildPlayerStatsHTML(prospect);
      if (salaryEl) salaryEl.textContent = '$' + (prospect.salary != null ? prospect.salary : 0).toLocaleString() + '/mo';
      const age = prospect.age != null ? prospect.age : 0;
      promoteBtn.disabled = age < 17;
      promoteBtn.title = age >= 17 ? 'Promote to main roster' : 'Available at 17';
      modal.classList.remove('is-hidden');
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeYouthModal() {
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();
      }
      currentProspect = null;
      currentUserTeam = null;
      modal.classList.add('is-hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    promoteBtn.addEventListener('click', () => {
      if (!currentProspect || !currentUserTeam) return;
      const result = Nexus.promoteYouthToRoster(currentUserTeam, currentProspect);
      if (result.success) {
        showNotification(result.message || 'Promoted to roster', 'success');
        closeYouthModal();
        updateYouthAcademyUI(userTeamRef());
        if (typeof updateRosterUI === 'function') updateRosterUI();
        if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
      } else showNotification(result.message || 'Promote failed', 'error');
    });

    releaseBtn.addEventListener('click', () => {
      if (!currentProspect || !currentUserTeam) return;
      const team = currentUserTeam;
      const prospect = currentProspect;
      const idx = (team.youthAcademy || []).indexOf(prospect);
      if (idx >= 0) team.youthAcademy.splice(idx, 1);
      const age = prospect.age != null ? prospect.age : 0;
      if (age <= 17) {
        (window.Nexus.YOUTH_MARKET = window.Nexus.YOUTH_MARKET || []).push(prospect);
      }
      if (team.finance && team.finance.monthlyCost != null) team.finance.monthlyCost -= (prospect.salary || 0);
      showNotification(getPlayerDisplayName(prospect) + ' released' + (age <= 17 ? ' (back to youth market)' : ''), 'info');
      closeYouthModal();
      updateYouthAcademyUI(userTeamRef());
      if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
    });

    if (closeBtn) closeBtn.addEventListener('click', closeYouthModal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeYouthModal(); });

    if (academyListings) {
      academyListings.addEventListener('click', function(e) {
        const card = e.target.closest('.market-card--clickable');
        if (!card) return;
        const idx = parseInt(card.getAttribute('data-academy-index'), 10);
        if (isNaN(idx)) return;
        const userTeam = userTeamRef();
        if (!userTeam || !userTeam.youthAcademy) return;
        const prospect = userTeam.youthAcademy[idx];
        if (prospect) openYouthModal(prospect, userTeam);
      });
    }
  }

  function getMarketAgePhaseClass(age) {
    if (age == null) return 'age-badge--prime';
    if (age <= 21) return 'age-badge--youth';
    if (age <= 25) return 'age-badge--prime';
    return 'age-badge--veteran';
  }

  const TRAINING_PLAN_KEYS = ['Mechanical', 'Tactical', 'Positional', 'Mental', 'Communication', 'Adaptive'];
  const TEAM_TRAINING_KEYS_UI = window.Nexus.TEAM_TRAINING_PLAN_KEYS || ['Fast Execute', 'Default Heavy', 'Contact Play', 'Utility Spam', 'Anti-Strat', 'Post-Plant'];

  function updateDevelopmentUI() {
    const userTeam = userTeamRef();
    const teamSelectEl = document.getElementById('teamTrainingSelect');
    const playerListEl = document.getElementById('developmentPlayerList');
    if (!teamSelectEl || !playerListEl) return;
    if (!userTeam) { playerListEl.innerHTML = ''; return; }
    if (userTeam.activeTeamTraining == null || userTeam.activeTeamTraining === '' || !TEAM_TRAINING_KEYS_UI.includes(userTeam.activeTeamTraining)) {
      userTeam.activeTeamTraining = TEAM_TRAINING_KEYS_UI[0];
    }
    teamSelectEl.value = userTeam.activeTeamTraining;
    teamSelectEl.onchange = function() {
      userTeam.activeTeamTraining = teamSelectEl.value;
      const trainingEl = document.getElementById('uiActiveTeamTraining');
      const trainingDescEl = document.getElementById('uiActiveTeamTrainingDesc');
      const planName = userTeam.activeTeamTraining || '—';
      if (trainingEl) trainingEl.textContent = planName;
      if (trainingDescEl) {
        const plans = window.Nexus.TEAM_TRAINING_PLANS;
        const desc = (planName !== '—' && plans && plans[planName] && plans[planName].description) ? ' — ' + plans[planName].description : '';
        trainingDescEl.textContent = desc;
      }
    };
    const players = userTeam.players || [];
    const getOverall = window.Nexus.getPlayerOverall || (p => (p.stats && typeof STAT_KEYS !== 'undefined' ? Math.round(STAT_KEYS.reduce((s, k) => s + ((p.stats[k] && p.stats[k].current) || 0), 0) / STAT_KEYS.length) : 70));
    playerListEl.innerHTML = '';
    players.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'market-card development-player-card';
      const currentPlan = p.assignedTrainingPlan != null && TRAINING_PLAN_KEYS.includes(p.assignedTrainingPlan) ? p.assignedTrainingPlan : TRAINING_PLAN_KEYS[0];
      if (p.assignedTrainingPlan == null || !TRAINING_PLAN_KEYS.includes(p.assignedTrainingPlan)) p.assignedTrainingPlan = TRAINING_PLAN_KEYS[0];
      const optionsHtml = TRAINING_PLAN_KEYS.map(k => '<option value="' + k + '"' + (k === currentPlan ? ' selected' : '') + '>' + k + '</option>').join('');
      card.innerHTML = `
        <div class="market-card__header">
          <strong>${getPlayerDisplayName(p)}</strong>
          <span class="age-badge">${p.age != null ? p.age : '—'}</span>
        </div>
        <div class="market-card__info">
          <span>Primary: ${(p.roleBias && p.roleBias.primaryRoleBias) || '—'}</span>
          <span>Overall: ${getOverall(p)}</span>
        </div>
        <label class="development-player-plan">Plan: <select data-player-idx="${idx}">${optionsHtml}</select></label>
      `;
      const sel = card.querySelector('select');
      sel.addEventListener('change', function() {
        const player = (userTeam.players || [])[parseInt(sel.getAttribute('data-player-idx'), 10)];
        if (player) player.assignedTrainingPlan = sel.value;
      });
      playerListEl.appendChild(card);
    });

    var youthListEl = document.getElementById('developmentYouthList');
    if (youthListEl) {
      var academy = (userTeam.youthAcademy || []);
      var statKeys = (typeof STAT_KEYS !== 'undefined' && STAT_KEYS) ? STAT_KEYS : ['aim', 'reaction', 'gameSense', 'positioning', 'utilityIQ', 'decisionSpeed', 'adaptability', 'consistency', 'mental', 'communication'];
      var currentMatchday = (typeof season !== 'undefined' && season && season.currentMatchday != null) ? season.currentMatchday : 0;
      if (academy.length === 0) {
        youthListEl.innerHTML = '<p class="panel__hint">No players in academy. Sign prospects from the Youth Market.</p>';
      } else {
        youthListEl.innerHTML = '';
        academy.forEach(function(prospect, idx) {
          if (window.Nexus.ensureYouthProspectRoleBias) window.Nexus.ensureYouthProspectRoleBias(prospect);
          var ticksThisMd = (prospect.lastTrainingMatchday === currentMatchday && prospect.ticksThisMatchday != null) ? prospect.ticksThisMatchday : 0;
          var statsTrainedThisMd = (prospect.lastTrainingMatchday === currentMatchday && Array.isArray(prospect.statsTrainedThisMatchday)) ? prospect.statsTrainedThisMatchday : [];
          var noTicksLeft = ticksThisMd >= 3;
          var card = document.createElement('div');
          card.className = 'market-card development-player-card development-youth-card';
          var overall = getOverall(prospect);
          var age = prospect.age != null ? prospect.age : '—';
          var primaryRole = (prospect.roleBias && prospect.roleBias.primaryRoleBias) || '';
          var primaryCoreStats = (typeof ROLES !== 'undefined' && primaryRole && ROLES[primaryRole] && ROLES[primaryRole].core) ? ROLES[primaryRole].core : [];
          var statRows = statKeys.map(function(sk) {
            var st = prospect.stats && prospect.stats[sk];
            var cur = st && st.current != null ? Math.round(st.current * 10) / 10 : '—';
            var cap = st && st.maxCap != null ? st.maxCap : '—';
            var atMax = st && st.current >= st.maxCap;
            var alreadyTrainedThisMd = statsTrainedThisMd.indexOf(sk) >= 0;
            var canTrain = !atMax && !alreadyTrainedThisMd && !noTicksLeft;
            var label = atMax ? 'Max' : (alreadyTrainedThisMd ? 'Done' : (noTicksLeft ? '—' : 'Train'));
            var btnHtml = canTrain ? '<button type="button" class="btn btn--small development-youth-train" data-academy-idx="' + idx + '" data-stat-key="' + sk + '">Train</button>' : '<span class="development-youth-tick-label">' + label + '</span>';
            var isPrimaryCore = primaryCoreStats.indexOf(sk) >= 0;
            var statLabel = isPrimaryCore ? '★ ' + sk : sk;
            return '<div class="development-youth-stat-row"><span class="development-youth-stat-name' + (isPrimaryCore ? ' development-youth-stat-name--primary' : '') + '">' + statLabel + '</span> <span class="development-youth-stat-val">' + cur + ' / ' + cap + '</span>' + btnHtml + '</div>';
          }).join('');
          card.innerHTML = '<div class="market-card__header"><strong>' + getPlayerDisplayName(prospect) + '</strong><span class="age-badge">' + age + '</span></div><div class="market-card__info"><span>Overall: ' + overall + '</span><span class="development-youth-ticks">' + ticksThisMd + '/3 ticks this matchday</span></div><div class="development-youth-stats">' + statRows + '</div>';
          youthListEl.appendChild(card);
        });
        youthListEl.querySelectorAll('.development-youth-train').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var idx = parseInt(btn.getAttribute('data-academy-idx'), 10);
            var statKey = btn.getAttribute('data-stat-key');
            var team = userTeamRef();
            if (!team || !team.youthAcademy || !team.youthAcademy[idx]) return;
            var prospect = team.youthAcademy[idx];
            var env = (typeof environmentMap !== 'undefined' && team.name && environmentMap[team.name]) ? environmentMap[team.name] : {};
            var result = window.Nexus.trainYouthProspect && window.Nexus.trainYouthProspect({ team: team, prospect: prospect, statKey: statKey, environment: env, season: typeof season !== 'undefined' ? season : null });
            if (result && result.success) {
              if (typeof showNotification === 'function') showNotification('+' + (result.growth != null ? result.growth.toFixed(2) : '0') + ' ' + statKey, 'success');
              if (typeof saveGameState === 'function') saveGameState();
              updateDevelopmentUI();
            } else if (result && result.message && typeof showNotification === 'function') {
              showNotification(result.message, 'error');
            }
          });
        });
      }
    }

    var historyEl = document.getElementById('developmentYouthHistory');
    if (historyEl) {
      var history = (userTeam && userTeam.youthTrainingHistory) ? userTeam.youthTrainingHistory : [];
      if (history.length === 0) {
        historyEl.innerHTML = '<p class="panel__hint">No youth training recorded yet. Train academy players above to see history here.</p>';
      } else {
        historyEl.innerHTML = history.map(function(day) {
          var md = day.matchday != null ? day.matchday : 0;
          var entries = (day.entries && day.entries.length) ? day.entries : [];
          var byPlayer = {};
          entries.forEach(function(e) {
            var key = (e.playerId != null ? e.playerId : e.playerName) || '?';
            if (!byPlayer[key]) byPlayer[key] = { name: e.playerName || '—', stats: [] };
            byPlayer[key].stats.push({ statKey: e.statKey, growth: e.growth != null ? e.growth : 0 });
          });
          var playerBlocks = Object.keys(byPlayer).map(function(key) {
            var p = byPlayer[key];
            var statParts = (p.stats || []).map(function(s) {
              var g = (s.growth != null && typeof s.growth === 'number') ? s.growth.toFixed(2) : '0';
              return s.statKey + ' (+' + g + ')';
            }).join(', ');
            return '<div class="development-youth-history-player"><strong>' + (p.name || '—') + '</strong>: ' + statParts + '</div>';
          }).join('');
          return '<div class="development-youth-history-day"><div class="development-youth-history-day-title">Matchday ' + (md + 1) + '</div><div class="development-youth-history-day-players">' + playerBlocks + '</div></div>';
        }).join('');
      }
    }
  }

  function updateYouthAcademyUI(userTeam) {
    const academyEl = document.getElementById('youthAcademyListings');
    const marketEl = document.getElementById('youthMarketListings');
    const getOverall = window.Nexus.getPlayerOverall || (p => (p.stats && STAT_KEYS ? Math.round(STAT_KEYS.reduce((s, k) => s + ((p.stats[k] && p.stats[k].current) || 0), 0) / STAT_KEYS.length) : 70));
    if (!academyEl || !marketEl) return;
    academyEl.innerHTML = '';
    marketEl.innerHTML = '';
    const academy = (userTeam && userTeam.youthAcademy) ? userTeam.youthAcademy : [];
    academy.forEach((p, idx) => {
      if (window.Nexus.ensureYouthProspectRoleBias) window.Nexus.ensureYouthProspectRoleBias(p);
      const age = p.age != null ? p.age : 16;
      const overall = getOverall(p);
      const card = document.createElement('div');
      card.className = 'market-card market-card--clickable';
      card.setAttribute('data-academy-index', String(idx));
      card.innerHTML = `
        <div class="market-card__header">
          <strong>${getPlayerDisplayName(p)}</strong>
          <span class="age-badge ${getMarketAgePhaseClass(age)}">${age}</span>
        </div>
        <div class="market-card__info">
          <span>Primary: ${(p.roleBias && p.roleBias.primaryRoleBias) || '—'}</span>
          <span>Secondary: ${(p.roleBias && p.roleBias.secondaryRoleBias) || '—'}</span>
          <span>Overall: ${overall}</span>
        </div>
        <div class="market-card__price"><span class="salary">$${(p.salary || 0).toLocaleString()}/mo</span></div>
        <span class="panel__hint">Click for details</span>
      `;
      academyEl.appendChild(card);
    });
    if (academy.length === 0) academyEl.innerHTML = '<div class="schedule-day">No players in academy. Sign prospects from the Youth Market below.</div>';
    const youthMarket = window.Nexus.YOUTH_MARKET || [];
    youthMarket.forEach((p, idx) => {
      if (window.Nexus.ensureYouthProspectRoleBias) window.Nexus.ensureYouthProspectRoleBias(p);
      const age = p.age != null ? p.age : 16;
      const overall = getOverall(p);
      const salary = p.salary || 4000;
      const card = document.createElement('div');
      card.className = 'market-card';
      card.innerHTML = `
        <div class="market-card__header">
          <strong>${getPlayerDisplayName(p)}</strong>
          <span class="age-badge ${getMarketAgePhaseClass(age)}">${age}</span>
        </div>
        <div class="market-card__info">
          <span>Primary: ${(p.roleBias && p.roleBias.primaryRoleBias) || '—'}</span>
          <span>Secondary: ${(p.roleBias && p.roleBias.secondaryRoleBias) || '—'}</span>
          <span>Overall: ${overall}</span>
          <span>Free (salary only)</span>
        </div>
        <div class="market-card__price"><span class="salary">$${salary.toLocaleString()}/mo</span></div>
        <button type="button" class="btn btn--buy btn--sign-youth" data-market-index="${idx}">Sign to academy</button>
      `;
      const btn = card.querySelector('.btn--sign-youth');
      btn.addEventListener('click', () => {
        const prospect = (window.Nexus.YOUTH_MARKET || [])[parseInt(btn.getAttribute('data-market-index'), 10)];
        if (!prospect || !userTeam) return;
        const result = Nexus.signYouthToAcademy(userTeam, prospect);
        if (result.success) {
          showNotification(result.message || 'Signed to academy', 'success');
          updateYouthAcademyUI(userTeamRef());
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
        } else showNotification(result.message || 'Sign failed', 'error');
      });
      marketEl.appendChild(card);
    });
    if (youthMarket.length === 0) marketEl.innerHTML = '<div class="schedule-day">No prospects available. Market refreshes every season.</div>';
  }

  function renderTransferMarket(seasonData, userTeam) {
    const listEl = document.getElementById('marketListings');
    const freeEl = document.getElementById('freeAgentsListings');
    const hintEl = document.getElementById('marketRefreshHint');
    if (!listEl) return;

    const countdown = seasonData && seasonData.transferMarketRefreshCountdown != null ? seasonData.transferMarketRefreshCountdown : 3;
    if (hintEl) hintEl.textContent = 'Market refreshes in ' + countdown + ' matchday(s)';

    const roleFilter = (document.getElementById('marketFilterRole') || {}).value;
    const ageFilter = (document.getElementById('marketFilterAge') || {}).value;
    const priceFilter = (document.getElementById('marketFilterPrice') || {}).value;

    const listings = (seasonData && seasonData.transferMarket) ? seasonData.transferMarket.slice() : [];
    let filtered = listings.filter(entry => {
      const p = entry.player;
      if (!p) return false;
      if (roleFilter && p.roleBias && p.roleBias.primaryRoleBias !== roleFilter && p.roleBias.secondaryRoleBias !== roleFilter) return false;
      const age = p.age != null ? p.age : 22;
      if (ageFilter === 'youth' && age > 21) return false;
      if (ageFilter === 'prime' && (age < 22 || age > 25)) return false;
      if (ageFilter === 'veteran' && age < 26) return false;
      const price = entry.askingPrice || 0;
      if (priceFilter === 'under50' && price >= 50000) return false;
      if (priceFilter === '50-150' && (price < 50000 || price > 150000)) return false;
      if (priceFilter === '150plus' && price < 150000) return false;
      return true;
    });

    listEl.innerHTML = '';
    const marketList = (seasonData && seasonData.transferMarket) || [];
    const getOverall = window.Nexus.getPlayerOverall || (p => 70);
    filtered.forEach((entry) => {
      const p = entry.player;
      const team = entry.team;
      const askingPrice = entry.askingPrice || 0;
      const salary = p.salary || 5000;
      const age = p.age != null ? p.age : 22;
      const overall = getOverall(p);
      const listingIndex = marketList.indexOf(entry);
      const card = document.createElement('div');
      card.className = 'market-card';
      card.innerHTML = `
        <div class="market-card__header">
          <strong>${getPlayerDisplayName(p)}</strong>
          <span class="age-badge ${getMarketAgePhaseClass(age)}">${age}</span>
        </div>
        <div class="market-card__info">
          <span>Primary: ${(p.roleBias && p.roleBias.primaryRoleBias) || '—'}</span>
          <span>Secondary: ${(p.roleBias && p.roleBias.secondaryRoleBias) || '—'}</span>
          <span>Overall: ${overall}</span>
          <span>Team: ${team && team.name ? team.name : '—'}</span>
        </div>
        <div class="market-card__price">
          <strong>$${askingPrice.toLocaleString()}</strong>
          <span class="salary">$${salary.toLocaleString()}/mo</span>
        </div>
        <button type="button" class="btn btn--buy" data-listing-index="${listingIndex}">Buy</button>
      `;
      const btn = card.querySelector('.btn--buy');
      btn.addEventListener('click', () => {
        const listing = marketList[parseInt(btn.getAttribute('data-listing-index'), 10)];
        if (listing && openMarketPlayerModalRef) openMarketPlayerModalRef({ type: 'listing', listing, seasonData, userTeam });
      });
      listEl.appendChild(card);
    });

    if (freeEl) {
      const freeAgents = window.Nexus.FREE_AGENTS || [];
      freeEl.innerHTML = '';
      freeAgents.forEach((p, faIdx) => {
        const salary = p.salary || 5000;
        const age = p.age != null ? p.age : 22;
        const overall = getOverall(p);
        const card = document.createElement('div');
        card.className = 'market-card';
        card.innerHTML = `
          <div class="market-card__header">
            <strong>${getPlayerDisplayName(p)}</strong>
            <span class="age-badge ${getMarketAgePhaseClass(age)}">${age}</span>
          </div>
          <div class="market-card__info">
            <span>Primary: ${(p.roleBias && p.roleBias.primaryRoleBias) || '—'}</span>
            <span>Secondary: ${(p.roleBias && p.roleBias.secondaryRoleBias) || '—'}</span>
            <span>Overall: ${overall}</span>
            <span>Free Agent</span>
          </div>
          <div class="market-card__price">
            <span class="salary">$${salary.toLocaleString()}/mo</span>
          </div>
          <button type="button" class="btn btn--buy btn--sign-free" data-free-index="${faIdx}">Sign (Free)</button>
        `;
        const fBtn = card.querySelector('.btn--sign-free');
        fBtn.addEventListener('click', () => {
          const fa = (window.Nexus.FREE_AGENTS || [])[parseInt(fBtn.getAttribute('data-free-index'), 10)];
          if (fa && openMarketPlayerModalRef) openMarketPlayerModalRef({ type: 'free', player: fa, seasonData, userTeam });
        });
        freeEl.appendChild(card);
      });
    }

    var historyEl = document.getElementById('transferHistoryList');
    if (historyEl) {
      var hist = (typeof transferHistory !== 'undefined' && Array.isArray(transferHistory)) ? transferHistory : [];
      var mainTeams = (typeof league !== 'undefined' && league) ? league : (window.Nexus.LEAGUE || []);
      var challTeams = (typeof challengerLeague !== 'undefined' && challengerLeague) ? challengerLeague : (window.Nexus.CHALLENGER_LEAGUE || []);
      var allTeams = (mainTeams || []).concat(challTeams || []);
      var byTeam = {};
      allTeams.forEach(function(t) { if (t && t.name) byTeam[t.name] = { name: t.name, tier: t.tier || 'Main', in: [], out: [] }; });
      hist.forEach(function(ev) {
        if (!ev || !ev.teamName) return;
        if (!byTeam[ev.teamName]) byTeam[ev.teamName] = { name: ev.teamName, tier: 'Main', in: [], out: [] };
        var text = ev.playerName || '—';
        if (ev.how === 'transfer' && ev.otherTeam) text += ' (' + (ev.direction === 'out' ? 'to ' + ev.otherTeam : 'from ' + ev.otherTeam) + ')';
        else if (ev.how === 'free_agents') text += ' (free agents)';
        else if (ev.how === 'market_refresh') text += ' (left market)';
        if (ev.direction === 'in') byTeam[ev.teamName].in.push(text);
        else byTeam[ev.teamName].out.push(text);
      });
      var mainNames = (mainTeams || []).map(function(t) { return t.name; }).filter(Boolean);
      var challNames = (challTeams || []).map(function(t) { return t.name; }).filter(Boolean);
      var order = mainNames.concat(challNames);
      if (order.length === 0) order = Object.keys(byTeam).sort();
      if (hist.length === 0) {
        historyEl.innerHTML = '<p class="panel__hint">No transfer activity yet. Transfers and free agent signings will appear here.</p>';
      } else {
        historyEl.innerHTML = order.map(function(teamName) {
          var row = byTeam[teamName];
          if (!row) return '';
          var tierLabel = (row.tier === 'Challenger') ? ' (Challenger)' : '';
          var inList = (row.in && row.in.length) ? row.in.join('; ') : '—';
          var outList = (row.out && row.out.length) ? row.out.join('; ') : '—';
          return '<div class="transfer-history-team"><div class="transfer-history-team-name">' + teamName + tierLabel + '</div><div class="transfer-history-row"><span class="transfer-history-label">In:</span> ' + inList + '</div><div class="transfer-history-row"><span class="transfer-history-label">Out:</span> ' + outList + '</div></div>';
        }).filter(Boolean).join('');
      }
    }
  }

  // ===== SCHEDULE UI (by matchday / phase) =====
  function updateScheduleUI(seasonData) {
    const container = document.getElementById('schedule');
    if (!container) return;

    container.innerHTML = '';
    const phase = seasonData.phase || 'regular';

    if (phase === 'playoffs' && seasonData.playoffsBracket) {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'schedule-day schedule-day--next';
      dayHeader.innerHTML = '<strong>Playoffs Round ' + seasonData.playoffsBracket.round + '</strong>';
      container.appendChild(dayHeader);
      seasonData.playoffsBracket.matches.forEach(match => {
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = `<span>${match.teamA.name} vs ${match.teamB.name}</span><span></span>`;
        container.appendChild(row);
      });
      appendChallengerSchedule(container);
      return;
    }

    if (phase === 'relegation' && seasonData.relegationCandidates && seasonData.challengerPromotion) {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'schedule-day schedule-day--next';
      dayHeader.innerHTML = '<strong>Relegation Tournament</strong> (Main vs Challenger)';
      container.appendChild(dayHeader);
      const main = seasonData.relegationCandidates;
      const chall = seasonData.challengerPromotion;
      for (let i = 0; i < 2 && main[i] && chall[i]; i++) {
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = `<span>${main[i].name} vs ${chall[i].name}</span><span>Bo1</span>`;
        container.appendChild(row);
      }
      appendChallengerSchedule(container);
      return;
    }

    if (phase === 'finished') {
      container.innerHTML = '<div class="schedule-day">Season complete</div>';
      if (seasonData.champion) {
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = '<span>Champion: ' + seasonData.champion.name + '</span><span></span>';
        container.appendChild(row);
      }
      appendChallengerSchedule(container);
      return;
    }

    (seasonData.matchdays || []).forEach((dayMatches, dayIndex) => {
      const played = dayIndex < seasonData.currentMatchday;
      const isNext = dayIndex === seasonData.currentMatchday;
      const dayResults = (seasonData.playedMatchResults || [])[dayIndex] || [];
      const dayHeader = document.createElement('div');
      dayHeader.className = 'schedule-day' + (isNext ? ' schedule-day--next' : '');
      dayHeader.innerHTML = `<strong>Matchday ${dayIndex + 1}</strong>${played ? ' (played)' : isNext ? ' (next)' : ''}`;
      container.appendChild(dayHeader);
      dayMatches.forEach(match => {
        const resultEntry = dayResults.find(
          r => (r.match.teamA.name === match.teamA.name && r.match.teamB.name === match.teamB.name)
        );
        const scoreText = resultEntry && resultEntry.result && typeof resultEntry.result.scoreA === 'number'
          ? resultEntry.result.scoreA + '-' + resultEntry.result.scoreB
          : (played ? 'Played' : '');
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = `
          <span>${match.teamA.name} vs ${match.teamB.name}</span>
          <span class="schedule-map">${match.map || '—'}</span>
          <span>${scoreText}</span>
        `;
        container.appendChild(row);
      });
    });
    appendChallengerSchedule(container);
  }

  function appendChallengerSchedule(container) {
    if (!challengerSeason || !challengerSeason.matchdays || !challengerSeason.matchdays.length) return;
    const chHeader = document.createElement('div');
    chHeader.className = 'schedule-day';
    chHeader.style.marginTop = '1rem';
    chHeader.textContent = 'Challenger League Schedule';
    container.appendChild(chHeader);
    challengerSeason.matchdays.forEach((dayMatches, dayIndex) => {
      const played = dayIndex < challengerSeason.currentMatchday;
      const isNext = dayIndex === challengerSeason.currentMatchday;
      const dayResults = (challengerSeason.playedMatchResults || [])[dayIndex] || [];
      const dayHeader = document.createElement('div');
      dayHeader.className = 'schedule-day' + (isNext ? ' schedule-day--next' : '');
      dayHeader.innerHTML = `<strong>Matchday ${dayIndex + 1}</strong>${played ? ' (played)' : isNext ? ' (next)' : ''}`;
      container.appendChild(dayHeader);
      (dayMatches || []).forEach(match => {
        const resultEntry = dayResults.find(
          r => r.match && (r.match.teamA.name === match.teamA.name && r.match.teamB.name === match.teamB.name)
        );
        const scoreText = resultEntry && resultEntry.result && typeof resultEntry.result.scoreA === 'number'
          ? resultEntry.result.scoreA + '-' + resultEntry.result.scoreB
          : (played ? 'Played' : '');
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = `
          <span>${match.teamA.name} vs ${match.teamB.name}</span>
          <span class="schedule-map">${match.map || '—'}</span>
          <span>${scoreText}</span>
        `;
        container.appendChild(row);
      });
    });
  }

  // ===== INITIAL RENDER =====
  if (season) {
    setupContractOfferModal();
    setupPlayerDetailModal();
    setupMarketPlayerModal();
    setupYouthAcademyPlayerModal();
    setupOtherTeamRosterModal();
    updateFixtureUI(season);
    updateStandingsUI(season);
    updateScheduleUI(season);
    updateCareerUI(season);
    updateFinanceUI(userTeamRef());
    updateRosterUI();
    updateCycleUI();
  }
}

// --- Notifications (toasts) and confirm modal ---
function showNotification(message, type, durationMs) {
  type = type || 'info';
  const container = document.getElementById('notificationContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'notification notification--' + type;
  el.textContent = String(message);
  container.appendChild(el);
  const duration = durationMs != null ? durationMs : (type === 'error' ? 6000 : 4000);
  setTimeout(() => {
    el.classList.add('notification--out');
    setTimeout(() => el.remove(), 200);
  }, duration);
}
if (typeof window !== 'undefined' && window.Nexus) {
  window.Nexus.showNotification = showNotification;
  window.Nexus.onFinanceExpense = function(message, durationMs) {
    showNotification(message, 'info', durationMs != null ? durationMs : 10000);
  };
}

function showConfirm(message, onConfirm, onCancel) {
  const overlay = document.getElementById('confirmModal');
  const msgEl = document.getElementById('confirmMessage');
  const acceptBtn = document.getElementById('confirmAccept');
  const cancelBtn = document.getElementById('confirmCancel');
  if (!overlay || !msgEl || !acceptBtn || !cancelBtn) {
    if (onCancel) onCancel();
    return;
  }
  let resolved = false;
  function done(choice) {
    if (resolved) return;
    resolved = true;
    if (document.activeElement && overlay.contains(document.activeElement)) {
      document.body.setAttribute('tabindex', '-1');
      document.body.focus();
    }
    overlay.classList.add('is-hidden');
    overlay.setAttribute('aria-hidden', 'true');
    if (choice && onConfirm) onConfirm();
    if (!choice && onCancel) onCancel();
  }
  msgEl.textContent = message;
  overlay.classList.remove('is-hidden');
  overlay.setAttribute('aria-hidden', 'false');
  acceptBtn.onclick = () => done(true);
  cancelBtn.onclick = () => done(false);
  overlay.onclick = function(e) { if (e.target === overlay) done(false); };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUI);
} else {
  initUI();
}
=======
// Project Nexus – Step 1 Foundation
// Goal: lock in a FUTURE-PROOF Player data model (stats with caps/ranges + role bias + traits)
// This file keeps your current league/team generator vibe, BUT upgrades the schema so
// meta/training/environment/finance can plug in later without refactors.

// --- Teams, name pools ---
const TEAM_NAMES = [
  'Sentinels', 'Cloud9', 'NRG', 'Evil Geniuses', '100 Thieves', 'FURIA',
  'LOUD', 'Leviatán', 'G2 Esports', 'Fnatic', 'Team Liquid', 'DRX'
];

const CHALLENGER_TEAM_NAMES = [
  'M80', 'The Guard', 'Shopify Rebellion', 'Oxygen Esports', 'Ghost Gaming', 'KRÜ Esports'
];

// Single pool of gaming tags (one tag per player, no first/last). Deduplicated; assignment avoids repeats via usedPlayerNames.
const GAMING_NAMES = [
  'TenZ', 's1mple', 'ZywOo', 'cNed', 'Chronicle', 'Leo', 'Aspas', 'Less', 'saadhak', 'pANcada',
  'Tyson', 'Sacy', 'stax', 'Rb', 'MaKo', 'BuZz', 'Foxy9', 'Sayaplayer', 'Zombs', 'dapr',
  'ShahZaM', 'SicK', 'ScreaM', 'shroud', 'n0thing', 'autimatic', 'nitr0', 'EliGE', 'Twistzz', 'NAF',
  'Stewie', 'dev1ce', 'Faker', 'Niko', 'coldzera', 'fer', 'Hiko', 'Skadoodle', 'mixwell', 'Karrigan',
  'syrsoN', 'ropz', 'broky', 'rain', 'Jame', 'qikert', 'FL1T', 'n0rb3r7', 'buster', 'Perfecto',
  'B1T', 'sdy', 'electroNic', 'Magisk', 'dupreeh', 'Ax1Le', 'interz', 'HObbit', 'degster', 'm0NESY',
  'huNter', 'jL', 'torzsi', 'frozen', 'oskar', 'ISSAA', 'yekindar', 'Jabbi', 'stavn', 'TeSeS',
  'refrezh', 'sjuush', 'blameF', 'k0nfig', 'gla1ve', 'Xyp9x', 'Lucky', 'es3tag', 'Brollan', 'REZ',
  'hampus', 'Plopski', 'LNZ', 'f0rest', 'GeT_RiGhT', 'Markeloff', 'Edward', 'Zeus', 'flamie', 'electronic',
  'B1ad3', 'arT', 'junior', 'KSCERATO', 'yuurih', 'VINI', 'saffee', 'drop', 'NEKIZ', 'chelo',
  'soulz', 'vsm', 'heat', 'frz', 'RgLMeister', 'Mazin', 'jzz', 'kiNgg', 'Shyy', 'Melser',
  'Keen', 'bnj', 'Lucian', 'Luken', 'Nozwer', 'keznit', 'Daveey', 'Delz1k', 'Axed', 'Shanks',
  'penny', 'Derke', 'Alfajer', 'Shao', 'Boaster', 'Enzo', 'Soulcas', 'L1NK', 'Koldamenta', 'nAts',
  'Redgar', 'd3ffo', 'Sheydos', 'Sayf', 'Boo', 'Mistic', 'doma', 'AtaKaptan', 'qRaxz', 'BraveAF',
  'Jinggg', 'f0rsakeN', 'd4v41', 'mindfreak', 'Benkai', 'something', 'Davai', 'cGR', 'Laz', 'Crws',
  'Sylvan', 'Genghsta', 'Lakia', 'Bazzi', 'Munchkin', 'Meddo', 'Xeta', 'Bounty', 'Seoldam', 'Estrella',
  'Efina', 'Tsog', 'BcJ', 'Aproto', 'Oxy', 'Poach', 'Verno', 'YaBoiDre', 'brawk', 'thwifo',
  'Wedid', 'Oderus', 'Trick', 'Zik', 'Relyks', 'Android', 'mitch', 'Shinobi', 'Ace', 'Blaze',
  'Cipher', 'Dex', 'Echo', 'Flux', 'Grim', 'Havoc', 'Ion', 'Jade', 'Kite', 'Lynx',
  'Mirage', 'Nova', 'Onyx', 'Prism', 'Quake', 'Raven', 'Storm', 'Titan', 'Umbra', 'Vex',
  'Wraith', 'Xero', 'Yuri', 'Zen', 'Apex', 'Blitz', 'Cinder', 'Drift', 'Ember', 'Frost',
  'Ghost', 'Hex', 'Inferno', 'Jet', 'Kilo', 'Luna', 'Maze', 'Nyx', 'Orbit', 'Pulse',
  'Quill', 'Rift', 'Slash', 'Tracer', 'Void', 'Warp', 'Zero', 'Axon', 'Bolt', 'Dune',
  'Edge', 'Fade', 'Glitch', 'Haze', 'Index', 'Jolt', 'Karma'
];

// --- Core stat keys (stable, do not rename later unless you migrate saves) ---
const STAT_KEYS = [
  'aim', 'reaction', 'gameSense', 'positioning', 'utilityIQ', 'decisionSpeed',
  'adaptability', 'consistency', 'mental', 'communication'
];

// --- Role definitions (for affinity scoring; NOT gameplay yet) ---
// We keep your weights idea, but treat it as an AFFINITY model.
const ROLES = {
  Duelist: {
    core: ['aim', 'reaction', 'decisionSpeed'],
    secondary: ['mental', 'consistency'],
    soft: ['communication'],
    minStat: { aim: 65 }
  },
  Initiator: {
    core: ['utilityIQ', 'gameSense', 'communication'],
    secondary: ['decisionSpeed', 'adaptability'],
    soft: ['aim'],
    minStat: { communication: 60 }
  },
  Controller: {
    core: ['utilityIQ', 'consistency', 'mental'],
    secondary: ['gameSense', 'positioning'],
    soft: ['communication'],
    minStat: { consistency: 60 }
  },
  Sentinel: {
    core: ['positioning', 'gameSense', 'mental'],
    secondary: ['consistency', 'utilityIQ'],
    soft: ['communication'],
    minStat: { mental: 60 }
  }
};

const ROLE_WEIGHTS = { core: 1.4, secondary: 1.0, soft: 0.6 };

// --- Traits pool (just to seed structure; we can expand later) ---
const TRAITS_POOL = [
  'Late Bloomer',
  'Early Peak',
  'Adaptive',
  'Fragile Confidence',
  'Role Fluid',
  'Learner'
];

// --- ID + RNG helpers ---
let playerIdCounter = 1;
const usedPlayerNames = new Set();

function getAvailableGamingName() {
  const available = GAMING_NAMES.filter(n => !usedPlayerNames.has(n));
  const name = available.length > 0 ? pickRandom(available) : ('Player' + playerIdCounter);
  usedPlayerNames.add(name);
  return name;
}

function registerUsedPlayerNamesFromTeams(teams) {
  if (!teams || !Array.isArray(teams)) return;
  teams.forEach(team => {
    (team.players || []).forEach(p => {
      if (p.firstName) usedPlayerNames.add(p.firstName);
    });
  });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function chance(p) {
  return Math.random() < p;
}

// --- MAP POOL (10 maps, 7 in rotation per season) ---
const ALL_MAPS = [
  { id: 'ascent', name: 'Ascent', inRotation: true },
  { id: 'bind', name: 'Bind', inRotation: true },
  { id: 'haven', name: 'Haven', inRotation: true },
  { id: 'split', name: 'Split', inRotation: true },
  { id: 'fracture', name: 'Fracture', inRotation: true },
  { id: 'pearl', name: 'Pearl', inRotation: true },
  { id: 'lotus', name: 'Lotus', inRotation: true },
  { id: 'icebox', name: 'Icebox', inRotation: false },
  { id: 'sunset', name: 'Sunset', inRotation: false },
  { id: 'corrode', name: 'Corrode', inRotation: false }
];

function getActiveMapPool() {
  const active = ALL_MAPS.filter(m => m.inRotation);
  return active.map(m => m.name);
}

function assignMapToMatch(seasonOrPool) {
  const pool = Array.isArray(seasonOrPool) ? seasonOrPool : (seasonOrPool && seasonOrPool.activeMapPool) || getActiveMapPool();
  if (!pool || pool.length === 0) return '—';
  return pool[randomInt(0, pool.length - 1)];
}

function rotateMapPool() {
  const active = ALL_MAPS.filter(m => m.inRotation).slice();
  const inactive = ALL_MAPS.filter(m => !m.inRotation).slice();
  if (active.length < 2 || inactive.length < 2) return { mapsAdded: [], mapsRemoved: [] };
  const toRemove = [];
  for (let i = 0; i < 2; i++) {
    const idx = randomInt(0, active.length - 1);
    toRemove.push(active.splice(idx, 1)[0]);
  }
  const toAdd = [];
  for (let i = 0; i < 2; i++) {
    const idx = randomInt(0, inactive.length - 1);
    toAdd.push(inactive.splice(idx, 1)[0]);
  }
  toRemove.forEach(m => { m.inRotation = false; });
  toAdd.forEach(m => { m.inRotation = true; });
  return {
    mapsAdded: toAdd.map(m => m.name),
    mapsRemoved: toRemove.map(m => m.name)
  };
}

// --- AGE (esports: short careers, peak 22-25) ---
function generatePlayerAge() {
  const roll = Math.random() * 100;
  if (roll < 30) return randomInt(17, 19);   // 30% prospects
  if (roll < 70) return randomInt(20, 23);   // 40% prime
  if (roll < 90) return randomInt(24, 25);   // 20% experienced
  return randomInt(26, 27);                  // 10% veterans
}

function getAgePhase(age) {
  if (age == null) return 'peak';
  if (age <= 21) return 'growth';
  if (age <= 25) return 'peak';
  if (age <= 27) return 'decline';
  return 'retirement';
}

// --- STAT RANGE MODEL (critical for your design) ---
// Each stat is: { current, minCap, maxCap }
// current must always stay within [minCap, maxCap].
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function makeStatRange({ current, minCap, maxCap }) {
  const min = clamp(minCap, 1, 99);
  const max = clamp(maxCap, min, 99);
  return {
    current: clamp(current, min, max),
    minCap: min,
    maxCap: max
  };
}

// Generate a cap RANGE first, then pick a current inside it.
// This lets environment/meta/mental later adjust "effective cap" without changing biology.
function generateStatRange({ baseMin = 40, baseMax = 98, capWidthMin = 8, capWidthMax = 18 }) {
  const maxCap = randomInt(baseMin + capWidthMin, baseMax);
  const width = randomInt(capWidthMin, capWidthMax);
  const minCap = clamp(maxCap - width, 1, 98);
  const current = randomInt(minCap, maxCap);
  return makeStatRange({ current, minCap, maxCap });
}

// Role-biased range generation: core stats tend to have higher caps and higher current.
// Enforce role minStat so the biased player qualifies for that role.
function generateStatRangeForRole(statKey, roleKey) {
  const role = ROLES[roleKey];
  const isCore = role.core.includes(statKey);
  const isSecondary = role.secondary.includes(statKey);
  const isSoft = role.soft.includes(statKey);
  const minForRole = role.minStat && role.minStat[statKey] !== undefined ? role.minStat[statKey] : 0;

  // Tune these numbers later, but keep the idea stable.
  let opts;
  if (isCore) {
    opts = { baseMin: Math.max(55, minForRole), baseMax: 98, capWidthMin: 10, capWidthMax: 20 };
  } else if (isSecondary) {
    opts = { baseMin: Math.max(48, minForRole), baseMax: 92, capWidthMin: 8, capWidthMax: 18 };
  } else if (isSoft) {
    opts = { baseMin: Math.max(42, minForRole), baseMax: 86, capWidthMin: 8, capWidthMax: 16 };
  } else {
    opts = { baseMin: Math.max(40, minForRole), baseMax: 88, capWidthMin: 8, capWidthMax: 16 };
  }
  const range = generateStatRange(opts);
  if (minForRole > 0 && range.current < minForRole) {
    return makeStatRange({ current: minForRole, minCap: range.minCap, maxCap: Math.max(range.maxCap, minForRole) });
  }
  return range;
}

// --- Affinity scoring should read CURRENT values only (for now). ---
function scoreForRole(statsCurrent, roleKey, options) {
  const role = ROLES[roleKey];
  const ignoreMinStat = options && options.ignoreMinStat;

  if (!ignoreMinStat) {
    for (const [stat, minVal] of Object.entries(role.minStat || {})) {
      if ((statsCurrent[stat] || 0) < minVal) return -1;
    }
  }

  let score = 0;
  for (const s of role.core) score += (statsCurrent[s] || 0) * ROLE_WEIGHTS.core;
  for (const s of role.secondary) score += (statsCurrent[s] || 0) * ROLE_WEIGHTS.secondary;
  for (const s of role.soft) score += (statsCurrent[s] || 0) * ROLE_WEIGHTS.soft;
  return score;
}

function getPrimaryAndSecondaryRole(statsCurrent, options) {
  const allScores = {};
  for (const roleKey of Object.keys(ROLES)) {
    const s = scoreForRole(statsCurrent, roleKey, options || {});
    allScores[roleKey] = s >= 0 ? s : -1;
  }

  const eligible = Object.entries(allScores).filter(([, v]) => v >= 0);
  if (eligible.length === 0) {
    const first = Object.keys(ROLES)[0];
    return { primary: first, secondary: first, allScores };
  }

  eligible.sort((a, b) => b[1] - a[1]);
  const primary = eligible[0][0];
  const secondary = eligible.length > 1 ? eligible[1][0] : eligible[0][0];
  return { primary, secondary, allScores };
}

// FlexPotential based on how close 2nd role is to 1st (rare high flex)
function getFlexPotential(allScores, primary) {
  const scores = Object.entries(allScores)
    .filter(([, v]) => v >= 0)
    .sort((a, b) => b[1] - a[1]);

  if (scores.length < 2) return 'Low';
  const primaryEntry = scores.find(([r]) => r === primary);
  const pScore = primaryEntry ? primaryEntry[1] : 0;
  const secondScore = scores[1][1];
  const ratio = pScore ? secondScore / pScore : 0;

  if (ratio >= 0.94 && chance(0.18)) return 'High';
  if (ratio >= 0.82) return 'Medium';
  return 'Low';
}

// --- Traits seeding (structure only; logic later) ---
function seedTraits(flexPotential) {
  const traits = [];

  // Keep it light for now; just make sure the array exists.
  if (flexPotential === 'High' && chance(0.35)) traits.push('Role Fluid');
  if (chance(0.18)) traits.push('Adaptive');
  if (chance(0.12)) traits.push('Fragile Confidence');
  if (chance(0.10)) traits.push('Late Bloomer');

  // Ensure unique traits
  return [...new Set(traits)];
}

// --- Player creation (this is the step-1 deliverable) ---
function createPlayer(roleBias = null, ageOverride = null) {
  // Build stat ranges (slightly lower base for youth replacements if ageOverride is set)
  const stats = {};
  const isYouth = ageOverride != null && ageOverride <= 20;
  for (const k of STAT_KEYS) {
    if (isYouth && roleBias == null) {
      stats[k] = generateStatRange({ baseMin: 35, baseMax: 82, capWidthMin: 8, capWidthMax: 16 });
    } else {
      stats[k] = roleBias
        ? generateStatRangeForRole(k, roleBias)
        : generateStatRange({ baseMin: 40, baseMax: 90, capWidthMin: 8, capWidthMax: 18 });
    }
  }

  // Affinity uses current values
  const statsCurrent = Object.fromEntries(
    STAT_KEYS.map(k => [k, stats[k].current])
  );

  const { primary, secondary, allScores } = getPrimaryAndSecondaryRole(statsCurrent);
  const flexPotential = getFlexPotential(allScores, primary);
  const traits = seedTraits(flexPotential);

  const id = playerIdCounter++;
  const firstName = getAvailableGamingName();
  const lastName = '';
  const age = ageOverride != null ? ageOverride : generatePlayerAge();
  const overall = STAT_KEYS.reduce((sum, k) => sum + stats[k].current, 0) / STAT_KEYS.length;
  let salary;
  if (overall >= 80) salary = randomInt(15000, 25000);
  else if (overall >= 70) salary = randomInt(8000, 15000);
  else if (overall >= 60) salary = randomInt(4000, 8000);
  else salary = randomInt(2000, 4000);
  return {
    id,
    firstName,
    lastName,
    age,
    contractYears: randomInt(1, 3),
    salary,
    transferListed: false,

    // Step 1 schema
    stats, // { aim: {current,minCap,maxCap}, ... }
    roleBias: {
      primaryRoleBias: primary,
      secondaryRoleBias: secondary,
      flexPotential
    },
    traits,

    // Optional debug info (keep for dev; can remove later)
    roleScores: allScores
  };
}

function getPlayerDisplayName(p) {
  if (!p) return '';
  return ((p.firstName || '') + (p.lastName ? ' ' + p.lastName : '')).trim();
}

// Each team: 5 starters, 3 bench. At least 1 of each role.
function createTeam(teamName, tier = 'Main') {
  const requiredRoles = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];
  const players = [];

  for (const role of requiredRoles) {
    players.push(createPlayer(role));
  }

  for (let i = 0; i < 4; i++) {
    players.push(createPlayer(null));
  }

  const starters = players.slice(0, 5);
  const bench = players.slice(5, 8);

  return {
    name: teamName,
    starters,
    bench,
    players,
    youthAcademy: [],
    tier,
    prestige: tier === 'Main' ? 60 + Math.floor(Math.random() * 20) : 30 + Math.floor(Math.random() * 15),
    budgetMultiplier: tier === 'Main' ? 1.0 : 0.7
  };
}

// --- Youth Academy: prospect pool (14-17yo, no transfer fee, salary only) ---
window.Nexus = window.Nexus || {};
window.Nexus.YOUTH_MARKET = window.Nexus.YOUTH_MARKET || [];

function createYouthProspect() {
  // Mostly 16–17; 15 is rare (~8%)
  const age = chance(0.08) ? 15 : (chance(0.5) ? 16 : 17);
  const stats = {};
  STAT_KEYS.forEach(k => {
    const current = randomInt(35, 55);
    const maxCap = randomInt(70, 95);
    const minCap = Math.max(30, current - 10);
    stats[k] = { current, minCap, maxCap };
  });
  const statsCurrent = Object.fromEntries(STAT_KEYS.map(k => [k, stats[k].current]));
  const { primary, secondary, allScores } = getPrimaryAndSecondaryRole(statsCurrent, { ignoreMinStat: true });
  const roleRankings = Object.entries(allScores)
    .filter(([, score]) => score >= 0)
    .sort((a, b) => b[1] - a[1])
    .map(([role, score]) => ({ role, score }));
  const flexPotential = getFlexPotential(allScores, primary);
  const id = playerIdCounter++;
  return {
    id,
    firstName: getAvailableGamingName(),
    lastName: '',
    age,
    stats,
    roleBias: { primaryRoleBias: primary, secondaryRoleBias: secondary, flexPotential },
    roleRankings,
    roleScores: allScores,
    isYouth: true,
    salary: randomInt(2000, 4000),
    contractYears: 3
  };
}

function ensureYouthProspectRoleBias(prospect) {
  if (!prospect || !prospect.stats || typeof getPrimaryAndSecondaryRole !== 'function') return;
  var statsCurrent = {};
  var keys = typeof STAT_KEYS !== 'undefined' ? STAT_KEYS : ['aim', 'reaction', 'gameSense', 'positioning', 'utilityIQ', 'decisionSpeed', 'adaptability', 'consistency', 'mental', 'communication'];
  keys.forEach(function(k) {
    statsCurrent[k] = (prospect.stats[k] && prospect.stats[k].current != null) ? prospect.stats[k].current : 50;
  });
  if (Object.keys(statsCurrent).length === 0) return;
  var res = getPrimaryAndSecondaryRole(statsCurrent, { ignoreMinStat: true });
  var flexPotential = typeof getFlexPotential === 'function' ? getFlexPotential(res.allScores, res.primary) : 'Low';
  prospect.roleBias = { primaryRoleBias: res.primary, secondaryRoleBias: res.secondary, flexPotential: flexPotential };
  prospect.roleScores = res.allScores;
}

function prospectToFullPlayer(prospect) {
  const p = { ...prospect };
  delete p.roleRankings;
  delete p.isYouth;
  if (!p.traits) p.traits = seedTraits((p.roleBias && p.roleBias.flexPotential) || 'Low');
  if (p.transferListed === undefined) p.transferListed = false;
  if (p.stats && typeof getPrimaryAndSecondaryRole === 'function') {
    const statsCurrent = Object.fromEntries(
      (typeof STAT_KEYS !== 'undefined' ? STAT_KEYS : []).map(function(k) { return [k, (p.stats[k] && p.stats[k].current != null) ? p.stats[k].current : 50]; })
    );
    const keys = Object.keys(statsCurrent);
    if (keys.length > 0) {
      const res = getPrimaryAndSecondaryRole(statsCurrent, { ignoreMinStat: true });
      const flexPotential = typeof getFlexPotential === 'function' ? getFlexPotential(res.allScores, res.primary) : 'Low';
      p.roleBias = { primaryRoleBias: res.primary, secondaryRoleBias: res.secondary, flexPotential: flexPotential };
      p.roleScores = res.allScores;
    }
  }
  return p;
}

function promoteYouthToRoster(team, prospect) {
  if (!team || !prospect || (prospect.age !== 17 && prospect.age != null)) return { success: false, message: 'Only 17-year-olds can be promoted' };
  const academy = team.youthAcademy || [];
  const idx = academy.findIndex(p => p.id === prospect.id);
  if (idx === -1) return { success: false, message: 'Prospect not in your academy' };
  if ((team.players || []).length >= MAX_ROSTER_SIZE) return { success: false, message: 'Roster full (12 players max)' };
  academy.splice(idx, 1);
  const player = prospectToFullPlayer(prospect);
  team.players = team.players || [];
  team.players.push(player);
  team.starters = team.players.slice(0, 5);
  team.bench = team.players.slice(5, 8);
  if (Array.isArray(team.reserveSlots)) {
    const emptyIdx = team.reserveSlots.findIndex(s => !s);
    if (emptyIdx >= 0) team.reserveSlots[emptyIdx] = player;
    else if (Array.isArray(team.benchSlots)) {
      const bi = team.benchSlots.findIndex(s => !s);
      if (bi >= 0) team.benchSlots[bi] = player;
    }
  }
  if (team.sponsorContract) {
    team.sponsorContract.youthPromotedThisSeason = (team.sponsorContract.youthPromotedThisSeason || 0) + 1;
  }
  return { success: true, message: 'Promoted ' + getPlayerDisplayName(player) + ' to roster' };
}

function signYouthToAcademy(team, prospect) {
  const market = window.Nexus.YOUTH_MARKET || [];
  if (!team || !prospect || !market.includes(prospect)) return { success: false, message: 'Prospect not available' };
  const academy = team.youthAcademy || [];
  const maxSlots = typeof getMaxYouthAcademySlots === 'function' ? getMaxYouthAcademySlots(team) : MAX_YOUTH_ACADEMY;
  if (academy.length >= maxSlots) return { success: false, message: 'Academy full (' + maxSlots + ' max)' };
  const salary = prospect.salary || 4000;
  if (team.finance) {
    const newMonthly = (team.finance.monthlyCost || 0) + salary;
    const runway = newMonthly > 0 ? Math.floor((team.finance.capital || 0) / newMonthly) : 99;
    if (runway < 3) return { success: false, message: 'Cannot afford wages (runway < 3 months)' };
  }
  const idx = market.indexOf(prospect);
  if (idx >= 0) market.splice(idx, 1);
  academy.push(prospect);
  if (team.finance && team.finance.monthlyCost != null) team.finance.monthlyCost += salary;
  return { success: true, message: 'Signed ' + getPlayerDisplayName(prospect) + ' to academy' };
}

function trainYouthProspect({ team, prospect, statKey, environment, season }) {
  if (!prospect || (!prospect.isYouth && !(team.youthAcademy && team.youthAcademy.includes(prospect)))) {
    return { success: false, message: 'Not a youth prospect' };
  }
  if (!team.youthAcademy || !team.youthAcademy.includes(prospect)) {
    return { success: false, message: 'Prospect not in your academy' };
  }
  const stat = prospect.stats && prospect.stats[statKey];
  if (!stat) {
    return { success: false, message: 'Invalid stat' };
  }
  if (stat.current >= stat.maxCap) {
    return { success: false, message: 'Already at max for this stat' };
  }
  var currentMatchday = (season && season.currentMatchday != null) ? season.currentMatchday : 0;
  if (prospect.lastTrainingMatchday !== currentMatchday) {
    prospect.lastTrainingMatchday = currentMatchday;
    prospect.ticksThisMatchday = 0;
    prospect.statsTrainedThisMatchday = [];
  }
  if (prospect.ticksThisMatchday == null) prospect.ticksThisMatchday = 0;
  if (!Array.isArray(prospect.statsTrainedThisMatchday)) prospect.statsTrainedThisMatchday = [];
  if (prospect.ticksThisMatchday >= 3) {
    return { success: false, message: 'Max 3 ticks per matchday for this player' };
  }
  if (prospect.statsTrainedThisMatchday.indexOf(statKey) >= 0) {
    return { success: false, message: 'Already trained this stat this matchday' };
  }
  const distance = stat.maxCap - stat.current;
  const baseGrowth = 0.04 * distance;
  const coachQuality = (environment && environment.coachQuality != null) ? environment.coachQuality : 50;
  const coachFactor = coachQuality / 100;
  const facilityTierLevel = (team && (team.facilityTierLevel != null ? team.facilityTierLevel : 1)) || 1;
  const facilityBonus = 1 + ((facilityTierLevel - 1) * 0.05);
  const finalGrowth = baseGrowth * coachFactor * facilityBonus;
  stat.current = Math.min(stat.current + finalGrowth, stat.maxCap);
  prospect.ticksThisMatchday = (prospect.ticksThisMatchday || 0) + 1;
  prospect.statsTrainedThisMatchday = prospect.statsTrainedThisMatchday || [];
  prospect.statsTrainedThisMatchday.push(statKey);

  if (team && currentMatchday != null) {
    if (!team.youthTrainingHistory) team.youthTrainingHistory = [];
    var dayObj = team.youthTrainingHistory.find(function(d) { return d.matchday === currentMatchday; });
    if (!dayObj) {
      dayObj = { matchday: currentMatchday, entries: [] };
      team.youthTrainingHistory.push(dayObj);
    }
    dayObj.entries.push({
      playerId: prospect.id,
      playerName: getPlayerDisplayName(prospect),
      statKey: statKey,
      growth: finalGrowth
    });
    team.youthTrainingHistory.sort(function(a, b) { return (b.matchday || 0) - (a.matchday || 0); });
    team.youthTrainingHistory = team.youthTrainingHistory.slice(0, 5);
  }

  return { success: true, growth: finalGrowth, newValue: stat.current };
}

window.Nexus.trainYouthProspect = trainYouthProspect;

function generateYouthMarket() {
  const count = randomInt(12, 15);
  const prospects = [];
  for (let i = 0; i < count; i++) prospects.push(createYouthProspect());
  return prospects;
}

// Build leagues
const LEAGUE = TEAM_NAMES.map(name => createTeam(name));
const CHALLENGER_LEAGUE = CHALLENGER_TEAM_NAMES.map(name => createTeam(name, 'Challenger'));

// --- Aging & retirement (esports: short careers) ---
window.Nexus = window.Nexus || {};
window.Nexus.RETIRED_PLAYERS = window.Nexus.RETIRED_PLAYERS || [];
window.Nexus.FREE_AGENTS = window.Nexus.FREE_AGENTS || [];

function checkRetirement(player) {
  const age = player.age != null ? player.age : 20;
  if (age >= 29) return true;
  if (age >= 28) return chance(0.8);
  if (age === 27) {
    let avgRatio = 0;
    STAT_KEYS.forEach(k => {
      const s = player.stats[k];
      if (s && s.maxCap) avgRatio += s.current / s.maxCap;
    });
    avgRatio /= STAT_KEYS.length;
    if (avgRatio < 0.85) return chance(0.4);
  }
  return false;
}

function processRetirements(teams) {
  const retired = [];
  const minRoster = 8;
  (teams || []).forEach(team => {
    const toRemove = [];
    (team.players || []).forEach(p => {
      if (checkRetirement(p)) {
        toRemove.push(p);
        retired.push({ player: p, team });
        window.Nexus.RETIRED_PLAYERS.push(p);
        if (typeof console !== 'undefined' && console.log) console.log(getPlayerDisplayName(p) + ' retired at age ' + (p.age || '?'));
      }
    });
    team.players = (team.players || []).filter(p => !toRemove.includes(p));
    team.starters = team.players.slice(0, 5);
    team.bench = team.players.slice(5, 8);
    toRemove.forEach(p => {
      if (team.finance && team.finance.monthlyCost != null) team.finance.monthlyCost -= (p.salary || 0);
    });
    while (team.players.length < minRoster) {
      const roleNeeded = (toRemove.length > 0 && toRemove[0] && toRemove[0].roleBias && toRemove[0].roleBias.primaryRoleBias)
        ? toRemove.shift().roleBias.primaryRoleBias
        : 'Duelist';
      const seventeenYos = (team.youthAcademy || []).filter(p => p.age === 17);
      const matching = seventeenYos.filter(p => {
        const rb = p.roleBias || {};
        return rb.primaryRoleBias === roleNeeded || rb.secondaryRoleBias === roleNeeded;
      });
      if (matching.length > 0 && chance(0.8)) {
        const chosen = pickRandom(matching);
        const result = promoteYouthToRoster(team, chosen);
        if (result.success) continue;
      }
      const youth = createPlayer(roleNeeded, randomInt(17, 20));
      if (!youth.roleBias) youth.roleBias = { primaryRoleBias: roleNeeded, secondaryRoleBias: roleNeeded, flexPotential: 'Low' };
      youth.roleBias.primaryRoleBias = roleNeeded;
      team.players.push(youth);
      team.starters = team.players.slice(0, 5);
      team.bench = team.players.slice(5, 8);
      if (team.finance && team.finance.monthlyCost != null) team.finance.monthlyCost += (youth.salary || 3000);
    }
  });
  return retired;
}

function incrementPlayerAges(teams) {
  (teams || []).forEach(team => {
    (team.players || []).forEach(p => {
      p.age = (p.age != null ? p.age : 20) + 1;
    });
    const academy = team.youthAcademy || [];
    academy.forEach(p => { p.age = (p.age != null ? p.age : 16) + 1; });
    const evicted = academy.filter(p => (p.age || 0) >= 18);
    evicted.forEach(p => {
      if (team.finance && team.finance.monthlyCost != null) team.finance.monthlyCost -= (p.salary || 0);
      (window.Nexus.FREE_AGENTS = window.Nexus.FREE_AGENTS || []).push(prospectToFullPlayer(p));
    });
    team.youthAcademy = academy.filter(p => (p.age || 0) < 18);
  });
}

function applyAgeBasedGrowth(player, environment, meta) {
  const age = player.age != null ? player.age : 22;
  STAT_KEYS.forEach(statKey => {
    const stat = player.stats[statKey];
    if (!stat) return;
    if (age <= 21) {
      const gap = stat.maxCap - stat.current;
      if (gap > 0) stat.current = Math.min(stat.maxCap, stat.current + Math.max(0, Math.floor(gap * 0.05)));
    } else if (age >= 26) {
      const gap = stat.current - stat.minCap;
      if (gap > 0) stat.current = Math.max(stat.minCap, stat.current - Math.max(0, Math.floor(gap * 0.03)));
    }
  });
}

// Expose for console / UI
window.Nexus = window.Nexus || {};
window.Nexus.LEAGUE = LEAGUE;
window.Nexus.CHALLENGER_LEAGUE = CHALLENGER_LEAGUE;
window.Nexus.ROLES = ROLES;
window.Nexus.STAT_KEYS = STAT_KEYS;
window.Nexus.createPlayer = createPlayer;
window.Nexus.getPlayerDisplayName = getPlayerDisplayName;
window.Nexus.createTeam = createTeam;
window.Nexus.getAgePhase = getAgePhase;
window.Nexus.generatePlayerAge = generatePlayerAge;
window.Nexus.checkRetirement = checkRetirement;
window.Nexus.processRetirements = processRetirements;
window.Nexus.incrementPlayerAges = incrementPlayerAges;
window.Nexus.applyAgeBasedGrowth = applyAgeBasedGrowth;

// Optional: render a simple list into #app if present
function render() {
  const el = document.getElementById('app');
  if (!el) return;
  // If the app already has the full layout (sidebar + content), don't overwrite
  if (el.querySelector('.layout') || el.classList.contains('layout')) return;

  let html = '<h1>Project Nexus – League</h1>';

  LEAGUE.forEach(team => {
    html += `<section class="team"><h2>${team.name}</h2>`;

    html += '<h3>Starters (5)</h3><ul>';
    team.starters.forEach(p => {
      html += `<li><strong>${getPlayerDisplayName(p)}</strong> – ${p.roleBias.primaryRoleBias} / ${p.roleBias.secondaryRoleBias} (flex: ${p.roleBias.flexPotential})</li>`;
    });
    html += '</ul>';

    html += '<h3>Bench (3)</h3><ul>';
    team.bench.forEach(p => {
      html += `<li><strong>${getPlayerDisplayName(p)}</strong> – ${p.roleBias.primaryRoleBias} / ${p.roleBias.secondaryRoleBias} (flex: ${p.roleBias.flexPotential})</li>`;
    });
    html += '</ul></section>';
  });

  el.innerHTML = html;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', render);
} else {
  render();
}

// ------------------------------
// Project Nexus – Step 2
// Effective Cap Engine
// This layer introduces CONTEXT without touching biology (minCap / maxCap remain sacred).
// We compute an EFFECTIVE CAP based on environment, mental state, and meta alignment.
// ------------------------------

// 1. GLOBAL CONTEXT MODELS

// Environment model (can later belong to Team/Org)
function createEnvironment({
  coachQuality = 50,        // affects growth access to cap
  infrastructure = 50,      // affects stability
  psychologySupport = 50,   // mental recovery rate
  pressure = 50             // high pressure reduces effective cap if mental low
} = {}) {
  return { coachQuality, infrastructure, psychologySupport, pressure };
}

// Simple meta model (expand later with patches/map pool/etc.)
function createMeta({
  favoredRoles = [],        // e.g. ['Duelist', 'Initiator']
  tempo = 50                // fast meta favors high reaction/decisionSpeed
} = {}) {
  return { favoredRoles, tempo };
}

// 2. EFFECTIVE CAP CALCULATION

function calculateEffectiveCap({ player, statKey, environment, meta }) {
  const stat = player.stats[statKey];
  const baseMax = stat.maxCap;

  let modifier = 0;

  // Environment influence (access to ceiling)
  // Coach quality gives up to +5% access to cap range
  const coachBoost = (environment.coachQuality - 50) / 50; // -1 to +1
  modifier += coachBoost * 0.05 * baseMax;

  // Pressure vs Mental interaction (psychology reduces effective pressure)
  const mental = (player.stats.mental && player.stats.mental.current != null) ? player.stats.mental.current : 50;
  const rawPressure = environment.pressure != null ? environment.pressure : 50;
  const psychSupport = environment.psychologySupport != null ? environment.psychologySupport : 50;
  const psychTier = PSYCHOLOGY_TIERS && PSYCHOLOGY_TIERS.find(function(t) { return t.support === psychSupport; });
  const pressureReduction = (psychTier && psychTier.pressureReduction != null) ? psychTier.pressureReduction : 0;
  const effectivePressure = rawPressure * (1 - pressureReduction);
  const pressureImpact = (effectivePressure - mental) / 100;
  modifier -= pressureImpact * 0.05 * baseMax;

  // Meta alignment bonus (if stat aligns with favored role bias)
  if (meta.favoredRoles.includes(player.roleBias.primaryRoleBias)) {
    modifier += 0.03 * baseMax;
  }

  // Tempo meta example: fast tempo rewards reaction/decisionSpeed
  if (meta.tempo > 60 && (statKey === 'reaction' || statKey === 'decisionSpeed')) {
    modifier += 0.04 * baseMax;
  }

  const effectiveMax = Math.max(stat.minCap, Math.min(baseMax + modifier, 99));

  return Math.round(effectiveMax);
}

// 3. EFFECTIVE CURRENT VALUE

function calculateEffectiveCurrent({ player, statKey, environment, meta }) {
  const stat = player.stats[statKey];
  const effectiveCap = calculateEffectiveCap({ player, statKey, environment, meta });

  // Current cannot exceed effective cap
  return Math.min(stat.current, effectiveCap);
}

// 4. TESTING LAYER (for console)

function debugPlayerEffectiveStats(player, environment, meta) {
  const output = {};

  for (const key of Object.keys(player.stats)) {
    output[key] = {
      baseCurrent: player.stats[key].current,
      effectiveCurrent: calculateEffectiveCurrent({ player, statKey: key, environment, meta }),
      effectiveCap: calculateEffectiveCap({ player, statKey: key, environment, meta })
    };
  }

  return output;
}

// Expose Step 2
window.Nexus = window.Nexus || {};
window.Nexus.createEnvironment = createEnvironment;
window.Nexus.createMeta = createMeta;
window.Nexus.calculateEffectiveCap = calculateEffectiveCap;
window.Nexus.calculateEffectiveCurrent = calculateEffectiveCurrent;
window.Nexus.debugPlayerEffectiveStats = debugPlayerEffectiveStats;

// ------------------------------
// Project Nexus – Meta Evolution System
// Patch-based meta states for role viability, tempo, and playstyles.
// ------------------------------

const META_PATCHES = [
  {
    id: 'aggressive-entry',
    name: 'Aggressive Entry Meta',
    description: 'Entry fraggers and initiators dominate; sentinels struggle.',
    favoredRoles: ['Duelist', 'Initiator'],
    nerfedRoles: ['Sentinel'],
    tempo: 75,
    aggressionLevel: 80,
    statBonuses: { aim: 1.10, reaction: 1.08, decisionSpeed: 1.05, positioning: 0.95, utilityIQ: 0.97 },
    mapPoolFavored: [],
    patchNumber: 1,
    releaseDate: '2024-S1'
  },
  {
    id: 'utility-heavy',
    name: 'Utility Heavy Meta',
    description: 'Smokes and info reign; raw aim less decisive.',
    favoredRoles: ['Controller', 'Initiator'],
    nerfedRoles: ['Duelist'],
    tempo: 45,
    aggressionLevel: 30,
    statBonuses: { utilityIQ: 1.12, gameSense: 1.10, communication: 1.08, aim: 0.88, reaction: 0.92 },
    mapPoolFavored: [],
    patchNumber: 2,
    releaseDate: '2024-S2'
  },
  {
    id: 'five-stack-rush',
    name: 'Five-Stack Rush Meta',
    description: 'Multiple duelists and maximum aggression.',
    favoredRoles: ['Duelist', 'Duelist'],
    nerfedRoles: ['Sentinel', 'Controller'],
    tempo: 90,
    aggressionLevel: 95,
    statBonuses: { aim: 1.15, reaction: 1.12, decisionSpeed: 1.10, utilityIQ: 0.90, mental: 0.92 },
    mapPoolFavored: [],
    patchNumber: 3,
    releaseDate: '2024-S3'
  },
  {
    id: 'post-plant-control',
    name: 'Post-Plant Control',
    description: 'Sentinel and controller lockdown after plant.',
    favoredRoles: ['Sentinel', 'Controller'],
    nerfedRoles: ['Duelist'],
    tempo: 40,
    aggressionLevel: 35,
    statBonuses: { positioning: 1.12, utilityIQ: 1.10, consistency: 1.08, reaction: 0.92, decisionSpeed: 0.95 },
    mapPoolFavored: [],
    patchNumber: 4,
    releaseDate: '2024-S4'
  },
  {
    id: 'anti-eco-aggression',
    name: 'Anti-Eco Aggression',
    description: 'Duelist-led snowball on eco rounds.',
    favoredRoles: ['Duelist'],
    nerfedRoles: ['Controller'],
    tempo: 85,
    aggressionLevel: 82,
    statBonuses: { aim: 1.10, reaction: 1.08, decisionSpeed: 1.06, utilityIQ: 0.94 },
    mapPoolFavored: [],
    patchNumber: 5,
    releaseDate: '2024-S5'
  },
  {
    id: 'tactical-patience',
    name: 'Tactical Patience',
    description: 'Slow defaults and controller/sentinel value.',
    favoredRoles: ['Controller', 'Sentinel'],
    nerfedRoles: ['Duelist', 'Initiator'],
    tempo: 35,
    aggressionLevel: 28,
    statBonuses: { gameSense: 1.12, positioning: 1.10, mental: 1.08, reaction: 0.90, decisionSpeed: 0.92 },
    mapPoolFavored: [],
    patchNumber: 6,
    releaseDate: '2024-S6'
  },
  {
    id: 'double-initiator',
    name: 'Double Initiator Meta',
    description: 'Info and flash-heavy compositions.',
    favoredRoles: ['Initiator', 'Controller'],
    nerfedRoles: ['Duelist'],
    tempo: 50,
    aggressionLevel: 45,
    statBonuses: { utilityIQ: 1.10, communication: 1.10, gameSense: 1.06, aim: 0.92 },
    mapPoolFavored: [],
    patchNumber: 7,
    releaseDate: '2024-S7'
  },
  {
    id: 'sentinel-anchor',
    name: 'Sentinel Anchor',
    description: 'Site anchors and lurkers rewarded.',
    favoredRoles: ['Sentinel', 'Controller'],
    nerfedRoles: ['Initiator'],
    tempo: 38,
    aggressionLevel: 32,
    statBonuses: { positioning: 1.12, mental: 1.10, consistency: 1.08, communication: 0.94 },
    mapPoolFavored: [],
    patchNumber: 8,
    releaseDate: '2024-S8'
  },
  {
    id: 'flex-adapt',
    name: 'Flex & Adapt',
    description: 'Adaptability and role flexibility rewarded.',
    favoredRoles: ['Initiator', 'Controller', 'Sentinel', 'Duelist'],
    nerfedRoles: [],
    tempo: 55,
    aggressionLevel: 50,
    statBonuses: { adaptability: 1.15, gameSense: 1.06, communication: 1.05 },
    mapPoolFavored: [],
    patchNumber: 9,
    releaseDate: '2024-S9'
  },
  {
    id: 'pick-meta',
    name: 'First Pick & Info',
    description: 'First pick and info duels decide rounds.',
    favoredRoles: ['Initiator', 'Sentinel'],
    nerfedRoles: ['Duelist'],
    tempo: 58,
    aggressionLevel: 55,
    statBonuses: { gameSense: 1.10, positioning: 1.08, reaction: 1.05, aim: 0.95 },
    mapPoolFavored: [],
    patchNumber: 10,
    releaseDate: '2024-S10'
  }
];

let _currentMetaPatch = null;
let _recentPatchIds = [];

function getRandomMetaPatch() {
  const eligible = META_PATCHES.filter(p => !_recentPatchIds.includes(p.id));
  const pool = eligible.length >= 2 ? eligible : META_PATCHES;
  const chosen = pool[randomInt(0, pool.length - 1)];
  _currentMetaPatch = chosen;
  _recentPatchIds = [_recentPatchIds[1] || null, chosen.id].filter(Boolean);
  return chosen;
}

function getCurrentMeta() {
  if (!_currentMetaPatch) {
    return getRandomMetaPatch();
  }
  return _currentMetaPatch;
}

function setCurrentMetaPatch(patchOrId) {
  if (typeof patchOrId === 'string') {
    _currentMetaPatch = META_PATCHES.find(p => p.id === patchOrId) || _currentMetaPatch;
  } else if (patchOrId && patchOrId.id) {
    _currentMetaPatch = patchOrId;
  }
  return _currentMetaPatch;
}

window.Nexus.META_PATCHES = META_PATCHES;
window.Nexus.getRandomMetaPatch = getRandomMetaPatch;
window.Nexus.getCurrentMeta = getCurrentMeta;
window.Nexus.setCurrentMetaPatch = setCurrentMetaPatch;

// ------------------------------
// Project Nexus – Step 3
// Training & Growth Engine
// This system moves CURRENT toward EFFECTIVE CAP over time.
// Biology (minCap/maxCap) is never changed here.
// ------------------------------

// 1. TRAINING PLANS

const TRAINING_PLANS = {
  Mechanical: ['aim', 'reaction', 'decisionSpeed'],
  Tactical: ['utilityIQ', 'gameSense'],
  Positional: ['positioning', 'consistency'],
  Mental: ['mental'],
  Communication: ['communication'],
  Adaptive: ['adaptability']
};

const PLAYER_TRAINING_PLAN_KEYS = Object.keys(TRAINING_PLANS);

function getTrainingPlansForRole(roleKey) {
  const role = ROLES[roleKey];
  if (!role) return PLAYER_TRAINING_PLAN_KEYS;
  const roleStats = [...(role.core || []), ...(role.secondary || [])];
  return PLAYER_TRAINING_PLAN_KEYS.filter(planKey => {
    const planStats = TRAINING_PLANS[planKey] || [];
    return planStats.some(s => roleStats.includes(s));
  });
}

function pickAITrainingPlan(player) {
  const flex = (player.roleBias && player.roleBias.flexPotential) || 'Low';
  if (flex === 'High') {
    return PLAYER_TRAINING_PLAN_KEYS[Math.floor(Math.random() * PLAYER_TRAINING_PLAN_KEYS.length)];
  }
  const primary = (player.roleBias && player.roleBias.primaryRoleBias) || 'Duelist';
  const secondary = (player.roleBias && player.roleBias.secondaryRoleBias) || primary;
  const plansPrimary = getTrainingPlansForRole(primary);
  const plansSecondary = getTrainingPlansForRole(secondary);
  const combined = [...new Set([...plansPrimary, ...plansSecondary])];
  if (combined.length === 0) return PLAYER_TRAINING_PLAN_KEYS[0];
  return combined[Math.floor(Math.random() * combined.length)];
}

// 2. GROWTH CALCULATION

function getRoleGrowthMultiplier(player, statKey) {
  const primary = player.roleBias.primaryRoleBias;
  const secondary = player.roleBias.secondaryRoleBias;
  const flex = (player.roleBias && player.roleBias.flexPotential) || 'Low';

  if (ROLES[primary].core.includes(statKey)) return 1.0;
  if (ROLES[secondary].core.includes(statKey)) return flex === 'High' ? 0.9 : 0.75;
  return flex === 'High' ? 0.7 : 0.4;
}

function getTraitGrowthModifier(player, statKey) {
  let modifier = 1.0;

  if (player.traits.includes('Late Bloomer')) {
    modifier *= 0.85; // slower early growth (expand later by age logic)
  }

  if (player.traits.includes('Adaptive') && statKey === 'adaptability') {
    modifier *= 1.2;
  }

  if (player.traits.includes('Role Fluid')) {
    modifier *= 1.1;
  }

  return modifier;
}

function growStat({ player, statKey, environment, meta, growthMultiplier }) {
  const stat = player.stats[statKey];

  const effectiveCap = calculateEffectiveCap({ player, statKey, environment, meta });

  if (stat.current >= effectiveCap) return 0;

  const distance = effectiveCap - stat.current;

  const baseGrowth = 0.02 * distance; // 2% of gap per cycle

  const roleMultiplier = getRoleGrowthMultiplier(player, statKey);
  const traitMultiplier = getTraitGrowthModifier(player, statKey);

  const coachQuality = (environment && environment.coachQuality != null) ? environment.coachQuality : 50;
  const coachFactor = coachQuality / 100;

  let growth = baseGrowth * roleMultiplier * traitMultiplier * coachFactor;
  const mult = growthMultiplier != null ? growthMultiplier : 1;
  growth *= mult;

  stat.current = Math.min(stat.current + growth, effectiveCap);

  return growth;
}

// 3. TRAINING TICK (WEEKLY SIM)

function trainPlayer({ player, trainingPlan, environment, meta, growthMultiplier }) {
  const statsToTrain = TRAINING_PLANS[trainingPlan] || [];

  let totalGrowth = 0;

  statsToTrain.forEach(statKey => {
    totalGrowth += growStat({ player, statKey, environment, meta, growthMultiplier });
  });

  return totalGrowth;
}

// 4. DEBUG

function debugTrainingCycle(player, trainingPlan, environment, meta) {
  const before = JSON.parse(JSON.stringify(player.stats));
  const growth = trainPlayer({ player, trainingPlan, environment, meta });

  return {
    growthTotal: growth,
    before,
    after: player.stats
  };
}

// Expose Step 3
window.Nexus = window.Nexus || {};
window.Nexus.TRAINING_PLANS = TRAINING_PLANS;
window.Nexus.trainPlayer = trainPlayer;
window.Nexus.debugTrainingCycle = debugTrainingCycle;

// ------------------------------
// Project Nexus – Step 4
// Role Assignment & Mismatch Engine
// This layer introduces REAL role forcing consequences.
// It does NOT change biology.
// It modifies effective performance + growth when player is used outside affinity.
// ------------------------------

// 1. ROLE ASSIGNMENT

function assignRole(player, roleKey) {
  player.assignedRole = roleKey;
}

// 2. ROLE FIT CALCULATION

function getRoleFitMultiplier(player) {
  const assigned = player.assignedRole;
  if (!assigned) return 1.0;

  const { primaryRoleBias, secondaryRoleBias, flexPotential } = player.roleBias;

  if (assigned === primaryRoleBias) return 1.0;
  if (assigned === secondaryRoleBias) return 0.9;

  // Off-role penalties
  let basePenalty = 0.75;

  if (flexPotential === 'High') basePenalty = 0.9;
  else if (flexPotential === 'Medium') basePenalty = 0.82;

  if (player.traits.includes('Role Fluid')) basePenalty += 0.05;

  return basePenalty;
}

// 3. EFFECTIVE CURRENT WITH ROLE IMPACT + META FAVORED/NERFED

const META_FAVORED_BONUS = 1.12;   // +12% when role is in meta.favoredRoles
const META_NERFED_PENALTY = 0.90;  // -10% when role is in meta.nerfedRoles

function calculateRoleAdjustedCurrent({ player, statKey, environment, meta }) {
  const baseEffective = calculateEffectiveCurrent({ player, statKey, environment, meta });
  let value = baseEffective * getRoleFitMultiplier(player);

  const role = player.assignedRole || player.roleBias.primaryRoleBias;
  if (meta && Array.isArray(meta.favoredRoles) && meta.favoredRoles.includes(role)) {
    value *= META_FAVORED_BONUS;
  }
  if (meta && Array.isArray(meta.nerfedRoles) && meta.nerfedRoles.includes(role)) {
    value *= META_NERFED_PENALTY;
  }

  return Math.round(Math.max(0, Math.min(99, value)));
}

// 4. GROWTH PENALTY IF FORCED ROLE

function getRoleGrowthPenalty(player) {
  const assigned = player.assignedRole;
  if (!assigned) return 1.0;

  const { primaryRoleBias, secondaryRoleBias } = player.roleBias;

  if (assigned === primaryRoleBias) return 1.0;
  if (assigned === secondaryRoleBias) return 0.85;

  return 0.6; // heavy penalty for off-role growth
}

// Override growth multiplier hook (call this inside growStat if desired)
function getTotalGrowthMultiplier(player, statKey) {
  const roleGrowth = getRoleGrowthMultiplier(player, statKey);
  const traitGrowth = getTraitGrowthModifier(player, statKey);
  const rolePenalty = getRoleGrowthPenalty(player);

  return roleGrowth * traitGrowth * rolePenalty;
}

// 5. DEBUG

function debugRoleImpact(player, environment, meta) {
  const output = {};

  for (const key of Object.keys(player.stats)) {
    output[key] = {
      adjustedCurrent: calculateRoleAdjustedCurrent({ player, statKey: key, environment, meta })
    };
  }

  return output;
}

// Expose Step 4
window.Nexus = window.Nexus || {};
window.Nexus.assignRole = assignRole;
window.Nexus.calculateRoleAdjustedCurrent = calculateRoleAdjustedCurrent;
window.Nexus.debugRoleImpact = debugRoleImpact;
window.Nexus.getRoleFitMultiplier = getRoleFitMultiplier;

// ------------------------------
// Project Nexus – Step 5
// Team Synergy Engine
// This layer evaluates a 5-player lineup and produces a synergy profile.
// It does NOT simulate matches yet — it builds the tactical identity layer.
// ------------------------------

// 1. COMPOSITION ANALYSIS

function analyzeComposition(players) {
  const roleCount = {};
  players.forEach(p => {
    const role = p.assignedRole || p.roleBias.primaryRoleBias;
    roleCount[role] = (roleCount[role] || 0) + 1;
  });

  return roleCount;
}

// 2. COMMUNICATION DEPENDENCY SCORE

function calculateTeamCommunication(players) {
  const total = players.reduce((sum, p) => sum + p.stats.communication.current, 0);
  return total / players.length;
}

// Utility-heavy comps need higher comm
function getUtilityDependency(roleCount) {
  const initiators = roleCount['Initiator'] || 0;
  const controllers = roleCount['Controller'] || 0;

  return (initiators * 0.15) + (controllers * 0.1);
}

// 3. TEMPO COMPATIBILITY

function calculateTeamTempoProfile(players) {
  const avgReaction = players.reduce((sum, p) => sum + p.stats.reaction.current, 0) / players.length;
  const avgDecision = players.reduce((sum, p) => sum + p.stats.decisionSpeed.current, 0) / players.length;

  return (avgReaction + avgDecision) / 2;
}

// 4. RHYTHM CONFLICT DETECTION

function detectRhythmConflicts(players) {
  const aggressivePlayers = players.filter(p => p.roleBias.primaryRoleBias === 'Duelist');
  const slowIGLs = players.filter(p =>
    p.roleBias.primaryRoleBias === 'Controller' &&
    p.stats.decisionSpeed.current < 55
  );

  if (aggressivePlayers.length > 0 && slowIGLs.length > 0) {
    return -0.08; // conflict penalty
  }

  return 0;
}

// 5. FINAL SYNERGY SCORE

function calculateTeamSynergy(players, meta, environment) {
  if (players.length !== 5) {
    throw new Error('Synergy requires exactly 5 players.');
  }

  const roleCount = analyzeComposition(players);
  const avgComm = calculateTeamCommunication(players);
  const utilityDependency = getUtilityDependency(roleCount);
  const tempoProfile = calculateTeamTempoProfile(players);
  const rhythmPenalty = detectRhythmConflicts(players);

  let synergy = 1.0;

  // Communication check
  if (avgComm < 55 && utilityDependency > 0.2) {
    synergy -= 0.1;
  }

  // Balanced comp bonus
  if (
    roleCount['Duelist'] >= 1 &&
    roleCount['Initiator'] >= 1 &&
    roleCount['Controller'] >= 1 &&
    roleCount['Sentinel'] >= 1
  ) {
    synergy += 0.05;
  }

  // Meta alignment: 2+ players on favored roles → comp bonus
  if (meta && Array.isArray(meta.favoredRoles) && meta.favoredRoles.length > 0) {
    const favoredCount = players.filter(p => {
      const role = p.assignedRole || p.roleBias.primaryRoleBias;
      return meta.favoredRoles.includes(role);
    }).length;
    if (favoredCount >= 2) {
      synergy += 0.05;
    }
  }

  synergy += rhythmPenalty;

  // Psychology support synergy bonus
  if (environment && environment.psychologySupport != null && PSYCHOLOGY_TIERS) {
    const psychTier = PSYCHOLOGY_TIERS.find(function(t) { return t.support === environment.psychologySupport; });
    if (psychTier && psychTier.synergyBonus != null) {
      synergy += psychTier.synergyBonus;
    }
  }

  return {
    synergyMultiplier: Math.round(synergy * 100) / 100,
    avgCommunication: Math.round(avgComm),
    tempoProfile: Math.round(tempoProfile),
    roleDistribution: roleCount
  };
}

// 6. DEBUG

function debugTeamSynergy(team) {
  return calculateTeamSynergy(team.starters);
}

// Expose Step 5
window.Nexus = window.Nexus || {};
window.Nexus.calculateTeamSynergy = calculateTeamSynergy;
window.Nexus.debugTeamSynergy = debugTeamSynergy;

// ------------------------------
// Project Nexus – Step 6
// AI Lineup Logic + Match Core Engine
// This layer:
// 1) Prevents AI from making stupid comps
// 2) Converts all previous systems into match power
// 3) Produces win probability + match result
// ------------------------------

// PART 1 — SMART AI LINEUP SELECTION

// Required structure rule: At least 1 Duelist, 1 Controller, 1 Sentinel
const REQUIRED_CORE_ROLES = ['Duelist', 'Controller', 'Sentinel'];

function shouldTeamAdaptToMeta(team, meta) {
  const nerfed = (meta && meta.nerfedRoles) || [];
  if (nerfed.length === 0) return false;
  const count = team.starters.filter(p => {
    const role = p.assignedRole || p.roleBias.primaryRoleBias;
    return nerfed.includes(role);
  }).length;
  return count >= 3;
}

function buildBestLineup(team, meta) {
  const allPlayers = [...team.players];

  function roleStrength(player, role) {
    const roleDef = ROLES[role];
    let total = 0;
    roleDef.core.forEach(stat => {
      total += player.stats[stat].current;
    });
    return total;
  }

  function metaAwareScore(player) {
    let s = getPlayerOverall(player);
    const favored = (meta && meta.favoredRoles) || [];
    const nerfed = (meta && meta.nerfedRoles) || [];
    const role = player.roleBias.primaryRoleBias;
    const sec = player.roleBias.secondaryRoleBias;
    if (favored.includes(role) || favored.includes(sec)) s += 15;
    if (nerfed.includes(role) || nerfed.includes(sec)) s -= 15;
    return s;
  }

  const lineup = [];

  // Ensure required roles exist
  REQUIRED_CORE_ROLES.forEach(role => {
    const candidates = allPlayers
      .filter(p => p.roleBias.primaryRoleBias === role || p.roleBias.secondaryRoleBias === role)
      .sort((a, b) => roleStrength(b, role) - roleStrength(a, role));

    if (candidates.length > 0) {
      const chosen = candidates[0];
      assignRole(chosen, role);
      lineup.push(chosen);
      allPlayers.splice(allPlayers.indexOf(chosen), 1);
    }
  });

  // Fill remaining slots by overall strength (meta-aware when meta provided)
  while (lineup.length < 5 && allPlayers.length > 0) {
    const sortBy = meta ? metaAwareScore : getPlayerOverall;
    const best = allPlayers
      .sort((a, b) => sortBy(b) - sortBy(a))[0];

    assignRole(best, best.roleBias.primaryRoleBias);
    lineup.push(best);
    allPlayers.splice(allPlayers.indexOf(best), 1);
  }

  return lineup;
}

function adaptLineupToMeta(team, meta) {
  const newLineup = buildBestLineup(team, meta);
  const bench = team.players.filter(p => !newLineup.includes(p));
  team.starters = newLineup;
  team.bench = bench;
  team.players = [...newLineup, ...bench];
}

// PART 2 — PLAYER POWER CALCULATION

function getPlayerOverall(player) {
  const avg = STAT_KEYS.reduce((sum, key) => sum + player.stats[key].current, 0) / STAT_KEYS.length;
  return Math.round(avg);
}

function calculatePlayerMatchPower({ player, environment, meta, teamTrainingBoosts }) {
  let total = 0;
  const infrastructure = (environment && environment.infrastructure != null) ? environment.infrastructure : 50;
  const varianceReduction = (infrastructure - 50) / 100;

  STAT_KEYS.forEach(statKey => {
    let adjusted = calculateRoleAdjustedCurrent({
      player,
      statKey,
      environment,
      meta
    });
    if (meta && meta.statBonuses && meta.statBonuses[statKey] != null) {
      adjusted *= meta.statBonuses[statKey];
    }
    if (teamTrainingBoosts && teamTrainingBoosts[statKey]) {
      adjusted *= teamTrainingBoosts[statKey];
    }
    var reducedVariance = 1 + (Math.random() - 0.5) * 0.2 * (1 - varianceReduction);
    adjusted *= reducedVariance;
    total += adjusted;
  });

  return total / STAT_KEYS.length;
}

// PART 3 — TEAM MATCH POWER

const TEAM_TRAINING_PLAN_KEYS = ['Fast Execute', 'Default Heavy', 'Contact Play', 'Utility Spam', 'Anti-Strat', 'Post-Plant'];

const TEAM_TRAINING_PLANS = {
  'Fast Execute': {
    description: 'Aggressive site takes with explosive utility',
    boosts: { decisionSpeed: 1.15, aim: 1.08, utilityIQ: 1.05 }
  },
  'Default Heavy': {
    description: 'Slow defaults with late-round executes',
    boosts: { gameSense: 1.12, positioning: 1.10, consistency: 1.08 }
  },
  'Contact Play': {
    description: 'High tempo duels and first-bloods',
    boosts: { aim: 1.15, reaction: 1.12, mental: 1.05 }
  },
  'Utility Spam': {
    description: 'Info denial and ability-heavy rounds',
    boosts: { utilityIQ: 1.15, communication: 1.10, gameSense: 1.08 }
  },
  'Anti-Strat': {
    description: 'Read opponents and counter their setups',
    boosts: { adaptability: 1.15, gameSense: 1.10, positioning: 1.08 }
  },
  'Post-Plant': {
    description: 'Focus on winning after plant',
    boosts: { positioning: 1.12, mental: 1.10, consistency: 1.10 }
  }
};

const COACH_TIERS = [
  { level: 1, quality: 50, monthlySalary: 0, upgradeCost: 0, name: 'Standard Coach', description: 'Basic training staff' },
  { level: 2, quality: 65, monthlySalary: 20000, upgradeCost: 150000, name: 'Experienced Coach', description: 'Proven track record with mid-tier teams' },
  { level: 3, quality: 80, monthlySalary: 40000, upgradeCost: 350000, name: 'Elite Coach', description: 'Top-tier tactical mind and player development' },
  { level: 4, quality: 95, monthlySalary: 70000, upgradeCost: 750000, name: 'World-Class Coach', description: 'Championship-winning legendary coach' }
];

const FACILITY_TIERS = [
  { level: 1, infrastructure: 50, seasonalMaintenance: 0, upgradeCost: 0, name: 'Basic Setup', description: 'Shared office space, minimal equipment', prestigeBonus: 0, youthSlotsBonus: 0 },
  { level: 2, infrastructure: 65, seasonalMaintenance: 50000, upgradeCost: 200000, name: 'Gaming House', description: 'Dedicated team house with practice rooms', prestigeBonus: 5, youthSlotsBonus: 0 },
  { level: 3, infrastructure: 80, seasonalMaintenance: 100000, upgradeCost: 500000, name: 'Pro Facility', description: 'Full training complex with analysts and physios', prestigeBonus: 10, youthSlotsBonus: 2 },
  { level: 4, infrastructure: 95, seasonalMaintenance: 180000, upgradeCost: 1000000, name: 'State-of-the-Art HQ', description: 'World-class campus with recovery centers', prestigeBonus: 20, youthSlotsBonus: 4 }
];

const PSYCHOLOGY_TIERS = [
  { level: 1, support: 50, seasonalCost: 0, upgradeCost: 0, name: 'Basic Support', description: 'Standard player wellness check-ins', pressureReduction: 0, synergyBonus: 0 },
  { level: 2, support: 65, seasonalCost: 30000, upgradeCost: 120000, name: 'Sports Psychologist', description: 'Dedicated mental performance coach', pressureReduction: 0.10, synergyBonus: 0.02 },
  { level: 3, support: 80, seasonalCost: 60000, upgradeCost: 280000, name: 'Mental Performance Team', description: 'Full psychology staff with individual sessions', pressureReduction: 0.20, synergyBonus: 0.04 },
  { level: 4, support: 95, seasonalCost: 100000, upgradeCost: 600000, name: 'Elite Wellness Program', description: 'World-class mental health and performance optimization', pressureReduction: 0.30, synergyBonus: 0.06 }
];

const SPONSOR_TIERS = [
  { id: 'local-tech', name: 'Local Tech Startup', tier: 'Easy', totalPay: 250000, rules: [{ type: 'minWins', value: 3, description: 'Win at least 3 matches' }], description: 'Low-risk partnership with modest expectations' },
  { id: 'regional-brand', name: 'Regional Esports Brand', tier: 'Medium', totalPay: 400000, rules: [{ type: 'minWins', value: 6, description: 'Win at least 6 matches' }, { type: 'minPlacement', value: 8, description: 'Finish in top 8' }], description: 'Balanced risk with reasonable performance targets' },
  { id: 'gaming-peripheral', name: 'Gaming Peripherals Co.', tier: 'Medium', totalPay: 450000, rules: [{ type: 'minWins', value: 7, description: 'Win at least 7 matches' }, { type: 'useYouth', value: 1, description: 'Promote 1 youth player during season' }], description: 'Invest in young talent for brand visibility' },
  { id: 'fortune-500', name: 'Fortune 500 Tech Giant', tier: 'Hard', totalPay: 600000, rules: [{ type: 'minWins', value: 8, description: 'Win at least 8 matches' }, { type: 'minPlacement', value: 4, description: 'Finish in top 4' }], description: 'Elite partnership demanding championship contention' },
  { id: 'global-bank', name: 'Global Banking Group', tier: 'Hard', totalPay: 700000, rules: [{ type: 'minWins', value: 9, description: 'Win at least 9 matches' }, { type: 'minPlacement', value: 3, description: 'Finish in top 3' }, { type: 'useYouth', value: 1, description: 'Promote 1 youth player during season' }], description: 'Premium sponsorship for elite organizations only' }
];

window.Nexus.COACH_TIERS = COACH_TIERS;
window.Nexus.FACILITY_TIERS = FACILITY_TIERS;
window.Nexus.PSYCHOLOGY_TIERS = PSYCHOLOGY_TIERS;
window.Nexus.SPONSOR_TIERS = SPONSOR_TIERS;

function getCoachTier(team) {
  const level = (team && (team.coachTierLevel != null ? team.coachTierLevel : 1)) || 1;
  return COACH_TIERS[Math.min(level - 1, COACH_TIERS.length - 1)] || COACH_TIERS[0];
}

function getFacilityTier(team) {
  const level = (team && (team.facilityTierLevel != null ? team.facilityTierLevel : 1)) || 1;
  return FACILITY_TIERS[Math.min(level - 1, FACILITY_TIERS.length - 1)] || FACILITY_TIERS[0];
}

function getPsychologyTier(team) {
  const level = (team && (team.psychologyLevel != null ? team.psychologyLevel : 1)) || 1;
  return PSYCHOLOGY_TIERS[Math.min(level - 1, PSYCHOLOGY_TIERS.length - 1)] || PSYCHOLOGY_TIERS[0];
}

function getMaxYouthAcademySlots(team) {
  return 4 + (getFacilityTier(team).youthSlotsBonus || 0);
}

function upgradePsychology(team) {
  const currentLevel = team.psychologyLevel != null ? team.psychologyLevel : 1;
  if (currentLevel >= 4) return { success: false, message: 'Already at max level' };
  const nextTier = PSYCHOLOGY_TIERS[currentLevel];
  const upgradeCost = nextTier.upgradeCost;
  if (!team.finance || (team.finance.capital || 0) < upgradeCost) {
    return { success: false, message: 'Insufficient funds' };
  }
  team.finance.capital -= upgradeCost;
  team.psychologyLevel = currentLevel + 1;
  return { success: true, message: 'Upgraded to ' + nextTier.name, newLevel: team.psychologyLevel };
}

function syncTeamEnvironmentFromTiers(team, environmentMap) {
  if (!team || !environmentMap || !team.name) return;
  const env = environmentMap[team.name] || { coachQuality: 50, infrastructure: 50, psychologySupport: 50, pressure: 50 };
  const coach = getCoachTier(team);
  const facility = getFacilityTier(team);
  const psych = getPsychologyTier(team);
  environmentMap[team.name] = Object.assign({}, env, { coachQuality: coach.quality, infrastructure: facility.infrastructure, psychologySupport: psych.support });
}

function syncPressureToPrestige(team, environmentMap) {
  if (!team || !environmentMap || !environmentMap[team.name]) return;
  const prestige = team.prestige != null ? team.prestige : 50;
  const env = environmentMap[team.name];
  const newPressure = 50 + Math.floor((prestige - 50) * 0.4);
  env.pressure = Math.max(30, Math.min(80, newPressure));
}

function selectSponsor(team, sponsorId) {
  const sponsor = SPONSOR_TIERS.find(s => s.id === sponsorId);
  if (!sponsor) return { success: false, message: 'Sponsor not found' };
  if (!team.finance) return { success: false, message: 'No finance' };
  team.sponsorContract = {
    sponsorId: sponsor.id,
    name: sponsor.name,
    totalPay: sponsor.totalPay,
    upfrontPaid: Math.floor(sponsor.totalPay * 0.5),
    bonusPending: Math.floor(sponsor.totalPay * 0.5),
    rules: sponsor.rules,
    rulesCompleted: [],
    youthPromotedThisSeason: 0
  };
  const upfront = team.sponsorContract.upfrontPaid;
  team.finance.capital += upfront;
  team.finance.revenueThisSeason = (team.finance.revenueThisSeason || 0) + upfront;
  return { success: true, message: 'Signed with ' + sponsor.name + ' ($' + upfront.toLocaleString() + ' upfront)', upfront: upfront };
}

function checkSponsorRules(team, seasonStandings) {
  if (!team.sponsorContract) return { allMet: true, metRules: [], failedRules: [] };
  const contract = team.sponsorContract;
  const metRules = [];
  const failedRules = [];
  contract.rules.forEach(rule => {
    let met = false;
    if (rule.type === 'minWins') {
      const standing = seasonStandings[team.name];
      met = standing && standing.wins >= rule.value;
    } else if (rule.type === 'minPlacement') {
      const sorted = window.Nexus.getSortedStandings(seasonStandings);
      const position = sorted.findIndex(s => s.teamName === team.name) + 1;
      met = position > 0 && position <= rule.value;
    } else if (rule.type === 'useYouth') {
      met = (contract.youthPromotedThisSeason || 0) >= rule.value;
    }
    if (met) metRules.push(rule); else failedRules.push(rule);
  });
  return { allMet: failedRules.length === 0, metRules, failedRules };
}

function applySponsorSeasonEnd(team, seasonStandings) {
  if (!team.sponsorContract) return { bonus: 0, penalty: 0 };
  const contract = team.sponsorContract;
  const check = checkSponsorRules(team, seasonStandings);
  if (check.allMet) {
    const bonus = contract.bonusPending;
    if (team.finance) {
      team.finance.capital += bonus;
      team.finance.revenueThisSeason = (team.finance.revenueThisSeason || 0) + bonus;
    }
    team.sponsorContract = null;
    return { success: true, bonus: bonus, penalty: 0, message: 'All sponsor rules met! Received $' + bonus.toLocaleString() + ' bonus.' };
  } else {
    const penalty = Math.floor(contract.upfrontPaid * 0.5);
    if (team.finance) team.finance.capital -= penalty;
    team.sponsorContract = null;
    return { success: false, bonus: 0, penalty: penalty, failedRules: check.failedRules, message: 'Failed sponsor rules. Refunded $' + penalty.toLocaleString() + '.' };
  }
}

window.Nexus.selectSponsor = selectSponsor;
window.Nexus.checkSponsorRules = checkSponsorRules;
window.Nexus.applySponsorSeasonEnd = applySponsorSeasonEnd;
window.Nexus.getCoachTier = getCoachTier;
window.Nexus.getFacilityTier = getFacilityTier;
window.Nexus.getPsychologyTier = getPsychologyTier;
window.Nexus.upgradePsychology = upgradePsychology;
window.Nexus.getMaxYouthAcademySlots = getMaxYouthAcademySlots;
window.Nexus.syncTeamEnvironmentFromTiers = syncTeamEnvironmentFromTiers;
window.Nexus.syncPressureToPrestige = syncPressureToPrestige;

function calculateTeamMatchPower({ team, environment, meta }) {
  const nexus = window.Nexus || {};
  const userTeam =
    (nexus.getUserTeam && nexus.getUserTeam()) ||
    (nexus.LEAGUE && nexus.LEAGUE[0]) ||
    null;

  let lineup;
  if (userTeam && team && team.name === userTeam.name) {
    // For the player: always use chosen starters (roster page), never auto-picked lineup
    const slots = (team.starterSlots && team.starterSlots.length)
      ? team.starterSlots
      : (team.starters || team.players || []);
    lineup = (slots || []).filter(Boolean).slice(0, 5);
  } else {
    // For AI teams: keep automatic best lineup
    lineup = buildBestLineup(team, meta);
  }

  const synergyData = calculateTeamSynergy(lineup, meta, environment);
  const synergyMultiplier = synergyData.synergyMultiplier;

  const boosts = (team.activeTeamTraining && TEAM_TRAINING_PLANS[team.activeTeamTraining])
    ? TEAM_TRAINING_PLANS[team.activeTeamTraining].boosts
    : {};

  const playerPowers = lineup.map(function(p) {
    const matchPower = calculatePlayerMatchPower({ player: p, environment, meta, teamTrainingBoosts: boosts });
    return { player: p, matchPower: matchPower };
  });

  // Derive 0–10 style match ratings per player (relative to their own team this match)
  if (playerPowers.length > 0) {
    const powers = playerPowers.map(x => x.matchPower || 0);
    const mean = powers.reduce((s, v) => s + v, 0) / powers.length;
    const variance = powers.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / powers.length;
    const std = Math.sqrt(variance);
    playerPowers.forEach(function(x) {
      let rating;
      if (std > 0) {
        const z = (x.matchPower - mean) / std;
        rating = 6 + 1.5 * z;
      } else {
        rating = 6;
      }
      rating = Math.max(0, Math.min(10, rating));
      x.rating = Math.round(rating * 10) / 10;
    });
  }

  const avgPower = playerPowers.length > 0
    ? playerPowers.reduce(function(sum, x) { return sum + x.matchPower; }, 0) / playerPowers.length
    : 0;

  const shortHandedPenalty = lineup.length < 5 ? 0.85 : 1;
  const finalPower = (avgPower * synergyMultiplier) * shortHandedPenalty;

  return {
    finalPower,
    synergy: synergyData,
    lineup,
    playerPowers: playerPowers
  };
}

function getTeamTrainingMatchModifier(team) {
  if (!team || !team.activeTeamTraining) return 1.0;
  return 1.0;
}

// PART 4 — WIN PROBABILITY ENGINE

function calculateWinProbability(powerA, powerB) {
  const diff = powerA - powerB;

  // Logistic scaling — avoids extreme blowouts
  const probabilityA = 1 / (1 + Math.exp(-diff / 8));

  return probabilityA;
}

// Valorant-style round score: first to 13, or OT (12-12) then win by 2 (14-12, 15-13, 16-14)
function generateMatchScore(winnerName, teamA, teamB) {
  const teamAWon = winnerName === teamA.name;
  const isOvertime = Math.random() < 0.15;

  if (isOvertime) {
    const otVariants = [[14, 12], [15, 13], [16, 14]];
    const [winScore, loseScore] = otVariants[Math.floor(Math.random() * otVariants.length)];
    return {
      scoreA: teamAWon ? winScore : loseScore,
      scoreB: teamAWon ? loseScore : winScore
    };
  }

  const winnerRounds = 13;
  const loserRounds = Math.floor(Math.random() * 13);
  return {
    scoreA: teamAWon ? winnerRounds : loserRounds,
    scoreB: teamAWon ? loserRounds : winnerRounds
  };
}

function simulateMatch({ teamA, teamB, environmentA, environmentB, meta }) {
  const powerAData = calculateTeamMatchPower({ team: teamA, environment: environmentA, meta });
  const powerBData = calculateTeamMatchPower({ team: teamB, environment: environmentB, meta });

  const probA = calculateWinProbability(powerAData.finalPower, powerBData.finalPower);

  const roll = Math.random();

  const winner = roll < probA ? teamA.name : teamB.name;
  const { scoreA, scoreB } = generateMatchScore(winner, teamA, teamB);

  const playerPerformances = {};
  if (powerAData.playerPowers && powerAData.playerPowers.length) {
    playerPerformances[teamA.name] = powerAData.playerPowers.slice();
  }
  if (powerBData.playerPowers && powerBData.playerPowers.length) {
    playerPerformances[teamB.name] = powerBData.playerPowers.slice();
  }

  return {
    winner,
    scoreA,
    scoreB,
    playerPerformances,
    stage: undefined,
    probabilityA: Math.round(probA * 100) + '%',
    teamAPower: powerAData.finalPower.toFixed(2),
    teamBPower: powerBData.finalPower.toFixed(2),
    teamASynergy: powerAData.synergy,
    teamBSynergy: powerBData.synergy
  };
}

var MVP_ROLE_WEIGHTS = { Duelist: 0.40, Controller: 0.30, Sentinel: 0.20, Initiator: 0.10 };

function pickMatchMVP(winningTeamName, playerPerformances) {
  var list = (playerPerformances && playerPerformances[winningTeamName]) ? playerPerformances[winningTeamName] : [];
  if (!list.length) return null;

  var roll = Math.random();
  var roleWeights = MVP_ROLE_WEIGHTS;
  var pickedRole = 'Duelist';
  if (roll < roleWeights.Duelist) pickedRole = 'Duelist';
  else if (roll < roleWeights.Duelist + roleWeights.Controller) pickedRole = 'Controller';
  else if (roll < roleWeights.Duelist + roleWeights.Controller + roleWeights.Sentinel) pickedRole = 'Sentinel';
  else pickedRole = 'Initiator';

  var byRole = list.filter(function(x) {
    var p = x.player;
    var primary = (p && (p.assignedRole || (p.roleBias && p.roleBias.primaryRoleBias))) || '';
    return primary === pickedRole;
  });
  var pool = byRole.length > 0 ? byRole : list;

  var totalPower = 0;
  var weights = pool.map(function(x) {
    var noise = 0.9 + Math.random() * 0.2;
    var w = Math.max(0.01, (x.matchPower || 0) * noise);
    totalPower += w;
    return w;
  });
  var i = 0;
  var r = Math.random() * totalPower;
  for (; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) break;
  }
  i = Math.min(i, pool.length - 1);
  return pool[i] && pool[i].player ? pool[i].player : (list[0] && list[0].player) || null;
}

function analyzeMetaImpactOnRoster(team, meta) {
  if (!team || !team.players || !meta) return { buffed: 0, nerfed: 0 };
  const favored = (meta.favoredRoles && meta.favoredRoles.slice()) || [];
  const nerfed = (meta.nerfedRoles && meta.nerfedRoles.slice()) || [];
  let buffed = 0;
  let nerfedCount = 0;
  team.players.forEach(p => {
    const role = p.assignedRole || p.roleBias.primaryRoleBias;
    if (favored.includes(role)) buffed++;
    if (nerfed.includes(role)) nerfedCount++;
  });
  return { buffed, nerfed: nerfedCount };
}

// Expose Step 6
window.Nexus = window.Nexus || {};
function runPostMetaShiftAdaptation(season, newMeta, userTeamName) {
  if (!season || !season.teams || !newMeta) return;
  season.teams.forEach(team => {
    if (userTeamName && team.name === userTeamName) return;
    if (shouldTeamAdaptToMeta(team, newMeta)) adaptLineupToMeta(team, newMeta);
  });
}

window.Nexus.analyzeMetaImpactOnRoster = analyzeMetaImpactOnRoster;
window.Nexus.buildBestLineup = buildBestLineup;
window.Nexus.shouldTeamAdaptToMeta = shouldTeamAdaptToMeta;
window.Nexus.adaptLineupToMeta = adaptLineupToMeta;
window.Nexus.runPostMetaShiftAdaptation = runPostMetaShiftAdaptation;
window.Nexus.calculateTeamMatchPower = calculateTeamMatchPower;
window.Nexus.simulateMatch = simulateMatch;
window.Nexus.TEAM_TRAINING_PLAN_KEYS = TEAM_TRAINING_PLAN_KEYS;
window.Nexus.TEAM_TRAINING_PLANS = TEAM_TRAINING_PLANS;

// ------------------------------
// Project Nexus – Step 7 (Refactor)
// MATCHDAY SYSTEM
// Instead of one match at a time,
// we simulate full matchdays.
// Every team plays once per matchday.
// No more boring "other teams only" streak.
// ------------------------------

// PART 1 — ROUND ROBIN (CIRCLE METHOD)
// Produces structured matchdays (shuffled per career for variety)

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateMatchdays(teams) {
  let teamList = shuffleArray(teams);

  if (teamList.length % 2 !== 0) {
    teamList = [...teamList, { name: 'BYE' }];
  }

  const totalRounds = teamList.length - 1;
  const half = teamList.length / 2;
  const matchdays = [];

  for (let round = 0; round < totalRounds; round++) {
    const dayMatches = [];

    for (let i = 0; i < half; i++) {
      const teamA = teamList[i];
      const teamB = teamList[teamList.length - 1 - i];

      if (teamA.name !== 'BYE' && teamB.name !== 'BYE') {
        dayMatches.push({ teamA, teamB });
      }
    }

    matchdays.push(dayMatches);

    const fixed = teamList[0];
    const rest = teamList.slice(1);
    rest.unshift(rest.pop());
    teamList.splice(1, teamList.length - 1, ...rest);
  }

  return matchdays;
}

// PART 2 — SEASON MODEL UPDATE

function createSeason(teams) {
  const standings = {};

  teams.forEach(team => {
    standings[team.name] = {
      teamName: team.name,
      played: 0,
      wins: 0,
      losses: 0,
      points: 0
    };
  });

  return {
    teams,
    standings,
    matchdays: generateMatchdays(teams),
    currentMatchday: 0,
    playedMatchResults: []
  };
}

// PART 3 — PLAY FULL MATCHDAY

function checkForMetaShift(season) {
  if (season.matchdaysUntilMetaShift == null) season.matchdaysUntilMetaShift = 4;
  season.matchdaysUntilMetaShift--;
  if (season.matchdaysUntilMetaShift <= 0) {
    const current = getCurrentMeta();
    if (season.metaHistory == null) season.metaHistory = [];
    season.metaHistory.push({ atMatchday: season.currentMatchday, metaId: current.id, metaName: current.name || current.id });
    getRandomMetaPatch();
    season.matchdaysUntilMetaShift = 4;
    return getCurrentMeta();
  }
  return null;
}

function fillEmptyRosterSlotsForMatch(team) {
  if (!team || !Array.isArray(team.starterSlots) || team.starterSlots.length !== 5) return;
  const starterSlots = team.starterSlots;
  const benchSlots = team.benchSlots || [];
  const reserveSlots = team.reserveSlots || [];
  for (let i = 0; i < 5; i++) {
    if (starterSlots[i]) continue;
    const bj = benchSlots.findIndex(s => s != null);
    if (bj >= 0) {
      starterSlots[i] = benchSlots[bj];
      benchSlots[bj] = null;
    } else {
      const rj = reserveSlots.findIndex(s => s != null);
      if (rj >= 0) {
        starterSlots[i] = reserveSlots[rj];
        reserveSlots[rj] = null;
      }
    }
  }
  for (let i = 0; i < (benchSlots.length || 0); i++) {
    if (benchSlots[i]) continue;
    const rj = reserveSlots.findIndex(s => s != null);
    if (rj >= 0) {
      benchSlots[i] = reserveSlots[rj];
      reserveSlots[rj] = null;
    }
  }
  const starters = starterSlots.filter(Boolean);
  const bench = benchSlots.filter(Boolean);
  const reserves = reserveSlots.filter(Boolean);
  team.players = [...starters, ...bench, ...reserves];
  team.starters = team.players.slice(0, 5);
  team.bench = team.players.slice(5, 8);
}
window.Nexus.fillEmptyRosterSlotsForMatch = fillEmptyRosterSlotsForMatch;

function playNextMatchday(season, environmentMap, meta) {
  if (season.currentMatchday >= season.matchdays.length) {
    return { finished: true };
  }

  const keys = window.Nexus.TEAM_TRAINING_PLAN_KEYS || [];
  const userTeam = (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
  if (keys.length && season.teams) {
    season.teams.forEach(team => {
      if (team === userTeam) return;
      team.activeTeamTraining = keys[Math.floor(Math.random() * keys.length)];
    });
  }

  const todayMatches = season.matchdays[season.currentMatchday];
  const results = [];

  todayMatches.forEach(match => {
    if (window.Nexus.fillEmptyRosterSlotsForMatch) {
      window.Nexus.fillEmptyRosterSlotsForMatch(match.teamA);
      window.Nexus.fillEmptyRosterSlotsForMatch(match.teamB);
    }
    const result = simulateMatch({
      teamA: match.teamA,
      teamB: match.teamB,
      environmentA: environmentMap[match.teamA.name],
      environmentB: environmentMap[match.teamB.name],
      meta
    });
    result.stage = 'regular';

    updateStandings(season.standings, result, match);
    applyMatchRevenue(match.teamA, result.winner === match.teamA.name);
    applyMatchRevenue(match.teamB, result.winner === match.teamB.name);
    results.push({ match, result });
  });

  season.playedMatchResults[season.currentMatchday] = results;
  season.currentMatchday++;

  const newMeta = checkForMetaShift(season);

  return {
    finished: false,
    matchdayResults: results,
    newMeta: newMeta || undefined
  };
}

// PART 4 — UPDATE STANDINGS (unchanged logic)

function updateStandings(standings, result, match) {
  const teamAName = match.teamA.name;
  const teamBName = match.teamB.name;

  standings[teamAName].played++;
  standings[teamBName].played++;

  if (result.winner === teamAName) {
    standings[teamAName].wins++;
    standings[teamAName].points += 3;
    standings[teamBName].losses++;
  } else {
    standings[teamBName].wins++;
    standings[teamBName].points += 3;
    standings[teamAName].losses++;
  }
}

// PART 5 — SORT TABLE

function getSortedStandings(standings) {
  return Object.values(standings)
    .sort((a, b) => b.points - a.points || b.wins - a.wins);
}

// Expose Step 7
window.Nexus = window.Nexus || {};
window.Nexus.createSeason = createSeason;
window.Nexus.playNextMatchday = playNextMatchday;
window.Nexus.checkForMetaShift = checkForMetaShift;
window.Nexus.getSortedStandings = getSortedStandings;
window.Nexus.ALL_MAPS = ALL_MAPS;
window.Nexus.getActiveMapPool = getActiveMapPool;
window.Nexus.assignMapToMatch = assignMapToMatch;
window.Nexus.rotateMapPool = rotateMapPool;

// -------------------------------------------------
// Project Nexus – Step 8
// SPLIT FORMAT (Elite Esports Structure)
// 11 Matchdays Regular Season
// Then: Top 6 → Championship Playoffs | Bottom 6 → Relegation Split
// -------------------------------------------------

// PART 1 — EXTEND SEASON STATE

function createSeasonWithSplit(teams) {
  const baseSeason = createSeason(teams);
  const activeMapPool = getActiveMapPool();
  (baseSeason.matchdays || []).forEach(day => {
    (day || []).forEach(match => {
      match.map = assignMapToMatch(activeMapPool);
    });
  });

  return {
    ...baseSeason,
    phase: 'regular',
    playoffsBracket: null,
    relegationCandidates: null,
    challengerPromotion: null,
    relegationResults: null,
    matchdaysUntilMetaShift: 4,
    metaHistory: [],
    transferMarket: [],
    transferMarketRefreshCountdown: 3,
    activeMapPool
  };
}

function createChallengerSeasonFromTeams(teams) {
  if (!teams || teams.length === 0) return null;
  const baseSeason = createSeason(teams);
  const activeMapPool = getActiveMapPool();
  (baseSeason.matchdays || []).forEach(day => {
    (day || []).forEach(match => {
      match.map = assignMapToMatch(activeMapPool);
    });
  });
  return {
    ...baseSeason,
    phase: 'regular'
  };
}

// PART 2 — TRANSITION TO SPLIT (Top 6 playoffs, Bottom 2 vs Challenger Top 2)

function transitionToSplit(season, environmentMap, meta) {
  const sorted = getSortedStandings(season.standings);

  const top6 = sorted.slice(0, 6).map(t => season.teams.find(team => team.name === t.teamName));
  const bottom2 = sorted.slice(10, 12).map(t => season.teams.find(team => team.name === t.teamName)).filter(Boolean);

  season.phase = 'playoffs';
  season.playoffsBracket = createPlayoffBracket(top6);
  season.relegationCandidates = bottom2;

  const challengerSeason = window.Nexus.CHALLENGER_SEASON;
  const challengerTeams = window.Nexus.CHALLENGER_LEAGUE || [];
  if (challengerSeason && challengerSeason.standings && challengerTeams.length) {
    const challengerSorted = getSortedStandings(challengerSeason.standings);
    season.challengerPromotion = challengerSorted.slice(0, 2).map(t =>
      challengerTeams.find(team => team.name === t.teamName)
    ).filter(Boolean);
    if (window.Nexus.applyPlacementBonus) window.Nexus.applyPlacementBonus(challengerSeason);
  }
}

// PART 3 — PLAYOFF BRACKET (Single Elim: 1v6, 2v5, 3v4)

function createPlayoffBracket(topTeams) {
  return {
    round: 1,
    matches: [
      { teamA: topTeams[0], teamB: topTeams[5] },
      { teamA: topTeams[1], teamB: topTeams[4] },
      { teamA: topTeams[2], teamB: topTeams[3] }
    ],
    finalists: []
  };
}

function playPlayoffRound(season, environmentMap, meta) {
  const bracket = season.playoffsBracket;
  const winners = [];
  const roundResults = [];

  bracket.matches.forEach(match => {
    const result = simulateMatch({
      teamA: match.teamA,
      teamB: match.teamB,
      environmentA: environmentMap[match.teamA.name],
      environmentB: environmentMap[match.teamB.name],
      meta
    });
    result.stage = 'playoffs';

    const winnerTeam = season.teams.find(t => t.name === result.winner);
    winners.push(winnerTeam);
    roundResults.push({ match, result });
  });

  if (winners.length === 3) {
    bracket.finalists = [winners[0], winners[1]];
    bracket.round = 2;
    bracket.matches = [
      { teamA: winners[0], teamB: winners[1] }
    ];
    return { finished: false, playoffWinners: winners, roundResults };
  }

  if (winners.length === 1) {
    season.champion = winners[0];
    if (season.champion) {
      if (season.champion.finance) {
        const prize = 500000;
        const championTax = Math.round(prize * 0.35);
        season.champion.finance.capital += prize;
        season.champion.finance.revenueThisSeason += prize;
        season.champion.finance.capital -= championTax;
        season.champion.finance.revenueThisSeason -= championTax;
        const userTeam = window.Nexus && window.Nexus.getUserTeam && window.Nexus.getUserTeam();
        if (userTeam && season.champion.name === userTeam.name && window.Nexus && typeof window.Nexus.onFinanceExpense === 'function') {
          window.Nexus.onFinanceExpense('Player bonuses (champions): -$' + championTax.toLocaleString());
        }
      }
      season.champion.prestige = (season.champion.prestige || 50) + 30;
    }
    season.phase = 'relegation';
    return { finished: false, champion: season.champion, playoffWinners: winners, roundResults };
  }

  return { finished: false, roundResults };
}

// PART 4 — RELEGATION TOURNAMENT (Bottom 2 Main vs Top 2 Challenger)

function resolveRelegationTournament({
  mainTeams,
  challengerTeams,
  environmentMap,
  meta
}) {
  const results = [];
  const matchResults = [];
  const safeMain = Array.isArray(mainTeams) ? mainTeams : [];
  const safeChallenger = Array.isArray(challengerTeams) ? challengerTeams : [];

  for (let i = 0; i < 2; i++) {
    const main = safeMain[i];
    const challenger = safeChallenger[i];
    if (!main || !challenger || !main.name || !challenger.name) continue;

    const matchResult = simulateMatch({
      teamA: main,
      teamB: challenger,
      environmentA: environmentMap[main.name],
      environmentB: environmentMap[challenger.name],
      meta
    });
    matchResult.stage = 'relegation';

    const mainWins = matchResult.winner === main.name;

    if (!mainWins) {
      if (challenger.finance) {
        const prize = 200000;
        const championTax = Math.round(prize * 0.35);
        challenger.finance.capital += prize;
        challenger.finance.revenueThisSeason = (challenger.finance.revenueThisSeason || 0) + prize;
        challenger.finance.capital -= championTax;
        challenger.finance.revenueThisSeason -= championTax;
        const userTeam = window.Nexus && window.Nexus.getUserTeam && window.Nexus.getUserTeam();
        if (userTeam && challenger.name === userTeam.name && window.Nexus && typeof window.Nexus.onFinanceExpense === 'function') {
          window.Nexus.onFinanceExpense('Player bonuses (champions): -$' + championTax.toLocaleString());
        }
      }
      main.tier = 'Challenger';
      main.prestige = Math.max(1, (main.prestige || 50) - 10);
      main.budgetMultiplier = 0.75;

      challenger.tier = 'Main';
      challenger.prestige = (challenger.prestige || 30) + 15;
      challenger.budgetMultiplier = 1.0;
      if (window.Nexus.syncPressureToPrestige && environmentMap) {
        window.Nexus.syncPressureToPrestige(main, environmentMap);
        window.Nexus.syncPressureToPrestige(challenger, environmentMap);
      }
    } else {
      if (main.finance) {
        const prize = 100000;
        const championTax = Math.round(prize * 0.35);
        main.finance.capital += prize;
        main.finance.revenueThisSeason = (main.finance.revenueThisSeason || 0) + prize;
        main.finance.capital -= championTax;
        main.finance.revenueThisSeason -= championTax;
        const userTeam = window.Nexus && window.Nexus.getUserTeam && window.Nexus.getUserTeam();
        if (userTeam && main.name === userTeam.name && window.Nexus && typeof window.Nexus.onFinanceExpense === 'function') {
          window.Nexus.onFinanceExpense('Player bonuses (champions): -$' + championTax.toLocaleString());
        }
      }
    }

    results.push({
      mainTeam: main.name,
      challengerTeam: challenger.name,
      winner: matchResult.winner
    });
    matchResults.push({
      match: { teamA: main, teamB: challenger, map: 'Relegation series' },
      result: matchResult
    });
  }

  return { results, matchResults };
}

// PART 5 — UNIFIED STAGE FLOW

function playNextStage(season, environmentMap, meta) {
  if (season.phase === 'regular') {
    const result = playNextMatchday(season, environmentMap, meta);

    if (result.finished) {
      transitionToSplit(season, environmentMap, meta);
      return { finished: false, phase: 'playoffs', matchdayResults: result.matchdayResults, newMeta: result.newMeta };
    }

    return { ...result, phase: 'regular' };
  }

  if (season.phase === 'playoffs') {
    return playPlayoffRound(season, environmentMap, meta);
  }

  if (season.phase === 'relegation') {
    const rel = resolveRelegationTournament({
      mainTeams: season.relegationCandidates,
      challengerTeams: season.challengerPromotion,
      environmentMap,
      meta
    });
    season.relegationResults = rel.results;
    season.phase = 'finished';
    return { finished: true, relegationResults: rel.results, relegationMatchResults: rel.matchResults };
  }

  return { finished: true };
}

// Expose Step 8
window.Nexus = window.Nexus || {};
window.Nexus.createSeasonWithSplit = createSeasonWithSplit;
window.Nexus.createChallengerSeasonFromTeams = createChallengerSeasonFromTeams;
window.Nexus.playNextStage = playNextStage;
window.Nexus.transitionToSplit = transitionToSplit;
window.Nexus.resolveRelegationTournament = resolveRelegationTournament;

// -------------------------------------------------
// Project Nexus – Step 9
// Financial System – Season Economy Model
// 1 season = 1 split (~3 months). Monthly costs tick 3x; seasonal once at start.
// -------------------------------------------------

function initializeFinance(team) {
  const baseCapital = team.tier === 'Main' ? 1150000 : 550000;
  team.finance = {
    capital: baseCapital,
    monthlyCost: team.tier === 'Main' ? 180000 : 70000,
    seasonalCost: team.tier === 'Main' ? 200000 : 80000,
    revenuePerWin: team.tier === 'Main' ? 60000 : 25000,
    revenueThisSeason: 0,
    get transferBudget() { return Math.floor((this.capital || 0) * 0.3); }
  };
}

function applyMonthlyCosts(team) {
  if (!team.finance) return;
  const coach = typeof getCoachTier === 'function' ? getCoachTier(team) : { monthlySalary: 0 };
  const amount = (team.finance.monthlyCost || 0) + (coach.monthlySalary || 0);
  team.finance.capital -= amount;
  return amount;
}

function applySeasonalCost(team) {
  if (!team.finance) return 0;
  const prestige = team.prestige != null ? team.prestige : 50;
  const baseCost = Math.round(team.finance.seasonalCost * (0.7 + prestige / 100));
  const facility = typeof getFacilityTier === 'function' ? getFacilityTier(team) : { seasonalMaintenance: 0 };
  const psych = typeof getPsychologyTier === 'function' ? getPsychologyTier(team) : { seasonalCost: 0 };
  const maintenance = facility.seasonalMaintenance || 0;
  const psychologyCost = psych.seasonalCost || 0;
  const effectiveCost = baseCost + maintenance + psychologyCost;
  team.finance.capital -= effectiveCost;
  return effectiveCost;
}

function getOrdinalSuffix(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  const r = n % 10;
  if (r === 1) return 'st';
  if (r === 2) return 'nd';
  if (r === 3) return 'rd';
  return 'th';
}

function applyPlacementBonus(season) {
  if (!season || !season.standings || !season.teams) return;
  const sorted = window.Nexus.getSortedStandings(season.standings);
  if (!sorted || sorted.length === 0) return;
  const isMainLeague = season.teams.length === 12;
  const mainBonuses = {
    1: 300000, 2: 200000, 3: 150000, 4: 100000, 5: 75000, 6: 50000,
    7: 30000, 8: 25000, 9: 20000, 10: 15000, 11: 10000, 12: 5000
  };
  const challengerBonuses = {
    1: 100000, 2: 75000, 3: 40000, 4: 20000, 5: 10000, 6: 5000
  };
  const bonuses = isMainLeague ? mainBonuses : challengerBonuses;
  sorted.forEach((standing, index) => {
    const position = index + 1;
    const bonus = bonuses[position];
    if (bonus != null && bonus > 0) {
      const team = season.teams.find(t => t.name === standing.teamName);
      if (team && team.finance) {
        team.finance.capital += bonus;
        team.finance.revenueThisSeason = (team.finance.revenueThisSeason || 0) + bonus;
        const tier = isMainLeague ? 'Main' : 'Challenger';
        const suffix = getOrdinalSuffix(position);
        if (typeof console !== 'undefined' && console.log) {
          console.log('[' + tier + '] ' + team.name + ' received $' + bonus.toLocaleString() + ' for finishing ' + position + suffix);
        }
      }
    }
  });
}

function applyPrestigeChanges(season, environmentMap) {
  if (!season || !season.standings || !season.teams || !environmentMap) return;
  const sorted = window.Nexus.getSortedStandings(season.standings);
  if (!sorted || sorted.length === 0) return;
  const isMainLeague = season.teams.length === 12;
  const mainPrestige = { 1: 25, 2: 12, 3: 8, 4: 5, 5: 2, 6: 2, 7: 0, 8: 0, 9: 0, 10: -5, 11: -5, 12: -10 };
  const challengerPrestige = { 1: 15, 2: 10, 3: 3, 4: 3, 5: 0, 6: 0 };
  const prestigeByPosition = isMainLeague ? mainPrestige : challengerPrestige;
  sorted.forEach((standing, index) => {
    const position = index + 1;
    const prestigeChange = prestigeByPosition[position] != null ? prestigeByPosition[position] : 0;
    const team = season.teams.find(t => t.name === standing.teamName);
    if (team) {
      team.prestige = Math.max(10, Math.min(100, (team.prestige || 50) + prestigeChange));
      if (window.Nexus.syncPressureToPrestige) window.Nexus.syncPressureToPrestige(team, environmentMap);
    }
  });
}

function applyMatchRevenue(team, didWin) {
  if (!team.finance) return;
  if (didWin) {
    team.finance.capital += team.finance.revenuePerWin;
    team.finance.revenueThisSeason = (team.finance.revenueThisSeason || 0) + team.finance.revenuePerWin;
  }
}

function checkBankruptcy(team) {
  return team.finance && team.finance.capital <= 0;
}

// -------------------------------------------------
// Transfer Market – Contracts & Valuation
// -------------------------------------------------
function initializeContractForPlayer(player) {
  if (player.contractYears != null && player.salary != null) return;
  const overall = window.Nexus.getPlayerOverall ? window.Nexus.getPlayerOverall(player) : (STAT_KEYS.reduce((s, k) => s + (player.stats[k] && player.stats[k].current) || 0, 0) / STAT_KEYS.length);
  if (player.contractYears == null) player.contractYears = randomInt(1, 3);
  if (player.salary == null) {
    if (overall >= 80) player.salary = randomInt(15000, 25000);
    else if (overall >= 70) player.salary = randomInt(8000, 15000);
    else if (overall >= 60) player.salary = randomInt(4000, 8000);
    else player.salary = randomInt(2000, 4000);
  }
  if (player.transferListed == null) player.transferListed = false;
}

function calculatePlayerValue(player) {
  const overall = getPlayerOverall(player);
  let baseValue = overall * 1000;
  const age = player.age != null ? player.age : 22;
  if (age <= 21) baseValue *= 1.5;
  else if (age <= 25) baseValue *= 1.2;
  else if (age <= 27) baseValue *= 0.7;
  else baseValue *= 0.3;
  const role = (player.roleBias && player.roleBias.primaryRoleBias) || '';
  const aim = (player.stats && player.stats.aim && player.stats.aim.current) || 0;
  const utilityIQ = (player.stats && player.stats.utilityIQ && player.stats.utilityIQ.current) || 0;
  if (role === 'Duelist' && aim >= 85) baseValue *= 1.3;
  else if (role === 'Controller' && utilityIQ >= 80) baseValue *= 1.2;
  const flex = (player.roleBias && player.roleBias.flexPotential) || 'Low';
  if (flex === 'High') baseValue *= 1.2;
  else if (flex === 'Medium') baseValue *= 1.1;
  return Math.round(baseValue);
}

const MAX_ROSTER_SIZE = 12;
const MIN_ROSTER_SIZE = 8;
const MAX_YOUTH_ACADEMY = 6;

function generateTransferMarket(allTeams, userTeamName, skipPlayerIds) {
  const skip = new Set(skipPlayerIds || []);
  const listings = [];
  (allTeams || []).forEach(team => {
    if (team.name === userTeamName || !team.players) return;
    const bench = team.players.slice(5);
    const starters = team.players.slice(0, 5);
    bench.forEach((p, i) => {
      if (skip.has(p.id)) return;
      if (i < 2 && chance(0.7)) {
        p.transferListed = true;
        listings.push({
          player: p,
          team,
          askingPrice: Math.round(calculatePlayerValue(p) * 1.2),
          listedSince: 0
        });
      }
    });
    starters.forEach(p => {
      if (skip.has(p.id)) return;
      const age = p.age != null ? p.age : 22;
      const salary = p.salary || 5000;
      const monthlyCost = (team.finance && team.finance.monthlyCost) || 180000;
      if (age >= 27 && chance(0.4)) {
        p.transferListed = true;
        listings.push({ player: p, team, askingPrice: Math.round(calculatePlayerValue(p) * 1.2), listedSince: 0 });
      } else if (salary > monthlyCost * 0.15 && chance(0.3)) {
        p.transferListed = true;
        listings.push({ player: p, team, askingPrice: Math.round(calculatePlayerValue(p) * 1.2), listedSince: 0 });
      }
    });
  });
  return listings.slice(0, 20);
}

function refreshTransferMarket(season, allTeams, userTeamName) {
  if (!season) return;
  season.transferMarket = season.transferMarket || [];
  season.transferMarketRefreshCountdown = season.transferMarketRefreshCountdown != null ? season.transferMarketRefreshCountdown : 3;
  const current = season.transferMarket;
  const unlistCount = Math.floor(current.length * (0.3 + Math.random() * 0.2));
  for (let i = 0; i < unlistCount && current.length > 0; i++) {
    const idx = randomInt(0, current.length - 1);
    const entry = current[idx];
    if (entry && entry.team && entry.player && window.Nexus.recordTransferEvent) {
      window.Nexus.recordTransferEvent({ teamName: entry.team.name, direction: 'out', playerName: getPlayerDisplayName(entry.player), playerId: entry.player.id, how: 'market_refresh' });
    }
    if (entry && entry.player) entry.player.transferListed = false;
    current.splice(idx, 1);
  }
  const existingIds = current.map(e => e.player && e.player.id).filter(Boolean);
  const newListings = generateTransferMarket(allTeams, userTeamName, existingIds);
  const matchday = season.currentMatchday != null ? season.currentMatchday : 0;
  newListings.forEach(entry => {
    entry.listedSince = matchday;
    current.push(entry);
  });
  season.transferMarket = current.slice(0, 20);
  season.transferMarketRefreshCountdown = 3;
}

function canAffordPlayer(userTeam, askingPrice, playerSalary) {
  if (!userTeam || !userTeam.finance) return { canAfford: false, reason: 'No finance data' };
  if (userTeam.finance.capital < askingPrice) return { canAfford: false, reason: 'Insufficient funds' };
  if ((userTeam.players || []).length >= MAX_ROSTER_SIZE) return { canAfford: false, reason: 'Roster full (12 players max)' };
  const newMonthly = (userTeam.finance.monthlyCost || 0) + (playerSalary || 0);
  const capitalAfter = userTeam.finance.capital - askingPrice;
  const runway = newMonthly > 0 ? Math.floor(capitalAfter / newMonthly) : 99;
  if (runway < 3) return { canAfford: false, reason: 'Cannot afford wages (runway < 3 months)' };
  return { canAfford: true, reason: '' };
}

function buyPlayer(args) {
  const { userTeam, sellerTeam, player, askingPrice, season } = args || {};
  if (!userTeam || !sellerTeam || !player || askingPrice == null) return { success: false, message: 'Invalid args' };
  const salary = player.salary || 5000;
  const check = canAffordPlayer(userTeam, askingPrice, salary);
  if (!check.canAfford) return { success: false, message: check.reason };
  if (!(sellerTeam.players || []).includes(player)) return { success: false, message: 'Player no longer available' };
  userTeam.finance.capital -= askingPrice;
  sellerTeam.finance.capital += askingPrice;
  sellerTeam.players = sellerTeam.players.filter(p => p !== player);
  userTeam.players = userTeam.players || [];
  userTeam.players.push(player);
  player.transferListed = false;
  userTeam.starters = userTeam.players.slice(0, 5);
  userTeam.bench = userTeam.players.slice(5, 8);
  sellerTeam.starters = sellerTeam.players.slice(0, 5);
  sellerTeam.bench = sellerTeam.players.slice(5, 8);
  if (userTeam.finance.monthlyCost != null) userTeam.finance.monthlyCost += salary;
  if (sellerTeam.finance.monthlyCost != null) sellerTeam.finance.monthlyCost -= salary;
  if (sellerTeam !== userTeam && season && (sellerTeam.players || []).length < MIN_ROSTER_SIZE) {
    const replaced = aiBuyReplacement(sellerTeam, player, season);
    if (replaced) {
      sellerTeam.starters = sellerTeam.players.slice(0, 5);
      sellerTeam.bench = sellerTeam.players.slice(5, 8);
    }
  }
  while ((sellerTeam.players || []).length < MIN_ROSTER_SIZE) {
    const youth = createPlayer(null, randomInt(17, 20));
    sellerTeam.players.push(youth);
    sellerTeam.starters = sellerTeam.players.slice(0, 5);
    sellerTeam.bench = sellerTeam.players.slice(5, 8);
    if (sellerTeam.finance.monthlyCost != null) sellerTeam.finance.monthlyCost += (youth.salary || 3000);
  }
  if (window.Nexus.recordTransferEvent) {
    window.Nexus.recordTransferEvent({ teamName: sellerTeam.name, direction: 'out', playerName: getPlayerDisplayName(player), playerId: player.id, how: 'transfer', otherTeam: userTeam.name });
    window.Nexus.recordTransferEvent({ teamName: userTeam.name, direction: 'in', playerName: getPlayerDisplayName(player), playerId: player.id, how: 'transfer', otherTeam: sellerTeam.name });
  }
  return { success: true, message: 'Signed ' + getPlayerDisplayName(player) + ' for $' + askingPrice.toLocaleString() };
}

function sellPlayer(args) {
  const { userTeam, player, askingPrice } = args || {};
  if (!userTeam || !player) return { success: false, message: 'Invalid args' };
  const players = userTeam.players || [];
  if (players.length <= MIN_ROSTER_SIZE) return { success: false, message: 'Must keep at least 8 players' };
  if (!players.includes(player)) return { success: false, message: 'Player not in your team' };
  const fee = Math.round((askingPrice != null ? askingPrice : calculatePlayerValue(player)) * 0.8);
  userTeam.finance.capital += fee;
  userTeam.players = players.filter(p => p !== player);
  userTeam.starters = userTeam.players.slice(0, 5);
  userTeam.bench = userTeam.players.slice(5, 8);
  if (userTeam.finance.monthlyCost != null) userTeam.finance.monthlyCost -= (player.salary || 0);
  if (Array.isArray(userTeam.starterSlots)) {
    for (let i = 0; i < userTeam.starterSlots.length; i++) if (userTeam.starterSlots[i] === player) userTeam.starterSlots[i] = null;
  }
  if (Array.isArray(userTeam.benchSlots)) {
    for (let i = 0; i < userTeam.benchSlots.length; i++) if (userTeam.benchSlots[i] === player) userTeam.benchSlots[i] = null;
  }
  if (Array.isArray(userTeam.reserveSlots)) {
    for (let i = 0; i < userTeam.reserveSlots.length; i++) if (userTeam.reserveSlots[i] === player) userTeam.reserveSlots[i] = null;
  }
  player.contractYears = null;
  (window.Nexus.FREE_AGENTS = window.Nexus.FREE_AGENTS || []).push(player);
  if (window.Nexus.recordTransferEvent) {
    window.Nexus.recordTransferEvent({ teamName: userTeam.name, direction: 'out', playerName: getPlayerDisplayName(player), playerId: player.id, how: 'free_agents' });
  }
  return { success: true, message: 'Released ' + getPlayerDisplayName(player) + ' ($' + fee.toLocaleString() + ' received)' };
}

function signFreeAgent(userTeam, player, salaryOffered) {
  const freeAgents = window.Nexus.FREE_AGENTS || [];
  if (!userTeam || !player || !freeAgents.includes(player)) return { success: false, message: 'Player not available' };
  if ((userTeam.players || []).length >= MAX_ROSTER_SIZE) return { success: false, message: 'Roster full (12 players max)' };
  const salary = salaryOffered != null ? salaryOffered : (player.salary || 5000);
  const newMonthly = (userTeam.finance.monthlyCost || 0) + salary;
  const runway = newMonthly > 0 ? Math.floor((userTeam.finance.capital || 0) / newMonthly) : 99;
  if (runway < 3) return { success: false, message: 'Cannot afford wages (runway < 3 months)' };
  const idx = freeAgents.indexOf(player);
  if (idx >= 0) freeAgents.splice(idx, 1);
  player.salary = salary;
  player.contractYears = 2;
  userTeam.players = userTeam.players || [];
  userTeam.players.push(player);
  userTeam.starters = userTeam.players.slice(0, 5);
  userTeam.bench = userTeam.players.slice(5, 8);
  if (userTeam.finance.monthlyCost != null) userTeam.finance.monthlyCost += salary;
  if (window.Nexus.recordTransferEvent) {
    window.Nexus.recordTransferEvent({ teamName: userTeam.name, direction: 'in', playerName: getPlayerDisplayName(player), playerId: player.id, how: 'free_agents' });
  }
  return { success: true, message: 'Signed ' + getPlayerDisplayName(player) + ' (free agent)' };
}

function aiBuyReplacement(sellerTeam, lostPlayer, season) {
  if (!sellerTeam || !season || (sellerTeam.players || []).length >= MAX_ROSTER_SIZE) return false;
  const primary = (lostPlayer.roleBias && lostPlayer.roleBias.primaryRoleBias) || '';
  const secondary = (lostPlayer.roleBias && lostPlayer.roleBias.secondaryRoleBias) || '';
  const candidates = [];
  (season.transferMarket || []).forEach(entry => {
    if (!entry.player || !entry.team || entry.team === sellerTeam) return;
    if (!(entry.team.players || []).includes(entry.player)) return;
    const price = entry.askingPrice != null ? entry.askingPrice : 0;
    const salary = entry.player.salary || 5000;
    const check = canAffordPlayer(sellerTeam, price, salary);
    if (!check.canAfford) return;
    if ((sellerTeam.players || []).length >= MAX_ROSTER_SIZE - 1) return;
    const p = entry.player;
    const roleMatch = (p.roleBias && (p.roleBias.primaryRoleBias === primary || p.roleBias.primaryRoleBias === secondary || p.roleBias.secondaryRoleBias === primary || p.roleBias.secondaryRoleBias === secondary));
    candidates.push({ source: 'market', entry, player: p, team: entry.team, price, salary, roleMatch });
  });
  (window.Nexus.FREE_AGENTS || []).forEach(p => {
    if (!p) return;
    const salary = p.salary || 5000;
    const check = canAffordPlayer(sellerTeam, 0, salary);
    if (!check.canAfford) return;
    if ((sellerTeam.players || []).length >= MAX_ROSTER_SIZE - 1) return;
    const roleMatch = (p.roleBias && (p.roleBias.primaryRoleBias === primary || p.roleBias.primaryRoleBias === secondary || p.roleBias.secondaryRoleBias === primary || p.roleBias.secondaryRoleBias === secondary));
    candidates.push({ source: 'fa', player: p, team: null, price: 0, salary, roleMatch });
  });
  if (candidates.length === 0) return false;
  candidates.sort((a, b) => (b.roleMatch ? 1 : 0) - (a.roleMatch ? 1 : 0));
  const roleMatched = candidates.filter(c => c.roleMatch);
  const pool = roleMatched.length > 0 ? roleMatched : candidates;
  const chosen = pool[randomInt(0, pool.length - 1)];
  if (chosen.source === 'market') {
    const { entry, player, team, price } = chosen;
    sellerTeam.finance.capital -= price;
    team.finance.capital += price;
    team.players = (team.players || []).filter(x => x !== player);
    team.starters = (team.players || []).slice(0, 5);
    team.bench = (team.players || []).slice(5, 8);
    sellerTeam.players = sellerTeam.players || [];
    sellerTeam.players.push(player);
    sellerTeam.starters = sellerTeam.players.slice(0, 5);
    sellerTeam.bench = sellerTeam.players.slice(5, 8);
    if (sellerTeam.finance.monthlyCost != null) sellerTeam.finance.monthlyCost += (player.salary || 5000);
    if (team.finance.monthlyCost != null) team.finance.monthlyCost -= (player.salary || 5000);
    player.transferListed = false;
    season.transferMarket = (season.transferMarket || []).filter(e => e !== entry);
    return true;
  }
  if (chosen.source === 'fa') {
    const result = signFreeAgent(sellerTeam, chosen.player, chosen.player.salary);
    return result.success;
  }
  return false;
}

function _playerSharesRoleWith(rosterPlayer, incomingPlayer) {
  const a = rosterPlayer.roleBias || {};
  const b = incomingPlayer.roleBias || {};
  const pa = a.primaryRoleBias; const sa = a.secondaryRoleBias;
  const pb = b.primaryRoleBias; const sb = b.secondaryRoleBias;
  if (!pa && !pb) return true;
  return (pa && (pa === pb || pa === sb)) || (sa && (sa === pb || sa === sb));
}

/** Pick who to sell when buying incoming: prefer primary role match, then secondary, then flex High (by rating), then flex Medium. */
function _pickPlayerToSellForIncoming(roster, incoming, getOverall) {
  const incPr = incoming.roleBias && incoming.roleBias.primaryRoleBias;
  const incSr = incoming.roleBias && incoming.roleBias.secondaryRoleBias;
  let tier = roster.filter(p => (p.roleBias && p.roleBias.primaryRoleBias) === incPr);
  if (tier.length) { tier.sort((a, b) => getOverall(a) - getOverall(b)); return tier[0]; }
  tier = roster.filter(p => _playerSharesRoleWith(p, incoming) && (p.roleBias && p.roleBias.primaryRoleBias) !== incPr);
  if (tier.length) { tier.sort((a, b) => getOverall(a) - getOverall(b)); return tier[0]; }
  tier = roster.filter(p => (p.roleBias && p.roleBias.flexPotential) === 'High');
  if (tier.length) { tier.sort((a, b) => getOverall(a) - getOverall(b)); return tier[0]; }
  tier = roster.filter(p => (p.roleBias && p.roleBias.flexPotential) === 'Medium');
  if (tier.length) { tier.sort((a, b) => getOverall(a) - getOverall(b)); return tier[0]; }
  roster = roster.slice();
  roster.sort((a, b) => getOverall(a) - getOverall(b));
  return roster[0];
}

function _canReplaceWithIncoming(roster, incoming) {
  return roster.some(p => {
    const pr = p.roleBias && p.roleBias.primaryRoleBias;
    const sr = p.roleBias && p.roleBias.secondaryRoleBias;
    const incPr = incoming.roleBias && incoming.roleBias.primaryRoleBias;
    const incSr = incoming.roleBias && incoming.roleBias.secondaryRoleBias;
    if (pr === incPr) return true;
    if (pr === incSr || sr === incPr || (sr && sr === incSr)) return true;
    const flex = p.roleBias && p.roleBias.flexPotential;
    if (flex === 'High' || flex === 'Medium') return true;
    return false;
  });
}

function _aiSellPlayer(team, player) {
  if (!team || !player || !(team.players || []).includes(player)) return;
  const players = team.players || [];
  if (players.length <= MIN_ROSTER_SIZE) return;
  const fee = Math.round((typeof calculatePlayerValue === 'function' ? calculatePlayerValue(player) : 10000) * 0.8);
  team.finance.capital += fee;
  team.players = players.filter(p => p !== player);
  team.starters = team.players.slice(0, 5);
  team.bench = team.players.slice(5, 8);
  if (team.finance.monthlyCost != null) team.finance.monthlyCost -= (player.salary || 0);
  if (Array.isArray(team.starterSlots)) { for (let i = 0; i < team.starterSlots.length; i++) if (team.starterSlots[i] === player) team.starterSlots[i] = null; }
  if (Array.isArray(team.benchSlots)) { for (let i = 0; i < team.benchSlots.length; i++) if (team.benchSlots[i] === player) team.benchSlots[i] = null; }
  if (Array.isArray(team.reserveSlots)) { for (let i = 0; i < team.reserveSlots.length; i++) if (team.reserveSlots[i] === player) team.reserveSlots[i] = null; }
  player.contractYears = null;
  (window.Nexus.FREE_AGENTS = window.Nexus.FREE_AGENTS || []).push(player);
  if (window.Nexus.recordTransferEvent) {
    window.Nexus.recordTransferEvent({ teamName: team.name, direction: 'out', playerName: getPlayerDisplayName(player), playerId: player.id, how: 'free_agents' });
  }
}

/** AI buys one player (transfer or FA) and sells one of same role so roster size and market flow stay consistent. */
function aiInteractWithMarket(buyerTeam, season) {
  if (!buyerTeam || !season) return false;
  const roster = buyerTeam.players || [];
  if (roster.length <= MIN_ROSTER_SIZE) return false;

  const candidates = [];
  (season.transferMarket || []).forEach(entry => {
    if (!entry.player || !entry.team || entry.team === buyerTeam) return;
    if (!(entry.team.players || []).includes(entry.player)) return;
    const price = entry.askingPrice != null ? entry.askingPrice : 0;
    const salary = entry.player.salary || 5000;
    if (!canAffordPlayer(buyerTeam, price, salary).canAfford) return;
    if (!_canReplaceWithIncoming(roster, entry.player)) return;
    candidates.push({ source: 'market', entry, player: entry.player, team: entry.team, price, salary });
  });
  (window.Nexus.FREE_AGENTS || []).forEach(p => {
    if (!p) return;
    const salary = p.salary || 5000;
    if (!canAffordPlayer(buyerTeam, 0, salary).canAfford) return;
    if (!_canReplaceWithIncoming(roster, p)) return;
    candidates.push({ source: 'fa', player: p, team: null, price: 0, salary });
  });
  if (candidates.length === 0) return false;

  const chosen = candidates[randomInt(0, candidates.length - 1)];
  const incoming = chosen.player;
  const getOverall = typeof getPlayerOverall === 'function' ? getPlayerOverall : function(p) { return 70; };
  const sellHim = _pickPlayerToSellForIncoming(roster, incoming, getOverall);
  if (!sellHim) return false;
  _aiSellPlayer(buyerTeam, sellHim);

  if (chosen.source === 'market') {
    const { entry, player, team, price } = chosen;
    buyerTeam.finance.capital -= price;
    team.finance.capital += price;
    team.players = (team.players || []).filter(x => x !== player);
    team.starters = (team.players || []).slice(0, 5);
    team.bench = (team.players || []).slice(5, 8);
    buyerTeam.players = buyerTeam.players || [];
    buyerTeam.players.push(player);
    buyerTeam.starters = buyerTeam.players.slice(0, 5);
    buyerTeam.bench = buyerTeam.players.slice(5, 8);
    if (buyerTeam.finance.monthlyCost != null) buyerTeam.finance.monthlyCost += (player.salary || 5000);
    if (team.finance.monthlyCost != null) team.finance.monthlyCost -= (player.salary || 5000);
    player.transferListed = false;
    season.transferMarket = (season.transferMarket || []).filter(e => e !== entry);
    return true;
  }
  if (chosen.source === 'fa') {
    const result = signFreeAgent(buyerTeam, chosen.player, chosen.player.salary);
    return result.success;
  }
  return false;
}

window.Nexus = window.Nexus || {};
window.Nexus.initializeFinance = initializeFinance;
window.Nexus.initializeContractForPlayer = initializeContractForPlayer;
window.Nexus.calculatePlayerValue = calculatePlayerValue;
window.Nexus.getPlayerOverall = getPlayerOverall;
window.Nexus.generateTransferMarket = generateTransferMarket;
window.Nexus.refreshTransferMarket = refreshTransferMarket;
window.Nexus.canAffordPlayer = canAffordPlayer;
window.Nexus.buyPlayer = buyPlayer;
window.Nexus.sellPlayer = sellPlayer;
window.Nexus.signFreeAgent = signFreeAgent;
window.Nexus.aiBuyReplacement = aiBuyReplacement;
window.Nexus.aiInteractWithMarket = aiInteractWithMarket;
window.Nexus.MAX_ROSTER_SIZE = MAX_ROSTER_SIZE;
window.Nexus.MIN_ROSTER_SIZE = MIN_ROSTER_SIZE;

function generateJobOffers(userTeam, seasonOutcome, cycleCount, allTeams, season) {
  const offers = [];
  const otherTeams = (allTeams || []).filter(t => t && t.name !== userTeam.name);
  const userSalary = userTeam.finance && userTeam.finance.monthlyCost != null ? userTeam.finance.monthlyCost : 100000;

  if (seasonOutcome === 'bankrupt') {
    const promotedNames = (season && (season.challengerPromotion || []).map(t => t.name)) || [];
    const challengerExcludingPromoted = otherTeams.filter(t => t.tier === 'Challenger' && promotedNames.indexOf(t.name) === -1);
    const mainPool = otherTeams.filter(t => t.tier === 'Main');
    const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);
    const fromChallenger = shuffle(challengerExcludingPromoted).slice(0, 2);
    const fromMain = shuffle(mainPool).slice(0, 1);
    fromChallenger.forEach(t => offers.push({ team: t, salary: Math.round(userSalary * 0.85), reason: 'Rebuilding opportunity' }));
    fromMain.forEach(t => offers.push({ team: t, salary: Math.round(userSalary * 0.9), reason: 'Stability after bankruptcy' }));
    while (offers.length < 1) {
      const fallback = otherTeams.filter(t => !offers.some(o => o.team === t));
      if (fallback.length === 0) break;
      const pick = fallback[Math.floor(Math.random() * fallback.length)];
      offers.push({ team: pick, salary: Math.round(userSalary * 0.85), reason: 'New opportunity' });
    }
    return offers.slice(0, 3);
  }

  if (!cycleCount || cycleCount === 1) return [];
  if (seasonOutcome === 'champion') {
    const topTeams = otherTeams
      .filter(t => t.tier === 'Main' && (t.prestige || 50) >= 70)
      .sort((a, b) => (b.prestige || 0) - (a.prestige || 0))
      .slice(0, 3);
    for (let i = 0; i < Math.min(2, topTeams.length); i++) {
      if (chance(0.6)) {
        offers.push({
          team: topTeams[i],
          salary: Math.round(userSalary * 1.3),
          reason: 'Impressed by championship win'
        });
      }
    }
  } else if (seasonOutcome === 'playoffs') {
    const similarTeams = otherTeams
      .filter(t => t.tier === (userTeam.tier || 'Main') && Math.abs((t.prestige || 50) - (userTeam.prestige || 50)) < 15)
      .sort(() => Math.random() - 0.5);
    if (similarTeams.length > 0 && chance(0.4)) {
      offers.push({
        team: similarTeams[0],
        salary: Math.round(userSalary * 1.15),
        reason: 'Looking for experienced manager'
      });
    }
  } else if (seasonOutcome === 'mid') {
    const rebuilding = otherTeams
      .filter(t => t.tier === 'Main')
      .sort(() => Math.random() - 0.5);
    if (rebuilding.length > 0 && chance(0.35)) {
      offers.push({
        team: rebuilding[0],
        salary: Math.round(userSalary * 1.05),
        reason: 'Rebuilding project'
      });
    }
  } else if (seasonOutcome === 'relegated') {
    const challengerTeams = otherTeams
      .filter(t => t.tier === 'Challenger')
      .sort(() => Math.random() - 0.5);
    if (challengerTeams.length > 0) {
      offers.push({
        team: challengerTeams[0],
        salary: Math.round(userSalary * 0.9),
        reason: 'Rebuilding project'
      });
    }
    if (challengerTeams.length > 1 && chance(0.5)) {
      offers.push({
        team: challengerTeams[1],
        salary: Math.round(userSalary * 0.85),
        reason: 'Staying in the scene'
      });
    }
  }

  return offers.slice(0, 3);
}

function acceptJobOffer(offer, league, challengerLeague) {
  const allTeams = [...(league || []), ...(challengerLeague || [])];
  const userCurrentTeam = league && league[0];
  const newTeam = offer && offer.team;
  if (!userCurrentTeam || !newTeam) return { league, challengerLeague };
  const userIdx = allTeams.indexOf(userCurrentTeam);
  const newIdx = allTeams.indexOf(newTeam);
  if (userIdx === -1 || newIdx === -1) return { league, challengerLeague };
  [allTeams[userIdx], allTeams[newIdx]] = [allTeams[newIdx], allTeams[userIdx]];
  const mainTeams = allTeams.filter(t => t.tier === 'Main');
  const challTeams = allTeams.filter(t => t.tier === 'Challenger');
  const newUserIdx = mainTeams.indexOf(newTeam);
  if (newUserIdx >= 0) {
    [mainTeams[0], mainTeams[newUserIdx]] = [mainTeams[newUserIdx], mainTeams[0]];
    return { league: mainTeams, challengerLeague: challTeams };
  }
  const challIdx = challTeams.indexOf(newTeam);
  if (challIdx >= 0) {
    [challTeams[0], challTeams[challIdx]] = [challTeams[challIdx], challTeams[0]];
    return { league: mainTeams, challengerLeague: challTeams };
  }
  return { league: mainTeams, challengerLeague: challTeams };
}

function decrementContracts(teams) {
  (teams || []).forEach(team => {
    const toRemove = [];
    (team.players || []).forEach(p => {
      p.contractYears = (p.contractYears != null ? p.contractYears : 1) - 1;
      if (p.contractYears <= 0) {
        toRemove.push(p);
        p.contractYears = null;
        (window.Nexus.FREE_AGENTS = window.Nexus.FREE_AGENTS || []).push(p);
        if (typeof console !== 'undefined' && console.log) console.log(getPlayerDisplayName(p) + ' contract expired, now free agent');
      }
    });
    team.players = (team.players || []).filter(p => !toRemove.includes(p));
    team.starters = team.players.slice(0, 5);
    team.bench = team.players.slice(5, 8);
    toRemove.forEach(p => {
      if (team.finance && team.finance.monthlyCost != null) team.finance.monthlyCost -= (p.salary || 0);
    });
    while ((team.players || []).length < MIN_ROSTER_SIZE) {
      const roleNeeded = (toRemove.length > 0 && toRemove[0] && toRemove[0].roleBias && toRemove[0].roleBias.primaryRoleBias)
        ? toRemove.shift().roleBias.primaryRoleBias
        : 'Duelist';
      const seventeenYos = (team.youthAcademy || []).filter(p => p.age === 17);
      const matching = seventeenYos.filter(p => {
        const rb = p.roleBias || {};
        return rb.primaryRoleBias === roleNeeded || rb.secondaryRoleBias === roleNeeded;
      });
      if (matching.length > 0 && chance(0.8)) {
        const chosen = matching[randomInt(0, matching.length - 1)];
        const result = promoteYouthToRoster(team, chosen);
        if (result.success) continue;
      }
      const youth = createPlayer(roleNeeded, randomInt(17, 20));
      if (!youth.roleBias) youth.roleBias = { primaryRoleBias: roleNeeded, secondaryRoleBias: roleNeeded, flexPotential: 'Low' };
      youth.roleBias.primaryRoleBias = roleNeeded;
      team.players.push(youth);
      team.starters = team.players.slice(0, 5);
      team.bench = team.players.slice(5, 8);
      if (team.finance.monthlyCost != null) team.finance.monthlyCost += (youth.salary || 3000);
    }
    // Clear slot arrays so expired players (no longer in team.players) don't get synced back
    const inRoster = new Set(team.players || []);
    if (Array.isArray(team.starterSlots)) {
      for (let i = 0; i < team.starterSlots.length; i++) {
        if (team.starterSlots[i] && !inRoster.has(team.starterSlots[i])) team.starterSlots[i] = null;
      }
    }
    if (Array.isArray(team.benchSlots)) {
      for (let i = 0; i < team.benchSlots.length; i++) {
        if (team.benchSlots[i] && !inRoster.has(team.benchSlots[i])) team.benchSlots[i] = null;
      }
    }
    if (Array.isArray(team.reserveSlots)) {
      for (let i = 0; i < team.reserveSlots.length; i++) {
        if (team.reserveSlots[i] && !inRoster.has(team.reserveSlots[i])) team.reserveSlots[i] = null;
      }
    }
    // Put any players in team.players that aren't in a slot yet (e.g. new youth) into null slot positions
    const inSlots = new Set([
      ...(team.starterSlots || []).filter(Boolean),
      ...(team.benchSlots || []).filter(Boolean),
      ...(team.reserveSlots || []).filter(Boolean)
    ]);
    const orphans = (team.players || []).filter(p => !inSlots.has(p));
    if (orphans.length > 0 && Array.isArray(team.reserveSlots)) {
      let oi = 0;
      const fillSlot = (arr) => {
        for (let i = 0; i < arr.length && oi < orphans.length; i++) {
          if (!arr[i]) { arr[i] = orphans[oi++]; inSlots.add(arr[i]); }
        }
      };
      fillSlot(team.reserveSlots);
      if (Array.isArray(team.benchSlots)) fillSlot(team.benchSlots);
      if (Array.isArray(team.starterSlots)) fillSlot(team.starterSlots);
    }
  });
}

function offerContractRenewal(player, yearsOffered, salaryOffered) {
  const current = player.salary || 5000;
  let chanceVal = 0.6;
  if (salaryOffered >= current * 1.1) chanceVal += 0.2;
  else if (salaryOffered < current) chanceVal -= 0.3;
  const age = player.age != null ? player.age : 22;
  if (age >= 27) chanceVal += 0.15;
  if (age < 22) chanceVal += 0.1;
  const accepted = Math.random() < Math.max(0, Math.min(1, chanceVal));
  if (accepted) {
    player.contractYears = yearsOffered;
    player.salary = salaryOffered;
    return { accepted: true };
  }
  return { accepted: false, reason: 'wants higher salary' };
}

window.Nexus.generateJobOffers = generateJobOffers;
window.Nexus.acceptJobOffer = acceptJobOffer;
window.Nexus.decrementContracts = decrementContracts;
window.Nexus.offerContractRenewal = offerContractRenewal;
window.Nexus.applyMonthlyCosts = applyMonthlyCosts;
window.Nexus.applySeasonalCost = applySeasonalCost;
window.Nexus.applyMatchRevenue = applyMatchRevenue;
window.Nexus.applyPlacementBonus = applyPlacementBonus;
window.Nexus.applyPrestigeChanges = applyPrestigeChanges;
window.Nexus.checkBankruptcy = checkBankruptcy;
window.Nexus.MAX_YOUTH_ACADEMY = MAX_YOUTH_ACADEMY;
window.Nexus.createYouthProspect = createYouthProspect;
window.Nexus.generateYouthMarket = generateYouthMarket;
window.Nexus.ensureYouthProspectRoleBias = ensureYouthProspectRoleBias;
window.Nexus.promoteYouthToRoster = promoteYouthToRoster;
window.Nexus.signYouthToAcademy = signYouthToAcademy;
window.Nexus.prospectToFullPlayer = prospectToFullPlayer;

// ============================================================
// PROJECT NEXUS – ECONOMY TIMELINE REFACTOR PATCH
// Timeline model, monthly tick hook, bankruptcy guard,
// sponsor at split end, dashboard hook, tier finance refresh.
// ============================================================

function attachTimeline(season) {
  season.timeline = {
    totalMonths: 3,
    currentMonth: 1,
    monthMatchdays: [4, 8, 11],
    monthTriggered: []
  };
}

const _originalCreateSeasonWithSplit = window.Nexus.createSeasonWithSplit;
window.Nexus.createSeasonWithSplit = function(teams) {
  const season = _originalCreateSeasonWithSplit(teams);
  attachTimeline(season);
  if (season.metaHistory && window.Nexus.getCurrentMeta) {
    const initial = window.Nexus.getCurrentMeta();
    if (initial && initial.id) season.metaHistory.push({ atMatchday: 0, metaId: initial.id, metaName: initial.name || initial.id });
  }
  const userTeam = (window.Nexus.getUserTeam && window.Nexus.getUserTeam()) || (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
  season.teams.forEach(team => {
    const effectiveCost = window.Nexus.applySeasonalCost ? window.Nexus.applySeasonalCost(team) : 0;
    if (team.finance) team.finance.revenueThisSeason = 0;
    if (userTeam && team.name === userTeam.name && effectiveCost > 0 && window.Nexus.onFinanceExpense) {
      window.Nexus.onFinanceExpense('Facility maintenance: -$' + effectiveCost.toLocaleString(), 5000);
    }
  });
  return season;
};

function processMonthlyTick(season) {
  const timeline = season.timeline;
  if (!timeline) return;
  const md = season.currentMatchday;
  if (timeline.monthMatchdays.includes(md) && !timeline.monthTriggered.includes(md)) {
    timeline.monthTriggered.push(md);
    const userTeam = (window.Nexus.getUserTeam && window.Nexus.getUserTeam()) || (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
    season.teams.forEach(team => {
      window.Nexus.applyMonthlyCosts(team);
      if (userTeam && team.name === userTeam.name && team.finance && window.Nexus.onFinanceExpense) {
        var coach = window.Nexus.getCoachTier && window.Nexus.getCoachTier(team);
        var amount = (team.finance.monthlyCost || 0) + (coach && coach.monthlySalary || 0);
        if (amount > 0) window.Nexus.onFinanceExpense('Monthly costs: -$' + amount.toLocaleString(), 5000);
      }
    });
    timeline.currentMonth++;
  }
}

function isAnyTeamBankrupt(season) {
  return season.teams.some(team => window.Nexus.checkBankruptcy(team));
}

const _originalPlayNextStage = window.Nexus.playNextStage;
window.Nexus.playNextStage = function(season, environmentMap, meta) {
  const result = _originalPlayNextStage(season, environmentMap, meta);
  if (result && result.finished && season.phase === 'finished' && isAnyTeamBankrupt(season)) {
    result.bankrupt = true;
    season.bankrupt = true;
  }
  if (season.phase === 'regular' && result.matchdayResults && !result.finished) {
    const mainMdJustPlayed = season.currentMatchday - 1;
    if ([0, 2, 4, 6, 10].indexOf(mainMdJustPlayed) !== -1) {
      const chSeason = window.Nexus.CHALLENGER_SEASON;
      if (chSeason && chSeason.currentMatchday < (chSeason.matchdays || []).length && window.Nexus.playNextMatchday) {
        window.Nexus.playNextMatchday(chSeason, environmentMap, meta);
      }
    }
    processMonthlyTick(season);
    // Every 5 matchdays, 50% chance one AI team interacts with market (transfer list or free agents); not the same team as last time
    if (mainMdJustPlayed > 0 && mainMdJustPlayed % 5 === 0 && chance(0.5)) {
      const league = window.Nexus.LEAGUE || [];
      const challengerLeague = window.Nexus.CHALLENGER_LEAGUE || [];
      const allTeams = [...league, ...(challengerLeague || [])];
      const userTeam = league.length > 0 ? league[0] : null;
      const lastBuyerName = season.lastAiMarketBuyerTeamName || '';
      const aiPool = allTeams.filter(function(t) { return t && t !== userTeam && t.name !== lastBuyerName; });
      if (aiPool.length > 0) {
        const picked = aiPool[randomInt(0, aiPool.length - 1)];
        if (window.Nexus.aiInteractWithMarket && window.Nexus.aiInteractWithMarket(picked, season)) {
          season.lastAiMarketBuyerTeamName = picked.name;
        }
      }
    }
  } else if (season.phase === 'regular') {
    processMonthlyTick(season);
  }
  if (season.phase === 'regular' && season.currentMatchday === 2 && !season.aiYouthSignDone) {
    season.aiYouthSignDone = true;
    const Nexus = window.Nexus;
    const league = Nexus.LEAGUE || [];
    const challengerLeague = Nexus.CHALLENGER_LEAGUE || [];
    const allTeams = [...league, ...challengerLeague];
    const userTeam = league.length > 0 ? league[0] : null;
    allTeams.forEach(team => {
      if (team === userTeam) return;
      const academy = team.youthAcademy || [];
      var maxYouth = (Nexus.getMaxYouthAcademySlots && Nexus.getMaxYouthAcademySlots(team)) || 4;
      if (academy.length >= maxYouth) return;
      const players = team.players || [];
      const avgAge = players.length ? players.reduce((s, p) => s + (p.age != null ? p.age : 20), 0) / players.length : 0;
      if (avgAge <= 24 || !chance(0.5)) return;
      const market = Nexus.YOUTH_MARKET || [];
      const shuffled = market.slice().sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffled.length; i++) {
        const prospect = shuffled[i];
        const salary = prospect.salary || 4000;
        const newMonthly = (team.finance && team.finance.monthlyCost || 0) + salary;
        const runway = newMonthly > 0 && team.finance ? Math.floor((team.finance.capital || 0) / newMonthly) : 99;
        if (runway >= 3 && Nexus.signYouthToAcademy) {
          const res = Nexus.signYouthToAcademy(team, prospect);
          if (res.success) break;
        }
      }
    });
  }
  if (season.phase === 'regular' && result.matchdayResults && !result.finished) {
    const league = window.Nexus.LEAGUE || [];
    const userTeam = league.length > 0 ? league[0] : null;
    const mainMdJustPlayed = season.currentMatchday - 1;
    const currentMeta = meta || (window.Nexus.getCurrentMeta ? window.Nexus.getCurrentMeta() : null);
    if (userTeam && window.Nexus.trainPlayer) {
      const env = environmentMap && userTeam.name ? (environmentMap[userTeam.name] || {}) : {};
      (userTeam.players || []).forEach(player => {
        if (player.assignedTrainingPlan && window.Nexus.TRAINING_PLANS && window.Nexus.TRAINING_PLANS[player.assignedTrainingPlan]) {
          window.Nexus.trainPlayer({ player, trainingPlan: player.assignedTrainingPlan, environment: env, meta: currentMeta });
        }
      });
    }
    if (userTeam && (userTeam.youthAcademy || []).length > 0 && window.Nexus.trainYouthProspect && typeof ROLES !== 'undefined') {
      const env = environmentMap && userTeam.name ? (environmentMap[userTeam.name] || {}) : {};
      const seasonForMd = { currentMatchday: mainMdJustPlayed };
      (userTeam.youthAcademy || []).forEach(prospect => {
        if (prospect.lastTrainingMatchday === mainMdJustPlayed) return;
        const primaryRole = (prospect.roleBias && prospect.roleBias.primaryRoleBias) || 'Duelist';
        const roleDef = ROLES[primaryRole];
        const coreStats = (roleDef && roleDef.core) ? roleDef.core.slice(0, 3) : ['aim', 'reaction', 'decisionSpeed'];
        coreStats.forEach(statKey => {
          if (prospect.stats && prospect.stats[statKey] && prospect.stats[statKey].current < prospect.stats[statKey].maxCap) {
            window.Nexus.trainYouthProspect({ team: userTeam, prospect, statKey, environment: env, season: seasonForMd });
          }
        });
      });
    }
    const AI_TRAINING_GROWTH_MULTIPLIER = 0.75;
    (season.teams || []).forEach(team => {
      if (!team || team === userTeam || (userTeam && team.name === userTeam.name)) return;
      const aiEnv = (environmentMap && team.name && environmentMap[team.name]) ? environmentMap[team.name] : { coachQuality: 50 };
      if (aiEnv.coachQuality == null) aiEnv.coachQuality = 50;
      (team.players || []).forEach(player => {
        if (!player.stats) return;
        const plan = (player.assignedTrainingPlan && window.Nexus.TRAINING_PLANS && window.Nexus.TRAINING_PLANS[player.assignedTrainingPlan])
          ? player.assignedTrainingPlan
          : (typeof pickAITrainingPlan === 'function' ? pickAITrainingPlan(player) : PLAYER_TRAINING_PLAN_KEYS[Math.floor(Math.random() * PLAYER_TRAINING_PLAN_KEYS.length)]);
        if (window.Nexus.trainPlayer) {
          window.Nexus.trainPlayer({ player, trainingPlan: plan, environment: aiEnv, meta: currentMeta, growthMultiplier: AI_TRAINING_GROWTH_MULTIPLIER });
        }
      });
    });
  }
  if (result.finished && season.phase === 'finished') {
    if (window.Nexus.applyPlacementBonus) window.Nexus.applyPlacementBonus(season);
    if (window.Nexus.applyPrestigeChanges) window.Nexus.applyPrestigeChanges(season, environmentMap);
    var userTeamSponsor = (window.Nexus.getUserTeam && window.Nexus.getUserTeam()) || (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
    (season.teams || []).forEach(function(t) {
      if (window.Nexus.applySponsorSeasonEnd) {
        var sponsorResult = window.Nexus.applySponsorSeasonEnd(t, season.standings);
        if (userTeamSponsor && t.name === userTeamSponsor.name) {
          if (sponsorResult.success && sponsorResult.message) {
            window.Nexus.showNotification(sponsorResult.message, 'success', 8000);
          } else if (sponsorResult.penalty > 0 && sponsorResult.message) {
            window.Nexus.showNotification(sponsorResult.message, 'error', 10000);
            if (window.Nexus.onFinanceExpense) window.Nexus.onFinanceExpense('Sponsor penalty: -$' + sponsorResult.penalty.toLocaleString(), 8000);
          }
        }
      }
    });
    const CAPITAL_SOFT_CAP = 1600000;
    const CAPITAL_TAX_RATE = 0.12;
    const userTeam = (window.Nexus.getUserTeam && window.Nexus.getUserTeam()) || (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
    season.teams.forEach(team => {
      if (!team.finance || team.finance.capital <= CAPITAL_SOFT_CAP) return;
      const excess = team.finance.capital - CAPITAL_SOFT_CAP;
      const tax = Math.floor(excess * CAPITAL_TAX_RATE);
      team.finance.capital -= tax;
      if (userTeam && team.name === userTeam.name && tax > 0 && window.Nexus.onFinanceExpense) {
        window.Nexus.onFinanceExpense('Excess capital adjustment: -$' + tax.toLocaleString(), 5000);
      }
    });
  }
  return result;
};

window.Nexus.getTimelineInfo = function(season) {
  if (!season || !season.timeline) return null;
  return {
    currentMonth: season.timeline.currentMonth,
    totalMonths: season.timeline.totalMonths
  };
};

function reinitializeFinanceForTier(team) {
  window.Nexus.initializeFinance(team);
}

const _originalResolveRelegationTournament = window.Nexus.resolveRelegationTournament;
window.Nexus.resolveRelegationTournament = function(args) {
  const results = _originalResolveRelegationTournament(args);
  const { mainTeams, challengerTeams } = args;
  [...mainTeams, ...challengerTeams].forEach(team => reinitializeFinanceForTier(team));
  return results;
};

// -------------------------------------------------
// Project Nexus – Save/Load (localStorage)
// -------------------------------------------------

const NEXUS_SAVE_KEY = 'nexusSave';

function buildSeasonSnapshot(season) {
  if (!season) return null;
  const snap = {
    phase: season.phase,
    currentMatchday: season.currentMatchday,
    standings: season.standings,
    matchdays: (season.matchdays || []).map(day =>
      day.map(m => ({ teamA: m.teamA.name, teamB: m.teamB.name, map: m.map }))
    ),
    playedMatchResults: (season.playedMatchResults || []).map(day =>
      (day || []).map(r => ({
        teamA: r.match.teamA.name,
        teamB: r.match.teamB.name,
        map: r.match.map,
        winner: r.result.winner,
        scoreA: r.result.scoreA,
        scoreB: r.result.scoreB
      }))
    ),
    relegationResults: season.relegationResults || null,
    champion: season.champion ? season.champion.name : null,
    timeline: season.timeline || null,
    matchdaysUntilMetaShift: season.matchdaysUntilMetaShift,
    metaHistory: season.metaHistory || [],
    activeMapPool: season.activeMapPool || null,
    lastAiMarketBuyerTeamName: season.lastAiMarketBuyerTeamName || null
  };
  if (season.playoffsBracket) {
    snap.playoffsBracket = {
      round: season.playoffsBracket.round,
      matches: season.playoffsBracket.matches.map(m => ({ teamA: m.teamA.name, teamB: m.teamB.name })),
      finalists: (season.playoffsBracket.finalists || []).map(t => t.name)
    };
  } else snap.playoffsBracket = null;
  snap.relegationCandidates = (season.relegationCandidates || []).map(t => t.name);
  snap.challengerPromotion = (season.challengerPromotion || []).map(t => t.name);
  return snap;
}

function restoreSeasonFromSnapshot(snap, mainTeams, challengerLeague) {
  if (!snap || !mainTeams) return null;
  const allTeams = [...mainTeams, ...(challengerLeague || [])];
  const findTeam = name => allTeams.find(t => t.name === name);

  const matchdays = (snap.matchdays || []).map(day =>
    day.map(m => ({
      teamA: findTeam(m.teamA),
      teamB: findTeam(m.teamB),
      map: m.map
    })).filter(m => m.teamA && m.teamB)
  );

  const playedMatchResults = (snap.playedMatchResults || []).map(day =>
    (day || []).map(r => {
      const teamA = findTeam(r.teamA);
      const teamB = findTeam(r.teamB);
      return {
        match: { teamA, teamB, map: r.map },
        result: { winner: r.winner, scoreA: r.scoreA, scoreB: r.scoreB }
      };
    })
  );

  let playoffsBracket = null;
  if (snap.playoffsBracket && snap.playoffsBracket.matches) {
    playoffsBracket = {
      round: snap.playoffsBracket.round,
      matches: snap.playoffsBracket.matches.map(m => ({
        teamA: findTeam(m.teamA),
        teamB: findTeam(m.teamB)
      })).filter(m => m.teamA && m.teamB),
      finalists: (snap.playoffsBracket.finalists || []).map(name => findTeam(name)).filter(Boolean)
    };
  }

  const activeMapPool = snap.activeMapPool && snap.activeMapPool.length ? snap.activeMapPool : getActiveMapPool();
  const season = {
    teams: mainTeams,
    standings: snap.standings || {},
    matchdays,
    currentMatchday: snap.currentMatchday || 0,
    playedMatchResults,
    phase: snap.phase || 'regular',
    playoffsBracket,
    relegationCandidates: (snap.relegationCandidates || []).map(name => findTeam(name)).filter(Boolean),
    challengerPromotion: (snap.challengerPromotion || []).map(name => findTeam(name)).filter(Boolean),
    relegationResults: snap.relegationResults || null,
    champion: snap.champion ? findTeam(snap.champion) : null,
    timeline: snap.timeline || null,
    matchdaysUntilMetaShift: snap.matchdaysUntilMetaShift != null ? snap.matchdaysUntilMetaShift : 4,
    metaHistory: Array.isArray(snap.metaHistory) ? snap.metaHistory : [],
    activeMapPool,
    lastAiMarketBuyerTeamName: snap.lastAiMarketBuyerTeamName || null
  };
  return season;
}

function restoreChallengerSeasonFromSnapshot(snap, challengerTeams) {
  if (!snap || !challengerTeams || challengerTeams.length === 0) return null;
  const findTeam = name => challengerTeams.find(t => t.name === name);
  const matchdays = (snap.matchdays || []).map(day =>
    day.map(m => ({
      teamA: findTeam(m.teamA),
      teamB: findTeam(m.teamB),
      map: m.map
    })).filter(m => m.teamA && m.teamB)
  );
  const playedMatchResults = (snap.playedMatchResults || []).map(day =>
    (day || []).map(r => {
      const teamA = findTeam(r.teamA);
      const teamB = findTeam(r.teamB);
      return {
        match: { teamA, teamB, map: r.map },
        result: { winner: r.winner, scoreA: r.scoreA, scoreB: r.scoreB }
      };
    })
  );
  return {
    teams: challengerTeams,
    standings: snap.standings || {},
    matchdays,
    currentMatchday: snap.currentMatchday || 0,
    playedMatchResults,
    phase: 'regular'
  };
}

// -------------------------------------------------
// Project Nexus – UI Wiring Layer
// Connects existing HTML buttons to Nexus core logic
// Does NOT modify engine logic.
// Pure bridge layer.
// -------------------------------------------------

function initUI() {
  if (!document.getElementById('app') || !document.querySelector('.menu__item')) return;

  // ===== ROUTING SYSTEM (SPA) =====
  const routeButtons = document.querySelectorAll('.menu__item');
  const pages = document.querySelectorAll('.page');

  const pageTitles = {
    overview: 'Overview',
    roster: 'Roster',
    development: 'Development',
    market: 'Market',
    youth: 'Youth Academy',
    season: 'Season',
    career: 'Career',
    operations: 'Operations'
  };

  const pageSubtitles = {
    overview: 'Organizational status & competitive outlook',
    roster: 'Starting lineup & bench',
    development: 'Training programs & growth',
    market: 'Scouting & transfers',
    youth: 'Academy slots & youth market',
    season: 'League standings & schedule',
    career: 'Season summary & playoff outcome',
    operations: 'Organization management'
  };

  routeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;

      routeButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      pages.forEach(p => {
        p.classList.toggle('is-active', p.dataset.page === route);
      });

      const titleEl = document.getElementById('uiPageTitle');
      const subEl = document.getElementById('uiPageSubtitle');
      if (titleEl) titleEl.textContent = pageTitles[route] || btn.textContent;
      if (subEl) subEl.textContent = pageSubtitles[route] || '';

      if (route === 'career') updateCareerUI(season);
      if (route === 'roster') {
        updateRosterUI();
        const team = userTeamRef();
        const finalYear = (team && team.players) ? team.players.filter(p => (p.contractYears != null ? p.contractYears : 1) === 1) : [];
        if (finalYear.length > 0 && document.getElementById('nexus-contract-toast') == null) {
          const content = document.getElementById('app') || document.body;
          const toast = document.createElement('div');
          toast.id = 'nexus-contract-toast';
          toast.className = 'toast toast--contract';
          toast.textContent = finalYear.length + ' player(s) in final year of contract — consider renewals.';
          content.insertBefore(toast, content.firstChild);
          setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3500);
        }
      }
      if (route === 'market') renderTransferMarket(season, userTeamRef());
      if (route === 'youth' && typeof updateYouthAcademyUI === 'function') updateYouthAcademyUI(userTeamRef());
      if (route === 'development' && typeof updateDevelopmentUI === 'function') updateDevelopmentUI();
      if (route === 'operations' && typeof updateOperationsUI === 'function') updateOperationsUI();
    });
  });

  const marketRole = document.getElementById('marketFilterRole');
  const marketAge = document.getElementById('marketFilterAge');
  const marketPrice = document.getElementById('marketFilterPrice');
  [marketRole, marketAge, marketPrice].forEach(el => {
    if (el) el.addEventListener('change', () => { if (season) renderTransferMarket(season, userTeamRef()); });
  });

  // ===== GAME STATE (shared across UI) — load or init fresh =====
  let league, challengerLeague, season, challengerSeason = null, seasonHistory = [], cycleCount = 1, environmentMap, meta;
  let transferHistory = [];
  let pendingSeasonEnd = null;
  let pendingAfterMatchResult = null;
  let currentJobOffers = [];
  let openMarketPlayerModalRef = null;
  let openOtherTeamRosterModalRef = null;
  let pendingBankruptcy = false;
  let isBankruptcyJobOffers = false;
  let pendingBankruptcyOnLoad = false;
  const userTeamRef = () => league && league[0];

  window.Nexus.recordTransferEvent = function(ev) {
    if (ev && ev.teamName) {
      transferHistory.push(ev);
      if (transferHistory.length > 80) transferHistory = transferHistory.slice(-80);
    }
  };

  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(NEXUS_SAVE_KEY) : null;
  if (saved) {
    try {
      const loaded = JSON.parse(saved);
      league = loaded.mainTeams || null;
      challengerLeague = loaded.challengerTeams || [];
      if (!league || !Array.isArray(league) || league.length === 0) throw new Error('No main teams');
      window.Nexus.LEAGUE = league;
      window.Nexus.CHALLENGER_LEAGUE = challengerLeague;
      seasonHistory = loaded.seasonHistory || [];
      cycleCount = loaded.cycleCount || 1;
      environmentMap = loaded.environmentMap || {};
      transferHistory = Array.isArray(loaded.transferHistory) ? loaded.transferHistory : [];
      if (loaded.pendingBankruptcy === true) pendingBankruptcyOnLoad = true;
      if (loaded.metaId && Nexus.setCurrentMetaPatch) Nexus.setCurrentMetaPatch(loaded.metaId);
      meta = Nexus.getCurrentMeta ? Nexus.getCurrentMeta() : Nexus.createMeta({ favoredRoles: ['Duelist'], tempo: 65 });
      season = restoreSeasonFromSnapshot(loaded.seasonSnapshot, league, challengerLeague);
      if (!season) throw new Error('Restore season failed');
      challengerSeason = restoreChallengerSeasonFromSnapshot(loaded.challengerSeasonSnapshot, challengerLeague);
      if (!challengerSeason && challengerLeague && challengerLeague.length && Nexus.createChallengerSeasonFromTeams)
        challengerSeason = Nexus.createChallengerSeasonFromTeams(challengerLeague);
      if (challengerSeason) window.Nexus.CHALLENGER_SEASON = challengerSeason;
      window.Nexus.YOUTH_MARKET = (loaded.youthMarket && loaded.youthMarket.length) ? loaded.youthMarket : (Nexus.generateYouthMarket ? Nexus.generateYouthMarket() : []);
      (window.Nexus.YOUTH_MARKET || []).forEach(function(p) {
        if (Nexus.ensureYouthProspectRoleBias) Nexus.ensureYouthProspectRoleBias(p);
      });
      [league, challengerLeague].forEach(teams => {
        (teams || []).forEach(team => {
          team.youthAcademy = team.youthAcademy || [];
          (team.youthAcademy || []).forEach(function(p) {
            if (Nexus.ensureYouthProspectRoleBias) Nexus.ensureYouthProspectRoleBias(p);
          });
        });
      });
      [league, challengerLeague].forEach(teams => {
        (teams || []).forEach(team => {
          if (Nexus.syncTeamEnvironmentFromTiers) Nexus.syncTeamEnvironmentFromTiers(team, environmentMap);
        });
      });
      [league, challengerLeague].forEach(teams => {
        (teams || []).forEach(team => {
          if (Nexus.syncPressureToPrestige) Nexus.syncPressureToPrestige(team, environmentMap);
        });
      });
      registerUsedPlayerNamesFromTeams(league);
      registerUsedPlayerNamesFromTeams(challengerLeague);
      [league, challengerLeague].forEach(teams => {
        (teams || []).forEach(team => {
          (team.players || []).forEach(p => {
            if (p.age == null) p.age = 20;
            if (Nexus.initializeContractForPlayer) Nexus.initializeContractForPlayer(p);
          });
        });
      });
      var teamKeys = Nexus.TEAM_TRAINING_PLAN_KEYS || [];
      var userTeamForTraining = league && league[0];
      if (teamKeys.length) {
        [league, challengerLeague].forEach(teams => {
          (teams || []).forEach(team => {
            if (!team.activeTeamTraining || !teamKeys.includes(team.activeTeamTraining)) {
              team.activeTeamTraining = team === userTeamForTraining ? teamKeys[0] : teamKeys[Math.floor(Math.random() * teamKeys.length)];
            }
          });
        });
      }
      var userTeam = league && league[0];
      if (userTeam && userTeam.players) {
        var ps = userTeam.players;
        userTeam.starterSlots = [];
        for (var i = 0; i < 5; i++) userTeam.starterSlots.push(ps[i] || null);
        userTeam.benchSlots = [];
        for (var j = 0; j < 5; j++) userTeam.benchSlots.push(ps[5 + j] || null);
        userTeam.reserveSlots = [];
        for (var k = 0; k < 6; k++) userTeam.reserveSlots.push(ps[10 + k] || null);
      }
      if (season && season.transferMarket == null) season.transferMarket = [];
      if (season && season.transferMarketRefreshCountdown == null) season.transferMarketRefreshCountdown = 3;
      if (season && Nexus.refreshTransferMarket && league && league[0] && (season.transferMarket.length === 0 || !season.transferMarket))
        Nexus.refreshTransferMarket(season, [...league, ...(challengerLeague || [])], league[0].name);
      if (season.phase === 'finished') {
        var userTeamForEnd = league && league[0];
        if (userTeamForEnd && !(season.bankrupt && Nexus.checkBankruptcy && Nexus.checkBankruptcy(userTeamForEnd))) {
          var useChallengerForPositionLoad = userTeamForEnd.tier === 'Challenger' && challengerSeason && challengerSeason.standings;
          var standingsForPositionLoad = useChallengerForPositionLoad ? challengerSeason.standings : season.standings;
          var sortedLoad = Nexus.getSortedStandings(standingsForPositionLoad);
          var posIndexLoad = sortedLoad.findIndex(function(t) { return t.teamName === userTeamForEnd.name; });
          var positionLoad = posIndexLoad === -1 ? null : posIndexLoad + 1;
          var recLoad = standingsForPositionLoad[userTeamForEnd.name] ? { w: standingsForPositionLoad[userTeamForEnd.name].wins, l: standingsForPositionLoad[userTeamForEnd.name].losses } : { w: 0, l: 0 };
          var outcomeLoad = '—';
          var champNameLoad = season.champion != null ? (typeof season.champion === 'object' ? season.champion.name : season.champion) : null;
          if (champNameLoad === userTeamForEnd.name) outcomeLoad = 'Championship: Winner';
          else if (season.relegationCandidates && season.relegationCandidates.some(function(t) { return t.name === userTeamForEnd.name; })) {
            var relLoad = (season.relegationResults || []).find(function(r) { return r.mainTeam === userTeamForEnd.name; });
            outcomeLoad = relLoad ? (relLoad.winner === userTeamForEnd.name ? 'Relegation: Stayed in Main' : 'Relegation: Relegated to Challenger') : 'Relegation: Stayed in Main';
          } else if (season.challengerPromotion && season.challengerPromotion.some(function(t) { return t.name === userTeamForEnd.name; })) {
            var relLoad2 = (season.relegationResults || []).find(function(r) { return r.challengerTeam === userTeamForEnd.name; });
            outcomeLoad = relLoad2 ? (relLoad2.winner === userTeamForEnd.name ? 'Challenger Championship: Promoted to Main' : 'Challenger Championship: Stayed in Challenger') : 'Challenger Championship: Stayed in Challenger';
          } else if (userTeamForEnd.tier === 'Challenger') {
            outcomeLoad = 'Challenger: ' + (positionLoad === 1 ? '1st' : positionLoad === 2 ? '2nd' : positionLoad === 3 ? '3rd' : (positionLoad + 'th'));
          } else outcomeLoad = 'Championship Playoffs: Eliminated';
          var currentMainTeamsLoad = [...league, ...(challengerLeague || [])].filter(function(t) { return t.tier === 'Main'; });
          if (currentMainTeamsLoad.length === 12) {
            pendingSeasonEnd = { season: season, result: { finished: true }, position: positionLoad, rec: recLoad, outcome: outcomeLoad };
          }
        }
      }
    } catch (e) {
      league = null;
    }
  }

  if (!league) {
    league = window.Nexus.LEAGUE;
    challengerLeague = window.Nexus.CHALLENGER_LEAGUE || [];
    meta = Nexus.getCurrentMeta ? Nexus.getCurrentMeta() : Nexus.createMeta({ favoredRoles: ['Duelist'], tempo: 65 });
    environmentMap = {};
    league.forEach(team => {
      environmentMap[team.name] = Nexus.createEnvironment({
        coachQuality: 50 + Math.floor(Math.random() * 20),
        infrastructure: 50,
        psychologySupport: 50,
        pressure: 50
      });
    });
    (challengerLeague || []).forEach(team => {
      environmentMap[team.name] = Nexus.createEnvironment({
        coachQuality: 35 + Math.floor(Math.random() * 25),
        infrastructure: 40,
        psychologySupport: 40,
        pressure: 45
      });
    });
    [league, challengerLeague].forEach(teams => {
      (teams || []).forEach(team => {
        if (team.coachTierLevel == null) team.coachTierLevel = 1;
        if (team.facilityTierLevel == null) team.facilityTierLevel = 1;
        if (team.psychologyLevel == null) team.psychologyLevel = 1;
        if (Nexus.syncTeamEnvironmentFromTiers) Nexus.syncTeamEnvironmentFromTiers(team, environmentMap);
      });
    });
    league.forEach(team => Nexus.initializeFinance(team));
    (challengerLeague || []).forEach(team => Nexus.initializeFinance(team));
    const layoutEl = document.querySelector('.layout');
    const teamSelEl = document.getElementById('teamSelectionScreen');
    if (layoutEl) layoutEl.style.display = 'none';
    if (teamSelEl) teamSelEl.style.display = 'flex';
    renderTeamSelection(league);
  }

  function renderTeamSelection(teams) {
    const screen = document.getElementById('teamSelectionScreen');
    const grid = document.getElementById('teamSelectionGrid');
    if (!screen || !grid) return;
    grid.innerHTML = '';
    (teams || []).forEach((team, idx) => {
      const card = document.createElement('div');
      card.className = 'team-card';
      const prestige = team.prestige != null ? team.prestige : 50;
      const budget = team.finance ? team.finance.capital : 1100000;
      const avgOverall = team.players && team.players.length
        ? Math.round(team.players.reduce((sum, p) => sum + (Nexus.getPlayerOverall ? Nexus.getPlayerOverall(p) : 70), 0) / team.players.length)
        : 70;
      card.innerHTML = `
        <div class="team-card__name">${team.name}</div>
        <div class="team-card__stats">
          <div class="stat"><span class="stat__label">Prestige</span><span class="stat__value">${prestige}</span></div>
          <div class="stat"><span class="stat__label">Budget</span><span class="stat__value">$${(budget / 1000000).toFixed(1)}M</span></div>
          <div class="stat"><span class="stat__label">Squad Rating</span><span class="stat__value">${avgOverall}</span></div>
        </div>
        <button type="button" class="btn btn--select" data-team-index="${idx}">Select</button>
      `;
      card.querySelector('.btn--select').addEventListener('click', () => selectTeam(idx));
      grid.appendChild(card);
    });
    screen.style.display = 'flex';
  }

  function selectTeam(teamIndex) {
    if (league == null || !league[teamIndex]) return;
    [league[0], league[teamIndex]] = [league[teamIndex], league[0]];
    window.Nexus.LEAGUE = league;
    const layoutEl = document.querySelector('.layout');
    const teamSelEl = document.getElementById('teamSelectionScreen');
    if (teamSelEl) teamSelEl.style.display = 'none';
    if (layoutEl) layoutEl.style.display = 'flex';
    season = Nexus.createSeasonWithSplit(league);
    challengerSeason = Nexus.createChallengerSeasonFromTeams && Nexus.createChallengerSeasonFromTeams(challengerLeague || []);
    if (challengerSeason) window.Nexus.CHALLENGER_SEASON = challengerSeason;
    const teamTrainingKeys = Nexus.TEAM_TRAINING_PLAN_KEYS || [];
    const allTeamsForTraining = [...league, ...(challengerLeague || [])];
    const userTeamObj = league[0];
    if (teamTrainingKeys.length) {
      userTeamObj.activeTeamTraining = (userTeamObj.activeTeamTraining && teamTrainingKeys.includes(userTeamObj.activeTeamTraining))
        ? userTeamObj.activeTeamTraining : teamTrainingKeys[0];
      allTeamsForTraining.forEach(team => {
        if (team === userTeamObj) return;
        team.activeTeamTraining = teamTrainingKeys[Math.floor(Math.random() * teamTrainingKeys.length)];
      });
    }
    if (Nexus.initializeMomentum) Nexus.initializeMomentum(season);
    if (Nexus.refreshTransferMarket) Nexus.refreshTransferMarket(season, [...league, ...(challengerLeague || [])], league[0].name);
    window.Nexus.YOUTH_MARKET = (Nexus.generateYouthMarket && Nexus.generateYouthMarket()) || [];
    setupContractOfferModal();
    setupPlayerDetailModal();
    setupMarketPlayerModal();
    setupYouthAcademyPlayerModal();
    setupOtherTeamRosterModal();
    updateFixtureUI(season);
    updateStandingsUI(season);
    updateScheduleUI(season);
    updateCareerUI(season);
    updateFinanceUI(league[0]);
    updateRosterUI();
    updateCycleUI();
    saveGameState();
  }

  function saveGameState() {
    const snapshot = buildSeasonSnapshot(season);
    const challengerSnapshot = challengerSeason ? buildSeasonSnapshot(challengerSeason) : null;
    const payload = {
      mainTeams: league,
      challengerTeams: challengerLeague,
      seasonSnapshot: snapshot,
      challengerSeasonSnapshot: challengerSnapshot,
      seasonHistory,
      cycleCount,
      environmentMap,
      transferHistory: transferHistory || [],
      metaId: meta && meta.id ? meta.id : null,
      meta: meta && meta.tempo != null ? { favoredRoles: meta.favoredRoles, tempo: meta.tempo } : { favoredRoles: ['Duelist'], tempo: 65 },
      youthMarket: window.Nexus.YOUTH_MARKET || [],
      pendingBankruptcy: pendingBankruptcy || undefined
    };
    try {
      localStorage.setItem(NEXUS_SAVE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      return false;
    }
  }

  function updateCycleUI() {
    const el = document.getElementById('uiCycle');
    if (el) el.textContent = String(cycleCount);
    const tierEl = document.getElementById('uiTier');
    if (tierEl && userTeamRef()) tierEl.textContent = userTeamRef().tier || 'Main';
  }

  // ===== META CHANGED NOTIFICATION =====
  function showMetaChangedNotification() {
    const existing = document.getElementById('nexus-meta-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'nexus-meta-toast';
    toast.className = 'toast toast--meta';
    toast.textContent = 'Meta changed!';
    const content = document.querySelector('.content');
    if (content) {
      content.insertBefore(toast, content.firstChild);
      setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2500);
    }
  }

  function showMapRotationNotification(mapsAdded, mapsRemoved) {
    const existing = document.getElementById('nexus-map-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'nexus-map-toast';
    toast.className = 'toast toast--maps';
    const added = (mapsAdded || []).join(', ');
    const removed = (mapsRemoved || []).join(', ');
    toast.innerHTML = '<strong>Map Rotation</strong><br><span class="toast__added">+ ' + added + '</span><br><span class="toast__removed">− ' + removed + '</span>';
    const content = document.querySelector('.content');
    if (content) {
      content.insertBefore(toast, content.firstChild);
      setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4000);
    }
  }

  function continueSeasonTransition() {
    const data = pendingSeasonEnd;
    if (!data) return;
    pendingSeasonEnd = null;
    const { season: finishedSeason, result: finishResult, position, rec, outcome } = data;
    const prevChampion = finishedSeason.champion != null
      ? (typeof finishedSeason.champion === 'object' ? finishedSeason.champion.name : finishedSeason.champion)
      : null;
    const relegationResults = (finishResult.relegationResults && finishResult.relegationResults.length)
      ? finishResult.relegationResults
      : (finishedSeason.relegationResults || []);
    cycleCount++;
    const allTeams = [...league, ...(challengerLeague || [])];
    const currentMainTeams = allTeams.filter(t => t.tier === 'Main');
    const userTeamForPromo = league && league[0] ? league[0] : null;
    // AI teams: 60% chance to promote each 17yo from academy to roster (before they age to 18)
    allTeams.forEach(team => {
      if (team === userTeamForPromo) return;
      const academy = team.youthAcademy || [];
      const seventeenYos = academy.filter(p => (p.age || 0) === 17);
      seventeenYos.forEach(prospect => {
        if ((team.players || []).length >= MAX_ROSTER_SIZE) return;
        if (!chance(0.6)) return;
        if (Nexus.promoteYouthToRoster) {
          const res = Nexus.promoteYouthToRoster(team, prospect);
          if (res.success) return;
        }
      });
    });
    Nexus.incrementPlayerAges(allTeams);
    allTeams.forEach(team => {
      (team.players || []).forEach(player => {
        if (Nexus.applyAgeBasedGrowth) Nexus.applyAgeBasedGrowth(player, environmentMap[team.name] || {}, meta);
      });
    });
    const retirementsRaw = Nexus.processRetirements ? Nexus.processRetirements(allTeams) : [];
    const retirements = Array.isArray(retirementsRaw) && retirementsRaw.length > 0 && retirementsRaw[0].player != null
      ? retirementsRaw.map(r => r.player)
      : retirementsRaw;
    const retiredCount = retirements.length;
    const userTeamForRetired = userTeamRef();
    const userRetiredCount = Array.isArray(retirementsRaw) && retirementsRaw[0] && retirementsRaw[0].team != null
      ? retirementsRaw.filter(r => r.team === userTeamForRetired).length
      : 0;
    if (Nexus.decrementContracts) Nexus.decrementContracts(allTeams);
    // Cap free agents after new season inflows (no contract + youth 18+); keep best 30 by overall
    const freeAgents = window.Nexus.FREE_AGENTS || [];
    if (freeAgents.length > 30) {
      const getOverall = window.Nexus.getPlayerOverall || (p => (p.stats && typeof STAT_KEYS !== 'undefined' ? Math.round(STAT_KEYS.reduce((s, k) => s + ((p.stats[k] && p.stats[k].current) || 0), 0) / STAT_KEYS.length) : 70));
      window.Nexus.FREE_AGENTS = freeAgents
        .slice()
        .sort((a, b) => getOverall(b) - getOverall(a))
        .slice(0, 30);
    }
    const winsFinished = rec && typeof rec.w === 'number' ? rec.w : 0;
    const lossesFinished = rec && typeof rec.l === 'number' ? rec.l : 0;
    const gpFinished = winsFinished + lossesFinished;
    const winRateFinished = gpFinished > 0 ? winsFinished / gpFinished : null;
    seasonHistory.push({
      cycle: cycleCount,
      champion: prevChampion,
      position,
      record: rec,
      outcome,
      retiredCount,
      winRate: winRateFinished
    });
    if (Nexus.getRandomMetaPatch) Nexus.getRandomMetaPatch();
    meta = Nexus.getCurrentMeta ? Nexus.getCurrentMeta() : meta;
    const mapRotation = Nexus.rotateMapPool ? Nexus.rotateMapPool() : null;
    season = Nexus.createSeasonWithSplit(currentMainTeams);
    const currentChallengerTeams = allTeams.filter(t => t.tier === 'Challenger');
    challengerSeason = Nexus.createChallengerSeasonFromTeams && Nexus.createChallengerSeasonFromTeams(currentChallengerTeams);
    if (challengerSeason) window.Nexus.CHALLENGER_SEASON = challengerSeason;
    if (Nexus.initializeMomentum) Nexus.initializeMomentum(season);
    if (Nexus.refreshTransferMarket) Nexus.refreshTransferMarket(season, allTeams, (league && league[0]) ? league[0].name : null);
    window.Nexus.YOUTH_MARKET = (Nexus.generateYouthMarket && Nexus.generateYouthMarket()) || [];
    let mapsText = '—';
    if (mapRotation && (mapRotation.mapsAdded.length || mapRotation.mapsRemoved.length)) {
      const added = (mapRotation.mapsAdded || []).join(', ');
      const removed = (mapRotation.mapsRemoved || []).join(', ');
      mapsText = '+ ' + (added || '—') + ' | − ' + (removed || '—');
      showMapRotationNotification(mapRotation.mapsAdded, mapRotation.mapsRemoved);
    }
    if (typeof console !== 'undefined' && console.log) {
      console.log('[Season end] prevChampion:', prevChampion, 'relegationResults:', relegationResults.length, 'retiredCount:', retiredCount);
    }
    const mainStandingsFinal = Nexus.getSortedStandings(finishedSeason.standings || {});
    const mainTop4 = mainStandingsFinal.slice(0, 8).map((t, idx) =>
      (idx + 1) + '. ' + t.teamName + ' — ' + (t.wins || 0) + 'W-' + (t.losses || 0) + 'L'
    ).join('\n');
    const mainBottom2 = mainStandingsFinal.slice(-2).map((t, idx, arr) => {
      const pos = mainStandingsFinal.length - arr.length + idx + 1;
      return pos + '. ' + t.teamName + ' — ' + (t.wins || 0) + 'W-' + (t.losses || 0) + 'L';
    }).join('\n');
    let challengerTop2 = '—';
    if (challengerSeason && challengerSeason.standings) {
      const chSorted = Nexus.getSortedStandings(challengerSeason.standings || {});
      challengerTop2 = chSorted.slice(0, 4).map((t, idx) =>
        (idx + 1) + '. ' + t.teamName + ' — ' + (t.wins || 0) + 'W-' + (t.losses || 0) + 'L'
      ).join('\n');
    }
    const retiredText = retiredCount > 0
      ? (retiredCount <= 5
        ? retirements.map(p => getPlayerDisplayName(p) + ' (' + (p.age || '?') + ')').join(', ')
        : retiredCount + ' players')
      : 'None';
    const relegationText = relegationResults.length
      ? relegationResults.map(r => r.mainTeam + ' vs ' + r.challengerTeam + ' → ' + r.winner).join('\n')
      : '—';
    const winRatePercent = winRateFinished != null ? Math.round(winRateFinished * 100) + '%' : '—';
    const seasonNumber = (data && data.season && data.season.cycle) ? data.season.cycle : (cycleCount - 1);

    const userTeam = userTeamRef();
    pendingAfterMatchResult = function() {
      updateFixtureUI(season);
      updateStandingsUI(season);
      updateScheduleUI(season);
      updateCareerUI(season);
      updateFinanceUI(userTeam);
      updateCycleUI();
      saveGameState();
      if (userRetiredCount > 0) {
        showNotification(userRetiredCount === 1
          ? '1 player from your team retired last season.'
          : userRetiredCount + ' players from your team retired last season.', 'info', 10000);
      }
    };

    showSeasonStatsPage({
      seasonNumber,
      nextSeasonNumber: cycleCount,
      championName: prevChampion || '—',
      retiredText,
      relegationText,
      mapsText,
      mainTop4Text: mainTop4 || '—',
      mainBottom2Text: mainBottom2 || '—',
      challengerTop2Text: challengerTop2,
      winRateText: winRatePercent
    });
  }

  function renderJobOffers(offers, userTeam) {
    const modal = document.getElementById('jobOffersModal');
    const list = document.getElementById('jobOffersList');
    if (!modal || !list) return;
    if (!offers || offers.length === 0) {
      modal.style.display = 'none';
      return;
    }
    list.innerHTML = '';
    offers.forEach((offer, idx) => {
      const card = document.createElement('div');
      card.className = 'job-offer-card';
      const budget = offer.team.finance ? offer.team.finance.capital : 0;
      const prestige = offer.team.prestige != null ? offer.team.prestige : 50;
      card.innerHTML = `
        <div class="job-offer-card__header">
          <strong>${offer.team.name}</strong>
          <span class="badge badge--tier">${offer.team.tier || 'Main'}</span>
        </div>
        <div class="job-offer-card__info">
          <div class="info-row"><span>Prestige</span><span>${prestige}</span></div>
          <div class="info-row"><span>Budget</span><span>$${(budget || 0).toLocaleString()}</span></div>
          <div class="info-row"><span>Salary</span><span>$${(offer.salary || 0).toLocaleString()}/month</span></div>
        </div>
        <p class="job-offer-card__reason">"${offer.reason || ''}"</p>
        <button type="button" class="btn btn--accept" data-offer-index="${idx}">Accept Offer</button>
      `;
      const btn = card.querySelector('.btn--accept');
      btn.addEventListener('click', () => {
        const selectedOffer = currentJobOffers[parseInt(btn.getAttribute('data-offer-index'), 10)];
        if (!selectedOffer) return;
        const confirmMsg = 'Accept ' + selectedOffer.team.name + "'s offer? You will leave " + (userTeam ? userTeam.name : '') + '.';
        showConfirm(confirmMsg, () => {
          const userTeam = userTeamRef();
          if (isBankruptcyJobOffers && userTeam && userTeam.finance) {
            userTeam.finance.capital = (userTeam.finance.capital || 0) + 300000;
            pendingBankruptcy = false;
            isBankruptcyJobOffers = false;
          }
          const result = Nexus.acceptJobOffer(selectedOffer, league, challengerLeague);
          league = result.league;
          challengerLeague = result.challengerLeague;
          window.Nexus.LEAGUE = league;
          window.Nexus.CHALLENGER_LEAGUE = challengerLeague;
          const jobModal = document.getElementById('jobOffersModal');
          if (jobModal) jobModal.style.display = 'none';
          showNotification('You are now manager of ' + selectedOffer.team.name + '!', 'success');
          currentJobOffers = [];
          continueSeasonTransition();
        });
      });
      list.appendChild(card);
    });
  }

  const btnDeclineOffers = document.getElementById('btnDeclineAllOffers');
  if (btnDeclineOffers) {
    btnDeclineOffers.addEventListener('click', () => {
      const jobModal = document.getElementById('jobOffersModal');
      if (jobModal) jobModal.style.display = 'none';
      currentJobOffers = [];
      if (isBankruptcyJobOffers) {
        isBankruptcyJobOffers = false;
        const bm = document.getElementById('bankruptcyModal');
        if (bm) bm.style.display = 'flex';
      } else {
        continueSeasonTransition();
      }
    });
  }
  const jobModalOverlay = document.querySelector('#jobOffersModal .modal__overlay');
  if (jobModalOverlay) {
    jobModalOverlay.addEventListener('click', () => {
      document.getElementById('jobOffersModal').style.display = 'none';
      currentJobOffers = [];
      if (isBankruptcyJobOffers) {
        isBankruptcyJobOffers = false;
        const bm = document.getElementById('bankruptcyModal');
        if (bm) bm.style.display = 'flex';
      } else {
        continueSeasonTransition();
      }
    });
  }

  const btnBankruptcyJobOffers = document.getElementById('btnBankruptcyJobOffers');
  const btnBankruptcyNewCareer = document.getElementById('btnBankruptcyNewCareer');
  if (btnBankruptcyJobOffers) {
    btnBankruptcyJobOffers.addEventListener('click', () => {
      const bm = document.getElementById('bankruptcyModal');
      if (bm) bm.style.display = 'none';
      const userTeam = userTeamRef();
      if (!userTeam) return;
      const allTeams = [...(league || []), ...(challengerLeague || [])];
      let offers = Nexus.generateJobOffers ? Nexus.generateJobOffers(userTeam, 'bankrupt', cycleCount, allTeams, season) : [];
      if (offers.length === 0) {
        const other = allTeams.filter(t => t && t.name !== userTeam.name);
        const userSalary = userTeam.finance && userTeam.finance.monthlyCost != null ? userTeam.finance.monthlyCost : 100000;
        if (other.length) offers = [{ team: other[0], salary: Math.round(userSalary * 0.85), reason: 'New opportunity' }];
      }
      currentJobOffers = offers;
      isBankruptcyJobOffers = true;
      renderJobOffers(currentJobOffers, userTeam);
      const jobModal = document.getElementById('jobOffersModal');
      if (jobModal) jobModal.style.display = 'flex';
    });
  }
  if (btnBankruptcyNewCareer) {
    btnBankruptcyNewCareer.addEventListener('click', () => {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(NEXUS_SAVE_KEY);
      window.location.reload();
    });
  }

  function showMatchResultPage(match, matchResult, seasonData) {
    const overlay = document.getElementById('matchResultPage');
    const content = document.getElementById('matchResultPageContent');
    if (!overlay || !content) return;
    const teamA = match.teamA;
    const teamB = match.teamB;
    const scoreStr = (matchResult.scoreA != null && matchResult.scoreB != null)
      ? (matchResult.scoreA + ' – ' + matchResult.scoreB)
      : '—';
    const stage = matchResult && matchResult.stage;
    const titleEl = document.getElementById('matchResultTitle');
    if (titleEl) {
      if (stage === 'playoffs') titleEl.textContent = 'Playoffs Result';
      else if (stage === 'relegation') titleEl.textContent = 'Relegation Result';
      else titleEl.textContent = 'Match Result';
    }
    document.getElementById('matchResultTeamA').textContent = teamA ? teamA.name : '—';
    document.getElementById('matchResultScore').textContent = scoreStr;
    document.getElementById('matchResultTeamB').textContent = teamB ? teamB.name : '—';
    document.getElementById('matchResultMap').textContent = match.map || '—';
    const mvp = (typeof pickMatchMVP === 'function')
      ? pickMatchMVP(matchResult.winner, matchResult.playerPerformances)
      : null;
    document.getElementById('matchResultMVP').textContent = mvp ? (typeof getPlayerDisplayName === 'function' ? getPlayerDisplayName(mvp) : (mvp.firstName || 'Player')) : '—';
    const mainList = document.getElementById('matchResultMainStandings');
    mainList.innerHTML = '';
    const chList = document.getElementById('matchResultChallengerStandings');
    chList.innerHTML = '';

    // Per-player ratings: our team vs opponent
    const userTeam = userTeamRef();
    const perf = (matchResult && matchResult.playerPerformances) || {};
    let ourKey = null;
    let oppKey = null;
    if (userTeam && (teamA === userTeam || teamB === userTeam)) {
      ourKey = userTeam.name;
      const oppTeam = teamA === userTeam ? teamB : teamA;
      oppKey = oppTeam && oppTeam.name;
    } else {
      // Fallback: treat teamA as "our" and teamB as "opponent"
      ourKey = teamA && teamA.name;
      oppKey = teamB && teamB.name;
    }
    const ourList = (ourKey && perf[ourKey]) ? perf[ourKey].slice() : [];
    const oppList = (oppKey && perf[oppKey]) ? perf[oppKey].slice() : [];

    const sortByRating = function(a, b) {
      const ra = (a && typeof a.rating === 'number') ? a.rating : (a.matchPower || 0);
      const rb = (b && typeof b.rating === 'number') ? b.rating : (b.matchPower || 0);
      return rb - ra;
    };

    ourList.sort(sortByRating);
    oppList.sort(sortByRating);

    ourList.forEach(function(x) {
      if (!x || !x.player) return;
      const row = document.createElement('div');
      row.className = 'match-result__standings-row';
      const name = typeof getPlayerDisplayName === 'function'
        ? getPlayerDisplayName(x.player)
        : (x.player.firstName || 'Player');
      const ratingVal = (typeof x.rating === 'number') ? x.rating.toFixed(1) : null;
      const ratingStr = ratingVal != null ? (ratingVal + '/10') : '—';
      row.textContent = name + ' — ' + ratingStr;
      mainList.appendChild(row);
    });

    oppList.forEach(function(x) {
      if (!x || !x.player) return;
      const row = document.createElement('div');
      row.className = 'match-result__standings-row';
      const name = typeof getPlayerDisplayName === 'function'
        ? getPlayerDisplayName(x.player)
        : (x.player.firstName || 'Player');
      const ratingVal = (typeof x.rating === 'number') ? x.rating.toFixed(1) : null;
      const ratingStr = ratingVal != null ? (ratingVal + '/10') : '—';
      row.textContent = name + ' — ' + ratingStr;
      chList.appendChild(row);
    });
    content.classList.remove('match-result--playoffs', 'match-result--relegation');
    if (stage === 'playoffs') content.classList.add('match-result--playoffs');
    else if (stage === 'relegation') content.classList.add('match-result--relegation');
    overlay.classList.remove('is-hidden');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function hideMatchResultPage() {
    const overlay = document.getElementById('matchResultPage');
    if (overlay) {
      overlay.classList.add('is-hidden');
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  const matchResultContinueBtn = document.getElementById('matchResultContinue');
  if (matchResultContinueBtn) {
    matchResultContinueBtn.addEventListener('click', function() {
      hideMatchResultPage();
      if (typeof pendingAfterMatchResult === 'function') {
        pendingAfterMatchResult();
        pendingAfterMatchResult = null;
      }
    });
  }

  function showSeasonStatsPage(args) {
    const {
      seasonNumber,
      nextSeasonNumber,
      championName,
      retiredText,
      relegationText,
      mapsText,
      mainTop4Text,
      mainBottom2Text,
      challengerTop2Text,
      winRateText
    } = args || {};
    const overlay = document.getElementById('seasonStatsPage');
    const content = document.getElementById('seasonStatsPageContent');
    if (!overlay || !content) return;
    const titleEl = document.getElementById('seasonStatsTitle');
    const subtitleEl = document.getElementById('seasonStatsSubtitle');
    const champEl = document.getElementById('seasonStatsChampion');
    const retiredEl = document.getElementById('seasonStatsRetired');
    const relegEl = document.getElementById('seasonStatsRelegation');
    const mapsEl = document.getElementById('seasonStatsMaps');
    const mainTop4El = document.getElementById('seasonStatsMainTop4');
    const mainBottom2El = document.getElementById('seasonStatsMainBottom2');
    const challTop2El = document.getElementById('seasonStatsChallengerTop2');
    const winRateEl = document.getElementById('seasonStatsWinRate');
    if (!titleEl || !subtitleEl || !champEl || !retiredEl || !relegEl || !mapsEl || !mainTop4El || !mainBottom2El || !challTop2El || !winRateEl) return;
    const prevLabel = seasonNumber != null ? seasonNumber : cycleCount - 1;
    const nextLabel = nextSeasonNumber != null ? nextSeasonNumber : cycleCount;
    titleEl.textContent = 'Season ' + prevLabel + ' Complete';
    subtitleEl.textContent = 'Season ' + prevLabel + ' finished. Season ' + nextLabel + ' started.';
    champEl.textContent = championName || '—';
    retiredEl.textContent = retiredText || '—';
    relegEl.textContent = relegationText || '—';
    mapsEl.textContent = mapsText || '—';
    mainTop4El.textContent = mainTop4Text || '—';
    mainBottom2El.textContent = mainBottom2Text || '—';
    challTop2El.textContent = challengerTop2Text || '—';
    winRateEl.textContent = winRateText || '—';
    overlay.classList.remove('is-hidden');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function hideSeasonStatsPage() {
    const overlay = document.getElementById('seasonStatsPage');
    if (!overlay) return;
    overlay.classList.add('is-hidden');
    overlay.setAttribute('aria-hidden', 'true');
  }

  const seasonStatsContinueBtn = document.getElementById('seasonStatsContinue');
  if (seasonStatsContinueBtn) {
    seasonStatsContinueBtn.addEventListener('click', function() {
      hideSeasonStatsPage();
      if (typeof pendingAfterMatchResult === 'function') {
        pendingAfterMatchResult();
        pendingAfterMatchResult = null;
      }
    });
  }

  function handleSeasonFinished(result) {
    const userTeam = userTeamRef();
    const isBankrupt = result.bankrupt && userTeam && Nexus.checkBankruptcy(userTeam);

    if (isBankrupt) {
      pendingBankruptcy = true;
      updateFixtureUI(season);
      updateStandingsUI(season);
      updateScheduleUI(season);
      updateCareerUI(season);
      updateFinanceUI(userTeam);
      updateCycleUI();
      saveGameState();
      var bankruptcyModalEl = document.getElementById('bankruptcyModal');
      if (bankruptcyModalEl) bankruptcyModalEl.style.display = 'flex';
      return;
    }

    const useChallengerForPosition = userTeam.tier === 'Challenger' && challengerSeason && challengerSeason.standings;
    const standingsForPosition = useChallengerForPosition ? challengerSeason.standings : season.standings;
    const sorted = Nexus.getSortedStandings(standingsForPosition);
    const posIndex = sorted.findIndex(t => t.teamName === userTeam.name);
    const position = posIndex === -1 ? null : posIndex + 1;
    const rec = userTeam && standingsForPosition[userTeam.name]
      ? { w: standingsForPosition[userTeam.name].wins, l: standingsForPosition[userTeam.name].losses }
      : { w: 0, l: 0 };
    let outcome = '—';
    if (season.champion && season.champion.name === userTeam.name) outcome = 'Championship: Winner';
    else if (season.relegationCandidates && season.relegationCandidates.some(t => t.name === userTeam.name)) {
      const rel = (season.relegationResults || []).find(r => r.mainTeam === userTeam.name);
      outcome = rel ? (rel.winner === userTeam.name ? 'Relegation: Stayed in Main' : 'Relegation: Relegated to Challenger') : 'Relegation: Stayed in Main';
    } else if (season.challengerPromotion && season.challengerPromotion.some(t => t.name === userTeam.name)) {
      const rel = (season.relegationResults || []).find(r => r.challengerTeam === userTeam.name);
      outcome = rel ? (rel.winner === userTeam.name ? 'Challenger Championship: Promoted to Main' : 'Challenger Championship: Stayed in Challenger') : 'Challenger Championship: Stayed in Challenger';
    } else if (userTeam.tier === 'Challenger') {
      outcome = 'Challenger: ' + (position === 1 ? '1st' : position === 2 ? '2nd' : position === 3 ? '3rd' : (position + 'th'));
    } else outcome = 'Championship Playoffs: Eliminated';

    const allTeams = [...league, ...(challengerLeague || [])];
    const currentMainTeams = allTeams.filter(t => t.tier === 'Main');
    if (currentMainTeams.length !== 12) {
      showNotification('Season Finished (relegation/promotion applied). Cycle ' + cycleCount + '. Unable to start next season – team count mismatch.', 'info');
      updateFixtureUI(season);
      updateStandingsUI(season);
      updateScheduleUI(season);
      updateCareerUI(season);
      updateFinanceUI(userTeam);
      updateCycleUI();
      saveGameState();
      return;
    }

    const seasonOutcome = (season.champion && season.champion.name === userTeam.name)
      ? 'champion'
      : (outcome.indexOf('Relegated to Challenger') !== -1
        ? 'relegated'
        : (outcome.indexOf('Promoted to Main') !== -1
          ? 'promoted'
          : (position >= 2 && position <= 6 && !useChallengerForPosition ? 'playoffs' : 'mid')));
    pendingSeasonEnd = { season, result, position, rec, outcome };
    const offers = Nexus.generateJobOffers ? Nexus.generateJobOffers(userTeam, seasonOutcome, cycleCount, allTeams) : [];
    if (offers.length > 0) {
      currentJobOffers = offers;
      renderJobOffers(offers, userTeam);
      const jobModal = document.getElementById('jobOffersModal');
      if (jobModal) jobModal.style.display = 'flex';
      return;
    }
    continueSeasonTransition();
  }

  // ===== SIMULATE STAGE BUTTON =====
  const simBtn = document.getElementById('btnSim');
  if (simBtn) {
    simBtn.addEventListener('click', () => {
      const previousPhase = season ? season.phase : null;
      const result = Nexus.playNextStage(season, environmentMap, meta);
      if (result.newMeta) {
        meta = result.newMeta;
        showMetaChangedNotification();
      }
      if (result.newMeta && Nexus.runPostMetaShiftAdaptation) Nexus.runPostMetaShiftAdaptation(season, result.newMeta, (league && league[0]) ? league[0].name : null);

      if (result.finished && season.phase === 'finished') {
        handleSeasonFinished(result);
        return;
      }

      const runPostStageUpdates = () => {
        const wasRegular = season.phase === 'regular';
        const wasMatchday = result.matchdayResults && result.matchdayResults.length > 0;
        if (wasRegular && wasMatchday) {
          if (season.transferMarketRefreshCountdown != null) {
            season.transferMarketRefreshCountdown--;
            if (season.transferMarketRefreshCountdown <= 0 && Nexus.refreshTransferMarket && league && league[0]) {
              Nexus.refreshTransferMarket(season, [...league, ...(challengerLeague || [])], league[0].name);
            }
          }
          saveGameState();
        }

        if (result.matchdayResults) console.log('Matchday Results:', result.matchdayResults);
        if (result.playoffWinners) console.log('Playoff winners:', result.playoffWinners);
        if (result.champion) console.log('Champion:', result.champion.name);
        if (result.relegationResults) console.log('Relegation:', result.relegationResults);
        updateFixtureUI(season);
        updateStandingsUI(season);
        updateScheduleUI(season);
        updateCareerUI(season);
        updateFinanceUI(userTeamRef());
        updateCycleUI();
      };

      const userTeam = userTeamRef();
      if (previousPhase === 'regular' && result.matchdayResults && result.matchdayResults.length && userTeam) {
        const ourMatch = result.matchdayResults.find(r => r.match.teamA === userTeam || r.match.teamB === userTeam);
        if (ourMatch) {
          pendingAfterMatchResult = runPostStageUpdates;
          showMatchResultPage(ourMatch.match, ourMatch.result, season);
          return;
        }
      }

      if (previousPhase === 'playoffs' && result.roundResults && result.roundResults.length && userTeam) {
        const ourPlayoff = result.roundResults.find(r => r.match.teamA === userTeam || r.match.teamB === userTeam);
        if (ourPlayoff) {
          pendingAfterMatchResult = runPostStageUpdates;
          showMatchResultPage(ourPlayoff.match, ourPlayoff.result, season);
          return;
        }
      }

      if (previousPhase === 'relegation' && result.relegationMatchResults && result.relegationMatchResults.length && userTeam) {
        const ourRel = result.relegationMatchResults.find(r => r.match.teamA === userTeam || r.match.teamB === userTeam);
        if (ourRel) {
          pendingAfterMatchResult = runPostStageUpdates;
          showMatchResultPage(ourRel.match, ourRel.result, season);
          return;
        }
      }

      runPostStageUpdates();
    });
  }

  if (pendingSeasonEnd) {
    var data = pendingSeasonEnd;
    var userTeamFlush = userTeamRef();
    var champNameFlush = data.season.champion != null ? (typeof data.season.champion === 'object' ? data.season.champion.name : data.season.champion) : null;
    var seasonOutcomeFlush = (champNameFlush === (userTeamFlush && userTeamFlush.name)) ? 'champion' : (data.outcome.indexOf('Relegated to Challenger') !== -1 ? 'relegated' : (data.outcome.indexOf('Promoted to Main') !== -1 ? 'promoted' : (data.position >= 2 && data.position <= 6 ? 'playoffs' : 'mid')));
    var allTeamsFlush = [...league, ...(challengerLeague || [])];
    var offersFlush = Nexus.generateJobOffers ? Nexus.generateJobOffers(userTeamFlush, seasonOutcomeFlush, cycleCount, allTeamsFlush) : [];
    if (offersFlush.length > 0) {
      currentJobOffers = offersFlush;
      renderJobOffers(offersFlush, userTeamFlush);
      var jobModalFlush = document.getElementById('jobOffersModal');
      if (jobModalFlush) jobModalFlush.style.display = 'flex';
    } else {
      continueSeasonTransition();
    }
  }

  if (pendingBankruptcyOnLoad) {
    pendingBankruptcy = true;
    pendingBankruptcyOnLoad = false;
    var bankruptcyModalOnLoad = document.getElementById('bankruptcyModal');
    if (bankruptcyModalOnLoad) bankruptcyModalOnLoad.style.display = 'flex';
  }

  // ===== OPERATIONS (Coaches, Facilities, Sponsors) =====
  var operationsTabBtns = document.querySelectorAll('.operations-tab');
  var operationsPanels = document.querySelectorAll('.operations-panel');
  var activeOperationsPanel = 'coaches';

  function updateOperationsUI() {
    var userTeam = userTeamRef();
    if (!userTeam) return;
    var coachesEl = document.getElementById('operationsCoaches');
    var facilitiesEl = document.getElementById('operationsFacilities');
    var psychologyEl = document.getElementById('operationsPsychology');
    var sponsorsEl = document.getElementById('operationsSponsors');
    if (!coachesEl || !facilitiesEl || !psychologyEl || !sponsorsEl) return;

    if (activeOperationsPanel === 'coaches') {
      var coachTiers = window.Nexus.COACH_TIERS || [];
      var currentCoach = (userTeam.coachTierLevel != null ? userTeam.coachTierLevel : 1);
      coachesEl.innerHTML = '<div class="operations-tier-list">' + coachTiers.map(function(tier, i) {
        var isCurrent = (i + 1) === currentCoach;
        var isLocked = (i + 1) > currentCoach;
        var nextLevel = currentCoach < coachTiers.length ? coachTiers[currentCoach] : null;
        var canUpgrade = nextLevel && (userTeam.finance && (userTeam.finance.capital || 0) >= (nextLevel.upgradeCost || 0));
        var cardClass = 'operations-tier-card' + (isCurrent ? ' is-current' : '') + (isLocked ? ' is-locked' : '');
        var btnHtml = '';
        if ((i + 1) === currentCoach) btnHtml = '<span class="operations-badge">Current</span>';
        else if ((i + 1) === currentCoach + 1 && canUpgrade) btnHtml = '<button type="button" class="btn btn--primary operations-upgrade-btn" data-coach-level="' + (i + 1) + '">Upgrade — $' + (tier.upgradeCost || 0).toLocaleString() + '</button>';
        else if (isLocked) btnHtml = '<span class="operations-cost">$' + (tier.upgradeCost || 0).toLocaleString() + ' to unlock</span>';
        return '<div class="' + cardClass + '"><div class="operations-tier-card__header"><strong>' + (tier.name || 'Tier ' + (i + 1)) + '</strong><span class="operations-tier-level">Level ' + (i + 1) + '</span></div><p class="operations-tier-desc">' + (tier.description || '') + '</p><div class="operations-tier-stats"><span>Quality: ' + (tier.quality || 50) + '</span><span>Salary: $' + (tier.monthlySalary || 0).toLocaleString() + '/mo</span></div>' + btnHtml + '</div>';
      }).join('') + '</div>';
      coachesEl.querySelectorAll('.operations-upgrade-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var level = parseInt(btn.getAttribute('data-coach-level'), 10);
          var tier = (window.Nexus.COACH_TIERS || [])[level - 1];
          if (!tier || !userTeamRef() || !userTeamRef().finance) return;
          if ((userTeamRef().finance.capital || 0) < (tier.upgradeCost || 0)) { showNotification('Cannot afford upgrade.', 'error'); return; }
          userTeamRef().coachTierLevel = level;
          userTeamRef().finance.capital -= tier.upgradeCost;
          if (window.Nexus.syncTeamEnvironmentFromTiers) window.Nexus.syncTeamEnvironmentFromTiers(userTeamRef(), environmentMap);
          if (window.Nexus.syncPressureToPrestige) window.Nexus.syncPressureToPrestige(userTeamRef(), environmentMap);
          saveGameState();
          showNotification('Upgraded to ' + (tier.name || 'Level ' + level) + '!', 'success');
          updateOperationsUI();
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
        });
      });
    }

    if (activeOperationsPanel === 'facilities') {
      var facilityTiers = window.Nexus.FACILITY_TIERS || [];
      var currentFacility = (userTeam.facilityTierLevel != null ? userTeam.facilityTierLevel : 1);
      facilitiesEl.innerHTML = '<div class="operations-tier-list">' + facilityTiers.map(function(tier, i) {
        var isCurrent = (i + 1) === currentFacility;
        var isLocked = (i + 1) > currentFacility;
        var nextLevel = currentFacility < facilityTiers.length ? facilityTiers[currentFacility] : null;
        var canUpgrade = nextLevel && (userTeam.finance && (userTeam.finance.capital || 0) >= (nextLevel.upgradeCost || 0));
        var cardClass = 'operations-tier-card' + (isCurrent ? ' is-current' : '') + (isLocked ? ' is-locked' : '');
        var btnHtml = '';
        if ((i + 1) === currentFacility) btnHtml = '<span class="operations-badge">Current</span>';
        else if ((i + 1) === currentFacility + 1 && canUpgrade) btnHtml = '<button type="button" class="btn btn--primary operations-upgrade-btn" data-facility-level="' + (i + 1) + '">Upgrade — $' + (tier.upgradeCost || 0).toLocaleString() + '</button>';
        else if (isLocked) btnHtml = '<span class="operations-cost">$' + (tier.upgradeCost || 0).toLocaleString() + ' to unlock</span>';
        var extra = [];
        if (tier.prestigeBonus) extra.push('+' + tier.prestigeBonus + ' Prestige');
        if (tier.youthSlotsBonus) extra.push('+' + tier.youthSlotsBonus + ' youth slot(s)');
        if (tier.seasonalMaintenance) extra.push('$' + tier.seasonalMaintenance.toLocaleString() + '/season maintenance');
        return '<div class="' + cardClass + '"><div class="operations-tier-card__header"><strong>' + (tier.name || 'Tier ' + (i + 1)) + '</strong><span class="operations-tier-level">Level ' + (i + 1) + '</span></div><p class="operations-tier-desc">' + (tier.description || '') + '</p><div class="operations-tier-stats"><span>Infrastructure: ' + (tier.infrastructure || 50) + '</span>' + (extra.length ? '<span>' + extra.join(' · ') + '</span>' : '') + '</div>' + btnHtml + '</div>';
      }).join('') + '</div>';
      facilitiesEl.querySelectorAll('.operations-upgrade-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var level = parseInt(btn.getAttribute('data-facility-level'), 10);
          var tier = (window.Nexus.FACILITY_TIERS || [])[level - 1];
          if (!tier || !userTeamRef() || !userTeamRef().finance) return;
          if ((userTeamRef().finance.capital || 0) < (tier.upgradeCost || 0)) { showNotification('Cannot afford upgrade.', 'error'); return; }
          var oldTier = window.Nexus.getFacilityTier && window.Nexus.getFacilityTier(userTeamRef());
          userTeamRef().facilityTierLevel = level;
          userTeamRef().finance.capital -= tier.upgradeCost;
          if (userTeamRef().prestige != null) userTeamRef().prestige = (userTeamRef().prestige || 50) + (tier.prestigeBonus || 0) - (oldTier && oldTier.prestigeBonus || 0);
          else userTeamRef().prestige = 50 + (tier.prestigeBonus || 0);
          if (window.Nexus.syncTeamEnvironmentFromTiers) window.Nexus.syncTeamEnvironmentFromTiers(userTeamRef(), environmentMap);
          if (window.Nexus.syncPressureToPrestige) window.Nexus.syncPressureToPrestige(userTeamRef(), environmentMap);
          saveGameState();
          showNotification('Upgraded to ' + (tier.name || 'Level ' + level) + '!', 'success');
          updateOperationsUI();
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
        });
      });
    }

    if (activeOperationsPanel === 'psychology') {
      var psychologyTiers = window.Nexus.PSYCHOLOGY_TIERS || [];
      var currentPsych = (userTeam.psychologyLevel != null ? userTeam.psychologyLevel : 1);
      psychologyEl.innerHTML = '<div class="operations-tier-list">' + psychologyTiers.map(function(tier, i) {
        var isCurrent = (i + 1) === currentPsych;
        var isLocked = (i + 1) > currentPsych;
        var nextLevel = currentPsych < psychologyTiers.length ? psychologyTiers[currentPsych] : null;
        var canUpgrade = nextLevel && (userTeam.finance && (userTeam.finance.capital || 0) >= (nextLevel.upgradeCost || 0));
        var cardClass = 'operations-tier-card' + (isCurrent ? ' is-current' : '') + (isLocked ? ' is-locked' : '');
        var btnHtml = '';
        if ((i + 1) === currentPsych) btnHtml = '<span class="operations-badge">Current</span>';
        else if ((i + 1) === currentPsych + 1 && canUpgrade) btnHtml = '<button type="button" class="btn btn--primary operations-upgrade-btn btnUpgradePsychology" data-psychology-level="' + (i + 1) + '">Upgrade — $' + (tier.upgradeCost || 0).toLocaleString() + '</button>';
        else if (isLocked) btnHtml = '<span class="operations-cost">$' + (tier.upgradeCost || 0).toLocaleString() + ' to unlock</span>';
        var extra = [];
        if (tier.pressureReduction > 0) extra.push((tier.pressureReduction * 100) + '% pressure reduction');
        if (tier.synergyBonus > 0) extra.push('+' + (tier.synergyBonus * 100) + '% synergy');
        if (tier.seasonalCost) extra.push('$' + tier.seasonalCost.toLocaleString() + '/season');
        return '<div class="' + cardClass + '"><div class="operations-tier-card__header"><strong>' + (tier.name || 'Tier ' + (i + 1)) + '</strong><span class="operations-tier-level">Level ' + (i + 1) + '</span></div><p class="operations-tier-desc">' + (tier.description || '') + '</p><div class="operations-tier-stats"><span>Support: ' + (tier.support || 50) + '</span>' + (extra.length ? '<span>' + extra.join(' · ') + '</span>' : '') + '</div>' + btnHtml + '</div>';
      }).join('') + '</div>';
      psychologyEl.querySelectorAll('.operations-upgrade-btn, .btnUpgradePsychology').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var result = window.Nexus.upgradePsychology && window.Nexus.upgradePsychology(userTeamRef());
          if (!result || !result.success) {
            showNotification(result && result.message ? result.message : 'Could not upgrade psychology.', 'error');
            return;
          }
          if (window.Nexus.syncTeamEnvironmentFromTiers) window.Nexus.syncTeamEnvironmentFromTiers(userTeamRef(), environmentMap);
          saveGameState();
          showNotification(result.message || 'Psychology upgraded!', 'success');
          updateOperationsUI();
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
        });
      });
    }

    if (activeOperationsPanel === 'sponsors') {
      var sponsorTiers = window.Nexus.SPONSOR_TIERS || [];
      var contract = userTeam.sponsorContract;
      var canSelect = !contract && season && (season.currentMatchday == null || season.currentMatchday === 0);
      if (contract) {
        sponsorsEl.innerHTML = '<div class="operations-sponsor-current"><h3>Current sponsor</h3><div class="operations-sponsor-card is-active"><strong>' + contract.name + '</strong><p>50% upfront received. 50% bonus at season end if objectives met.</p><p class="operations-locked">Locked until next season</p></div></div>';
      } else {
        sponsorsEl.innerHTML = '<div class="operations-sponsor-list">' + (canSelect ? '<p class="operations-hint">Choose one sponsor at the start of the season. You will receive 50% upfront and 50% at season end if you meet the objectives.</p>' : '<p class="operations-locked">Sponsor selection is available at the start of the season (matchday 0).</p>') + sponsorTiers.map(function(s) {
          var rulesText = (s.rules || []).map(function(r) { return r.description; }).join(' · ');
          return '<div class="operations-sponsor-card"><div class="operations-sponsor-card__header"><strong>' + s.name + '</strong><span class="operations-sponsor-tier">' + (s.tier || '') + '</span></div><p class="operations-sponsor-desc">' + (s.description || '') + '</p><p class="operations-sponsor-rules">' + rulesText + '</p><div class="operations-sponsor-pay">$' + (s.totalPay || 0).toLocaleString() + ' total (50% upfront, 50% at season end)</div>' + (canSelect ? '<button type="button" class="btn btn--primary operations-select-sponsor" data-sponsor-id="' + (s.id || '') + '">Select</button>' : '') + '</div>';
        }).join('') + '</div>';
        sponsorsEl.querySelectorAll('.operations-select-sponsor').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-sponsor-id');
            if (!id || !userTeamRef()) return;
            var result = window.Nexus.selectSponsor && window.Nexus.selectSponsor(userTeamRef(), id);
            if (result && result.success) {
              showNotification(result.message || 'Sponsor signed.', 'success');
              saveGameState();
              updateOperationsUI();
              if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
            } else {
              showNotification(result && result.message ? result.message : 'Could not sign sponsor.', 'error');
            }
          });
        });
      }
    }
  }

  if (operationsTabBtns.length) {
    operationsTabBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tab = btn.getAttribute('data-operations-tab');
        if (!tab) return;
        operationsTabBtns.forEach(function(b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        operationsPanels.forEach(function(p) {
          p.classList.toggle('is-visible', p.getAttribute('data-panel') === tab);
        });
        activeOperationsPanel = tab;
        updateOperationsUI();
      });
    });
  }
  operationsPanels.forEach(function(p) {
    p.classList.toggle('is-visible', p.getAttribute('data-panel') === activeOperationsPanel);
  });

  // ===== SAVE BUTTON =====
  const saveBtn = document.getElementById('btnSave');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const ok = saveGameState();
      if (ok) saveBtn.textContent = 'Saved!';
      else saveBtn.textContent = 'Save failed';
      setTimeout(() => { saveBtn.textContent = 'Save'; }, 1500);
    });
  }

  const newCareerBtn = document.getElementById('btnNewCareer');
  if (newCareerBtn) {
    newCareerBtn.addEventListener('click', () => {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(NEXUS_SAVE_KEY);
      window.location.reload();
    });
  }

  function updateOverviewAgeUI() {
    const avgEl = document.getElementById('uiAvgAge');
    const pillsEl = document.getElementById('uiAgePills');
    if (!avgEl || !pillsEl) return;
    const yourTeam = league && league[0];
    if (!yourTeam || !yourTeam.players || !yourTeam.players.length) {
      avgEl.textContent = '—';
      pillsEl.innerHTML = '';
      return;
    }
    const ages = yourTeam.players.map(p => p.age != null ? p.age : 20);
    const avg = Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);
    avgEl.textContent = avg;
    const growth = ages.filter(a => a <= 21).length;
    const peak = ages.filter(a => a >= 22 && a <= 25).length;
    const decline = ages.filter(a => a >= 26 && a <= 27).length;
    const retirement = ages.filter(a => a >= 28).length;
    pillsEl.innerHTML = [
      growth ? '<span class="age-pill age-pill--growth">' + growth + ' growth</span>' : '',
      peak ? '<span class="age-pill age-pill--peak">' + peak + ' peak</span>' : '',
      decline ? '<span class="age-pill age-pill--decline">' + decline + ' decline</span>' : '',
      retirement ? '<span class="age-pill age-pill--retirement">' + retirement + ' retirement</span>' : ''
    ].filter(Boolean).join(' ');
  }

  // ===== FIXTURE UI (next match / stage) =====
  function updateFixtureUI(seasonData) {
    updateOverviewAgeUI();
    const teamNameEl = document.getElementById('uiTeamName');
    const oppEl = document.getElementById('uiOpponent');
    const badgeLeft = document.getElementById('uiBadgeLeft');
    const badgeRight = document.getElementById('uiBadgeRight');
    if (!teamNameEl || !oppEl) return;

    const currentMeta = meta && meta.name ? meta : (Nexus.getCurrentMeta ? Nexus.getCurrentMeta() : null);
    const metaNameEl = document.getElementById('uiMetaName');
    const metaDescEl = document.getElementById('uiMetaDesc');
    if (metaNameEl) metaNameEl.textContent = currentMeta && currentMeta.name ? currentMeta.name : '—';
    if (metaDescEl) metaDescEl.textContent = currentMeta && currentMeta.description ? currentMeta.description : (currentMeta ? 'Tempo: ' + currentMeta.tempo + ' | Aggression: ' + (currentMeta.aggressionLevel != null ? currentMeta.aggressionLevel : '—') : '');

    const userTeam = league[0];
    const teamPlanKeys = window.Nexus.TEAM_TRAINING_PLAN_KEYS || [];
    if (userTeam && teamPlanKeys.length && (userTeam.activeTeamTraining == null || userTeam.activeTeamTraining === '' || !teamPlanKeys.includes(userTeam.activeTeamTraining))) {
      userTeam.activeTeamTraining = teamPlanKeys[0];
    }
    const trainingEl = document.getElementById('uiActiveTeamTraining');
    const trainingDescEl = document.getElementById('uiActiveTeamTrainingDesc');
    const planName = (userTeam && userTeam.activeTeamTraining) ? userTeam.activeTeamTraining : '—';
    if (trainingEl) trainingEl.textContent = planName;
    if (trainingDescEl) {
      const plans = window.Nexus.TEAM_TRAINING_PLANS;
      const desc = (planName !== '—' && plans && plans[planName] && plans[planName].description) ? ' — ' + plans[planName].description : '';
      trainingDescEl.textContent = desc;
    }
    const phase = seasonData.phase || 'regular';
    const matchdayInfoEl = document.getElementById('uiMatchdayInfo');

    const fixturePanel = document.getElementById('fixturePanel');
    const titleEl = document.getElementById('uiFixtureTitle');
    if (fixturePanel) {
      fixturePanel.classList.remove('panel--playoffs', 'panel--relegation');
      if (phase === 'playoffs') fixturePanel.classList.add('panel--playoffs');
      else if (phase === 'relegation') fixturePanel.classList.add('panel--relegation');
    }
    if (titleEl) {
      if (phase === 'finished') titleEl.textContent = 'Season complete';
      else if (phase === 'playoffs' && seasonData.playoffsBracket) {
        const r = seasonData.playoffsBracket.round;
        titleEl.textContent = r === 2 ? 'Championship – Final' : 'Championship – Quarterfinals';
      } else if (phase === 'relegation') titleEl.textContent = 'Relegation – Decider';
      else titleEl.textContent = 'Next Fixture';
    }

    if (phase === 'finished') {
      if (matchdayInfoEl) matchdayInfoEl.textContent = 'Season finished';
      teamNameEl.textContent = seasonData.champion ? seasonData.champion.name : '—';
      oppEl.textContent = 'Season complete';
      if (badgeLeft) { badgeLeft.textContent = '—'; badgeLeft.classList.remove('badge--you'); }
      if (badgeRight) badgeRight.textContent = '—';
      return;
    }

    if (phase === 'playoffs' && seasonData.playoffsBracket) {
      if (matchdayInfoEl) matchdayInfoEl.textContent = 'Playoffs';
      const bracket = seasonData.playoffsBracket;
      const nextMatch = bracket.matches[0];
      if (nextMatch) {
        teamNameEl.textContent = nextMatch.teamA.name;
        oppEl.textContent = nextMatch.teamB.name;
        const isYou = nextMatch.teamA.name === userTeam.name || nextMatch.teamB.name === userTeam.name;
        if (badgeLeft) { badgeLeft.textContent = isYou ? 'YOU' : 'OPP'; badgeLeft.classList.toggle('badge--you', isYou); }
        if (badgeRight) badgeRight.textContent = 'OPP';
      } else {
        teamNameEl.textContent = 'Playoffs';
        oppEl.textContent = 'Round ' + bracket.round;
        if (badgeLeft) { badgeLeft.textContent = 'OPP'; badgeLeft.classList.remove('badge--you'); }
        if (badgeRight) badgeRight.textContent = 'OPP';
      }
      return;
    }

    if (phase === 'relegation' && seasonData.relegationCandidates && seasonData.challengerPromotion) {
      if (matchdayInfoEl) matchdayInfoEl.textContent = 'Relegation';
      const main = seasonData.relegationCandidates;
      const chall = seasonData.challengerPromotion;
      const ourTeamIn = main.some(t => t.name === userTeam.name) || chall.some(t => t.name === userTeam.name);
      const firstMain = main[0];
      const firstChall = chall[0];
      const secondMain = main[1];
      const secondChall = chall[1];
      if (firstMain && firstChall) {
        teamNameEl.textContent = firstMain.name + ' vs ' + firstChall.name;
        oppEl.textContent = (secondMain && secondChall) ? (secondMain.name + ' vs ' + secondChall.name) : 'Relegation Tournament (2 matches)';
        if (badgeLeft) { badgeLeft.textContent = ourTeamIn ? 'YOU' : 'OPP'; badgeLeft.classList.toggle('badge--you', ourTeamIn); }
        if (badgeRight) badgeRight.textContent = 'OPP';
      } else {
        teamNameEl.textContent = 'Relegation';
        oppEl.textContent = 'Main vs Challenger';
        if (badgeLeft) { badgeLeft.textContent = 'OPP'; badgeLeft.classList.remove('badge--you'); }
        if (badgeRight) badgeRight.textContent = 'OPP';
      }
      return;
    }

    // Regular season: show fixture from manager's league only (Main or Challenger)
    const isChallengerManager = userTeam.tier === 'Challenger';
    const dataForFixture = (isChallengerManager && challengerSeason && challengerSeason.teams && challengerSeason.teams.some(t => t.name === userTeam.name))
      ? challengerSeason
      : seasonData;
    const finished = dataForFixture.currentMatchday >= (dataForFixture.matchdays || []).length;
    if (matchdayInfoEl && !finished) {
      const md = (dataForFixture.currentMatchday || 0) + 1;
      matchdayInfoEl.textContent = 'Matchday ' + md + ' / ' + (dataForFixture.matchdays || []).length;
    }
    if (finished) {
      teamNameEl.textContent = '—';
      oppEl.textContent = 'Regular season complete';
      if (badgeLeft) { badgeLeft.textContent = '—'; badgeLeft.classList.remove('badge--you'); }
      if (badgeRight) badgeRight.textContent = '—';
      return;
    }

    const todayMatches = (dataForFixture.matchdays || [])[dataForFixture.currentMatchday] || [];
    const ourMatch = todayMatches.find(m =>
      m.teamA.name === userTeam.name || m.teamB.name === userTeam.name
    );

    if (ourMatch) {
      if (ourMatch.teamA.name === userTeam.name) {
        teamNameEl.textContent = ourMatch.teamA.name;
        oppEl.textContent = ourMatch.teamB.name;
      } else {
        teamNameEl.textContent = ourMatch.teamB.name;
        oppEl.textContent = ourMatch.teamA.name;
      }
      const mapEl = document.getElementById('uiFixtureMap');
      if (mapEl) {
        mapEl.textContent = ourMatch.map || '—';
        mapEl.style.display = '';
      }
      if (badgeLeft) { badgeLeft.textContent = 'YOU'; badgeLeft.classList.add('badge--you'); }
      if (badgeRight) badgeRight.textContent = 'OPP';
    } else {
      teamNameEl.textContent = '—';
      oppEl.textContent = 'Matchday ' + (dataForFixture.currentMatchday + 1) + ' (no your game)';
      const mapEl = document.getElementById('uiFixtureMap');
      if (mapEl) { mapEl.textContent = '—'; mapEl.style.display = ''; }
      if (badgeLeft) { badgeLeft.textContent = 'OPP'; badgeLeft.classList.remove('badge--you'); }
      if (badgeRight) badgeRight.textContent = 'OPP';
    }
  }

  // ===== CAREER PAGE UI =====
  let pastSeasonModalSetupDone = false;
  function openPastSeasonModal(entry, displaySeasonNum) {
    const modal = document.getElementById('pastSeasonDetailModal');
    const titleEl = document.getElementById('pastSeasonDetailTitle');
    const summaryEl = document.getElementById('pastSeasonDetailSummary');
    const textEl = document.getElementById('pastSeasonDetailText');
    if (!modal || !titleEl || !summaryEl || !textEl) return;
    const seasonLabel = displaySeasonNum != null ? displaySeasonNum : entry.cycle;
    titleEl.textContent = 'Season ' + seasonLabel;
    const rec = entry.record || { w: 0, l: 0 };
    const posStr = entry.position != null ? entry.position + (entry.position === 1 ? 'st' : entry.position === 2 ? 'nd' : entry.position === 3 ? 'rd' : 'th') : '—';
    const winRate = entry.winRate != null ? Math.round(entry.winRate * 100) + '%' : '—';
    summaryEl.innerHTML = ''
      + '<div class="career-row"><span class="career-k">Position</span><span class="career-v">' + posStr + '</span></div>'
      + '<div class="career-row"><span class="career-k">Record</span><span class="career-v">' + rec.w + 'W - ' + rec.l + 'L</span></div>'
      + '<div class="career-row"><span class="career-k">Win rate</span><span class="career-v">' + winRate + '</span></div>'
      + '<div class="career-row"><span class="career-k">Outcome</span><span class="career-v">' + (entry.outcome || '—') + '</span></div>'
      + (entry.champion ? '<div class="career-past-champ">Champion: ' + entry.champion + '</div>' : '');
    var summaryText = (entry.champion ? 'Champion: ' + entry.champion + '\n\n' : '') + 'Season ' + seasonLabel + ' finished.';
    if (entry.retiredCount > 0) summaryText += '\n\nRetired: ' + entry.retiredCount + ' players';
    textEl.textContent = summaryText;
    modal.classList.remove('is-hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closePastSeasonModal() {
    const modal = document.getElementById('pastSeasonDetailModal');
    if (!modal) return;
    modal.classList.add('is-hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
  function updateCareerUI(seasonData) {
    const teamEl = document.getElementById('careerTeam');
    const posEl = document.getElementById('careerPosition');
    const recEl = document.getElementById('careerRecord');
    const winRateEl = document.getElementById('careerWinRate');
    const outEl = document.getElementById('careerOutcome');
    if (!teamEl || !posEl || !recEl || !outEl) return;

    const userTeam = league[0];
    if (!userTeam) {
      teamEl.textContent = '—';
      posEl.textContent = '—';
      recEl.textContent = '—';
      outEl.textContent = '—';
      return;
    }

    teamEl.textContent = userTeam.name + ' (' + (userTeam.tier || 'Main') + ')';

    const isChallengerManager = userTeam.tier === 'Challenger';
    const standings = (isChallengerManager && challengerSeason && challengerSeason.standings) ? challengerSeason.standings : seasonData.standings;
    const phase = seasonData.phase || 'regular';

    if (!standings || !standings[userTeam.name]) {
      posEl.textContent = '—';
      recEl.textContent = '0W - 0L';
      if (winRateEl) winRateEl.textContent = '—';
    } else {
      const sorted = Nexus.getSortedStandings(standings);
      const posIndex = sorted.findIndex(t => t.teamName === userTeam.name);
      const position = posIndex === -1 ? '—' : (posIndex + 1) + (posIndex === 0 ? 'st' : posIndex === 1 ? 'nd' : posIndex === 2 ? 'rd' : 'th');
      posEl.textContent = position;
      const s = standings[userTeam.name];
      recEl.textContent = (s.wins || 0) + 'W - ' + (s.losses || 0) + 'L';
      if (winRateEl) {
        const w = s.wins || 0;
        const l = s.losses || 0;
        const total = w + l;
        winRateEl.textContent = total > 0 ? (Math.round((w / total) * 100) + '%') : '—';
      }
    }

    let outcome = '—';
    if (phase === 'regular') {
      outcome = isChallengerManager ? 'Challenger – in progress' : 'Season in progress';
    } else if (phase === 'playoffs' && seasonData.playoffsBracket) {
      const r = seasonData.playoffsBracket.round;
      outcome = 'Championship Playoffs – Round ' + r + (r === 1 ? ' (Quarterfinals)' : ' (Final)');
    } else if (phase === 'finished') {
      if (seasonData.champion && seasonData.champion.name === userTeam.name) {
        outcome = 'Championship: Winner';
      } else if (seasonData.relegationCandidates && seasonData.relegationCandidates.some(t => t.name === userTeam.name)) {
        const rel = (seasonData.relegationResults || []).find(r => r.mainTeam === userTeam.name);
        outcome = rel ? (rel.winner === userTeam.name ? 'Relegation: Stayed in Main' : 'Relegation: Relegated to Challenger') : 'Relegation: Stayed in Main';
      } else if (seasonData.challengerPromotion && seasonData.challengerPromotion.some(t => t.name === userTeam.name)) {
        const rel = (seasonData.relegationResults || []).find(r => r.challengerTeam === userTeam.name);
        outcome = rel ? (rel.winner === userTeam.name ? 'Challenger Championship: Promoted to Main' : 'Challenger Championship: Stayed in Challenger') : 'Challenger Championship: Stayed in Challenger';
      } else {
        outcome = 'Championship Playoffs: Eliminated';
      }
    } else if (phase === 'relegation') {
      const inMain = seasonData.relegationCandidates && seasonData.relegationCandidates.some(t => t.name === userTeam.name);
      const inChall = seasonData.challengerPromotion && seasonData.challengerPromotion.some(t => t.name === userTeam.name);
      if (inMain) outcome = 'Relegation tournament (Main) – pending';
      else if (inChall) outcome = 'Challenger Championship – pending';
      else outcome = '—';
    }
    outEl.textContent = outcome;

    const retiredTotalEl = document.getElementById('careerRetiredTotal');
    if (retiredTotalEl) {
      const totalRetired = (seasonHistory || []).reduce((sum, e) => sum + (e.retiredCount || 0), 0);
      retiredTotalEl.textContent = totalRetired;
    }

    const pastEl = document.getElementById('careerPastSeasons');
    if (pastEl) {
      if (!seasonHistory || seasonHistory.length === 0) {
        pastEl.innerHTML = '<div class="schedule-day">No past seasons yet.</div>';
      } else {
        pastEl.innerHTML = '';
        if (!pastSeasonModalSetupDone) {
          var pastModal = document.getElementById('pastSeasonDetailModal');
          var pastCloseBtn = document.getElementById('pastSeasonDetailModalClose');
          if (pastModal && pastCloseBtn) {
            pastCloseBtn.addEventListener('click', closePastSeasonModal);
            pastModal.addEventListener('click', function(e) { if (e.target === pastModal) closePastSeasonModal(); });
          }
          pastSeasonModalSetupDone = true;
        }
        seasonHistory.slice().reverse().forEach((entry, i) => {
          const displayNum = i + 1;
          const card = document.createElement('div');
          card.className = 'career-past-card career-past-card--clickable';
          const rec = entry.record || { w: 0, l: 0 };
          const winRate = entry.winRate != null ? Math.round(entry.winRate * 100) + '%' : '—';
          card.innerHTML = `
            <div class="career-past-header">Season ${displayNum}</div>
            <div class="career-past-row"><span>Position</span><span>${entry.position != null ? entry.position + (entry.position === 1 ? 'st' : entry.position === 2 ? 'nd' : entry.position === 3 ? 'rd' : 'th') : '—'}</span></div>
            <div class="career-past-row"><span>Record</span><span>${rec.w}W - ${rec.l}L</span></div>
            <div class="career-past-row"><span>Win rate</span><span>${winRate}</span></div>
            <div class="career-past-row"><span>Outcome</span><span>${entry.outcome || '—'}</span></div>
            ${(entry.retiredCount && entry.retiredCount > 0) ? '<div class="career-past-row"><span>Retired</span><span>' + entry.retiredCount + ' players</span></div>' : ''}
            ${entry.champion ? '<div class="career-past-champ">Champion: ' + entry.champion + '</div>' : ''}
          `;
          card.addEventListener('click', function() { openPastSeasonModal(entry, displayNum); });
          pastEl.appendChild(card);
        });
      }
    }
  }

  // ===== STANDINGS UI =====
  function renderStandingsBlock(container, seasonData, blockTitle, isAppend) {
    const phase = seasonData.phase || 'regular';
    let sorted = Nexus.getSortedStandings(seasonData.standings || {});
    let title = blockTitle || '';
    if (phase === 'relegation' && seasonData.relegationCandidates && !blockTitle) {
      title = 'Relegation: bottom 2 vs Challenger top 2 — ';
    } else if (!blockTitle) {
      if (phase === 'playoffs') title = 'Regular season (final) ';
      if (phase === 'finished' && seasonData.champion) title = 'Champion: ' + seasonData.champion.name + ' — ';
    }
    if (!isAppend) container.innerHTML = '';
    if (title) {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'schedule-day';
      titleDiv.textContent = title;
      container.appendChild(titleDiv);
    }
    const allTeamsForLookup = (seasonData.teams && seasonData.teams.length) ? seasonData.teams : [...(league || []), ...(challengerLeague || [])];
    sorted.forEach((team, index) => {
      const row = document.createElement('div');
      row.className = 'list-row';
      const teamName = team.teamName;
      const fullTeam = (seasonData.teams || []).find(t => t && t.name === teamName) || allTeamsForLookup.find(t => t && t.name === teamName);
      const isUserTeam = userTeamRef && userTeamRef() && userTeamRef().name === teamName;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'standings-team-name';
      btn.setAttribute('data-team-name', teamName);
      btn.textContent = index + 1 + '. ' + teamName;
      btn.disabled = !!isUserTeam;
      const recordSpan = document.createElement('span');
      recordSpan.textContent = team.wins + 'W - ' + team.losses + 'L';
      row.appendChild(btn);
      row.appendChild(recordSpan);
      if (fullTeam && !isUserTeam && typeof openOtherTeamRosterModalRef === 'function') {
        btn.addEventListener('click', () => openOtherTeamRosterModalRef(fullTeam));
      }
      if (isUserTeam) btn.title = 'Your team';
      container.appendChild(row);
    });
  }

  function updateStandingsUI(seasonData) {
    const container = document.getElementById('standings');
    if (!container) return;

    const phase = seasonData.phase || 'regular';
    let mainTitle = '';
    if (phase === 'relegation' && seasonData.relegationCandidates) mainTitle = 'Relegation: bottom 2 vs Challenger top 2 — ';
    else {
      if (phase === 'playoffs') mainTitle = 'Regular season (final) ';
      if (phase === 'finished' && seasonData.champion) mainTitle = 'Champion: ' + seasonData.champion.name + ' — ';
    }
    renderStandingsBlock(container, seasonData, mainTitle || 'Main League', false);

    if (challengerSeason && challengerSeason.teams && challengerSeason.teams.length) {
      const chTitle = document.createElement('div');
      chTitle.className = 'schedule-day';
      chTitle.style.marginTop = '1rem';
      chTitle.textContent = 'Challenger League';
      container.appendChild(chTitle);
      const chSorted = Nexus.getSortedStandings(challengerSeason.standings || {});
      const allTeamsForLookup = [...(league || []), ...(challengerLeague || [])];
      chSorted.forEach((team, index) => {
        const row = document.createElement('div');
        row.className = 'list-row';
        const teamName = team.teamName;
        const fullTeam = (challengerSeason.teams || []).find(t => t && t.name === teamName) || allTeamsForLookup.find(t => t && t.name === teamName);
        const isUserTeam = userTeamRef && userTeamRef() && userTeamRef().name === teamName;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'standings-team-name';
        btn.setAttribute('data-team-name', teamName);
        btn.textContent = index + 1 + '. ' + teamName;
        btn.disabled = !!isUserTeam;
        const recordSpan = document.createElement('span');
        recordSpan.textContent = team.wins + 'W - ' + team.losses + 'L';
        row.appendChild(btn);
        row.appendChild(recordSpan);
        if (fullTeam && !isUserTeam && typeof openOtherTeamRosterModalRef === 'function') {
          btn.addEventListener('click', () => openOtherTeamRosterModalRef(fullTeam));
        }
        if (isUserTeam) btn.title = 'Your team';
        container.appendChild(row);
      });
    }
  }

  // ===== FINANCE DASHBOARD =====
  function updateFinanceUI(userTeam) {
    if (!userTeam || !userTeam.finance) return;
    const capEl = document.getElementById('uiCapital');
    const costEl = document.getElementById('uiCost');
    const revEl = document.getElementById('uiRevenue');
    const runwayEl = document.getElementById('uiRunway');
    if (capEl) capEl.textContent = '$' + userTeam.finance.capital.toLocaleString();
    if (costEl) costEl.textContent = '$' + userTeam.finance.monthlyCost.toLocaleString();
    if (revEl) revEl.textContent = '$' + (userTeam.finance.revenueThisSeason != null ? userTeam.finance.revenueThisSeason : 0).toLocaleString();
    if (runwayEl) {
      const months = userTeam.finance.monthlyCost > 0
        ? Math.floor(userTeam.finance.capital / userTeam.finance.monthlyCost)
        : 0;
      runwayEl.textContent = months + ' month' + (months !== 1 ? 's' : '');
    }
  }

  // ===== ROSTER UI (your team = LEAGUE[0]) =====
  function getMetaBadgeForPlayer(player, meta) {
    if (!meta) return '';
    const role = player.assignedRole || player.roleBias.primaryRoleBias;
    const favored = (meta.favoredRoles && meta.favoredRoles) || [];
    const nerfed = (meta.nerfedRoles && meta.nerfedRoles) || [];
    if (favored.includes(role)) return '<span class="badge badge--meta">META</span>';
    if (nerfed.includes(role)) return '<span class="badge badge--nerfed">NERFED</span>';
    return '';
  }

  function getAgePhaseClass(age) {
    const phase = Nexus.getAgePhase ? Nexus.getAgePhase(age) : 'peak';
    return 'age-badge--' + phase;
  }

  function getAgeAndRetirementBadges(player) {
    const age = player.age != null ? player.age : 20;
    const phaseClass = getAgePhaseClass(age);
    let badges = '<span class="age-badge ' + phaseClass + '">' + age + '</span>';
    if (age >= 28) badges += ' <span class="badge badge--retirement">Last Season</span>';
    else if (age >= 27) badges += ' <span class="badge badge--retiring">Retiring Soon</span>';
    return badges;
  }

  const BENCH_SLOT_COUNT = 5;
  const RESERVE_SLOT_COUNT = 6;
  const BENCH_COUNT_FOR_MATCH = 3;
  const RESERVE_COUNT_FOR_MATCH = 4;

  function ensureUserTeamSlots(team) {
    if (!team || team !== league[0]) return;
    const players = team.players || [];
    if (!Array.isArray(team.starterSlots) || team.starterSlots.length !== 5) {
      team.starterSlots = [];
      for (let i = 0; i < 5; i++) team.starterSlots.push(players[i] || null);
      team.benchSlots = [];
      for (let i = 0; i < BENCH_SLOT_COUNT; i++) team.benchSlots.push(players[5 + i] || null);
      team.reserveSlots = [];
      for (let i = 0; i < RESERVE_SLOT_COUNT; i++) team.reserveSlots.push(null);
      return;
    }
    if (!Array.isArray(team.benchSlots) || team.benchSlots.length !== BENCH_SLOT_COUNT || !Array.isArray(team.reserveSlots) || team.reserveSlots.length !== RESERVE_SLOT_COUNT) {
      const bench = (team.benchSlots || []).filter(Boolean);
      const res = (team.reserves || []).concat((team.reserveSlots || []).filter(Boolean));
      team.benchSlots = [];
      for (let i = 0; i < BENCH_SLOT_COUNT; i++) team.benchSlots.push(bench[i] || null);
      team.reserveSlots = [];
      for (let i = 0; i < RESERVE_SLOT_COUNT; i++) team.reserveSlots.push(res[i] || null);
    }
    const inStarters = (team.starterSlots || []).filter(Boolean);
    const inBench = (team.benchSlots || []).filter(Boolean);
    const inReserveSlots = (team.reserveSlots || []).filter(Boolean);
    players.forEach(p => {
      if (!p || inStarters.includes(p) || inBench.includes(p) || inReserveSlots.includes(p)) return;
      const rj = (team.reserveSlots || []).findIndex(s => s == null);
      if (rj >= 0) team.reserveSlots[rj] = p;
    });
  }

  function syncUserTeamPlayersFromSlots(team) {
    if (!team || team !== league[0] || !Array.isArray(team.starterSlots)) return;
    const starters = (team.starterSlots || []).filter(Boolean);
    const bench = (team.benchSlots || []).filter(Boolean);
    const reserves = (team.reserveSlots || []).filter(Boolean);
    team.players = [...starters, ...bench, ...reserves];
    team.starters = team.players.slice(0, 5);
    team.bench = team.players.slice(5, 8);
  }

  function updateRosterUI() {
    const startingEl = document.getElementById('startingRoster');
    const benchEl = document.getElementById('benchRoster');
    const reserveEl = document.getElementById('reserveRoster');
    const impactEl = document.getElementById('rosterMetaImpact');
    const warningEl = document.getElementById('rosterContractWarning');
    const warningTextEl = document.getElementById('rosterContractWarningText');
    if (!startingEl || !benchEl) return;

    const yourTeam = league[0];
    if (!yourTeam) return;

    ensureUserTeamSlots(yourTeam);
    syncUserTeamPlayersFromSlots(yourTeam);
    const starterSlots = yourTeam.starterSlots || [];
    const benchSlots = yourTeam.benchSlots || [];
    const reserveSlots = yourTeam.reserveSlots || [];
    const allPlayers = yourTeam.players;
    const finalYearPlayers = allPlayers.filter(p => (p.contractYears != null ? p.contractYears : 1) === 1);
    if (warningEl && warningTextEl) {
      if (finalYearPlayers.length > 0) {
        warningEl.classList.remove('is-hidden');
        const names = finalYearPlayers.map(p => getPlayerDisplayName(p)).join(', ');
        warningTextEl.textContent = finalYearPlayers.length + ' player(s) entering final year of contract: ' + names + '. Consider offering renewals.';
      } else {
        warningEl.classList.add('is-hidden');
        warningTextEl.textContent = '';
      }
    }

    const currentMeta = meta && (meta.name || meta.id) ? meta : (Nexus.getCurrentMeta ? Nexus.getCurrentMeta() : null);
    if (Nexus.analyzeMetaImpactOnRoster && currentMeta && impactEl) {
      const impact = Nexus.analyzeMetaImpactOnRoster(yourTeam, currentMeta);
      impactEl.textContent = impact.buffed + ' buffed, ' + impact.nerfed + ' nerfed by current meta.';
    } else if (impactEl) {
      impactEl.textContent = '—';
    }

    startingEl.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const p = starterSlots[i];
      const card = document.createElement('div');
      if (p) {
        card.className = 'player-card player-card--clickable';
        const badge = getMetaBadgeForPlayer(p, currentMeta);
        const ageBadges = getAgeAndRetirementBadges(p);
        const years = p.contractYears != null ? p.contractYears : 1;
        const salary = p.salary != null ? p.salary : 5000;
        const isFinalYear = years === 1;
        const contractClass = isFinalYear ? 'player-card__contract player-card__contract--final' : 'player-card__contract';
        const playerIdx = allPlayers.indexOf(p);
        card.dataset.playerIndex = playerIdx;
        card.innerHTML = `
          <div class="player-card__header">
            <strong>${getPlayerDisplayName(p)}</strong>
            <span class="player-card__badges">${ageBadges} ${badge}</span>
          </div>
          <span class="player-role-primary">Primary: ${p.roleBias.primaryRoleBias}</span>
          <span class="player-role-secondary">Secondary: ${p.roleBias.secondaryRoleBias}</span>
          <span class="player-flex">Flex: ${p.roleBias.flexPotential}</span>
          <div class="${contractClass}">Contract: ${years} year(s) left · $${salary.toLocaleString()}/mo</div>
          <button type="button" class="btn btn--offer-contract" data-player-index="${playerIdx}">Offer new contract</button>
        `;
      } else {
        card.className = 'player-card player-card--empty';
        card.innerHTML = '<div class="player-card__empty">Empty slot</div>';
        card.dataset.slotType = 'starter';
        card.dataset.slotIndex = String(i);
      }
      startingEl.appendChild(card);
    }

    benchEl.innerHTML = '';
    for (let i = 0; i < BENCH_SLOT_COUNT; i++) {
      const p = benchSlots[i];
      if (!p && i >= BENCH_COUNT_FOR_MATCH) continue;
      const row = document.createElement('div');
      if (p) {
        row.className = 'bench-row bench-row--clickable';
        const playerIdx = allPlayers.indexOf(p);
        row.dataset.playerIndex = playerIdx;
        const badge = getMetaBadgeForPlayer(p, currentMeta);
        const years = p.contractYears != null ? p.contractYears : 1;
        const salary = p.salary != null ? p.salary : 5000;
        const isFinalYear = years === 1;
        const contractClass = isFinalYear ? 'player-contract-info player-contract-info--final' : 'player-contract-info';
        row.innerHTML = `
          <span class="bench-row__name">${getPlayerDisplayName(p)} <span class="age-badge ${getAgePhaseClass(p.age)}">${p.age != null ? p.age : '?'}</span></span>
          <span class="bench-row__role">Primary: ${p.roleBias.primaryRoleBias}</span>
          <span class="bench-row__role bench-row__role--sec">Secondary: ${p.roleBias.secondaryRoleBias}</span>
          <span class="${contractClass}">${years}y · $${salary.toLocaleString()}/mo</span>
          ${badge ? '<span class="bench-badge">' + badge + '</span>' : ''}
          <span class="bench-row__actions">
            <button type="button" class="btn btn--offer-contract" data-player-index="${playerIdx}">Renew</button>
            <button type="button" class="btn btn--small btn--add-to-starters" data-player-index="${playerIdx}">Add to starters</button>
            <button type="button" class="btn btn--small btn--add-to-reserves" data-player-index="${playerIdx}">Add to reserves</button>
          </span>
        `;
      } else {
        row.className = 'bench-row bench-row--empty';
        row.innerHTML = '<span class="bench-row__name">Empty slot</span>';
        row.dataset.slotType = 'bench';
        row.dataset.slotIndex = String(i);
      }
      benchEl.appendChild(row);
    }

    if (reserveEl) {
      reserveEl.innerHTML = '';
      for (let i = 0; i < RESERVE_SLOT_COUNT; i++) {
        const p = reserveSlots[i];
        if (!p && i >= RESERVE_COUNT_FOR_MATCH) continue;
        const row = document.createElement('div');
        if (p) {
          row.className = 'reserve-row reserve-row--clickable';
          const playerIdx = allPlayers.indexOf(p);
          if (playerIdx < 0) continue;
          row.dataset.playerIndex = playerIdx;
          const badge = getMetaBadgeForPlayer(p, currentMeta);
          const years = p.contractYears != null ? p.contractYears : 1;
          const salary = p.salary != null ? p.salary : 5000;
          const isFinalYear = years === 1;
          const contractClass = isFinalYear ? 'player-contract-info player-contract-info--final' : 'player-contract-info';
          row.innerHTML = `
            <span class="reserve-row__name">${getPlayerDisplayName(p)} <span class="age-badge ${getAgePhaseClass(p.age)}">${p.age != null ? p.age : '?'}</span></span>
            <span class="reserve-row__role">Primary: ${p.roleBias.primaryRoleBias}</span>
            <span class="reserve-row__role reserve-row__role--sec">Secondary: ${p.roleBias.secondaryRoleBias}</span>
            <span class="${contractClass}">${years}y · $${salary.toLocaleString()}/mo</span>
            ${badge ? '<span class="reserve-badge">' + badge + '</span>' : ''}
            <span class="reserve-row__actions">
              <button type="button" class="btn btn--offer-contract" data-player-index="${playerIdx}">Renew</button>
              <button type="button" class="btn btn--small btn--add-to-bench" data-player-index="${playerIdx}">Add to bench</button>
            </span>
          `;
        } else {
          row.className = 'reserve-row reserve-row--empty';
          row.innerHTML = '<span class="reserve-row__name">Empty slot</span>';
          row.dataset.slotType = 'reserve';
          row.dataset.slotIndex = String(i);
        }
        reserveEl.appendChild(row);
      }
    }
  }

  function formatStatKey(k) {
    if (k === 'utilityIQ') return 'Utility IQ';
    return (k || '').replace(/([A-Z])/g, ' $1').replace(/^\w/, s => s.toUpperCase()).trim();
  }

  function buildPlayerStatsHTML(player) {
    if (!player || !player.stats) return '';
    const keys = typeof STAT_KEYS !== 'undefined' ? STAT_KEYS : ['aim', 'reaction', 'gameSense', 'positioning', 'utilityIQ', 'decisionSpeed', 'adaptability', 'consistency', 'mental', 'communication'];
    return keys.map(k => {
      const raw = player.stats[k] && player.stats[k].current != null ? player.stats[k].current : null;
      const v = raw != null ? Math.round(raw) : '—';
      return '<div class="player-detail-stat"><span class="player-detail-stat__label">' + formatStatKey(k) + '</span><span class="player-detail-stat__value">' + v + '</span></div>';
    }).join('');
  }

  function setupPlayerDetailModal() {
    const modal = document.getElementById('playerDetailModal');
    const nameEl = document.getElementById('playerDetailName');
    const ageEl = document.getElementById('playerDetailAge');
    const rolePrimaryEl = document.getElementById('playerDetailRolePrimary');
    const roleSecondaryEl = document.getElementById('playerDetailRoleSecondary');
    const roleFlexEl = document.getElementById('playerDetailRoleFlex');
    const statsEl = document.getElementById('playerDetailStats');
    const contractEl = document.getElementById('playerDetailContract');
    const moveToBenchBtn = document.getElementById('playerDetailMoveToBench');
    const moveToStarterBtn = document.getElementById('playerDetailMoveToStarter');
    const offerContractBtn = document.getElementById('playerDetailOfferContract');
    const sellBtn = document.getElementById('playerDetailSell');
    const closeBtn = document.getElementById('playerDetailClose');
    const rosterPage = document.querySelector('[data-page="roster"]');
    if (!modal || !nameEl || !statsEl || !rosterPage) return;

    let detailPlayer = null;

    function openDetailModal(player) {
      detailPlayer = player;
      const yourTeam = league && league[0];
      if (!yourTeam || !player) return;
      ensureUserTeamSlots(yourTeam);
      const inStarters = (yourTeam.starterSlots || []).indexOf(player) >= 0;
      const inBench = (yourTeam.benchSlots || []).indexOf(player) >= 0;
      const inReserves = (yourTeam.reserveSlots || []).indexOf(player) >= 0;
      nameEl.textContent = getPlayerDisplayName(player);
      ageEl.textContent = 'Age ' + (player.age != null ? player.age : '—');
      if (rolePrimaryEl) rolePrimaryEl.textContent = (player.roleBias && player.roleBias.primaryRoleBias) ? player.roleBias.primaryRoleBias : '—';
      if (roleSecondaryEl) roleSecondaryEl.textContent = (player.roleBias && player.roleBias.secondaryRoleBias) ? player.roleBias.secondaryRoleBias : '—';
      if (roleFlexEl) roleFlexEl.textContent = (player.roleBias && player.roleBias.flexPotential) ? player.roleBias.flexPotential : '—';
      statsEl.innerHTML = buildPlayerStatsHTML(player);
      const years = player.contractYears != null ? player.contractYears : 1;
      const salary = player.salary != null ? player.salary : 5000;
      contractEl.textContent = years + ' year(s) left · $' + salary.toLocaleString() + '/mo';
      moveToBenchBtn.style.display = (inStarters || inReserves) ? 'inline-block' : 'none';
      moveToStarterBtn.style.display = inBench ? 'inline-block' : 'none';
      modal.classList.remove('is-hidden');
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeDetailModal() {
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();
      }
      detailPlayer = null;
      modal.classList.add('is-hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    rosterPage.addEventListener('click', function(e) {
      if (e.target.closest('.btn--offer-contract') || e.target.closest('.btn--add-to-starters') || e.target.closest('.btn--add-to-reserves') || e.target.closest('.btn--add-to-bench')) return;
      const card = e.target.closest('.player-card--clickable');
      const row = e.target.closest('.bench-row--clickable');
      const reserveRow = e.target.closest('.reserve-row--clickable');
      const el = card || row || reserveRow;
      if (!el) return;
      const yourTeam = league && league[0];
      if (!yourTeam || !yourTeam.players) return;
      const idx = parseInt(el.dataset.playerIndex, 10);
      const player = yourTeam.players[idx];
      if (player) openDetailModal(player);
    });

    function movePlayerToBench(player) {
      const yourTeam = league && league[0];
      if (!yourTeam || yourTeam !== league[0] || !Array.isArray(yourTeam.starterSlots)) return;
      ensureUserTeamSlots(yourTeam);
      const starterSlots = yourTeam.starterSlots;
      const benchSlots = yourTeam.benchSlots;
      const reserveSlots = yourTeam.reserveSlots || [];
      const si = starterSlots.indexOf(player);
      if (si >= 0) {
        starterSlots[si] = null;
        const bj = benchSlots.findIndex(s => s == null);
        if (bj >= 0) benchSlots[bj] = player;
      } else {
        const rj = reserveSlots.indexOf(player);
        if (rj < 0) return;
        reserveSlots[rj] = null;
        const bj = benchSlots.findIndex(s => s == null);
        if (bj >= 0) benchSlots[bj] = player;
      }
      syncUserTeamPlayersFromSlots(yourTeam);
      updateRosterUI();
      closeDetailModal();
    }

    function movePlayerToStarter(player) {
      const yourTeam = league && league[0];
      if (!yourTeam || yourTeam !== league[0] || !Array.isArray(yourTeam.starterSlots)) return;
      ensureUserTeamSlots(yourTeam);
      const starterSlots = yourTeam.starterSlots;
      const benchSlots = yourTeam.benchSlots;
      const reserveSlots = yourTeam.reserveSlots || [];
      const si = starterSlots.findIndex(s => s == null);
      if (si < 0) return;
      const bj = benchSlots.indexOf(player);
      if (bj >= 0) {
        benchSlots[bj] = null;
        starterSlots[si] = player;
      } else {
        const rj = reserveSlots.indexOf(player);
        if (rj >= 0) {
          reserveSlots[rj] = null;
          starterSlots[si] = player;
        }
      }
      syncUserTeamPlayersFromSlots(yourTeam);
      updateRosterUI();
      closeDetailModal();
    }

    function movePlayerToReserves(player) {
      const yourTeam = league && league[0];
      if (!yourTeam || yourTeam !== league[0] || !Array.isArray(yourTeam.benchSlots)) return;
      ensureUserTeamSlots(yourTeam);
      const benchSlots = yourTeam.benchSlots;
      const reserveSlots = yourTeam.reserveSlots || [];
      const bj = benchSlots.indexOf(player);
      if (bj < 0) return;
      benchSlots[bj] = null;
      const rj = reserveSlots.findIndex(s => s == null);
      if (rj >= 0) reserveSlots[rj] = player;
      syncUserTeamPlayersFromSlots(yourTeam);
      updateRosterUI();
      closeDetailModal();
    }

    rosterPage.addEventListener('click', function(e) {
      const addStarters = e.target.closest('.btn--add-to-starters');
      const addReserves = e.target.closest('.btn--add-to-reserves');
      const addBench = e.target.closest('.btn--add-to-bench');
      const yourTeam = league && league[0];
      if (!yourTeam || !yourTeam.players) return;
      if (addStarters) {
        const idx = parseInt(addStarters.getAttribute('data-player-index'), 10);
        const player = yourTeam.players[idx];
        if (player) movePlayerToStarter(player);
        return;
      }
      if (addReserves) {
        const idx = parseInt(addReserves.getAttribute('data-player-index'), 10);
        const player = yourTeam.players[idx];
        if (player) movePlayerToReserves(player);
        return;
      }
      if (addBench) {
        const idx = parseInt(addBench.getAttribute('data-player-index'), 10);
        const player = yourTeam.players[idx];
        if (player) movePlayerToBench(player);
        return;
      }
    });

    moveToBenchBtn.addEventListener('click', () => { if (detailPlayer) movePlayerToBench(detailPlayer); });
    moveToStarterBtn.addEventListener('click', () => { if (detailPlayer) movePlayerToStarter(detailPlayer); });
    offerContractBtn.addEventListener('click', () => {
      if (!detailPlayer) return;
      const playerToOffer = detailPlayer;
      closeDetailModal();
      document.dispatchEvent(new CustomEvent('nexus:openContractOffer', { detail: { player: playerToOffer } }));
    });
    sellBtn.addEventListener('click', () => {
      if (!detailPlayer) return;
      const yourTeam = league && league[0];
      if (!yourTeam || !yourTeam.players) return;
      const playerToSell = detailPlayer;
      const name = getPlayerDisplayName(playerToSell);
      const estimatedFee = Math.round((typeof calculatePlayerValue === 'function' ? calculatePlayerValue(playerToSell) : 10000) * 0.8);
      showConfirm('Sell ' + name + '? You will receive approximately $' + estimatedFee.toLocaleString() + ' (80% of value). Continue?', function() {
        const result = Nexus.sellPlayer({ userTeam: yourTeam, player: playerToSell });
        closeDetailModal();
        if (result && result.success) {
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
          updateRosterUI();
          showNotification(result.message || ('Sold ' + name), 'success');
        } else {
          showNotification(result && result.message ? result.message : 'Could not sell player.', 'error');
        }
      });
    });
    closeBtn.addEventListener('click', closeDetailModal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeDetailModal(); });
  }

  function setupContractOfferModal() {
    const modal = document.getElementById('contractOfferModal');
    const playerNameEl = document.getElementById('contractOfferPlayerName');
    const yearsEl = document.getElementById('contractOfferYears');
    const salaryEl = document.getElementById('contractOfferSalary');
    const cancelBtn = document.getElementById('contractOfferCancel');
    const confirmBtn = document.getElementById('contractOfferConfirm');
    const rosterPage = document.querySelector('[data-page="roster"]');
    if (!modal || !playerNameEl || !yearsEl || !salaryEl || !cancelBtn || !confirmBtn || !rosterPage) return;

    let currentPlayer = null;

    function openModal(player) {
      currentPlayer = player;
      playerNameEl.textContent = getPlayerDisplayName(player);
      const currentSalary = player.salary != null ? player.salary : 5000;
      salaryEl.value = Math.round(currentSalary * 1.1);
      yearsEl.value = '2';
      modal.classList.remove('is-hidden');
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();
      }
      currentPlayer = null;
      modal.classList.add('is-hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    rosterPage.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn--offer-contract');
      if (!btn) return;
      const yourTeam = league && league[0];
      if (!yourTeam || !yourTeam.players) return;
      const idx = parseInt(btn.getAttribute('data-player-index'), 10);
      const player = yourTeam.players[idx];
      if (player) openModal(player);
    });
    document.addEventListener('nexus:openContractOffer', function(e) {
      if (e.detail && e.detail.player) openModal(e.detail.player);
    });

    cancelBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', () => {
      if (!currentPlayer) return;
      const player = currentPlayer;
      const playerName = getPlayerDisplayName(player);
      const yourTeam = league && league[0];
      const years = parseInt(yearsEl.value, 10) || 2;
      const salary = parseInt(salaryEl.value, 10) || player.salary || 5000;
      const oldSalary = player.salary != null ? player.salary : 0;
      const result = Nexus.offerContractRenewal ? Nexus.offerContractRenewal(player, years, salary) : { accepted: false, reason: 'Not available' };
      closeModal();
      if (result.accepted) {
        if (yourTeam && yourTeam.finance && yourTeam.finance.monthlyCost != null) {
          yourTeam.finance.monthlyCost += (salary - oldSalary);
        }
        if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
        updateRosterUI();
        showNotification(playerName + ' accepted the new contract (' + years + ' years, $' + salary.toLocaleString() + '/mo).', 'success');
      } else {
        showNotification(playerName + ' declined: ' + (result.reason || 'wants higher salary') + '.', 'info');
      }
    });
  }

  function setupMarketPlayerModal() {
    const modal = document.getElementById('marketPlayerModal');
    const nameEl = document.getElementById('marketPlayerName');
    const metaEl = document.getElementById('marketPlayerMeta');
    const statsEl = document.getElementById('marketPlayerStats');
    const priceEl = document.getElementById('marketPlayerPrice');
    const closeBtn = document.getElementById('marketPlayerModalClose');
    const buyBtn = document.getElementById('marketPlayerModalBuy');
    if (!modal || !nameEl || !statsEl || !priceEl || !buyBtn) return;

    let marketModalContext = null;

    function closeMarketModal() {
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();
      }
      marketModalContext = null;
      modal.classList.add('is-hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    openMarketPlayerModalRef = function(data) {
      if (!data) return;
      marketModalContext = data;
      const player = data.type === 'listing' ? data.listing.player : (data.type === 'buyFromClub' ? data.player : data.player);
      if (!player) return;
      nameEl.textContent = getPlayerDisplayName(player);
      if (metaEl) metaEl.textContent = 'Age ' + (player.age != null ? player.age : '—') + ' · Primary: ' + (player.roleBias ? player.roleBias.primaryRoleBias : '—') + ' · Secondary: ' + (player.roleBias ? player.roleBias.secondaryRoleBias : '—');
      statsEl.innerHTML = buildPlayerStatsHTML(player);
      const errEl = document.getElementById('marketPlayerError');
      if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
      if (data.type === 'listing') {
        const listing = data.listing;
        priceEl.innerHTML = '<strong>Transfer fee: $' + (listing.askingPrice || 0).toLocaleString() + '</strong><br><span class="salary">Salary: $' + (player.salary || 0).toLocaleString() + '/mo</span>';
        buyBtn.textContent = 'Buy';
      } else if (data.type === 'buyFromClub') {
        const baseValue = (window.Nexus.calculatePlayerValue && window.Nexus.calculatePlayerValue(player)) || 0;
        const askPrice = Math.round(baseValue * 1.15);
        priceEl.innerHTML = '<strong>Transfer fee: $' + askPrice.toLocaleString() + '</strong> <span class="salary">(15% markup)</span><br><span class="salary">Salary: $' + (player.salary || 0).toLocaleString() + '/mo</span>';
        buyBtn.textContent = 'Buy from club';
      } else {
        priceEl.innerHTML = '<strong>Free agent</strong><br><span class="salary">Salary: $' + (player.salary || 0).toLocaleString() + '/mo</span>';
        buyBtn.textContent = 'Sign (Free)';
      }
      modal.classList.remove('is-hidden');
      modal.setAttribute('aria-hidden', 'false');
    };

    buyBtn.addEventListener('click', () => {
      if (!marketModalContext) return;
      const { type, listing, player, seasonData, userTeam, sellerTeam } = marketModalContext;
      if (type === 'listing') {
        if (!userTeam || !listing) return;
        const errEl = document.getElementById('marketPlayerError');
        if (errEl) errEl.style.display = 'none';
        const check = Nexus.canAffordPlayer(userTeam, listing.askingPrice, listing.player.salary || 5000);
        if (!check.canAfford) {
          if (errEl) { errEl.textContent = check.reason || 'Cannot afford this transfer.'; errEl.style.display = 'block'; }
          return;
        }
        const result = Nexus.buyPlayer({ userTeam, sellerTeam: listing.team, player: listing.player, askingPrice: listing.askingPrice });
        if (result.success) {
          closeMarketModal();
          showNotification(result.message || 'Player signed.', 'success');
          if (seasonData && seasonData.transferMarket) seasonData.transferMarket = seasonData.transferMarket.filter(e => e !== listing);
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
          if (typeof updateRosterUI === 'function') updateRosterUI();
          renderTransferMarket(seasonData, userTeamRef());
        } else {
          if (errEl) { errEl.textContent = result.message || 'Transfer failed.'; errEl.style.display = 'block'; }
        }
      } else if (type === 'buyFromClub') {
        if (!userTeam || !sellerTeam || !player) return;
        const errEl = document.getElementById('marketPlayerError');
        if (errEl) errEl.style.display = 'none';
        const askPrice = Math.round(((Nexus.calculatePlayerValue && Nexus.calculatePlayerValue(player)) || 0) * 1.15);
        const check = Nexus.canAffordPlayer(userTeam, askPrice, player.salary || 5000);
        if (!check.canAfford) {
          if (errEl) { errEl.textContent = check.reason || 'Cannot afford this transfer.'; errEl.style.display = 'block'; }
          return;
        }
        const result = Nexus.buyPlayer({ userTeam, sellerTeam, player, askingPrice: askPrice, season: seasonData });
        if (result.success) {
          closeMarketModal();
          showNotification(result.message || 'Player signed from club.', 'success');
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
          if (typeof updateRosterUI === 'function') updateRosterUI();
          if (typeof updateStandingsUI === 'function' && seasonData) updateStandingsUI(seasonData);
        } else {
          if (errEl) { errEl.textContent = result.message || 'Transfer failed.'; errEl.style.display = 'block'; }
        }
      } else {
        if (!userTeam || !player) return;
        const errEl = document.getElementById('marketPlayerError');
        if (errEl) errEl.style.display = 'none';
        const result = Nexus.signFreeAgent(userTeam, player, player.salary);
        if (result.success) {
          closeMarketModal();
          showNotification(result.message || 'Free agent signed.', 'success');
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
          if (typeof updateRosterUI === 'function') updateRosterUI();
          renderTransferMarket(seasonData, userTeamRef());
        } else {
          if (errEl) { errEl.textContent = result.message || 'Signing failed.'; errEl.style.display = 'block'; }
        }
      }
    });
    closeBtn.addEventListener('click', closeMarketModal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeMarketModal(); });
  }

  function setupOtherTeamRosterModal() {
    const modal = document.getElementById('otherTeamRosterModal');
    const titleEl = document.getElementById('otherTeamRosterTitle');
    const startersEl = document.getElementById('otherTeamStarters');
    const benchEl = document.getElementById('otherTeamBench');
    const reservesEl = document.getElementById('otherTeamReserves');
    const closeBtn = document.getElementById('otherTeamRosterModalClose');
    if (!modal || !titleEl || !startersEl || !benchEl || !reservesEl) return;

    function closeRosterModal() {
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();
      }
      modal.classList.add('is-hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    function renderPlayerRow(p, sectionLabel) {
      const row = document.createElement('div');
      row.className = 'list-row list-row--clickable other-team-player-row';
      const rb = p.roleBias || {};
      const age = p.age != null ? p.age : '—';
      row.innerHTML = `
        <span class="other-team-player-name">${getPlayerDisplayName(p)}</span>
        <span class="age-badge age-badge--prime">${age}</span>
        <span>Primary: ${rb.primaryRoleBias || '—'}</span>
        <span>Secondary: ${rb.secondaryRoleBias || '—'}</span>
      `;
      row.addEventListener('click', () => {
        closeRosterModal();
        if (openMarketPlayerModalRef) {
          openMarketPlayerModalRef({
            type: 'buyFromClub',
            player: p,
            sellerTeam: currentOtherTeam,
            seasonData: season,
            userTeam: userTeamRef()
          });
        }
      });
      return row;
    }

    let currentOtherTeam = null;

    openOtherTeamRosterModalRef = function(team) {
      if (!team || !team.players) return;
      currentOtherTeam = team;
      titleEl.textContent = team.name || 'Roster';
      const starters = team.players.slice(0, 5);
      const bench = team.players.slice(5, 8);
      const reserves = team.players.slice(8);

      startersEl.innerHTML = '';
      starters.forEach(p => startersEl.appendChild(renderPlayerRow(p, 'Starters')));

      benchEl.innerHTML = '';
      bench.forEach(p => benchEl.appendChild(renderPlayerRow(p, 'Bench')));

      reservesEl.innerHTML = '';
      reserves.forEach(p => reservesEl.appendChild(renderPlayerRow(p, 'Reserves')));

      modal.classList.remove('is-hidden');
      modal.setAttribute('aria-hidden', 'false');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeRosterModal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeRosterModal(); });
  }

  function setupYouthAcademyPlayerModal() {
    const modal = document.getElementById('youthAcademyPlayerModal');
    const nameEl = document.getElementById('youthAcademyPlayerName');
    const ageEl = document.getElementById('youthAcademyPlayerAge');
    const rolePrimaryEl = document.getElementById('youthAcademyPlayerRolePrimary');
    const roleSecondaryEl = document.getElementById('youthAcademyPlayerRoleSecondary');
    const roleFlexEl = document.getElementById('youthAcademyPlayerRoleFlex');
    const statsEl = document.getElementById('youthAcademyPlayerStats');
    const salaryEl = document.getElementById('youthAcademyPlayerSalary');
    const promoteBtn = document.getElementById('youthAcademyPlayerPromote');
    const releaseBtn = document.getElementById('youthAcademyPlayerRelease');
    const closeBtn = document.getElementById('youthAcademyPlayerClose');
    const academyListings = document.getElementById('youthAcademyListings');
    if (!modal || !nameEl || !statsEl || !promoteBtn || !releaseBtn) return;

    let currentProspect = null;
    let currentUserTeam = null;

    function openYouthModal(prospect, userTeam) {
      currentProspect = prospect;
      currentUserTeam = userTeam;
      if (!prospect || !userTeam) return;
      nameEl.textContent = getPlayerDisplayName(prospect);
      ageEl.textContent = 'Age ' + (prospect.age != null ? prospect.age : '—');
      if (rolePrimaryEl) rolePrimaryEl.textContent = (prospect.roleBias && prospect.roleBias.primaryRoleBias) ? prospect.roleBias.primaryRoleBias : '—';
      if (roleSecondaryEl) roleSecondaryEl.textContent = (prospect.roleBias && prospect.roleBias.secondaryRoleBias) ? prospect.roleBias.secondaryRoleBias : '—';
      if (roleFlexEl) roleFlexEl.textContent = (prospect.roleBias && prospect.roleBias.flexPotential) ? prospect.roleBias.flexPotential : '—';
      statsEl.innerHTML = buildPlayerStatsHTML(prospect);
      if (salaryEl) salaryEl.textContent = '$' + (prospect.salary != null ? prospect.salary : 0).toLocaleString() + '/mo';
      const age = prospect.age != null ? prospect.age : 0;
      promoteBtn.disabled = age < 17;
      promoteBtn.title = age >= 17 ? 'Promote to main roster' : 'Available at 17';
      modal.classList.remove('is-hidden');
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeYouthModal() {
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();
      }
      currentProspect = null;
      currentUserTeam = null;
      modal.classList.add('is-hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    promoteBtn.addEventListener('click', () => {
      if (!currentProspect || !currentUserTeam) return;
      const result = Nexus.promoteYouthToRoster(currentUserTeam, currentProspect);
      if (result.success) {
        showNotification(result.message || 'Promoted to roster', 'success');
        closeYouthModal();
        updateYouthAcademyUI(userTeamRef());
        if (typeof updateRosterUI === 'function') updateRosterUI();
        if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
      } else showNotification(result.message || 'Promote failed', 'error');
    });

    releaseBtn.addEventListener('click', () => {
      if (!currentProspect || !currentUserTeam) return;
      const team = currentUserTeam;
      const prospect = currentProspect;
      const idx = (team.youthAcademy || []).indexOf(prospect);
      if (idx >= 0) team.youthAcademy.splice(idx, 1);
      const age = prospect.age != null ? prospect.age : 0;
      if (age <= 17) {
        (window.Nexus.YOUTH_MARKET = window.Nexus.YOUTH_MARKET || []).push(prospect);
      }
      if (team.finance && team.finance.monthlyCost != null) team.finance.monthlyCost -= (prospect.salary || 0);
      showNotification(getPlayerDisplayName(prospect) + ' released' + (age <= 17 ? ' (back to youth market)' : ''), 'info');
      closeYouthModal();
      updateYouthAcademyUI(userTeamRef());
      if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
    });

    if (closeBtn) closeBtn.addEventListener('click', closeYouthModal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeYouthModal(); });

    if (academyListings) {
      academyListings.addEventListener('click', function(e) {
        const card = e.target.closest('.market-card--clickable');
        if (!card) return;
        const idx = parseInt(card.getAttribute('data-academy-index'), 10);
        if (isNaN(idx)) return;
        const userTeam = userTeamRef();
        if (!userTeam || !userTeam.youthAcademy) return;
        const prospect = userTeam.youthAcademy[idx];
        if (prospect) openYouthModal(prospect, userTeam);
      });
    }
  }

  function getMarketAgePhaseClass(age) {
    if (age == null) return 'age-badge--prime';
    if (age <= 21) return 'age-badge--youth';
    if (age <= 25) return 'age-badge--prime';
    return 'age-badge--veteran';
  }

  const TRAINING_PLAN_KEYS = ['Mechanical', 'Tactical', 'Positional', 'Mental', 'Communication', 'Adaptive'];
  const TEAM_TRAINING_KEYS_UI = window.Nexus.TEAM_TRAINING_PLAN_KEYS || ['Fast Execute', 'Default Heavy', 'Contact Play', 'Utility Spam', 'Anti-Strat', 'Post-Plant'];

  function updateDevelopmentUI() {
    const userTeam = userTeamRef();
    const teamSelectEl = document.getElementById('teamTrainingSelect');
    const playerListEl = document.getElementById('developmentPlayerList');
    if (!teamSelectEl || !playerListEl) return;
    if (!userTeam) { playerListEl.innerHTML = ''; return; }
    if (userTeam.activeTeamTraining == null || userTeam.activeTeamTraining === '' || !TEAM_TRAINING_KEYS_UI.includes(userTeam.activeTeamTraining)) {
      userTeam.activeTeamTraining = TEAM_TRAINING_KEYS_UI[0];
    }
    teamSelectEl.value = userTeam.activeTeamTraining;
    teamSelectEl.onchange = function() {
      userTeam.activeTeamTraining = teamSelectEl.value;
      const trainingEl = document.getElementById('uiActiveTeamTraining');
      const trainingDescEl = document.getElementById('uiActiveTeamTrainingDesc');
      const planName = userTeam.activeTeamTraining || '—';
      if (trainingEl) trainingEl.textContent = planName;
      if (trainingDescEl) {
        const plans = window.Nexus.TEAM_TRAINING_PLANS;
        const desc = (planName !== '—' && plans && plans[planName] && plans[planName].description) ? ' — ' + plans[planName].description : '';
        trainingDescEl.textContent = desc;
      }
    };
    const players = userTeam.players || [];
    const getOverall = window.Nexus.getPlayerOverall || (p => (p.stats && typeof STAT_KEYS !== 'undefined' ? Math.round(STAT_KEYS.reduce((s, k) => s + ((p.stats[k] && p.stats[k].current) || 0), 0) / STAT_KEYS.length) : 70));
    playerListEl.innerHTML = '';
    players.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'market-card development-player-card';
      const currentPlan = p.assignedTrainingPlan != null && TRAINING_PLAN_KEYS.includes(p.assignedTrainingPlan) ? p.assignedTrainingPlan : TRAINING_PLAN_KEYS[0];
      if (p.assignedTrainingPlan == null || !TRAINING_PLAN_KEYS.includes(p.assignedTrainingPlan)) p.assignedTrainingPlan = TRAINING_PLAN_KEYS[0];
      const optionsHtml = TRAINING_PLAN_KEYS.map(k => '<option value="' + k + '"' + (k === currentPlan ? ' selected' : '') + '>' + k + '</option>').join('');
      card.innerHTML = `
        <div class="market-card__header">
          <strong>${getPlayerDisplayName(p)}</strong>
          <span class="age-badge">${p.age != null ? p.age : '—'}</span>
        </div>
        <div class="market-card__info">
          <span>Primary: ${(p.roleBias && p.roleBias.primaryRoleBias) || '—'}</span>
          <span>Overall: ${getOverall(p)}</span>
        </div>
        <label class="development-player-plan">Plan: <select data-player-idx="${idx}">${optionsHtml}</select></label>
      `;
      const sel = card.querySelector('select');
      sel.addEventListener('change', function() {
        const player = (userTeam.players || [])[parseInt(sel.getAttribute('data-player-idx'), 10)];
        if (player) player.assignedTrainingPlan = sel.value;
      });
      playerListEl.appendChild(card);
    });

    var youthListEl = document.getElementById('developmentYouthList');
    if (youthListEl) {
      var academy = (userTeam.youthAcademy || []);
      var statKeys = (typeof STAT_KEYS !== 'undefined' && STAT_KEYS) ? STAT_KEYS : ['aim', 'reaction', 'gameSense', 'positioning', 'utilityIQ', 'decisionSpeed', 'adaptability', 'consistency', 'mental', 'communication'];
      var currentMatchday = (typeof season !== 'undefined' && season && season.currentMatchday != null) ? season.currentMatchday : 0;
      if (academy.length === 0) {
        youthListEl.innerHTML = '<p class="panel__hint">No players in academy. Sign prospects from the Youth Market.</p>';
      } else {
        youthListEl.innerHTML = '';
        academy.forEach(function(prospect, idx) {
          if (window.Nexus.ensureYouthProspectRoleBias) window.Nexus.ensureYouthProspectRoleBias(prospect);
          var ticksThisMd = (prospect.lastTrainingMatchday === currentMatchday && prospect.ticksThisMatchday != null) ? prospect.ticksThisMatchday : 0;
          var statsTrainedThisMd = (prospect.lastTrainingMatchday === currentMatchday && Array.isArray(prospect.statsTrainedThisMatchday)) ? prospect.statsTrainedThisMatchday : [];
          var noTicksLeft = ticksThisMd >= 3;
          var card = document.createElement('div');
          card.className = 'market-card development-player-card development-youth-card';
          var overall = getOverall(prospect);
          var age = prospect.age != null ? prospect.age : '—';
          var primaryRole = (prospect.roleBias && prospect.roleBias.primaryRoleBias) || '';
          var primaryCoreStats = (typeof ROLES !== 'undefined' && primaryRole && ROLES[primaryRole] && ROLES[primaryRole].core) ? ROLES[primaryRole].core : [];
          var statRows = statKeys.map(function(sk) {
            var st = prospect.stats && prospect.stats[sk];
            var cur = st && st.current != null ? Math.round(st.current * 10) / 10 : '—';
            var cap = st && st.maxCap != null ? st.maxCap : '—';
            var atMax = st && st.current >= st.maxCap;
            var alreadyTrainedThisMd = statsTrainedThisMd.indexOf(sk) >= 0;
            var canTrain = !atMax && !alreadyTrainedThisMd && !noTicksLeft;
            var label = atMax ? 'Max' : (alreadyTrainedThisMd ? 'Done' : (noTicksLeft ? '—' : 'Train'));
            var btnHtml = canTrain ? '<button type="button" class="btn btn--small development-youth-train" data-academy-idx="' + idx + '" data-stat-key="' + sk + '">Train</button>' : '<span class="development-youth-tick-label">' + label + '</span>';
            var isPrimaryCore = primaryCoreStats.indexOf(sk) >= 0;
            var statLabel = isPrimaryCore ? '★ ' + sk : sk;
            return '<div class="development-youth-stat-row"><span class="development-youth-stat-name' + (isPrimaryCore ? ' development-youth-stat-name--primary' : '') + '">' + statLabel + '</span> <span class="development-youth-stat-val">' + cur + ' / ' + cap + '</span>' + btnHtml + '</div>';
          }).join('');
          card.innerHTML = '<div class="market-card__header"><strong>' + getPlayerDisplayName(prospect) + '</strong><span class="age-badge">' + age + '</span></div><div class="market-card__info"><span>Overall: ' + overall + '</span><span class="development-youth-ticks">' + ticksThisMd + '/3 ticks this matchday</span></div><div class="development-youth-stats">' + statRows + '</div>';
          youthListEl.appendChild(card);
        });
        youthListEl.querySelectorAll('.development-youth-train').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var idx = parseInt(btn.getAttribute('data-academy-idx'), 10);
            var statKey = btn.getAttribute('data-stat-key');
            var team = userTeamRef();
            if (!team || !team.youthAcademy || !team.youthAcademy[idx]) return;
            var prospect = team.youthAcademy[idx];
            var env = (typeof environmentMap !== 'undefined' && team.name && environmentMap[team.name]) ? environmentMap[team.name] : {};
            var result = window.Nexus.trainYouthProspect && window.Nexus.trainYouthProspect({ team: team, prospect: prospect, statKey: statKey, environment: env, season: typeof season !== 'undefined' ? season : null });
            if (result && result.success) {
              if (typeof showNotification === 'function') showNotification('+' + (result.growth != null ? result.growth.toFixed(2) : '0') + ' ' + statKey, 'success');
              if (typeof saveGameState === 'function') saveGameState();
              updateDevelopmentUI();
            } else if (result && result.message && typeof showNotification === 'function') {
              showNotification(result.message, 'error');
            }
          });
        });
      }
    }

    var historyEl = document.getElementById('developmentYouthHistory');
    if (historyEl) {
      var history = (userTeam && userTeam.youthTrainingHistory) ? userTeam.youthTrainingHistory : [];
      if (history.length === 0) {
        historyEl.innerHTML = '<p class="panel__hint">No youth training recorded yet. Train academy players above to see history here.</p>';
      } else {
        historyEl.innerHTML = history.map(function(day) {
          var md = day.matchday != null ? day.matchday : 0;
          var entries = (day.entries && day.entries.length) ? day.entries : [];
          var byPlayer = {};
          entries.forEach(function(e) {
            var key = (e.playerId != null ? e.playerId : e.playerName) || '?';
            if (!byPlayer[key]) byPlayer[key] = { name: e.playerName || '—', stats: [] };
            byPlayer[key].stats.push({ statKey: e.statKey, growth: e.growth != null ? e.growth : 0 });
          });
          var playerBlocks = Object.keys(byPlayer).map(function(key) {
            var p = byPlayer[key];
            var statParts = (p.stats || []).map(function(s) {
              var g = (s.growth != null && typeof s.growth === 'number') ? s.growth.toFixed(2) : '0';
              return s.statKey + ' (+' + g + ')';
            }).join(', ');
            return '<div class="development-youth-history-player"><strong>' + (p.name || '—') + '</strong>: ' + statParts + '</div>';
          }).join('');
          return '<div class="development-youth-history-day"><div class="development-youth-history-day-title">Matchday ' + (md + 1) + '</div><div class="development-youth-history-day-players">' + playerBlocks + '</div></div>';
        }).join('');
      }
    }
  }

  function updateYouthAcademyUI(userTeam) {
    const academyEl = document.getElementById('youthAcademyListings');
    const marketEl = document.getElementById('youthMarketListings');
    const getOverall = window.Nexus.getPlayerOverall || (p => (p.stats && STAT_KEYS ? Math.round(STAT_KEYS.reduce((s, k) => s + ((p.stats[k] && p.stats[k].current) || 0), 0) / STAT_KEYS.length) : 70));
    if (!academyEl || !marketEl) return;
    academyEl.innerHTML = '';
    marketEl.innerHTML = '';
    const academy = (userTeam && userTeam.youthAcademy) ? userTeam.youthAcademy : [];
    academy.forEach((p, idx) => {
      if (window.Nexus.ensureYouthProspectRoleBias) window.Nexus.ensureYouthProspectRoleBias(p);
      const age = p.age != null ? p.age : 16;
      const overall = getOverall(p);
      const card = document.createElement('div');
      card.className = 'market-card market-card--clickable';
      card.setAttribute('data-academy-index', String(idx));
      card.innerHTML = `
        <div class="market-card__header">
          <strong>${getPlayerDisplayName(p)}</strong>
          <span class="age-badge ${getMarketAgePhaseClass(age)}">${age}</span>
        </div>
        <div class="market-card__info">
          <span>Primary: ${(p.roleBias && p.roleBias.primaryRoleBias) || '—'}</span>
          <span>Secondary: ${(p.roleBias && p.roleBias.secondaryRoleBias) || '—'}</span>
          <span>Overall: ${overall}</span>
        </div>
        <div class="market-card__price"><span class="salary">$${(p.salary || 0).toLocaleString()}/mo</span></div>
        <span class="panel__hint">Click for details</span>
      `;
      academyEl.appendChild(card);
    });
    if (academy.length === 0) academyEl.innerHTML = '<div class="schedule-day">No players in academy. Sign prospects from the Youth Market below.</div>';
    const youthMarket = window.Nexus.YOUTH_MARKET || [];
    youthMarket.forEach((p, idx) => {
      if (window.Nexus.ensureYouthProspectRoleBias) window.Nexus.ensureYouthProspectRoleBias(p);
      const age = p.age != null ? p.age : 16;
      const overall = getOverall(p);
      const salary = p.salary || 4000;
      const card = document.createElement('div');
      card.className = 'market-card';
      card.innerHTML = `
        <div class="market-card__header">
          <strong>${getPlayerDisplayName(p)}</strong>
          <span class="age-badge ${getMarketAgePhaseClass(age)}">${age}</span>
        </div>
        <div class="market-card__info">
          <span>Primary: ${(p.roleBias && p.roleBias.primaryRoleBias) || '—'}</span>
          <span>Secondary: ${(p.roleBias && p.roleBias.secondaryRoleBias) || '—'}</span>
          <span>Overall: ${overall}</span>
          <span>Free (salary only)</span>
        </div>
        <div class="market-card__price"><span class="salary">$${salary.toLocaleString()}/mo</span></div>
        <button type="button" class="btn btn--buy btn--sign-youth" data-market-index="${idx}">Sign to academy</button>
      `;
      const btn = card.querySelector('.btn--sign-youth');
      btn.addEventListener('click', () => {
        const prospect = (window.Nexus.YOUTH_MARKET || [])[parseInt(btn.getAttribute('data-market-index'), 10)];
        if (!prospect || !userTeam) return;
        const result = Nexus.signYouthToAcademy(userTeam, prospect);
        if (result.success) {
          showNotification(result.message || 'Signed to academy', 'success');
          updateYouthAcademyUI(userTeamRef());
          if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
        } else showNotification(result.message || 'Sign failed', 'error');
      });
      marketEl.appendChild(card);
    });
    if (youthMarket.length === 0) marketEl.innerHTML = '<div class="schedule-day">No prospects available. Market refreshes every season.</div>';
  }

  function renderTransferMarket(seasonData, userTeam) {
    const listEl = document.getElementById('marketListings');
    const freeEl = document.getElementById('freeAgentsListings');
    const hintEl = document.getElementById('marketRefreshHint');
    if (!listEl) return;

    const countdown = seasonData && seasonData.transferMarketRefreshCountdown != null ? seasonData.transferMarketRefreshCountdown : 3;
    if (hintEl) hintEl.textContent = 'Market refreshes in ' + countdown + ' matchday(s)';

    const roleFilter = (document.getElementById('marketFilterRole') || {}).value;
    const ageFilter = (document.getElementById('marketFilterAge') || {}).value;
    const priceFilter = (document.getElementById('marketFilterPrice') || {}).value;

    const listings = (seasonData && seasonData.transferMarket) ? seasonData.transferMarket.slice() : [];
    let filtered = listings.filter(entry => {
      const p = entry.player;
      if (!p) return false;
      if (roleFilter && p.roleBias && p.roleBias.primaryRoleBias !== roleFilter && p.roleBias.secondaryRoleBias !== roleFilter) return false;
      const age = p.age != null ? p.age : 22;
      if (ageFilter === 'youth' && age > 21) return false;
      if (ageFilter === 'prime' && (age < 22 || age > 25)) return false;
      if (ageFilter === 'veteran' && age < 26) return false;
      const price = entry.askingPrice || 0;
      if (priceFilter === 'under50' && price >= 50000) return false;
      if (priceFilter === '50-150' && (price < 50000 || price > 150000)) return false;
      if (priceFilter === '150plus' && price < 150000) return false;
      return true;
    });

    listEl.innerHTML = '';
    const marketList = (seasonData && seasonData.transferMarket) || [];
    const getOverall = window.Nexus.getPlayerOverall || (p => 70);
    filtered.forEach((entry) => {
      const p = entry.player;
      const team = entry.team;
      const askingPrice = entry.askingPrice || 0;
      const salary = p.salary || 5000;
      const age = p.age != null ? p.age : 22;
      const overall = getOverall(p);
      const listingIndex = marketList.indexOf(entry);
      const card = document.createElement('div');
      card.className = 'market-card';
      card.innerHTML = `
        <div class="market-card__header">
          <strong>${getPlayerDisplayName(p)}</strong>
          <span class="age-badge ${getMarketAgePhaseClass(age)}">${age}</span>
        </div>
        <div class="market-card__info">
          <span>Primary: ${(p.roleBias && p.roleBias.primaryRoleBias) || '—'}</span>
          <span>Secondary: ${(p.roleBias && p.roleBias.secondaryRoleBias) || '—'}</span>
          <span>Overall: ${overall}</span>
          <span>Team: ${team && team.name ? team.name : '—'}</span>
        </div>
        <div class="market-card__price">
          <strong>$${askingPrice.toLocaleString()}</strong>
          <span class="salary">$${salary.toLocaleString()}/mo</span>
        </div>
        <button type="button" class="btn btn--buy" data-listing-index="${listingIndex}">Buy</button>
      `;
      const btn = card.querySelector('.btn--buy');
      btn.addEventListener('click', () => {
        const listing = marketList[parseInt(btn.getAttribute('data-listing-index'), 10)];
        if (listing && openMarketPlayerModalRef) openMarketPlayerModalRef({ type: 'listing', listing, seasonData, userTeam });
      });
      listEl.appendChild(card);
    });

    if (freeEl) {
      const freeAgents = window.Nexus.FREE_AGENTS || [];
      freeEl.innerHTML = '';
      freeAgents.forEach((p, faIdx) => {
        const salary = p.salary || 5000;
        const age = p.age != null ? p.age : 22;
        const overall = getOverall(p);
        const card = document.createElement('div');
        card.className = 'market-card';
        card.innerHTML = `
          <div class="market-card__header">
            <strong>${getPlayerDisplayName(p)}</strong>
            <span class="age-badge ${getMarketAgePhaseClass(age)}">${age}</span>
          </div>
          <div class="market-card__info">
            <span>Primary: ${(p.roleBias && p.roleBias.primaryRoleBias) || '—'}</span>
            <span>Secondary: ${(p.roleBias && p.roleBias.secondaryRoleBias) || '—'}</span>
            <span>Overall: ${overall}</span>
            <span>Free Agent</span>
          </div>
          <div class="market-card__price">
            <span class="salary">$${salary.toLocaleString()}/mo</span>
          </div>
          <button type="button" class="btn btn--buy btn--sign-free" data-free-index="${faIdx}">Sign (Free)</button>
        `;
        const fBtn = card.querySelector('.btn--sign-free');
        fBtn.addEventListener('click', () => {
          const fa = (window.Nexus.FREE_AGENTS || [])[parseInt(fBtn.getAttribute('data-free-index'), 10)];
          if (fa && openMarketPlayerModalRef) openMarketPlayerModalRef({ type: 'free', player: fa, seasonData, userTeam });
        });
        freeEl.appendChild(card);
      });
    }

    var historyEl = document.getElementById('transferHistoryList');
    if (historyEl) {
      var hist = (typeof transferHistory !== 'undefined' && Array.isArray(transferHistory)) ? transferHistory : [];
      var mainTeams = (typeof league !== 'undefined' && league) ? league : (window.Nexus.LEAGUE || []);
      var challTeams = (typeof challengerLeague !== 'undefined' && challengerLeague) ? challengerLeague : (window.Nexus.CHALLENGER_LEAGUE || []);
      var allTeams = (mainTeams || []).concat(challTeams || []);
      var byTeam = {};
      allTeams.forEach(function(t) { if (t && t.name) byTeam[t.name] = { name: t.name, tier: t.tier || 'Main', in: [], out: [] }; });
      hist.forEach(function(ev) {
        if (!ev || !ev.teamName) return;
        if (!byTeam[ev.teamName]) byTeam[ev.teamName] = { name: ev.teamName, tier: 'Main', in: [], out: [] };
        var text = ev.playerName || '—';
        if (ev.how === 'transfer' && ev.otherTeam) text += ' (' + (ev.direction === 'out' ? 'to ' + ev.otherTeam : 'from ' + ev.otherTeam) + ')';
        else if (ev.how === 'free_agents') text += ' (free agents)';
        else if (ev.how === 'market_refresh') text += ' (left market)';
        if (ev.direction === 'in') byTeam[ev.teamName].in.push(text);
        else byTeam[ev.teamName].out.push(text);
      });
      var mainNames = (mainTeams || []).map(function(t) { return t.name; }).filter(Boolean);
      var challNames = (challTeams || []).map(function(t) { return t.name; }).filter(Boolean);
      var order = mainNames.concat(challNames);
      if (order.length === 0) order = Object.keys(byTeam).sort();
      if (hist.length === 0) {
        historyEl.innerHTML = '<p class="panel__hint">No transfer activity yet. Transfers and free agent signings will appear here.</p>';
      } else {
        historyEl.innerHTML = order.map(function(teamName) {
          var row = byTeam[teamName];
          if (!row) return '';
          var tierLabel = (row.tier === 'Challenger') ? ' (Challenger)' : '';
          var inList = (row.in && row.in.length) ? row.in.join('; ') : '—';
          var outList = (row.out && row.out.length) ? row.out.join('; ') : '—';
          return '<div class="transfer-history-team"><div class="transfer-history-team-name">' + teamName + tierLabel + '</div><div class="transfer-history-row"><span class="transfer-history-label">In:</span> ' + inList + '</div><div class="transfer-history-row"><span class="transfer-history-label">Out:</span> ' + outList + '</div></div>';
        }).filter(Boolean).join('');
      }
    }
  }

  // ===== SCHEDULE UI (by matchday / phase) =====
  function updateScheduleUI(seasonData) {
    const container = document.getElementById('schedule');
    if (!container) return;

    container.innerHTML = '';
    const phase = seasonData.phase || 'regular';

    if (phase === 'playoffs' && seasonData.playoffsBracket) {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'schedule-day schedule-day--next';
      dayHeader.innerHTML = '<strong>Playoffs Round ' + seasonData.playoffsBracket.round + '</strong>';
      container.appendChild(dayHeader);
      seasonData.playoffsBracket.matches.forEach(match => {
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = `<span>${match.teamA.name} vs ${match.teamB.name}</span><span></span>`;
        container.appendChild(row);
      });
      appendChallengerSchedule(container);
      return;
    }

    if (phase === 'relegation' && seasonData.relegationCandidates && seasonData.challengerPromotion) {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'schedule-day schedule-day--next';
      dayHeader.innerHTML = '<strong>Relegation Tournament</strong> (Main vs Challenger)';
      container.appendChild(dayHeader);
      const main = seasonData.relegationCandidates;
      const chall = seasonData.challengerPromotion;
      for (let i = 0; i < 2 && main[i] && chall[i]; i++) {
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = `<span>${main[i].name} vs ${chall[i].name}</span><span>Bo1</span>`;
        container.appendChild(row);
      }
      appendChallengerSchedule(container);
      return;
    }

    if (phase === 'finished') {
      container.innerHTML = '<div class="schedule-day">Season complete</div>';
      if (seasonData.champion) {
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = '<span>Champion: ' + seasonData.champion.name + '</span><span></span>';
        container.appendChild(row);
      }
      appendChallengerSchedule(container);
      return;
    }

    (seasonData.matchdays || []).forEach((dayMatches, dayIndex) => {
      const played = dayIndex < seasonData.currentMatchday;
      const isNext = dayIndex === seasonData.currentMatchday;
      const dayResults = (seasonData.playedMatchResults || [])[dayIndex] || [];
      const dayHeader = document.createElement('div');
      dayHeader.className = 'schedule-day' + (isNext ? ' schedule-day--next' : '');
      dayHeader.innerHTML = `<strong>Matchday ${dayIndex + 1}</strong>${played ? ' (played)' : isNext ? ' (next)' : ''}`;
      container.appendChild(dayHeader);
      dayMatches.forEach(match => {
        const resultEntry = dayResults.find(
          r => (r.match.teamA.name === match.teamA.name && r.match.teamB.name === match.teamB.name)
        );
        const scoreText = resultEntry && resultEntry.result && typeof resultEntry.result.scoreA === 'number'
          ? resultEntry.result.scoreA + '-' + resultEntry.result.scoreB
          : (played ? 'Played' : '');
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = `
          <span>${match.teamA.name} vs ${match.teamB.name}</span>
          <span class="schedule-map">${match.map || '—'}</span>
          <span>${scoreText}</span>
        `;
        container.appendChild(row);
      });
    });
    appendChallengerSchedule(container);
  }

  function appendChallengerSchedule(container) {
    if (!challengerSeason || !challengerSeason.matchdays || !challengerSeason.matchdays.length) return;
    const chHeader = document.createElement('div');
    chHeader.className = 'schedule-day';
    chHeader.style.marginTop = '1rem';
    chHeader.textContent = 'Challenger League Schedule';
    container.appendChild(chHeader);
    challengerSeason.matchdays.forEach((dayMatches, dayIndex) => {
      const played = dayIndex < challengerSeason.currentMatchday;
      const isNext = dayIndex === challengerSeason.currentMatchday;
      const dayResults = (challengerSeason.playedMatchResults || [])[dayIndex] || [];
      const dayHeader = document.createElement('div');
      dayHeader.className = 'schedule-day' + (isNext ? ' schedule-day--next' : '');
      dayHeader.innerHTML = `<strong>Matchday ${dayIndex + 1}</strong>${played ? ' (played)' : isNext ? ' (next)' : ''}`;
      container.appendChild(dayHeader);
      (dayMatches || []).forEach(match => {
        const resultEntry = dayResults.find(
          r => r.match && (r.match.teamA.name === match.teamA.name && r.match.teamB.name === match.teamB.name)
        );
        const scoreText = resultEntry && resultEntry.result && typeof resultEntry.result.scoreA === 'number'
          ? resultEntry.result.scoreA + '-' + resultEntry.result.scoreB
          : (played ? 'Played' : '');
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = `
          <span>${match.teamA.name} vs ${match.teamB.name}</span>
          <span class="schedule-map">${match.map || '—'}</span>
          <span>${scoreText}</span>
        `;
        container.appendChild(row);
      });
    });
  }

  // ===== INITIAL RENDER =====
  if (season) {
    setupContractOfferModal();
    setupPlayerDetailModal();
    setupMarketPlayerModal();
    setupYouthAcademyPlayerModal();
    setupOtherTeamRosterModal();
    updateFixtureUI(season);
    updateStandingsUI(season);
    updateScheduleUI(season);
    updateCareerUI(season);
    updateFinanceUI(userTeamRef());
    updateRosterUI();
    updateCycleUI();
  }
}

// --- Notifications (toasts) and confirm modal ---
function showNotification(message, type, durationMs) {
  type = type || 'info';
  const container = document.getElementById('notificationContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'notification notification--' + type;
  el.textContent = String(message);
  container.appendChild(el);
  const duration = durationMs != null ? durationMs : (type === 'error' ? 6000 : 4000);
  setTimeout(() => {
    el.classList.add('notification--out');
    setTimeout(() => el.remove(), 200);
  }, duration);
}
if (typeof window !== 'undefined' && window.Nexus) {
  window.Nexus.showNotification = showNotification;
  window.Nexus.onFinanceExpense = function(message, durationMs) {
    showNotification(message, 'info', durationMs != null ? durationMs : 10000);
  };
}

function showConfirm(message, onConfirm, onCancel) {
  const overlay = document.getElementById('confirmModal');
  const msgEl = document.getElementById('confirmMessage');
  const acceptBtn = document.getElementById('confirmAccept');
  const cancelBtn = document.getElementById('confirmCancel');
  if (!overlay || !msgEl || !acceptBtn || !cancelBtn) {
    if (onCancel) onCancel();
    return;
  }
  let resolved = false;
  function done(choice) {
    if (resolved) return;
    resolved = true;
    if (document.activeElement && overlay.contains(document.activeElement)) {
      document.body.setAttribute('tabindex', '-1');
      document.body.focus();
    }
    overlay.classList.add('is-hidden');
    overlay.setAttribute('aria-hidden', 'true');
    if (choice && onConfirm) onConfirm();
    if (!choice && onCancel) onCancel();
  }
  msgEl.textContent = message;
  overlay.classList.remove('is-hidden');
  overlay.setAttribute('aria-hidden', 'false');
  acceptBtn.onclick = () => done(true);
  cancelBtn.onclick = () => done(false);
  overlay.onclick = function(e) { if (e.target === overlay) done(false); };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUI);
} else {
  initUI();
}
>>>>>>> 7e26ee3f3f82a047d4dcd0509e20cf69189157c1
