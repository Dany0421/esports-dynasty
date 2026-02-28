// Project Nexus – Step 1 Foundation
// Goal: lock in a FUTURE-PROOF Player data model (stats with caps/ranges + role bias + traits)
// This file keeps your current league/team generator vibe, BUT upgrades the schema so
// meta/training/environment/finance can plug in later without refactors.

(function() {
'use strict';
if (typeof window !== 'undefined' && window.__NEXUS_SCRIPT_LOADED__) return;
if (typeof window !== 'undefined') window.__NEXUS_SCRIPT_LOADED__ = true;

// --- Teams, name pools ---
const TEAM_NAMES = [
  'Sentinels', 'Cloud9', 'NRG', 'Evil Geniuses', '100 Thieves', 'FURIA',
  'LOUD', 'Leviatán', 'G2 Esports', 'Fnatic', 'Team Liquid', 'DRX'
];

const CHALLENGER_TEAM_NAMES = [
  'M80', 'The Guard', 'Shopify Rebellion', 'Oxygen Esports', 'Ghost Gaming', 'KRÜ Esports'
];

const INTERNATIONAL_TEAM_POOLS = {
  EU:    ['Team Vitality', 'NaVi', 'BIG Clan', 'Astralis', 'FaZe', 'OG'],
  APAC:  ['T1', 'Paper Rex', 'ZETA Division', 'BOOM', 'Rex Regum'],
  LATAM: ['9z Team', 'Isurus Gaming', 'Infinity', 'Netcorp'],
  SA:    ['paiN Gaming', 'INTZ', 'Fluxo', 'Liberty']
};

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

// --- Injury system constants ---
const INJURY_TYPES = {
  RSI:       { label: 'RSI',        affectedStats: ['aim', 'reaction', 'decisionSpeed'] },
  Burnout:   { label: 'Burnout',    affectedStats: ['mental', 'consistency', 'gameSense'] },
  EyeStrain: { label: 'Eye Strain', affectedStats: ['aim', 'reaction'] },
  Illness:   { label: 'Illness',    affectedStats: ['aim', 'reaction', 'gameSense', 'positioning', 'utilityIQ', 'decisionSpeed', 'adaptability', 'consistency', 'mental', 'communication'] },
  BackPain:  { label: 'Back Pain',  affectedStats: ['positioning', 'consistency'] }
};

// powerPenalty: multiplied against player matchPower (0.10 = -10%)
// trainingMult: growth multiplier while injured
// canPlay: false = blocked from starters
// aggravateChance: chance of becoming Major when playing with this severity
const INJURY_SEVERITY = {
  Minor:    { matchdays: [1, 3],   powerPenalty: 0.10, trainingMult: 0.5,  canPlay: true,  aggravateChance: 0    },
  Moderate: { matchdays: [4, 7],   powerPenalty: 0.25, trainingMult: 0.20, canPlay: true,  aggravateChance: 0.30 },
  Major:    { matchdays: [8, 14],  powerPenalty: 1.0,  trainingMult: 0,    canPlay: false, aggravateChance: 0    }
};

// Clinic visit cost to treat (Minor: instant heal, Moderate: instant heal, Major: reduce to Moderate 3md remaining)
const INJURY_CLINIC_COST = { Minor: 15000, Moderate: 35000, Major: 60000 };

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
    roleScores: allScores,

    // Injury state: null = healthy. When injured: { type, severity, matchdaysLeft, affectedStats }
    injury: null,

    // Morale: 0-100. Affects match power, contract negotiations, transfer requests.
    morale: 70
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
    activeBootcamp: null,
    bootcampUsageThisSeason: {},
    tier,
    prestige: tier === 'Main' ? 60 + Math.floor(Math.random() * 20) : 30 + Math.floor(Math.random() * 15),
    budgetMultiplier: tier === 'Main' ? 1.0 : 0.7
  };
}

// --- Youth Academy: prospect pool (14-17yo, no transfer fee, salary only) ---
window.Nexus = window.Nexus || {};
window.Nexus.YOUTH_MARKET = window.Nexus.YOUTH_MARKET || [];

function createYouthProspect() {
  // Mostly 16–17; 15 is rare (~8%); 14 is very rare (~1.5%).
  const age = chance(0.015) ? 14 : (chance(0.08) ? 15 : (chance(0.5) ? 16 : 17));
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
  const count = 30;
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

function calculateEffectiveCap({ player, statKey, environment, meta, bootcampEffect }) {
  const stat = player.stats[statKey];
  const baseMax = stat.maxCap;

  let modifier = 0;

  // Environment influence (access to ceiling)
  // Coach quality gives up to +5% access to cap range
  const coachBoost = (environment.coachQuality - 50) / 50; // -1 to +1
  modifier += coachBoost * 0.05 * baseMax;

  // Pressure vs Mental interaction (psychology reduces effective pressure)
  const mental = (player.stats.mental && player.stats.mental.current != null) ? player.stats.mental.current : 50;
  const mentalBoost = (bootcampEffect && bootcampEffect.mentalBoost != null) ? bootcampEffect.mentalBoost : 0;
  const effectiveMental = clamp(mental + mentalBoost, 1, 99);
  const rawPressure = environment.pressure != null ? environment.pressure : 50;
  const psychSupport = environment.psychologySupport != null ? environment.psychologySupport : 50;
  const psychTier = PSYCHOLOGY_TIERS && PSYCHOLOGY_TIERS.find(function(t) { return t.support === psychSupport; });
  const pressureReduction = (psychTier && psychTier.pressureReduction != null) ? psychTier.pressureReduction : 0;
  let effectivePressure = rawPressure * (1 - pressureReduction);
  if (bootcampEffect && bootcampEffect.pressureReduction != null) {
    const extraReduction = clamp(bootcampEffect.pressureReduction, 0, 0.9);
    effectivePressure *= (1 - extraReduction);
  }
  const pressureImpact = (effectivePressure - effectiveMental) / 100;
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

function calculateEffectiveCurrent({ player, statKey, environment, meta, bootcampEffect }) {
  const stat = player.stats[statKey];
  const effectiveCap = calculateEffectiveCap({ player, statKey, environment, meta, bootcampEffect });

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

  // Injury reduces or blocks training
  const inj = getPlayerInjury(player);
  if (inj) {
    const sevDef = INJURY_SEVERITY[inj.severity];
    if (sevDef && sevDef.trainingMult === 0) return 0; // Major: no training
    const injMult = sevDef ? sevDef.trainingMult : 1;
    growthMultiplier = (growthMultiplier != null ? growthMultiplier : 1) * injMult;
  }

  // Morale affects training growth
  growthMultiplier = (growthMultiplier != null ? growthMultiplier : 1) * getMoraleTrainingMultiplier(player.morale);

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

function calculateRoleAdjustedCurrent({ player, statKey, environment, meta, bootcampEffect }) {
  const baseEffective = calculateEffectiveCurrent({ player, statKey, environment, meta, bootcampEffect });
  let value = baseEffective * getRoleFitMultiplier(player);

  const role = player.assignedRole || player.roleBias.primaryRoleBias;
  if (meta && Array.isArray(meta.favoredRoles) && meta.favoredRoles.includes(role)) {
    let favoredBonus = META_FAVORED_BONUS;
    if (bootcampEffect && bootcampEffect.metaFavoredBonus != null) {
      favoredBonus += bootcampEffect.metaFavoredBonus;
    }
    value *= favoredBonus;
  }
  if (meta && Array.isArray(meta.nerfedRoles) && meta.nerfedRoles.includes(role)) {
    let nerfedPenalty = META_NERFED_PENALTY;
    if (bootcampEffect && bootcampEffect.metaNerfedReduction != null) {
      const reduction = clamp(bootcampEffect.metaNerfedReduction, 0, 1);
      const penaltyStrength = 1 - META_NERFED_PENALTY;
      nerfedPenalty = 1 - (penaltyStrength * (1 - reduction));
    }
    value *= nerfedPenalty;
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

function calculateTeamSynergy(players, meta, environment, bootcampEffect) {
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

  if (bootcampEffect && bootcampEffect.synergyBonus != null) {
    synergy += bootcampEffect.synergyBonus;
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
  // Exclude Major-injured players from lineup consideration
  const allPlayers = (team.players || []).filter(p => {
    const inj = getPlayerInjury(p);
    return !inj || inj.severity !== 'Major';
  });

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

const MATCH_POWER_MIN_BONUS_FROM_BASE = -0.25; // cap total penalty to -25% of role-adjusted base
const MATCH_POWER_MAX_BONUS_FROM_BASE = 0.25;  // cap total bonus to +25% of role-adjusted base
const MATCH_POWER_HARD_MIN = 0;
const MATCH_POWER_HARD_MAX = 99;

function getPlayerOverall(player) {
  const avg = STAT_KEYS.reduce((sum, key) => sum + player.stats[key].current, 0) / STAT_KEYS.length;
  return Math.round(avg);
}

function calculatePlayerMatchPower({ player, environment, meta, teamTrainingBoosts, bootcampEffect, useVariance }) {
  let total = 0;
  const infrastructure = (environment && environment.infrastructure != null) ? environment.infrastructure : 50;
  const varianceReduction = (infrastructure - 50) / 100;
  const hasBootcamp = !!bootcampEffect;
  const applyVariance = useVariance !== false;

  STAT_KEYS.forEach(statKey => {
    const baseAdjusted = calculateRoleAdjustedCurrent({
      player,
      statKey,
      environment,
      meta,
      bootcampEffect
    });
    let adjusted = baseAdjusted;
    if (meta && meta.statBonuses && meta.statBonuses[statKey] != null) {
      adjusted *= meta.statBonuses[statKey];
    }
    if (bootcampEffect && bootcampEffect.statBoosts && bootcampEffect.statBoosts[statKey] != null) {
      adjusted *= bootcampEffect.statBoosts[statKey];
    } else if (bootcampEffect && bootcampEffect.allStatsBonus != null) {
      adjusted *= bootcampEffect.allStatsBonus;
    } else if (!hasBootcamp && teamTrainingBoosts && teamTrainingBoosts[statKey]) {
      adjusted *= teamTrainingBoosts[statKey];
    }
    // Recap stacked bonus/penalty relative to role-adjusted base BEFORE variance.
    const minFromBase = baseAdjusted * (1 + MATCH_POWER_MIN_BONUS_FROM_BASE);
    const maxFromBase = baseAdjusted * (1 + MATCH_POWER_MAX_BONUS_FROM_BASE);
    adjusted = clamp(adjusted, minFromBase, maxFromBase);

    const reducedVariance = applyVariance
      ? 1 + (Math.random() - 0.5) * 0.2 * (1 - varianceReduction)
      : 1;
    adjusted *= reducedVariance;

    // Final stat recap AFTER variance to avoid random spikes.
    total += clamp(adjusted, MATCH_POWER_HARD_MIN, MATCH_POWER_HARD_MAX);
  });

  let basePower = clamp(total / STAT_KEYS.length, MATCH_POWER_HARD_MIN, MATCH_POWER_HARD_MAX);

  // Apply injury penalty
  const inj = getPlayerInjury(player);
  if (inj) {
    const sevDef = INJURY_SEVERITY[inj.severity];
    if (sevDef) basePower *= (1 - sevDef.powerPenalty);
  }

  // Apply individual player form multiplier (hot/cold)
  basePower *= getPlayerFormMultiplier(player);

  // Apply morale multiplier
  basePower *= getMoraleMatchMultiplier(player.morale);

  return clamp(basePower, MATCH_POWER_HARD_MIN, MATCH_POWER_HARD_MAX);
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

// Match Decision Event system (pre-match choices that affect one simulation stage)
const MATCH_DECISION_EVENTS = {
  tactical_approach: {
    id: 'tactical_approach',
    title: 'Pre-Match Tactical Call',
    icon: '📋',
    description: function(ctx) {
      return 'You have to decide your team\'s approach going into the match against ' + ctx.opponentName + '.';
    },
    condition: function() { return true; },
    options: [
      {
        label: 'Aggressive',
        description: 'Full pressure, take risks. +12% match power, but +8% injury risk per player.',
        effect: { userPowerMult: 1.12, injuryRiskBonus: 0.08 }
      },
      {
        label: 'Balanced',
        description: 'Default game plan. No modifier.',
        effect: {}
      },
      {
        label: 'Conservative',
        description: 'Protect structure, frustrate the opponent. -6% your power, -10% opponent power.',
        effect: { userPowerMult: 0.94, opponentPowerMult: 0.90 }
      }
    ]
  },
  comms_breakdown: {
    id: 'comms_breakdown',
    title: 'Comms Under Pressure',
    icon: '🎧',
    description: function(ctx) {
      return ctx.stressedPlayer.firstName + ' is mentally struggling and your in-game comms are suffering. How do you handle it?';
    },
    condition: function(ctx) {
      return ctx.stressedPlayer != null;
    },
    options: [
      {
        label: 'Let him lead through it',
        description: 'Trust the process. No power change, but he takes a morale hit (-6).',
        effect: { stressedPlayerMoraleDelta: -6 }
      },
      {
        label: 'Rotate the calls to another player',
        description: 'Disrupts rhythm slightly (-6% power) but protects team morale.',
        effect: { userPowerMult: 0.94, stressedPlayerMoraleDelta: 5 }
      },
      {
        label: 'Bench him this match',
        description: 'Bench player steps in. Bigger power hit (-12%) but stressed player rests.',
        effect: { userPowerMult: 0.88, stressedPlayerMoraleDelta: 8 }
      }
    ]
  },
  map_exploit: {
    id: 'map_exploit',
    title: 'Map Pool Weakness Spotted',
    icon: '🗺️',
    description: function(ctx) {
      return 'Your analyst has found a vulnerability in ' + ctx.opponentName + '\'s map pool. Do you adapt your prep?';
    },
    condition: function() { return true; },
    options: [
      {
        label: 'Full exploitation',
        description: 'Rebuild the gameplan around it. +15% power if it works. High risk - if you lose, team morale drops.',
        effect: { userPowerMult: 1.15, onLossMoraleAllDelta: -4 }
      },
      {
        label: 'Partial adaptation',
        description: 'Mix your normal prep with the exploit. +6% power, safe.',
        effect: { userPowerMult: 1.06 }
      },
      {
        label: 'Standard preparation',
        description: 'Stick to your gameplan. No modifier.',
        effect: {}
      }
    ]
  },
  player_condition: {
    id: 'player_condition',
    title: 'Player Fitness Concern',
    icon: '⚕️',
    description: function(ctx) {
      return ctx.concernedPlayer.firstName + ' is not at 100%. Do you take the risk of playing him?';
    },
    condition: function(ctx) {
      return ctx.concernedPlayer != null;
    },
    options: [
      {
        label: 'Play him at full intensity',
        description: 'Normal contribution, but +14% injury risk for him this match.',
        effect: { concernedPlayerInjuryRiskBonus: 0.14 }
      },
      {
        label: 'Manage his minutes carefully',
        description: 'His contribution is reduced (-15% power from his slot), but injury risk is normal.',
        effect: { userPowerMult: 0.93 }
      },
      {
        label: 'Rest him, trust the bench',
        description: 'Bench player plays instead. -10% overall team power, no extra injury risk.',
        effect: { userPowerMult: 0.90 }
      }
    ]
  },
  opponent_intel: {
    id: 'opponent_intel',
    title: 'Opponent Intel Available',
    icon: '🔍',
    description: function(ctx) {
      return 'Your staff has compiled a full breakdown of ' + ctx.opponentName + '\'s recent matches. Do you invest in deep analysis?';
    },
    condition: function() { return true; },
    options: [
      {
        label: 'Full analysis ($5,000)',
        description: 'Thorough prep. +10% match power. Costs $5,000.',
        effect: { userPowerMult: 1.10, financeCost: 5000 }
      },
      {
        label: 'Quick review ($2,000)',
        description: 'Light prep. +5% match power. Costs $2,000.',
        effect: { userPowerMult: 1.05, financeCost: 2000 }
      },
      {
        label: 'Trust your preparation',
        description: 'No cost, no modifier.',
        effect: {}
      }
    ]
  }
};

function ensureSeasonDecisionData(season) {
  if (!season || typeof season !== 'object') return { resolvedFixtures: {}, pending: null };
  if (!season.matchDecisionState || typeof season.matchDecisionState !== 'object') {
    season.matchDecisionState = { resolvedFixtures: {}, pending: null };
  }
  if (!season.matchDecisionState.resolvedFixtures || typeof season.matchDecisionState.resolvedFixtures !== 'object') {
    season.matchDecisionState.resolvedFixtures = {};
  }
  if (!('pending' in season.matchDecisionState)) {
    season.matchDecisionState.pending = null;
  }
  return season.matchDecisionState;
}

function markMatchDecisionResolved(season, fixtureKey, eventId) {
  const data = ensureSeasonDecisionData(season);
  if (fixtureKey) data.resolvedFixtures[fixtureKey] = eventId || true;
  if (data.pending && (!fixtureKey || data.pending.fixtureKey === fixtureKey)) data.pending = null;
}

function getMatchDecisionFixture(season, userTeam) {
  if (!season || !userTeam || !userTeam.name) return null;
  const phase = season.phase || 'regular';
  const userName = userTeam.name;
  const includesUser = function(match) {
    return !!(match && match.teamA && match.teamB && (match.teamA.name === userName || match.teamB.name === userName));
  };
  const opponentOf = function(match) {
    if (!match || !match.teamA || !match.teamB) return 'your opponent';
    return match.teamA.name === userName ? match.teamB.name : match.teamA.name;
  };

  if (phase === 'regular') {
    const days = season.matchdays || season.schedule || [];
    const md = season.currentMatchday || 0;
    const dayMatches = normalizeMatchdayMatches(days[md]);
    const userMatch = dayMatches.find(includesUser);
    if (!userMatch) return null;
    return {
      phase: 'regular',
      match: userMatch,
      opponentName: opponentOf(userMatch),
      fixtureKey: 'regular:' + md + ':' + userMatch.teamA.name + ':' + userMatch.teamB.name
    };
  }

  if (phase === 'playoffs') {
    const bracket = season.playoffsBracket;
    const matches = (bracket && bracket.matches) || [];
    const idx = matches.findIndex(includesUser);
    if (idx === -1) return null;
    const userMatch = matches[idx];
    const round = (bracket && bracket.round != null) ? bracket.round : 0;
    return {
      phase: 'playoffs',
      match: userMatch,
      opponentName: opponentOf(userMatch),
      fixtureKey: 'playoffs:' + round + ':' + idx + ':' + userMatch.teamA.name + ':' + userMatch.teamB.name
    };
  }

  if (phase === 'relegation') {
    const main = season.relegationCandidates || [];
    const challenger = season.challengerPromotion || [];
    for (let i = 0; i < 2; i++) {
      const teamA = main[i];
      const teamB = challenger[i];
      const m = teamA && teamB ? { teamA: teamA, teamB: teamB } : null;
      if (!m || !includesUser(m)) continue;
      return {
        phase: 'relegation',
        match: m,
        opponentName: opponentOf(m),
        fixtureKey: 'relegation:' + i + ':' + teamA.name + ':' + teamB.name
      };
    }
    return null;
  }

  if (phase === 'invitational') {
    const bracketMatches = (season.invitationalBracket && season.invitationalBracket.matches) || [];
    const directMatches = season.invitationalMatches || [];
    const matches = (Array.isArray(directMatches) && directMatches.length) ? directMatches : bracketMatches;
    const idx = matches.findIndex(includesUser);
    if (idx === -1) return null;
    const userMatch = matches[idx];
    const round = season.invitationalRound != null
      ? season.invitationalRound
      : ((season.invitationalBracket && season.invitationalBracket.round != null)
        ? season.invitationalBracket.round
        : (season.currentMatchday || 0));
    return {
      phase: 'invitational',
      match: userMatch,
      opponentName: opponentOf(userMatch),
      fixtureKey: 'invitational:' + round + ':' + idx + ':' + userMatch.teamA.name + ':' + userMatch.teamB.name
    };
  }

  return null;
}

function getMatchDecisionContext(season, userTeam) {
  const fixture = getMatchDecisionFixture(season, userTeam);
  const opponentName = fixture ? fixture.opponentName : 'your opponent';
  const starters = (userTeam && (userTeam.starterSlots || userTeam.starters || [])) || [];
  const safeStarters = starters.filter(Boolean);
  const stressed = safeStarters
    .filter(function(p) { return (p.morale != null ? p.morale : 70) < 50; })
    .sort(function(a, b) { return (a.morale != null ? a.morale : 70) - (b.morale != null ? b.morale : 70); })[0] || null;
  const concerned = safeStarters
    .filter(function(p) {
      return (p.morale != null ? p.morale : 70) < 40 || (p.injury && p.injury.matchdaysLeft === 0);
    })[0] || null;

  return {
    opponentName: opponentName,
    stressedPlayer: stressed,
    concernedPlayer: concerned,
    fixtureKey: fixture ? fixture.fixtureKey : null
  };
}

function pickMatchDecisionEvent(season, userTeam) {
  const fixture = getMatchDecisionFixture(season, userTeam);
  if (!fixture) return null;

  const decisionData = ensureSeasonDecisionData(season);
  if (decisionData.resolvedFixtures[fixture.fixtureKey]) return null;

  if (decisionData.pending && decisionData.pending.fixtureKey === fixture.fixtureKey && decisionData.pending.eventId) {
    const pendingEvent = MATCH_DECISION_EVENTS[decisionData.pending.eventId];
    if (pendingEvent) {
      return { event: pendingEvent, ctx: getMatchDecisionContext(season, userTeam), fixtureKey: fixture.fixtureKey };
    }
  }

  const isHighStakes = fixture.phase === 'playoffs' || fixture.phase === 'invitational' || fixture.phase === 'relegation';
  const triggerChance = isHighStakes ? 0.60 : 0.40;
  if (Math.random() > triggerChance) {
    decisionData.pending = null;
    return null;
  }

  const ctx = getMatchDecisionContext(season, userTeam);
  const allKeys = Object.keys(MATCH_DECISION_EVENTS);
  const shuffled = allKeys.slice().sort(function() { return Math.random() - 0.5; });
  for (let i = 0; i < shuffled.length; i++) {
    const ev = MATCH_DECISION_EVENTS[shuffled[i]];
    if (ev && typeof ev.condition === 'function' && ev.condition(ctx)) {
      decisionData.pending = { fixtureKey: fixture.fixtureKey, eventId: ev.id };
      return { event: ev, ctx: ctx, fixtureKey: fixture.fixtureKey };
    }
  }
  decisionData.pending = null;
  return null;
}

function applyMatchDecisionEffect(season, userTeam, effect) {
  const safeEffect = effect || {};
  const decisionData = ensureSeasonDecisionData(season);
  const pending = decisionData.pending;
  const ctx = getMatchDecisionContext(season, userTeam);
  const fixtureKey = (pending && pending.fixtureKey) || ctx.fixtureKey;

  var canApplyFinanceEffects = true;
  if (safeEffect.financeCost && userTeam && userTeam.finance) {
    const cost = safeEffect.financeCost;
    if ((userTeam.finance.capital || 0) >= cost) {
      userTeam.finance.capital -= cost;
      userTeam.finance.expensesThisSeason = (userTeam.finance.expensesThisSeason || 0) + cost;
    } else {
      canApplyFinanceEffects = false;
      if (typeof showNotification === 'function') {
        showNotification('Not enough capital for this decision option. Boost not applied.', 'error');
      }
    }
  } else if (safeEffect.financeCost) {
    canApplyFinanceEffects = false;
  }

  window.Nexus._pendingMatchModifier = {
    userPowerMult: canApplyFinanceEffects ? (safeEffect.userPowerMult || 1) : 1,
    opponentPowerMult: canApplyFinanceEffects ? (safeEffect.opponentPowerMult || 1) : 1,
    injuryRiskBonus: safeEffect.injuryRiskBonus || 0,
    concernedPlayerInjuryRiskBonus: safeEffect.concernedPlayerInjuryRiskBonus || 0,
    concernedPlayerId: ctx && ctx.concernedPlayer ? ctx.concernedPlayer.id : null,
    onLossMoraleAllDelta: safeEffect.onLossMoraleAllDelta || 0,
    fixtureKey: fixtureKey || null
  };

  if (safeEffect.stressedPlayerMoraleDelta && ctx && ctx.stressedPlayer) {
    const stressed = ctx.stressedPlayer;
    stressed.morale = clamp((stressed.morale != null ? stressed.morale : 70) + safeEffect.stressedPlayerMoraleDelta, 0, 100);
  }

  markMatchDecisionResolved(season, fixtureKey, pending && pending.eventId ? pending.eventId : null);
}

const BOOTCAMP_TYPES = [
  {
    id: 'meta-adaptation',
    icon: 'META',
    name: 'Meta Adaptation Camp',
    description: 'Fast prep to exploit favored roles and soften nerfs.',
    effectDescription: '+8% favored-role meta bonus, 12% nerf reduction',
    cost: 60000,
    duration: 3,
    effect: {
      type: 'meta',
      metaFavoredBonus: 0.08,
      metaNerfedReduction: 0.12
    }
  },
  {
    id: 'mechanical-bootcamp',
    icon: 'MECH',
    name: 'Mechanical Skill Camp',
    description: 'Raw dueling focus: aim, reactions, and snap decisions.',
    effectDescription: '+10% aim, +8% reaction, +6% decision speed',
    cost: 55000,
    duration: 3,
    effect: {
      type: 'stats',
      statBoosts: {
        aim: 1.10,
        reaction: 1.08,
        decisionSpeed: 1.06
      }
    }
  },
  {
    id: 'tactical-bootcamp',
    icon: 'TACT',
    name: 'Tactical IQ Camp',
    description: 'Macro-heavy prep focused on utility and spacing.',
    effectDescription: '+10% game sense, +8% utility IQ, +6% positioning',
    cost: 55000,
    duration: 3,
    effect: {
      type: 'stats',
      statBoosts: {
        gameSense: 1.10,
        utilityIQ: 1.08,
        positioning: 1.06
      }
    }
  },
  {
    id: 'synergy-bootcamp',
    icon: 'SYNC',
    name: 'Team Synergy Camp',
    description: 'Team coordination drills for cleaner executes and retakes.',
    effectDescription: '+6% team synergy',
    cost: 50000,
    duration: 4,
    effect: {
      type: 'synergy',
      synergyBonus: 0.06
    }
  },
  {
    id: 'mental-bootcamp',
    icon: 'MIND',
    name: 'Mental Resilience Camp',
    description: 'Pressure-control sessions with focused resilience routines.',
    effectDescription: '-15% pressure impact and +5 effective mental',
    cost: 40000,
    duration: 5,
    effect: {
      type: 'mental',
      pressureReduction: 0.15,
      mentalBoost: 5
    }
  },
  {
    id: 'championship-bootcamp',
    icon: 'CHMP',
    name: 'Championship Prep',
    description: 'High-intensity short prep for title races.',
    effectDescription: '+12% all stats and +8% team synergy',
    cost: 120000,
    duration: 2,
    effect: {
      type: 'championship',
      allStatsBonus: 1.12,
      synergyBonus: 0.08
    }
  }
];

function getBootcampById(bootcampId) {
  if (!bootcampId) return null;
  return BOOTCAMP_TYPES.find(function(b) { return b.id === bootcampId; }) || null;
}

function initializeBootcampSeasonUsage(team) {
  if (!team) return {};
  if (!team.bootcampUsageThisSeason || typeof team.bootcampUsageThisSeason !== 'object') {
    team.bootcampUsageThisSeason = {};
  }
  return team.bootcampUsageThisSeason;
}

function hasTeamUsedBootcampThisSeason(team, bootcampId) {
  if (!team || !bootcampId) return false;
  const usage = initializeBootcampSeasonUsage(team);
  return !!usage[bootcampId];
}

function markBootcampUsedThisSeason(team, bootcampId) {
  if (!team || !bootcampId) return;
  const usage = initializeBootcampSeasonUsage(team);
  usage[bootcampId] = true;
}

function resetBootcampUsageForSeason(teams) {
  const list = Array.isArray(teams) ? teams : [];
  list.forEach(function(team) {
    if (!team) return;
    team.activeBootcamp = null;
    team.bootcampUsageThisSeason = {};
  });
}

function getTeamActiveBootcampEffect(team) {
  if (!team || !team.activeBootcamp) return null;
  const remaining = team.activeBootcamp.remainingMatchdays != null ? team.activeBootcamp.remainingMatchdays : 0;
  if (remaining <= 0) return null;
  return team.activeBootcamp.effect || null;
}

function activateBootcamp(team, bootcampId) {
  const bootcamp = getBootcampById(bootcampId);
  if (!team || !bootcamp) return { success: false, message: 'Bootcamp not found.' };
  if (hasTeamUsedBootcampThisSeason(team, bootcamp.id)) {
    return { success: false, message: 'This bootcamp is locked for the rest of the season.' };
  }
  if (team.activeBootcamp && (team.activeBootcamp.remainingMatchdays || 0) > 0) {
    return { success: false, message: 'A bootcamp is already active.' };
  }
  if (!team.finance) return { success: false, message: 'No finance data available.' };
  const capital = team.finance.capital || 0;
  if (capital < bootcamp.cost) return { success: false, message: 'Insufficient funds.' };

  team.finance.capital = capital - bootcamp.cost;
  team.activeBootcamp = {
    id: bootcamp.id,
    name: bootcamp.name,
    remainingMatchdays: bootcamp.duration,
    effect: JSON.parse(JSON.stringify(bootcamp.effect || {}))
  };
  markBootcampUsedThisSeason(team, bootcamp.id);

  return {
    success: true,
    bootcamp: team.activeBootcamp,
    message: 'Activated ' + bootcamp.name + ' for ' + bootcamp.duration + ' matchdays.'
  };
}

function getTeamReputationScore(team) {
  if (!team) return 50;
  if (team.reputation != null) return team.reputation;
  if (team.prestige != null) return team.prestige;
  return 50;
}

function selectRandomBootcamp(team) {
  if (!team || !team.finance) return null;
  if (team.activeBootcamp && (team.activeBootcamp.remainingMatchdays || 0) > 0) return null;
  const affordable = BOOTCAMP_TYPES.filter(function(type) {
    return (team.finance.capital || 0) >= type.cost && !hasTeamUsedBootcampThisSeason(team, type.id);
  });
  if (!affordable.length) return null;
  return affordable[randomInt(0, affordable.length - 1)];
}

function shouldAIActivateBootcamp(aiTeam, opponentTeam) {
  if (!aiTeam || !opponentTeam || aiTeam === opponentTeam) return null;
  const userTeam = (window.Nexus.getUserTeam && window.Nexus.getUserTeam()) || (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
  if (userTeam && aiTeam.name === userTeam.name) return null;
  if (aiTeam.activeBootcamp && (aiTeam.activeBootcamp.remainingMatchdays || 0) > 0) return null;

  const aiReputation = getTeamReputationScore(aiTeam);
  const oppReputation = getTeamReputationScore(opponentTeam);
  if (oppReputation <= aiReputation) return null;

  if (Math.random() >= 0.7) return null;
  const randomBootcamp = selectRandomBootcamp(aiTeam);
  if (!randomBootcamp) return null;

  const result = activateBootcamp(aiTeam, randomBootcamp.id);
  if (result && result.success && userTeam && opponentTeam.name === userTeam.name) {
    if (window.Nexus.showNotification) window.Nexus.showNotification(aiTeam.name + ' activated ' + randomBootcamp.name + ' before facing you!', 'info', 5500);
    if (typeof window.Nexus.onOpponentBootcampActivated === 'function') window.Nexus.onOpponentBootcampActivated(aiTeam.name, randomBootcamp.name);
  }
  return result;
}

function tickBootcampDuration(teams) {
  const list = Array.isArray(teams) ? teams : [];
  const userTeam = (window.Nexus.getUserTeam && window.Nexus.getUserTeam()) || (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
  let expiredUserBootcamp = null;

  list.forEach(function(team) {
    if (!team || !team.activeBootcamp) return;
    const remaining = team.activeBootcamp.remainingMatchdays != null ? team.activeBootcamp.remainingMatchdays : 0;
    const nextRemaining = remaining - 1;
    team.activeBootcamp.remainingMatchdays = nextRemaining;
    if (nextRemaining <= 0) {
      if (userTeam && userTeam.name === team.name) {
        expiredUserBootcamp = team.activeBootcamp.name || 'Bootcamp';
      }
      team.activeBootcamp = null;
    }
  });

  if (expiredUserBootcamp && window.Nexus.showNotification) {
    window.Nexus.showNotification(expiredUserBootcamp + ' expired.', 'info', 5500);
  }

  return { userExpiredBootcamp: expiredUserBootcamp };
}

window.Nexus.COACH_TIERS = COACH_TIERS;
window.Nexus.FACILITY_TIERS = FACILITY_TIERS;
window.Nexus.PSYCHOLOGY_TIERS = PSYCHOLOGY_TIERS;
window.Nexus.SPONSOR_TIERS = SPONSOR_TIERS;
window.Nexus.BOOTCAMP_TYPES = BOOTCAMP_TYPES;

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
window.Nexus.getBootcampById = getBootcampById;
window.Nexus.getTeamActiveBootcampEffect = getTeamActiveBootcampEffect;
window.Nexus.activateBootcamp = activateBootcamp;
window.Nexus.selectRandomBootcamp = selectRandomBootcamp;
window.Nexus.shouldAIActivateBootcamp = shouldAIActivateBootcamp;
window.Nexus.tickBootcampDuration = tickBootcampDuration;
window.Nexus.hasTeamUsedBootcampThisSeason = hasTeamUsedBootcampThisSeason;
window.Nexus.resetBootcampUsageForSeason = resetBootcampUsageForSeason;
window.Nexus.getCoachTier = getCoachTier;
window.Nexus.getFacilityTier = getFacilityTier;
window.Nexus.getPsychologyTier = getPsychologyTier;
window.Nexus.upgradePsychology = upgradePsychology;
window.Nexus.getMaxYouthAcademySlots = getMaxYouthAcademySlots;
window.Nexus.syncTeamEnvironmentFromTiers = syncTeamEnvironmentFromTiers;
window.Nexus.syncPressureToPrestige = syncPressureToPrestige;

function calculateTeamMatchPower({ team, environment, meta }, options) {
  const useVariance = (options && options.useVariance) !== false;
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

  const activeBootcampEffect = getTeamActiveBootcampEffect(team);
  const synergyData = calculateTeamSynergy(lineup, meta, environment, activeBootcampEffect);
  const synergyMultiplier = synergyData.synergyMultiplier;

  const boosts = (!activeBootcampEffect && team.activeTeamTraining && TEAM_TRAINING_PLANS[team.activeTeamTraining])
    ? TEAM_TRAINING_PLANS[team.activeTeamTraining].boosts
    : {};

  const playerPowers = lineup.map(function(p) {
    const matchPower = calculatePlayerMatchPower({
      player: p,
      environment,
      meta,
      teamTrainingBoosts: boosts,
      bootcampEffect: activeBootcampEffect,
      useVariance: useVariance
    });
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
  const formMultiplier = getTeamFormMultiplier(team);
  const finalPower = (avgPower * synergyMultiplier) * shortHandedPenalty * formMultiplier;

  return {
    finalPower,
    synergy: synergyData,
    lineup,
    playerPowers: playerPowers
  };
}

/**
 * Deterministic team power for previews (dashboard win probability).
 * Same logic as calculateTeamMatchPower but without variance — stable across refreshes.
 */
function calculateTeamExpectedPower(team, context) {
  return calculateTeamMatchPower(
    { team, environment: context.environment, meta: context.meta },
    { useVariance: false }
  );
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
  let powerA = powerAData.finalPower;
  let powerB = powerBData.finalPower;

  // Apply one-match pending decision modifier to the user fixture only.
  const _decisionMod = window.Nexus && window.Nexus._pendingMatchModifier;
  const _userTeamRef =
    (window.Nexus && window.Nexus.getUserTeam && window.Nexus.getUserTeam()) ||
    (window.Nexus && window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) ||
    null;
  const _isUserMatch = _userTeamRef && (
    (teamA && teamA.name === _userTeamRef.name) ||
    (teamB && teamB.name === _userTeamRef.name)
  );
  if (_decisionMod && _userTeamRef && _isUserMatch) {
    if (teamA && teamA.name === _userTeamRef.name) {
      powerA = (powerA || 0) * (_decisionMod.userPowerMult || 1);
      powerB = (powerB || 0) * (_decisionMod.opponentPowerMult || 1);
    } else if (teamB && teamB.name === _userTeamRef.name) {
      powerB = (powerB || 0) * (_decisionMod.userPowerMult || 1);
      powerA = (powerA || 0) * (_decisionMod.opponentPowerMult || 1);
    }
  }

  const probA = calculateWinProbability(powerA, powerB);

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

  const result = {
    winner,
    scoreA,
    scoreB,
    playerPerformances,
    stage: undefined,
    probabilityA: Math.round(probA * 100) + '%',
    teamAPower: powerA.toFixed(2),
    teamBPower: powerB.toFixed(2),
    teamASynergy: powerAData.synergy,
    teamBSynergy: powerBData.synergy
  };

  if (_decisionMod && _userTeamRef && _isUserMatch) {
    // Apply morale penalty only when the user team loses and the selected event has that downside.
    if (_decisionMod.onLossMoraleAllDelta) {
      const userLost = result.winner && result.winner !== _userTeamRef.name;
      if (userLost) {
        (_userTeamRef.players || []).forEach(function(p) {
          p.morale = clamp((p.morale != null ? p.morale : 70) + _decisionMod.onLossMoraleAllDelta, 0, 100);
        });
      }
    }

    // Lightweight injury-risk implementation: can cause morale drops (minor knocks).
    const injuryEvents = [];
    const applyDecisionInjuryRisk = function(team) {
      if (!team || team.name !== _userTeamRef.name) return;
      const starters = (team.starterSlots && team.starterSlots.length ? team.starterSlots : (team.starters || team.players || []))
        .filter(Boolean)
        .slice(0, 5);
      starters.forEach(function(player) {
        var injuryChance = 0;
        if (_decisionMod.injuryRiskBonus) injuryChance += _decisionMod.injuryRiskBonus;
        if (_decisionMod.concernedPlayerInjuryRiskBonus && _decisionMod.concernedPlayerId && player.id === _decisionMod.concernedPlayerId) {
          injuryChance += _decisionMod.concernedPlayerInjuryRiskBonus;
        }
        injuryChance = clamp(injuryChance, 0, 0.95);
        if (injuryChance > 0 && Math.random() < injuryChance) {
          var moraleDrop = randomInt(4, 10);
          player.morale = clamp((player.morale != null ? player.morale : 70) - moraleDrop, 0, 100);
          injuryEvents.push({
            team: team.name,
            player: getPlayerDisplayName(player),
            moraleDrop: moraleDrop
          });
        }
      });
    };
    applyDecisionInjuryRisk(teamA);
    applyDecisionInjuryRisk(teamB);
    if (injuryEvents.length > 0) result.injuryEvents = injuryEvents;

    window.Nexus._pendingMatchModifier = null;
  }

  return result;
}

var MVP_ROLE_WEIGHTS = { Duelist: 0.40, Controller: 0.30, Sentinel: 0.20, Initiator: 0.10 };
var MVP_ROLE_ORDER = { Duelist: 0, Controller: 1, Sentinel: 2, Initiator: 3 };

function pickMatchMVP(winningTeamName, playerPerformances) {
  if (!playerPerformances || typeof playerPerformances !== 'object') return null;

  var all = [];
  var teamNames = Object.keys(playerPerformances);
  for (var t = 0; t < teamNames.length; t++) {
    var teamName = teamNames[t];
    var list = playerPerformances[teamName];
    if (!Array.isArray(list)) continue;
    for (var i = 0; i < list.length; i++) {
      var x = list[i];
      var p = x && x.player;
      if (!p) continue;
      var rating = typeof x.rating === 'number' ? x.rating : (x.matchPower != null ? x.matchPower : 0);
      var role = (p.assignedRole || (p.roleBias && p.roleBias.primaryRoleBias)) || '';
      var roleOrder = MVP_ROLE_ORDER[role] != null ? MVP_ROLE_ORDER[role] : 99;
      all.push({
        player: p,
        rating: rating,
        matchPower: x.matchPower != null ? x.matchPower : 0,
        isWinningTeam: teamName === winningTeamName,
        roleOrder: roleOrder
      });
    }
  }
  if (all.length === 0) return null;

  all.sort(function(a, b) {
    if (a.rating !== b.rating) return b.rating - a.rating;
    if (a.isWinningTeam !== b.isWinningTeam) return a.isWinningTeam ? -1 : 1;
    if (a.roleOrder !== b.roleOrder) return a.roleOrder - b.roleOrder;
    return Math.random() < 0.5 ? -1 : 1;
  });

  return all[0].player;
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
window.Nexus.calculateTeamExpectedPower = calculateTeamExpectedPower;
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

function normalizeMatchdayMatches(dayEntry) {
  if (Array.isArray(dayEntry)) return dayEntry.filter(Boolean);
  if (dayEntry && Array.isArray(dayEntry.matches)) return dayEntry.matches.filter(Boolean);
  return [];
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
    playedMatchResults: [],
    matchDecisionState: { resolvedFixtures: {}, pending: null }
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

  const playedMatchdayIndex = season.currentMatchday;
  const todayMatches = normalizeMatchdayMatches((season.matchdays || [])[season.currentMatchday]);
  const results = [];

  todayMatches.forEach(match => {
    if (window.Nexus.fillEmptyRosterSlotsForMatch) {
      window.Nexus.fillEmptyRosterSlotsForMatch(match.teamA);
      window.Nexus.fillEmptyRosterSlotsForMatch(match.teamB);
    }
    if (window.Nexus.shouldAIActivateBootcamp) {
      const involvesUser = userTeam && (
        match.teamA === userTeam ||
        match.teamB === userTeam ||
        (match.teamA && match.teamA.name === userTeam.name) ||
        (match.teamB && match.teamB.name === userTeam.name)
      );
      if (!involvesUser) {
        window.Nexus.shouldAIActivateBootcamp(match.teamA, match.teamB);
        window.Nexus.shouldAIActivateBootcamp(match.teamB, match.teamA);
      }
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

  // Process injuries: new rolls for players that played + tick recovery for all
  const allTeams = season.teams || [];
  const newInjuries = processMatchdayInjuries(results, allTeams, environmentMap, season, userTeam);

  // Process form: update team recentForm + player recentRatings
  processMatchdayForm(results);

  // Process morale: update all players across all teams
  const moraleEvents = processMatchdayMorale(results, allTeams, environmentMap, season, playedMatchdayIndex);

  return {
    finished: false,
    matchdayResults: results,
    newMeta: newMeta || undefined,
    newInjuries,
    moraleEvents
  };
}

// -------------------------------------------------
// INJURY SYSTEM
// -------------------------------------------------

/**
 * Returns the injury object for a player, or null if healthy.
 * Safely handles old save data where injury field may be undefined.
 */
function getPlayerInjury(player) {
  return (player && player.injury && player.injury.severity) ? player.injury : null;
}

/**
 * Roll for a new injury on a player after a match.
 * @param {object} player
 * @param {object} environment - team environment (infrastructure, psychologySupport)
 * @returns injury object or null
 */
function rollInjuryForPlayer(player, environment) {
  // Already Major-injured: no stacking
  const existing = getPlayerInjury(player);
  if (existing && existing.severity === 'Major') return null;

  // Base chance per matchday
  let chance = 0.07;

  // High pressure increases risk
  const pressure = (environment && environment.pressure != null) ? environment.pressure : 50;
  if (pressure > 70) chance += 0.04;
  else if (pressure > 55) chance += 0.02;

  // Low mental increases risk
  const mental = player.stats && player.stats.mental ? player.stats.mental.current : 50;
  if (mental < 40) chance += 0.04;
  else if (mental < 55) chance += 0.02;

  // Good facilities reduce risk
  const infra = (environment && environment.infrastructure != null) ? environment.infrastructure : 50;
  if (infra >= 80) chance -= 0.03;
  else if (infra >= 65) chance -= 0.015;

  // Psychology support reduces risk
  const psych = (environment && environment.psychologySupport != null) ? environment.psychologySupport : 0;
  if (psych >= 3) chance -= 0.02;
  else if (psych >= 2) chance -= 0.01;

  // Playing while Moderate: higher chance of aggravation to Major
  if (existing && existing.severity === 'Moderate') {
    if (Math.random() < INJURY_SEVERITY.Moderate.aggravateChance) {
      // Aggravate to Major
      const md = randomInt(INJURY_SEVERITY.Major.matchdays[0], INJURY_SEVERITY.Major.matchdays[1]);
      player.injury = { type: existing.type, severity: 'Major', matchdaysLeft: md, affectedStats: existing.affectedStats };
      return player.injury;
    }
    return null; // already injured, no new roll
  }

  // Low morale increases injury risk (stress/burnout)
  chance += getMoraleInjuryRisk(player.morale);

  chance = Math.max(0.01, Math.min(0.20, chance));
  if (Math.random() > chance) return null;

  // Pick injury type (contextual weights)
  const primaryRole = player.roleBias && player.roleBias.primaryRoleBias;
  let typeKeys = Object.keys(INJURY_TYPES);
  // Duelists more prone to RSI, Controllers/Initiators to Burnout
  let weights = { RSI: 2, Burnout: 2, EyeStrain: 1, Illness: 1.5, BackPain: 1 };
  if (primaryRole === 'Duelist') weights.RSI = 4;
  if (primaryRole === 'Controller' || primaryRole === 'Initiator') weights.Burnout = 4;
  if (infra < 50) weights.BackPain = 3;
  if (pressure > 65) weights.Burnout = Math.max(weights.Burnout, 3);

  const totalWeight = typeKeys.reduce((s, k) => s + (weights[k] || 1), 0);
  let r = Math.random() * totalWeight;
  let chosenType = typeKeys[0];
  for (const k of typeKeys) {
    r -= (weights[k] || 1);
    if (r <= 0) { chosenType = k; break; }
  }

  // Pick severity (biased toward Minor/Moderate)
  const severityRoll = Math.random();
  let severity;
  if (severityRoll < 0.55) severity = 'Minor';
  else if (severityRoll < 0.90) severity = 'Moderate';
  else severity = 'Major';

  const sevDef = INJURY_SEVERITY[severity];
  const matchdaysLeft = randomInt(sevDef.matchdays[0], sevDef.matchdays[1]);

  player.injury = {
    type: chosenType,
    severity,
    matchdaysLeft,
    affectedStats: INJURY_TYPES[chosenType].affectedStats
  };
  return player.injury;
}

/**
 * After a matchday: trigger injury rolls for all players that played,
 * then tick down recovery for all injured players on all teams.
 */
function processMatchdayInjuries(matchResults, allTeams, environmentMap) {
  const newInjuries = []; // { player, team, injury } — returned so UI can notify

  // 1. Roll for new injuries on players that played
  matchResults.forEach(({ match, result }) => {
    [match.teamA, match.teamB].forEach(team => {
      const env = (environmentMap && environmentMap[team.name]) || {};
      const lineup = (result.playerPerformances && result.playerPerformances[team.name]) || [];
      const playedPlayers = lineup.map(x => x.player).filter(Boolean);
      playedPlayers.forEach(player => {
        const inj = rollInjuryForPlayer(player, env);
        if (inj) newInjuries.push({ player, team, injury: inj });
      });
    });
  });

  // 2. Tick recovery for all injured players across all teams
  const userTeam = (arguments.length >= 4 && arguments[4]) ? arguments[4] : null;
  const seasonForChat = (arguments.length >= 4 && arguments[3]) ? arguments[3] : null;
  allTeams.forEach(team => {
    const allPlayers = team.players || [];
    allPlayers.forEach(player => {
      const inj = getPlayerInjury(player);
      if (!inj) return;
      const wasMajor = inj.severity === 'Major';
      inj.matchdaysLeft--;
      if (inj.matchdaysLeft <= 0) {
        player.injury = null; // fully recovered
        if (wasMajor && seasonForChat && seasonForChat.inbox && userTeam && team === userTeam && typeof triggerPlayerChat === 'function') {
          triggerPlayerChat(seasonForChat, player, 'return_from_injury');
        }
      }
    });
  });

  return newInjuries;
}

/**
 * Apply clinic treatment to a player (spend money, reduce injury).
 * Minor/Moderate: instant heal. Major: reduce to Moderate (3 matchdays).
 */
function applyClinicVisit(player, team) {
  const inj = getPlayerInjury(player);
  if (!inj) return { success: false, message: 'Player is not injured.' };

  const cost = INJURY_CLINIC_COST[inj.severity];
  const capital = team.capital != null ? team.capital : 0;
  if (capital < cost) {
    return { success: false, message: 'Not enough capital. Clinic costs $' + cost.toLocaleString() + '.' };
  }

  team.capital -= cost;

  if (inj.severity === 'Minor' || inj.severity === 'Moderate') {
    player.injury = null;
    return { success: true, cost, message: 'Player fully recovered. Cost: $' + cost.toLocaleString() + '.' };
  }
  // Major → reduce to Moderate level (3 matchdays, can play again)
  player.injury = { type: inj.type, severity: 'Moderate', matchdaysLeft: 3, affectedStats: inj.affectedStats };
  return { success: true, cost, message: 'Injury reduced to Moderate (3 matchdays). Cost: $' + cost.toLocaleString() + '.' };
}

window.Nexus.getPlayerInjury = getPlayerInjury;
window.Nexus.applyClinicVisit = applyClinicVisit;
window.Nexus.INJURY_CLINIC_COST = INJURY_CLINIC_COST;
window.Nexus.INJURY_SEVERITY = INJURY_SEVERITY;
window.Nexus.INJURY_TYPES = INJURY_TYPES;

// -------------------------------------------------
// FORM & MOMENTUM SYSTEM
// -------------------------------------------------

/**
 * Reset form at season start for all teams and players.
 * Called via Nexus.initializeMomentum(season).
 */
function initializeMomentum(season) {
  if (!season || !season.teams) return;
  season.teams.forEach(team => {
    team.recentForm = [];
    (team.players || []).forEach(player => {
      player.recentRatings = [];
      player.morale = 70; // reset to neutral-positive at season start
    });
  });
}

/**
 * Team momentum score: wins - losses in last 5 matches.
 * Range: -5 (all losses) to +5 (all wins). 0 = no data yet.
 */
function getTeamMomentumScore(team) {
  const form = team.recentForm || [];
  if (!form.length) return 0;
  const wins = form.filter(r => r === 'W').length;
  const losses = form.filter(r => r === 'L').length;
  return wins - losses;
}

/**
 * Match power multiplier from team momentum.
 * Hot streak: up to +5%. Cold streak: down to -5%.
 */
function getTeamFormMultiplier(team) {
  const score = getTeamMomentumScore(team);
  if (score >= 5) return 1.05;
  if (score >= 3) return 1.03;
  if (score >= 1) return 1.01;
  if (score <= -5) return 0.95;
  if (score <= -3) return 0.97;
  if (score <= -1) return 0.99;
  return 1.0;
}

/**
 * Individual player form state based on last 3 match ratings.
 * Returns 'hot', 'cold', or 'normal'.
 */
function getPlayerFormState(player) {
  const ratings = player.recentRatings || [];
  if (ratings.length < 2) return 'normal';
  const avg = ratings.reduce((s, v) => s + v, 0) / ratings.length;
  if (avg >= 7.0) return 'hot';
  if (avg <= 4.5) return 'cold';
  return 'normal';
}

/**
 * Match power multiplier from individual player form.
 * Hot: +5%. Cold: -5%.
 */
function getPlayerFormMultiplier(player) {
  const state = getPlayerFormState(player);
  if (state === 'hot') return 1.05;
  if (state === 'cold') return 0.95;
  return 1.0;
}

/**
 * After each matchday: update recentForm for each team and
 * recentRatings for each player that played.
 */
function processMatchdayForm(matchResults) {
  matchResults.forEach(({ match, result }) => {
    [
      { team: match.teamA, won: result.winner === match.teamA.name },
      { team: match.teamB, won: result.winner === match.teamB.name }
    ].forEach(({ team, won }) => {
      if (!Array.isArray(team.recentForm)) team.recentForm = [];
      team.recentForm.push(won ? 'W' : 'L');
      if (team.recentForm.length > 5) team.recentForm = team.recentForm.slice(-5);

      // Update individual player ratings from this match
      const performances = (result.playerPerformances && result.playerPerformances[team.name]) || [];
      performances.forEach(({ player, rating }) => {
        if (!player || rating == null) return;
        if (!Array.isArray(player.recentRatings)) player.recentRatings = [];
        player.recentRatings.push(rating);
        if (player.recentRatings.length > 3) player.recentRatings = player.recentRatings.slice(-3);
      });
    });
  });
}

window.Nexus.initializeMomentum = initializeMomentum;
window.Nexus.getTeamMomentumScore = getTeamMomentumScore;
window.Nexus.getPlayerFormState = getPlayerFormState;
window.Nexus.getTeamFormMultiplier = getTeamFormMultiplier;

// -------------------------------------------------
// MORALE SYSTEM
// -------------------------------------------------

const MORALE_LABELS = [
  { min: 90, label: 'Thriving',  cssClass: 'morale--thriving'  },
  { min: 75, label: 'Happy',     cssClass: 'morale--happy'     },
  { min: 55, label: 'Neutral',   cssClass: 'morale--neutral'   },
  { min: 35, label: 'Unsettled', cssClass: 'morale--unsettled' },
  { min: 20, label: 'Unhappy',   cssClass: 'morale--unhappy'   },
  { min: 0,  label: 'Miserable', cssClass: 'morale--miserable' }
];

function getMoraleInfo(morale) {
  const m = morale != null ? morale : 70;
  return MORALE_LABELS.find(e => m >= e.min) || MORALE_LABELS[MORALE_LABELS.length - 1];
}

/** Match power multiplier from morale. */
function getMoraleMatchMultiplier(morale) {
  const m = morale != null ? morale : 70;
  if (m >= 90) return 1.03;
  if (m >= 75) return 1.01;
  if (m >= 55) return 1.00;
  if (m >= 35) return 0.98;
  if (m >= 20) return 0.95;
  return 0.92; // Miserable
}

/** Training growth multiplier from morale. */
function getMoraleTrainingMultiplier(morale) {
  const m = morale != null ? morale : 70;
  if (m >= 75) return 1.05;
  if (m >= 55) return 1.00;
  if (m >= 35) return 0.95;
  return 0.85;
}

/** Extra injury risk from low morale (additive %). */
function getMoraleInjuryRisk(morale) {
  const m = morale != null ? morale : 70;
  if (m < 20) return 0.04;
  if (m < 35) return 0.02;
  return 0;
}

/** Rough market salary for a player (used for morale salary comparison). */
function getMarketSalaryForPlayer(player) {
  const overall = getPlayerOverall(player);
  if (overall >= 80) return 20000;
  if (overall >= 70) return 11500;
  if (overall >= 60) return 6000;
  return 3000;
}

/**
 * How much psychology support reduces negative morale changes.
 * psychologySupport ranges 50-95. Returns 0.0 – 0.60 reduction factor.
 */
function getPsychMoraleReduction(environment) {
  const support = (environment && environment.psychologySupport != null) ? environment.psychologySupport : 50;
  return Math.max(0, (support - 50) / 75); // 0 at lvl1, ~0.20 lvl2, ~0.40 lvl3, ~0.60 lvl4
}

/**
 * Process morale for all players on all teams after a matchday.
 * Returns array of { player, team, event } for UI notifications.
 */
function processMatchdayMorale(matchResults, allTeams, environmentMap, season, playedMatchdayIndex) {
  const events = []; // morale threshold crossings to notify
  const userTeam = (window.Nexus && typeof window.Nexus.getUserTeam === 'function')
    ? window.Nexus.getUserTeam()
    : (window.Nexus && window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]);

  function hasOpenScenarioThread(playerId, scenarioKey) {
    if (!season || !season.inbox || !Array.isArray(season.inbox.chats)) return false;
    return season.inbox.chats.some(function(c) {
      return c && c.playerId === playerId && c.scenario === scenarioKey && !c.resolved;
    });
  }

  // Build set of player ids that played this matchday, and their match result
  const playedMap = new Map(); // playerId -> { won, team }
  matchResults.forEach(({ match, result }) => {
    [
      { team: match.teamA, won: result.winner === match.teamA.name },
      { team: match.teamB, won: result.winner === match.teamB.name }
    ].forEach(({ team, won }) => {
      const performances = (result.playerPerformances && result.playerPerformances[team.name]) || [];
      performances.forEach(({ player }) => {
        if (player) playedMap.set(player.id, { won, team });
      });
    });
  });

  allTeams.forEach(team => {
    const env = (environmentMap && environmentMap[team.name]) || {};
    const psychReduction = getPsychMoraleReduction(env);
    const prestige = team.prestige != null ? team.prestige : 50;
    const momentumScore = getTeamMomentumScore(team);

    // Last match result for this team (for bench/reserve players)
    const lastResult = (team.recentForm || []).slice(-1)[0]; // 'W' or 'L' or undefined

    (team.players || []).forEach(player => {
      const prevMorale = player.morale != null ? player.morale : 70;
      let delta = 0;

      const played = playedMap.has(player.id);
      const info = played ? playedMap.get(player.id) : null;

      if (played) {
        // Player was in the starting lineup
        if (info.won) {
          delta += 3;
          // Win streak bonus
          const form = team.recentForm || [];
          const streak = [...form].reverse().findIndex(r => r !== 'W');
          const winStreak = streak === -1 ? form.length : streak;
          if (winStreak >= 3) delta += 2;
        } else {
          delta -= 2;
          const form = team.recentForm || [];
          const streak = [...form].reverse().findIndex(r => r !== 'L');
          const lossStreak = streak === -1 ? form.length : streak;
          if (lossStreak >= 3) delta -= 2;
        }
      } else {
        // On bench/reserves — frustration at not playing
        if (lastResult === 'W') delta -= 1;
        else if (lastResult === 'L') delta -= 1;
      }

      // If the manager promised a starting spot for this exact matchday, enforce it.
      const promisedStarterMatchday = player.promisedStarterMatchday;
      const numericPromiseMatchday = promisedStarterMatchday != null ? Number(promisedStarterMatchday) : null;
      if (
        userTeam &&
        team === userTeam &&
        Number.isFinite(numericPromiseMatchday) &&
        playedMatchdayIndex != null &&
        playedMatchdayIndex >= numericPromiseMatchday
      ) {
        if (playedMatchdayIndex === numericPromiseMatchday && played) {
          delta += 2; // extra morale bump for keeping your word and actually fielding him
          events.push({ player, team, gameTimePromiseKept: true });
        } else {
          delta -= 8; // sharp morale hit when the promise is broken
          events.push({ player, team, gameTimePromiseBroken: true });
        }
        player.promisedStarterMatchday = null;
      }

      // Salary vs market value
      const market = getMarketSalaryForPlayer(player);
      const sal = player.salary || 5000;
      if (sal >= market * 1.15) delta += 1;
      else if (sal < market * 0.85) delta -= 1;

      // Injury
      const inj = getPlayerInjury(player);
      if (inj) delta -= 2;

      // Final year contract anxiety
      if ((player.contractYears != null ? player.contractYears : 1) <= 1) delta -= 1;

      // Team prestige effect
      if (prestige < 40) delta -= 1;
      else if (prestige > 75) delta += 0.5;

      // Facilities
      if (env.infrastructure >= 80) delta += 0.5;

      // Team on bad momentum
      if (momentumScore <= -3) delta -= 1;

      // Psychology support reduces negative changes
      if (delta < 0) delta *= (1 - psychReduction);

      // Natural decay toward 60 (very gentle)
      if (prevMorale > 60) delta -= 0.3;
      else if (prevMorale < 60) delta += 0.3;

      const newMorale = Math.max(0, Math.min(100, prevMorale + delta));
      player.morale = newMorale;

      // Detect threshold crossings (for notifications on user team)
      const prevLabel = getMoraleInfo(prevMorale).label;
      const newLabel  = getMoraleInfo(newMorale).label;
      if (prevLabel !== newLabel) {
        const dropped = (newLabel === 'Unhappy' || newLabel === 'Miserable');
        const improved = (newLabel === 'Happy' || newLabel === 'Thriving');
        if (dropped || improved) {
          events.push({ player, team, newLabel, dropped });
        }
      }

      // Player asks for more minutes only when morale falls below 45 (but not transfer-zone yet)
      const crossedBelowGameTimeThreshold = prevMorale >= 45 && newMorale < 45 && newMorale >= 30;
      if (
        crossedBelowGameTimeThreshold &&
        userTeam &&
        team === userTeam &&
        !played &&
        !hasOpenScenarioThread(player.id, 'more_game_time_request')
      ) {
        events.push({ player, team, moreGameTimeRequest: true, newLabel });
      }

      // Morale-driven transfer request (only when morale falls below 30)
      const crossedBelowTransferThreshold = prevMorale >= 30 && newMorale < 30;
      if (crossedBelowTransferThreshold && !player.transferListed) {
        player.transferListed = true;
        events.push({ player, team, transferRequest: true, newLabel });
      }
    });
  });

  return events;
}

window.Nexus.getMoraleInfo = getMoraleInfo;
window.Nexus.getMoraleMatchMultiplier = getMoraleMatchMultiplier;
window.Nexus.getMarketSalaryForPlayer = getMarketSalaryForPlayer;
window.Nexus.getMoraleInjuryRisk = getMoraleInjuryRisk;

// =====================================================================
// INBOX SYSTEM — Persistent Mails + Player Chat Threads
// =====================================================================

const CHAT_SCENARIOS = {
  transfer_request: {
    icon: '😤',
    getOpening: function() {
      return '"I\'ve been thinking about this a lot. I\'m not happy here and I think it\'s time for me to move on."';
    },
    options: [
      { label: "We\'ll find you a suitable club", moraleDelta: 5, transferList: true, managerReply: 'I appreciate your honesty. I\'ll make sure we find you the right opportunity.', resolved: true },
      { label: "You\'re vital to us — please reconsider", moraleDelta: 8, managerReply: 'I hear you. Let\'s talk about what would make you stay.', next: 'transfer_request_stay' },
      { label: 'You signed a contract, honour it', moraleDelta: -12, managerReply: 'This isn\'t the right time for this conversation. Focus on the team.', resolved: true }
    ]
  },
  transfer_request_stay: {
    icon: '😤',
    getOpening: function() {
      return '"I\'ll give it more time. But I need to see changes — a better contract, a bigger role. Something."';
    },
    options: [
      { label: "We\'ll offer a new contract soon", moraleDelta: 5, managerReply: 'You have my word. We\'ll sit down and sort something out.', resolved: true },
      { label: 'Your performances will decide your future', moraleDelta: 0, managerReply: 'Show us what you can do and we\'ll take care of the rest.', resolved: true }
    ]
  },
  more_game_time_request: {
    icon: '🕒',
    getOpening: function() {
      return '"Coach, I need more game time. I can do more for this team if you trust me with a starting spot."';
    },
    options: [
      { label: "You\'re right — you start next matchday", moraleDelta: 7, promiseStarter: true, managerReply: 'Understood. You will start in the next matchday, so be ready.', resolved: true },
      { label: "Keep pushing, your minutes will come soon", moraleDelta: 3, managerReply: 'Stay focused and keep training hard. You\'re close to earning more time.', resolved: true },
      { label: 'No promises right now — lineup stays by merit', moraleDelta: -7, managerReply: 'I need to keep competition high. Keep proving yourself and your role will grow.', resolved: true }
    ]
  },
  contract_expiring: {
    icon: '📋',
    getOpening: function() {
      return '"My contract is running out at the end of this season. I\'d like to know where I stand."';
    },
    options: [
      { label: "We want to keep you — let\'s negotiate", moraleDelta: 6, managerReply: 'Absolutely. Come speak to me and we\'ll work out a deal.', resolved: true },
      { label: "We\'re still evaluating our options", moraleDelta: -5, managerReply: 'I\'ll get back to you before the end of the season.', resolved: true },
      { label: "We\'ll let your contract run out", moraleDelta: -15, transferList: true, managerReply: 'I respect everything you\'ve done, but we\'re going in a different direction.', resolved: true }
    ]
  },
  major_injury: {
    icon: '🏥',
    getOpening: function(name, extra) {
      return '"' + (extra || 'This injury') + ' has really knocked me. How long am I actually going to be out for?"';
    },
    options: [
      { label: "We\'re sending you to the clinic immediately", moraleDelta: 10, clinic: true, managerReply: 'Your health comes first. We\'ll get you the best treatment available.', resolved: true },
      { label: 'Take all the time you need to recover', moraleDelta: 5, managerReply: 'Don\'t rush back. We need you at 100% when you return.', resolved: true },
      { label: 'We need you back as soon as possible', moraleDelta: -8, managerReply: 'I know it\'s hard, but the team needs you.', resolved: true }
    ]
  },
  hot_streak: {
    icon: '🔥',
    getOpening: function() {
      return '"I\'ve been on fire lately and I think I\'m performing at a level that deserves more recognition."';
    },
    options: [
      { label: "You\'re our standout player right now", moraleDelta: 10, managerReply: 'Keep it up. Everyone in the team sees what you\'re doing.', resolved: true },
      { label: 'Great form — keep building on it', moraleDelta: 5, managerReply: 'You\'re doing well. Stay focused and keep improving.', resolved: true },
      { label: "Don\'t let it go to your head", moraleDelta: -3, managerReply: 'It\'s a team game. Stay grounded.', resolved: true }
    ]
  },
  youth_promoted: {
    icon: '🌟',
    getOpening: function() {
      return '"I\'m so excited to join the main roster! I won\'t let you down — I\'ll work hard and prove myself."';
    },
    options: [
      { label: 'Welcome to the team', moraleDelta: 8, managerReply: 'You earned it. Make the most of it.', resolved: true },
      { label: 'Work hard and earn your spot', moraleDelta: 5, managerReply: 'Keep your head down and show us what you can do.', resolved: true },
      { label: "Show us what you've got", moraleDelta: 6, managerReply: 'We\'re counting on you. Don\'t hold back.', resolved: true }
    ]
  },
  new_signing: {
    icon: '🤝',
    getOpening: function() {
      return '"Thanks for the opportunity. I\'m ready to prove myself and contribute to the team."';
    },
    options: [
      { label: 'Welcome aboard', moraleDelta: 8, managerReply: 'Glad to have you. Let\'s get to work.', resolved: true },
      { label: 'We expect big things', moraleDelta: 6, managerReply: 'We brought you here for a reason. Show it.', resolved: true },
      { label: 'Fit in and work hard', moraleDelta: 5, managerReply: 'Integrate with the group and give 100%.', resolved: true }
    ]
  },
  return_from_injury: {
    icon: '💪',
    getOpening: function() {
      return '"I\'m back and ready to play. Thanks for the support during the recovery."';
    },
    options: [
      { label: 'Good to have you back', moraleDelta: 8, managerReply: 'We missed you. Ease in and stay sharp.', resolved: true },
      { label: 'Ease back in', moraleDelta: 5, managerReply: 'Don\'t rush. We need you at 100%.', resolved: true },
      { label: 'We need you at 100%', moraleDelta: 3, managerReply: 'Get up to speed quickly. The team needs you.', resolved: true }
    ]
  },
  signed_to_academy: {
    icon: '📚',
    getOpening: function() {
      return '"I\'m really grateful for the chance to develop here. I\'ll give it my all."';
    },
    options: [
      { label: 'Welcome to the academy', moraleDelta: 6, managerReply: 'Focus on growth. We\'re watching.', resolved: true },
      { label: 'Work hard and you\'ll go far', moraleDelta: 5, managerReply: 'Develop your game. The path is there.', resolved: true }
    ]
  },
  transfer_listed: {
    icon: '📋',
    getOpening: function() {
      return '"I\'ve been put on the transfer list. I understand the decision — but I want to know where I stand."';
    },
    options: [
      { label: "We'll find you the right move", moraleDelta: 5, managerReply: 'We\'ll do our best to find a good fit for you.', resolved: true },
      { label: 'Your performances will decide', moraleDelta: 0, managerReply: 'If you play well, we might take you off. Ball is in your court.', resolved: true },
      { label: 'You can play your way back', moraleDelta: 3, managerReply: 'Nothing is set in stone. Prove us wrong.', resolved: true }
    ]
  },
  youth_released: {
    icon: '😔',
    getOpening: function() {
      return '"I\'m disappointed but I understand. Thank you for the opportunity you gave me."';
    },
    options: [
      { label: 'We wish you the best', moraleDelta: 2, managerReply: 'Keep working. You\'ll find your place somewhere.', resolved: true },
      { label: 'Keep working and you\'ll find a place', moraleDelta: 0, managerReply: 'Don\'t give up. Another door will open.', resolved: true }
    ]
  },
  trophy_or_playoffs: {
    icon: '🏆',
    getOpening: function() {
      return '"We did it! I\'m so proud of this team. Everyone stepped up when it mattered."';
    },
    options: [
      { label: 'Everyone played their part', moraleDelta: 8, managerReply: 'That\'s what we needed. More of the same.', resolved: true },
      { label: 'Now let\'s push for more', moraleDelta: 6, managerReply: 'One step at a time. Next target is ahead.', resolved: true }
    ]
  },
  relegation_survived: {
    icon: '😤',
    getOpening: function() {
      return '"That was way too close. We need to be better next season — no more scraping by."';
    },
    options: [
      { label: 'We\'ll be better next time', moraleDelta: 5, managerReply: 'We learn from this. Next season we improve.', resolved: true },
      { label: 'Use this as motivation', moraleDelta: 6, managerReply: 'Channel that feeling. Don\'t let it happen again.', resolved: true }
    ]
  },
  morale_improved: {
    icon: '🙂',
    getOpening: function() {
      return '"I\'ve been in a better headspace lately. Ready to contribute and help the team."';
    },
    options: [
      { label: 'Good to hear', moraleDelta: 5, managerReply: 'Keep it up. We need you focused.', resolved: true },
      { label: 'That\'s what we need', moraleDelta: 6, managerReply: 'Channel that into your performances.', resolved: true }
    ]
  }
};

let _inboxMailIdCounter = 1;

function initInbox(season) {
  season.inbox = { mails: [], chats: [] };
}

function addMail(season, opts) {
  if (!season || !season.inbox) return;
  const mail = {
    id: 'mail_' + (_inboxMailIdCounter++),
    type: opts.type || 'info',
    icon: opts.icon || '📬',
    title: opts.title || '',
    body: opts.body || '',
    matchday: opts.matchday != null ? opts.matchday : (season.currentMatchday || 0),
    read: false,
    actionRoute: opts.actionRoute || null,
    actionLabel: opts.actionLabel || null
  };
  if (opts.offers && Array.isArray(opts.offers)) mail.offers = opts.offers;
  if (opts.actionTab) mail.actionTab = opts.actionTab;
  season.inbox.mails.unshift(mail);
}

function triggerPlayerChat(season, player, scenarioKey, extraText) {
  if (!season || !season.inbox || !player) return;
  const scenario = CHAT_SCENARIOS[scenarioKey];
  if (!scenario) return;
  const existing = season.inbox.chats.find(function(c) {
    return c.playerId === player.id && c.scenario === scenarioKey && !c.resolved;
  });
  if (existing) return;
  const name = getPlayerDisplayName(player);
  season.inbox.chats.unshift({
    playerId: player.id,
    playerName: name,
    scenario: scenarioKey,
    icon: scenario.icon || '💬',
    resolved: false,
    unread: true,
    messages: [{ from: 'player', text: scenario.getOpening(name, extraText), options: scenario.options.slice(), matchday: season.currentMatchday || 0 }]
  });
}

function applyChatOption(season, playerId, optionIndex) {
  if (!season || !season.inbox) return null;
  const thread = season.inbox.chats.find(function(c) { return c.playerId === playerId && !c.resolved; });
  if (!thread) return null;
  const lastMsg = thread.messages[thread.messages.length - 1];
  if (!lastMsg || lastMsg.from !== 'player' || !lastMsg.options) return null;
  const option = lastMsg.options[optionIndex];
  if (!option) return null;
  lastMsg.options = null;
  thread.messages.push({ from: 'manager', text: '"' + option.managerReply + '"', matchday: season.currentMatchday || 0 });
  const userTeam = window.Nexus && window.Nexus.LEAGUE && window.Nexus.LEAGUE[0];
  const player = userTeam && (userTeam.players || []).find(function(p) { return p.id === playerId; });
  if (player) {
    if (option.moraleDelta) player.morale = Math.max(0, Math.min(100, (player.morale || 70) + option.moraleDelta));
    if (option.transferList) player.transferListed = true;
    if (option.promiseStarter) {
      player.promisedStarterMatchday = season.currentMatchday != null ? season.currentMatchday : 0;
    }
    if (option.clinic && player.injury && window.Nexus.applyClinicVisit && userTeam && userTeam.finance) {
      const cost = (window.Nexus.INJURY_CLINIC_COST || {})[player.injury.severity] || 35000;
      if ((userTeam.finance.capital || 0) >= cost) window.Nexus.applyClinicVisit(userTeam, player);
    }
  }
  if (option.next) {
    const nextScenario = CHAT_SCENARIOS[option.next];
    if (nextScenario) {
      const nm = player ? getPlayerDisplayName(player) : thread.playerName;
      thread.messages.push({ from: 'player', text: nextScenario.getOpening(nm), options: nextScenario.options.slice(), matchday: season.currentMatchday || 0 });
      thread.unread = true;
      return 'followup';
    }
  }
  if (option.resolved) thread.resolved = true;
  return 'resolved';
}

function checkContractExpiryChats(season, userTeam) {
  if (!season || !userTeam) return;
  (userTeam.players || []).forEach(function(player) {
    if ((player.contractYears != null ? player.contractYears : 1) === 1) {
      triggerPlayerChat(season, player, 'contract_expiring');
    }
  });
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

function getMainPlayoffOutcome(seasonData, teamName, regularPosition, usingChallengerStandings) {
  if (!teamName || usingChallengerStandings) return 'Championship Playoffs: Did not qualify';
  const qualified = regularPosition != null && regularPosition <= 6;
  if (!qualified) return 'Championship Playoffs: Did not qualify';

  const finalists = (seasonData && seasonData.playoffsBracket && Array.isArray(seasonData.playoffsBracket.finalists))
    ? seasonData.playoffsBracket.finalists
      .map(function(t) { return typeof t === 'string' ? t : (t && t.name); })
      .filter(Boolean)
    : [];

  if (finalists.length >= 2) {
    return finalists.indexOf(teamName) >= 0
      ? 'Championship Playoffs: Eliminated in final'
      : 'Championship Playoffs: Eliminated in semi finals';
  }

  return 'Championship Playoffs: Eliminated';
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

// PART 1b — INTERNATIONAL TEAM HELPER

function createInternationalTeam(region, teamName, avgStat) {
  const team = createTeam(teamName, 'Main');
  team.region = region;
  team.isInternational = true;

  // Calibrate player stats relative to league top-4 average
  if (avgStat != null) {
    const isElite = region === 'EU' || region === 'APAC';
    team.players.forEach(function(player) {
      STAT_KEYS.forEach(function(k) {
        // Regional band: EU/APAC +5→+10 above avg, LATAM/SA -5→-10 below avg
        const regionOffset = isElite ? randomInt(5, 10) : -randomInt(5, 10);
        // Per-stat random variance: ±6 to keep players feeling individual
        const variance = Math.round((Math.random() - 0.5) * 12);
        const newCurrent = Math.max(38, Math.min(96, Math.round(avgStat + regionOffset + variance)));
        player.stats[k].current = newCurrent;
        player.stats[k].minCap = Math.max(30, newCurrent - randomInt(5, 12));
        player.stats[k].maxCap = Math.min(99, newCurrent + randomInt(5, 15));
      });
    });
  }

  return team;
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
  const userTeam = (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
  const winners = [];
  const roundResults = [];

  bracket.matches.forEach(match => {
    if (window.Nexus.shouldAIActivateBootcamp) {
      const involvesUser = userTeam && (
        match.teamA === userTeam ||
        match.teamB === userTeam ||
        (match.teamA && match.teamA.name === userTeam.name) ||
        (match.teamB && match.teamB.name === userTeam.name)
      );
      if (!involvesUser) {
        window.Nexus.shouldAIActivateBootcamp(match.teamA, match.teamB);
        window.Nexus.shouldAIActivateBootcamp(match.teamB, match.teamA);
      }
    }
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

// PART 3b — MID-SEASON INVITATIONAL (Top 4 league + 4 international teams, single elim QF→SF→Final)

function createInvitationalBracket(top4, intlTeams) {
  return {
    round: 1, // 1=QF, 2=SF, 3=Final
    matches: [
      { teamA: top4[0], teamB: intlTeams[3] },
      { teamA: top4[1], teamB: intlTeams[2] },
      { teamA: top4[2], teamB: intlTeams[1] },
      { teamA: top4[3], teamB: intlTeams[0] }
    ]
  };
}

function transitionToInvitational(season) {
  const sorted = getSortedStandings(season.standings);
  const top4 = sorted.slice(0, 4).map(t => season.teams.find(team => team.name === t.teamName)).filter(Boolean);

  // Compute average current stat across all players in top 4 teams
  let statTotal = 0, statCount = 0;
  top4.forEach(function(team) {
    (team ? team.players : []).forEach(function(player) {
      STAT_KEYS.forEach(function(k) {
        if (player.stats && player.stats[k]) { statTotal += player.stats[k].current; statCount++; }
      });
    });
  });
  const avgStat = statCount > 0 ? statTotal / statCount : 68;

  const usedNames = new Set(season.teams.map(t => t.name));
  const regions = ['EU', 'APAC', 'LATAM', 'SA'];
  const intlTeams = regions.map(function(region) {
    const pool = INTERNATIONAL_TEAM_POOLS[region];
    const available = pool.filter(function(n) { return !usedNames.has(n); });
    const name = available.length ? available[randomInt(0, available.length - 1)] : (region + ' All-Stars');
    return createInternationalTeam(region, name, avgStat);
  });

  season.phase = 'invitational';
  season.invitationalTeams = top4.concat(intlTeams);
  season.invitationalBracket = createInvitationalBracket(top4, intlTeams);
}

function playInvitationalRound(season, environmentMap, meta) {
  const bracket = season.invitationalBracket;
  const defaultEnv = { coachQuality: 60, infrastructure: 60, psychologySupport: 60, pressure: 50 };
  const winners = [];
  const roundResults = [];

  bracket.matches.forEach(function(match) {
    const result = simulateMatch({
      teamA: match.teamA,
      teamB: match.teamB,
      environmentA: environmentMap[match.teamA.name] || defaultEnv,
      environmentB: environmentMap[match.teamB.name] || defaultEnv,
      meta
    });
    result.stage = 'invitational';

    const allTeams = season.invitationalTeams || [];
    const winnerTeam = allTeams.find(function(t) { return t.name === result.winner; })
      || season.teams.find(function(t) { return t.name === result.winner; });
    winners.push(winnerTeam);
    roundResults.push({ match, result });
  });

  // QF → SF
  if (bracket.round === 1) {
    bracket.sfParticipants = winners.slice();
    bracket.round = 2;
    bracket.matches = [
      { teamA: winners[0], teamB: winners[1] },
      { teamA: winners[2], teamB: winners[3] }
    ];
    return { finished: false, roundResults, invitationalRound: 'QF' };
  }

  // SF → Final
  if (bracket.round === 2) {
    bracket.round = 3;
    bracket.matches = [{ teamA: winners[0], teamB: winners[1] }];
    return { finished: false, roundResults, invitationalRound: 'SF' };
  }

  // Final → done
  if (bracket.round === 3) {
    const champion = winners[0];
    const runnerUp = bracket.matches[0].teamA === champion
      ? bracket.matches[0].teamB
      : bracket.matches[0].teamA;

    const sfLosers = (bracket.sfParticipants || []).filter(function(t) {
      return t && champion && t.name !== champion.name && runnerUp && t.name !== runnerUp.name;
    });

    const prizes = { champion: 300000, runnerUp: 150000, semifinalist: 50000 };
    [{ team: champion, prize: prizes.champion }, { team: runnerUp, prize: prizes.runnerUp }]
      .concat(sfLosers.map(function(t) { return { team: t, prize: prizes.semifinalist }; }))
      .forEach(function(entry) {
        if (entry.team && entry.team.finance) {
          entry.team.finance.capital += entry.prize;
          entry.team.finance.revenueThisSeason = (entry.team.finance.revenueThisSeason || 0) + entry.prize;
        }
      });

    if (champion) champion.prestige = (champion.prestige || 50) + 15;

    season.invitationalChampion = champion;
    season.invitationalPlayed = true;
    season.phase = 'regular'; // resume regular season from MD6
    return { finished: false, roundResults, invitationalRound: 'Final', invitationalChampion: champion, invitationalRunnerUp: runnerUp };
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
  const userTeam = (window.Nexus.LEAGUE && window.Nexus.LEAGUE[0]) || null;
  const results = [];
  const matchResults = [];
  const safeMain = Array.isArray(mainTeams) ? mainTeams : [];
  const safeChallenger = Array.isArray(challengerTeams) ? challengerTeams : [];

  for (let i = 0; i < 2; i++) {
    const main = safeMain[i];
    const challenger = safeChallenger[i];
    if (!main || !challenger || !main.name || !challenger.name) continue;

    if (window.Nexus.shouldAIActivateBootcamp) {
      const involvesUser = userTeam && (
        main === userTeam ||
        challenger === userTeam ||
        main.name === userTeam.name ||
        challenger.name === userTeam.name
      );
      if (!involvesUser) {
        window.Nexus.shouldAIActivateBootcamp(main, challenger);
        window.Nexus.shouldAIActivateBootcamp(challenger, main);
      }
    }
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

    // Trigger Mid-Season Invitational after matchday 5
    if (season.currentMatchday === 5 && !season.invitationalPlayed) {
      transitionToInvitational(season);
      return { ...result, phase: 'invitational' };
    }

    return { ...result, phase: 'regular' };
  }

  if (season.phase === 'invitational') {
    return playInvitationalRound(season, environmentMap, meta);
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
window.Nexus.transitionToInvitational = transitionToInvitational;
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
      const morale = p.morale != null ? p.morale : 70;
      // Unhappy/Miserable starters request transfer regardless of age/salary
      if (morale < 35 && chance(0.75)) {
        p.transferListed = true;
        listings.push({ player: p, team, askingPrice: Math.round(calculatePlayerValue(p) * 1.1), listedSince: 0 });
      } else if (age >= 27 && chance(0.4)) {
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
  const morale = player.morale != null ? player.morale : 70;

  // Miserable players may flat-out refuse regardless of offer
  if (morale < 20 && Math.random() < 0.50) {
    return { accepted: false, reason: 'Player wants to leave the team.' };
  }

  // Morale shifts the salary threshold the player will accept.
  // Unhappy/Miserable demand a significant premium; Happy/Thriving are more flexible.
  let moraleMultiplier;
  if (morale < 20)      moraleMultiplier = 1.50; // Miserable: wants 50% more
  else if (morale < 35) moraleMultiplier = 1.30; // Unhappy: wants 30% more
  else if (morale < 55) moraleMultiplier = 1.15; // Unsettled: wants 15% more
  else if (morale > 80) moraleMultiplier = 0.95; // Happy/Thriving: slight discount
  else                  moraleMultiplier = 1.00; // Neutral: no change

  const current = player.salary || 5000;
  const demandedSalary = current * moraleMultiplier;

  let chanceVal = 0.6;
  if (salaryOffered >= demandedSalary * 1.1) chanceVal += 0.2;
  else if (salaryOffered >= demandedSalary)   chanceVal += 0.05;
  else if (salaryOffered < demandedSalary * 0.85) chanceVal -= 0.35;
  else if (salaryOffered < current)           chanceVal -= 0.15;

  const age = player.age != null ? player.age : 22;
  if (age >= 27) chanceVal += 0.15;
  if (age < 22)  chanceVal += 0.1;

  const accepted = Math.random() < Math.max(0, Math.min(1, chanceVal));
  if (accepted) {
    player.contractYears = yearsOffered;
    player.salary = salaryOffered;
    // Contract renewal boosts morale
    player.morale = Math.min(100, (player.morale || 70) + 8);
    return { accepted: true };
  }

  // Give a hint about what the player actually wants
  const hint = morale < 35
    ? 'Player is unhappy — demands significantly higher salary ($' + Math.round(demandedSalary).toLocaleString() + '/mo or more).'
    : 'Player wants higher salary (min ~$' + Math.round(demandedSalary).toLocaleString() + '/mo).';
  return { accepted: false, reason: hint };
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
  const hadStageMatches = !!(
    result && (
      (result.matchdayResults && result.matchdayResults.length > 0) ||
      (result.roundResults && result.roundResults.length > 0) ||
      (result.relegationMatchResults && result.relegationMatchResults.length > 0)
    )
  );
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
  if (hadStageMatches && window.Nexus.tickBootcampDuration) {
    const allTeamsForTick = [
      ...(window.Nexus.LEAGUE || []),
      ...(window.Nexus.CHALLENGER_LEAGUE || [])
    ].filter(Boolean);
    window.Nexus.tickBootcampDuration(Array.from(new Set(allTeamsForTick)));
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
      normalizeMatchdayMatches(day).map(m => ({ teamA: m.teamA.name, teamB: m.teamB.name, map: m.map }))
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
    lastAiMarketBuyerTeamName: season.lastAiMarketBuyerTeamName || null,
    matchDecisionState: season.matchDecisionState || { resolvedFixtures: {}, pending: null }
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
  if (season.inbox && (season.inbox.mails || season.inbox.chats)) {
    snap.inbox = { mails: season.inbox.mails || [], chats: season.inbox.chats || [] };
  }
  return snap;
}

function restoreSeasonFromSnapshot(snap, mainTeams, challengerLeague) {
  if (!snap || !mainTeams) return null;
  const allTeams = [...mainTeams, ...(challengerLeague || [])];
  const findTeam = name => allTeams.find(t => t.name === name);

  const matchdays = (snap.matchdays || []).map(day =>
    normalizeMatchdayMatches(day).map(m => ({
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
    lastAiMarketBuyerTeamName: snap.lastAiMarketBuyerTeamName || null,
    matchDecisionState: {
      resolvedFixtures: (snap.matchDecisionState && typeof snap.matchDecisionState.resolvedFixtures === 'object')
        ? snap.matchDecisionState.resolvedFixtures
        : {},
      pending: (snap.matchDecisionState && snap.matchDecisionState.pending) ? snap.matchDecisionState.pending : null
    },
    inbox: snap.inbox && (snap.inbox.mails || snap.inbox.chats)
      ? { mails: snap.inbox.mails || [], chats: snap.inbox.chats || [] }
      : { mails: [], chats: [] }
  };
  return season;
}

function restoreChallengerSeasonFromSnapshot(snap, challengerTeams) {
  if (!snap || !challengerTeams || challengerTeams.length === 0) return null;
  const findTeam = name => challengerTeams.find(t => t.name === name);
  const matchdays = (snap.matchdays || []).map(day =>
    normalizeMatchdayMatches(day).map(m => ({
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
    phase: 'regular',
    matchDecisionState: {
      resolvedFixtures: (snap.matchDecisionState && typeof snap.matchDecisionState.resolvedFixtures === 'object')
        ? snap.matchDecisionState.resolvedFixtures
        : {},
      pending: (snap.matchDecisionState && snap.matchDecisionState.pending) ? snap.matchDecisionState.pending : null
    }
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
    operations: 'Operations',
    inbox: 'Inbox'
  };

  const pageSubtitles = {
    overview: 'Organizational status & competitive outlook',
    roster: 'Starting lineup & bench',
    development: 'Training programs & growth',
    market: 'Scouting & transfers',
    youth: 'Academy slots & youth market',
    season: 'League standings & schedule',
    career: 'Season summary & playoff outcome',
    operations: 'Organization management',
    inbox: 'Mails & player conversations'
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
      if (route === 'overview' && typeof updateFixtureUI === 'function') updateFixtureUI(season);
      if (route === 'inbox' && typeof updateInboxUI === 'function') updateInboxUI();
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
  let pendingAcceptedOfferTeamName = null;
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
          if (team.activeBootcamp === undefined) team.activeBootcamp = null;
          if (!team.bootcampUsageThisSeason || typeof team.bootcampUsageThisSeason !== 'object') team.bootcampUsageThisSeason = {};
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
            outcomeLoad = 'Challenger Championship: Did not qualify';
          } else {
            outcomeLoad = getMainPlayoffOutcome(season, userTeamForEnd.name, positionLoad, useChallengerForPositionLoad);
          }
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
        if (team.activeBootcamp === undefined) team.activeBootcamp = null;
        if (!team.bootcampUsageThisSeason || typeof team.bootcampUsageThisSeason !== 'object') team.bootcampUsageThisSeason = {};
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
        if (team.activeBootcamp === undefined) team.activeBootcamp = null;
        if (!team.bootcampUsageThisSeason || typeof team.bootcampUsageThisSeason !== 'object') team.bootcampUsageThisSeason = {};
        if (team === userTeamObj) return;
        team.activeTeamTraining = teamTrainingKeys[Math.floor(Math.random() * teamTrainingKeys.length)];
      });
    }
    if (Nexus.initializeMomentum) Nexus.initializeMomentum(season);
    initInbox(season);
    checkContractExpiryChats(season, league[0]);
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
    const jobOffersSnapshot = (currentJobOffers && currentJobOffers.length)
      ? currentJobOffers.map(function(o) { return { teamName: o.team && o.team.name, salary: o.salary, reason: o.reason }; })
      : null;
    currentJobOffers = [];
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
    if (Nexus.resetBootcampUsageForSeason) Nexus.resetBootcampUsageForSeason(allTeams);
    season = Nexus.createSeasonWithSplit(currentMainTeams);
    const currentChallengerTeams = allTeams.filter(t => t.tier === 'Challenger');
    challengerSeason = Nexus.createChallengerSeasonFromTeams && Nexus.createChallengerSeasonFromTeams(currentChallengerTeams);
    if (challengerSeason) window.Nexus.CHALLENGER_SEASON = challengerSeason;
    if (Nexus.initializeMomentum) Nexus.initializeMomentum(season);
    initInbox(season);
    if (jobOffersSnapshot && jobOffersSnapshot.length) {
      addMail(season, {
        type: 'career',
        icon: '📋',
        title: 'You have new job offers',
        body: 'You have ' + jobOffersSnapshot.length + ' job offer(s) from other teams. Use the buttons below to view or accept an offer.',
        offers: jobOffersSnapshot
      });
    }
    if (pendingAcceptedOfferTeamName) {
      addMail(season, {
        type: 'career',
        icon: '✅',
        title: 'You are now manager of ' + pendingAcceptedOfferTeamName,
        body: 'You accepted the offer and are now in charge of ' + pendingAcceptedOfferTeamName + '. Good luck this season.'
      });
      pendingAcceptedOfferTeamName = null;
    }
    const userTeamNew = league && league[0];
    const budgetNext = userTeamNew && userTeamNew.finance && (userTeamNew.finance.capital != null) ? userTeamNew.finance.capital : 0;
    addMail(season, {
      type: 'result',
      icon: '🏁',
      title: 'Season finished',
      body: 'Position: ' + position + '. ' + (outcome || '') + ' Budget for next season: $' + Number(budgetNext).toLocaleString() + '.'
    });
    checkContractExpiryChats(season, league && league[0]);
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
          pendingAcceptedOfferTeamName = selectedOffer.team.name;
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
      if (season && season.inbox && typeof addMail === 'function') {
        addMail(season, {
          type: 'career',
          icon: '📋',
          title: 'You have new job offers',
          body: 'You have ' + offers.length + ' job offer(s). Use the buttons below to view or accept an offer.',
          offers: offers.map(function(o) { return { teamName: o.team.name, salary: o.salary, reason: o.reason || '' }; })
        });
      }
      renderJobOffers(currentJobOffers, userTeam);
      if (season && season.inbox && typeof addMail === 'function') {
        addMail(season, {
          type: 'career',
          icon: '📋',
          title: 'You have new job offers',
          body: 'You have ' + offers.length + ' job offer(s). Use the buttons below to view or accept.',
          offers: offers.map(function(o) { return { teamName: o.team && o.team.name, salary: o.salary, reason: o.reason }; })
        });
      }
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

  function showMatchDecisionModal(eventData, onChoice) {
    const modal = document.getElementById('matchDecisionModal');
    const iconEl = document.getElementById('matchDecisionIcon');
    const titleEl = document.getElementById('matchDecisionTitle');
    const subtitleEl = document.getElementById('matchDecisionSubtitle');
    const optionsEl = document.getElementById('matchDecisionOptions');
    if (!modal || !iconEl || !titleEl || !subtitleEl || !optionsEl) {
      onChoice(null);
      return;
    }

    iconEl.textContent = eventData.event.icon;
    titleEl.textContent = eventData.event.title;
    subtitleEl.textContent = eventData.event.description(eventData.ctx);
    optionsEl.innerHTML = '';

    const userTeam = userTeamRef();
    let enabledCount = 0;
    eventData.event.options.forEach(function(opt) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'match-decision-option';
      btn.innerHTML = '<div class="match-decision-option__label">' + opt.label + '</div><div class="match-decision-option__desc">' + opt.description + '</div>';
      const cost = opt && opt.effect && opt.effect.financeCost ? opt.effect.financeCost : 0;
      const hasFinance = !!(userTeam && userTeam.finance);
      const canAfford = !cost || (hasFinance && (userTeam.finance.capital || 0) >= cost);
      if (!canAfford) {
        btn.disabled = true;
        btn.classList.add('is-disabled');
      } else {
        enabledCount++;
      }
      btn.addEventListener('click', function() {
        if (btn.disabled) return;
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        onChoice(opt.effect);
      });
      optionsEl.appendChild(btn);
    });

    if (enabledCount === 0) {
      const fallbackBtn = document.createElement('button');
      fallbackBtn.type = 'button';
      fallbackBtn.className = 'match-decision-option';
      fallbackBtn.innerHTML = '<div class="match-decision-option__label">Continue without changes</div><div class="match-decision-option__desc">No eligible decision option is available right now.</div>';
      fallbackBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        onChoice({});
      });
      optionsEl.appendChild(fallbackBtn);
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
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
      outcome = 'Challenger Championship: Did not qualify';
    } else {
      outcome = getMainPlayoffOutcome(season, userTeam.name, position, useChallengerForPosition);
    }

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
    if ((outcome.indexOf('Stayed in Main') !== -1 && outcome.indexOf('Relegation') !== -1) || outcome.indexOf('Promoted to Main') !== -1) {
      const userTeamRel = league && league[0];
      if (userTeamRel && userTeamRel.players && userTeamRel.players.length && typeof triggerPlayerChat === 'function' && season.inbox) {
        const firstPlayer = userTeamRel.players[0];
        if (firstPlayer) triggerPlayerChat(season, firstPlayer, 'relegation_survived');
      }
    }
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
      function doSim() {
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
        // Notify about new injuries on the user's team
        if (result.newInjuries && result.newInjuries.length) {
          const userTeamForInj = league && league[0];
          result.newInjuries.forEach(({ player, team, injury }) => {
            if (!userTeamForInj || team !== userTeamForInj) return;
            const label = (INJURY_TYPES[injury.type] && INJURY_TYPES[injury.type].label) || injury.type;
            const icon = injury.severity === 'Major' ? '🔴' : injury.severity === 'Moderate' ? '🟠' : '🟡';
            showNotification(icon + ' ' + getPlayerDisplayName(player) + ' sustained a ' + injury.severity + ' ' + label + ' (' + injury.matchdaysLeft + ' matchdays)', 'error', 7000);
            addMail(season, {
              type: 'injury', icon,
              title: getPlayerDisplayName(player) + ' — ' + injury.severity + ' ' + label,
              body: getPlayerDisplayName(player) + ' is out for ' + injury.matchdaysLeft + ' matchday(s). ' + (injury.severity === 'Major' ? 'Cannot play until fully recovered.' : 'Can still play but with reduced performance.'),
              matchday: (season.currentMatchday || 1) - 1,
              actionRoute: 'roster', actionLabel: 'Go to Roster'
            });
            if (injury.severity === 'Major') triggerPlayerChat(season, player, 'major_injury', 'This ' + label);
          });
        }

        // Notify about morale events on the user's team
        if (result.moraleEvents && result.moraleEvents.length) {
          const userTeamForMorale = league && league[0];
          result.moraleEvents.forEach(ev => {
            if (!userTeamForMorale || ev.team !== userTeamForMorale) return;
            if (ev.gameTimePromiseBroken) {
              showNotification('😠 ' + getPlayerDisplayName(ev.player) + ' is upset because you promised a start and did not play him.', 'error', 8000);
              addMail(season, {
                type: 'morale', icon: '😠',
                title: getPlayerDisplayName(ev.player) + ' — Promise Broken',
                body: 'You promised ' + getPlayerDisplayName(ev.player) + ' a starting spot this matchday, but he did not play. Morale took a major hit.',
                matchday: (season.currentMatchday || 1) - 1,
                actionRoute: 'roster', actionLabel: 'Go to Roster'
              });
            } else if (ev.gameTimePromiseKept) {
              showNotification('✅ ' + getPlayerDisplayName(ev.player) + ' got his promised start and morale improved.', 'success', 5500);
            } else if (ev.moreGameTimeRequest) {
              showNotification('💬 ' + getPlayerDisplayName(ev.player) + ' wants more game time.', 'error', 7000);
              addMail(season, {
                type: 'morale', icon: '💬',
                title: getPlayerDisplayName(ev.player) + ' — Wants More Game Time',
                body: getPlayerDisplayName(ev.player) + ' asked for more minutes and is pushing for a starter opportunity.',
                matchday: (season.currentMatchday || 1) - 1,
                actionRoute: 'inbox', actionLabel: 'Open Inbox'
              });
              triggerPlayerChat(season, ev.player, 'more_game_time_request');
            } else if (ev.transferRequest) {
              const label = ev.newLabel || 'Unhappy';
              showNotification('😤 ' + getPlayerDisplayName(ev.player) + ' is ' + label + ' and has requested a transfer.', 'error', 8000);
              addMail(season, {
                type: 'transfer', icon: '😤',
                title: getPlayerDisplayName(ev.player) + ' — Transfer Request',
                body: getPlayerDisplayName(ev.player) + ' is ' + label + ' and has formally requested a transfer.',
                matchday: (season.currentMatchday || 1) - 1,
                actionRoute: 'roster', actionLabel: 'Go to Roster'
              });
              triggerPlayerChat(season, ev.player, 'transfer_request');
            } else if (ev.dropped) {
              showNotification('😟 ' + getPlayerDisplayName(ev.player) + '\'s morale dropped to ' + ev.newLabel + '.', 'error', 6000);
              if (ev.newLabel === 'Miserable' || ev.newLabel === 'Unhappy') {
                addMail(season, {
                  type: 'morale', icon: '😟',
                  title: getPlayerDisplayName(ev.player) + ' — Morale Drop',
                  body: getPlayerDisplayName(ev.player) + '\'s morale has dropped to ' + ev.newLabel + '. Consider speaking to them.',
                  matchday: (season.currentMatchday || 1) - 1,
                  actionRoute: 'roster', actionLabel: 'Go to Roster'
                });
              }
            } else {
              showNotification('😊 ' + getPlayerDisplayName(ev.player) + '\'s morale improved to ' + ev.newLabel + '.', 'success', 5000);
              if (typeof triggerPlayerChat === 'function' && season.inbox) triggerPlayerChat(season, ev.player, 'morale_improved');
            }
          });
        }

        // Hot streak chats — check after each regular matchday
        if (result.matchdayResults && (league && league[0])) {
          const userTeamHS = league[0];
          (userTeamHS.players || []).forEach(function(p) {
            const alreadyChat = season.inbox && season.inbox.chats.some(function(c) { return c.playerId === p.id && c.scenario === 'hot_streak'; });
            if (alreadyChat) return;
            if (typeof getPlayerFormState === 'function' && getPlayerFormState(p) === 'hot') {
              triggerPlayerChat(season, p, 'hot_streak');
            }
          });
        }

        // Add mail for invitational result
        if (result.invitationalChampion) {
          const userT = league && league[0];
          const champ = result.invitationalChampion;
          const isUs = userT && champ.name === userT.name;
          addMail(season, {
            type: 'result', icon: '🏆',
            title: 'Mid-Season Invitational — ' + champ.name + ' wins!',
            body: isUs ? 'Your team won the Mid-Season Invitational! Prize: $300,000.' : champ.name + ' claimed the Mid-Season Invitational trophy.',
            matchday: season.currentMatchday || 0
          });
          if (isUs && userT && userT.players && userT.players.length && typeof triggerPlayerChat === 'function' && season.inbox) {
            const firstPlayer = userT.players[0];
            if (firstPlayer) triggerPlayerChat(season, firstPlayer, 'trophy_or_playoffs');
          }
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
          if (typeof updateInboxBadge === 'function') updateInboxBadge();
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

        if (previousPhase === 'regular' && season.phase === 'playoffs' && season.playoffsBracket && season.playoffsBracket.matches && userTeam && !season.playoffsQualifiedChatDone) {
          const inBracket = season.playoffsBracket.matches.some(function(m) { return m.teamA === userTeam || m.teamB === userTeam; });
          if (inBracket && season.inbox && typeof triggerPlayerChat === 'function' && userTeam.players && userTeam.players.length) {
            season.playoffsQualifiedChatDone = true;
            triggerPlayerChat(season, userTeam.players[0], 'trophy_or_playoffs');
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

        if (previousPhase === 'invitational' && result.roundResults && result.roundResults.length && userTeam) {
          const ourInv = result.roundResults.find(r => r.match.teamA === userTeam || r.match.teamB === userTeam);
          if (ourInv) {
            pendingAfterMatchResult = runPostStageUpdates;
            showMatchResultPage(ourInv.match, ourInv.result, season);
            return;
          }
          // user wasn't in this round — show champion notification if final
          if (result.invitationalChampion) {
            const champ = result.invitationalChampion;
            showNotification('🏆 Mid-Season Invitational champion: ' + champ.name, 'success', 6000);
          }
        }

        // Invitational champion notification when user WAS in the final
        if (result.invitationalChampion && previousPhase === 'invitational') {
          const champ = result.invitationalChampion;
          if (userTeam && champ.name === userTeam.name) {
            showNotification('🏆 Your team won the Mid-Season Invitational! (+$300,000)', 'success', 8000);
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
      }

      function safeDoSim() {
        try {
          doSim();
        } catch (err) {
          console.error('Simulate stage failed:', err);
          if (typeof showNotification === 'function') {
            showNotification('Simulation failed due to an unexpected error. Please try again.', 'error', 7000);
          }
        }
      }

      let _userT = null;
      let decisionEvent = null;
      try {
        _userT = userTeamRef ? userTeamRef() : (league && league[0]);
        const userIsPlaying = !!(season && _userT && getMatchDecisionFixture(season, _userT));
        decisionEvent = userIsPlaying && _userT ? pickMatchDecisionEvent(season, _userT) : null;
      } catch (err) {
        console.error('Match decision pre-check failed; continuing without event:', err);
      }

      if (decisionEvent) {
        showMatchDecisionModal(decisionEvent, function(effect) {
          if (effect) applyMatchDecisionEffect(season, _userT, effect);
          safeDoSim();
        });
      } else {
        safeDoSim();
      }
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

  // ===== OPERATIONS (Coaches, Facilities, Psychology, Sponsors, Bootcamp) =====
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
    var bootcampEl = document.getElementById('operationsBootcamp');
    if (!coachesEl || !facilitiesEl || !psychologyEl || !sponsorsEl || !bootcampEl) return;

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
          if (season && season.inbox && typeof addMail === 'function') addMail(season, { type: 'info', icon: '📊', title: 'Coach upgraded', body: 'Upgraded to ' + (tier.name || 'Level ' + level) + '!' });
          updateOperationsUI();
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
          if (season && season.inbox && typeof addMail === 'function') addMail(season, { type: 'info', icon: '🏟', title: 'Facility upgraded', body: 'Upgraded to ' + (tier.name || 'Level ' + level) + '!', actionRoute: 'operations', actionLabel: 'Operations' });
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
          if (season && season.inbox && typeof addMail === 'function') addMail(season, { type: 'info', icon: '🧠', title: 'Psychology upgraded', body: result.message || 'Psychology upgraded!', actionRoute: 'operations', actionLabel: 'Operations' });
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
              if (season && season.inbox && typeof addMail === 'function') addMail(season, { type: 'info', icon: '📄', title: 'Sponsor signed', body: result.message || 'Sponsor signed.' });
              saveGameState();
              updateOperationsUI();
              if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
            } else {
              showNotification(result && result.message ? result.message : 'Could not sign sponsor.', 'error');
              if (season && season.inbox && typeof addMail === 'function') addMail(season, { type: 'error', icon: '❌', title: 'Could not sign sponsor', body: (result && result.message) ? result.message : 'Could not sign sponsor.' });
            }
          });
        });
      }
    }

    if (activeOperationsPanel === 'bootcamp') {
      var bootcampTypes = window.Nexus.BOOTCAMP_TYPES || [];
      var activeBootcamp = (userTeam.activeBootcamp && (userTeam.activeBootcamp.remainingMatchdays || 0) > 0) ? userTeam.activeBootcamp : null;
      if (!userTeam.bootcampUsageThisSeason || typeof userTeam.bootcampUsageThisSeason !== 'object') userTeam.bootcampUsageThisSeason = {};
      var usageMap = userTeam.bootcampUsageThisSeason;
      var statusHtml = activeBootcamp
        ? '<div class="operations-bootcamp-status is-active"><strong>Active:</strong> ' + activeBootcamp.name + ' <span class="operations-tier-level">' + activeBootcamp.remainingMatchdays + ' matchday(s) left</span></div>'
        : '<div class="operations-bootcamp-status"><strong>No active bootcamp.</strong> Each bootcamp type can be used once per season and temporarily replaces team training effects.</div>';

      bootcampEl.innerHTML = '<div class="operations-bootcamp">' + statusHtml + '<div class="operations-bootcamp-grid">' + bootcampTypes.map(function(b) {
        var hasFinance = !!(userTeam.finance);
        var canAfford = hasFinance && (userTeam.finance.capital || 0) >= (b.cost || 0);
        var alreadyUsed = !!usageMap[b.id];
        var isCurrentActive = !!(activeBootcamp && activeBootcamp.id === b.id);
        var disabled = true;
        var btnLabel = 'Activate';
        if (isCurrentActive) {
          btnLabel = 'Active';
        } else if (alreadyUsed) {
          btnLabel = 'Locked (used this season)';
        } else if (activeBootcamp) {
          btnLabel = 'Bootcamp active';
        } else if (!canAfford) {
          btnLabel = 'Insufficient funds';
        } else {
          disabled = false;
        }
        var activeClass = (activeBootcamp && activeBootcamp.id === b.id) ? ' is-active' : '';
        var durationText = (b.duration || 0) + ' matchday(s)';
        var costText = '$' + (b.cost || 0).toLocaleString();
        return '<div class="operations-bootcamp-card' + activeClass + '"><div class="operations-bootcamp-card__header"><span class="operations-bootcamp-icon">' + (b.icon || 'CAMP') + '</span><strong class="operations-bootcamp-name">' + (b.name || 'Bootcamp') + '</strong></div><p class="operations-bootcamp-desc">' + (b.description || '') + '</p><p class="operations-bootcamp-effect">' + (b.effectDescription || '') + '</p><div class="operations-bootcamp-meta"><span>Cost: ' + costText + '</span><span>Duration: ' + durationText + '</span></div><button type="button" class="btn btn--primary operations-bootcamp-btn operations-activate-bootcamp" data-bootcamp-id="' + (b.id || '') + '"' + (disabled ? ' disabled' : '') + '>' + btnLabel + '</button></div>';
      }).join('') + '</div></div>';

      bootcampEl.querySelectorAll('.operations-activate-bootcamp').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var bootcampId = btn.getAttribute('data-bootcamp-id');
          if (!bootcampId || !userTeamRef()) return;
          var result = window.Nexus.activateBootcamp && window.Nexus.activateBootcamp(userTeamRef(), bootcampId);
          if (result && result.success) {
            showNotification(result.message || 'Bootcamp activated.', 'success');
            saveGameState();
            updateOperationsUI();
            if (typeof updateFinanceUI === 'function') updateFinanceUI(userTeamRef());
            if (typeof updateFixtureUI === 'function') updateFixtureUI(season);
          } else {
            showNotification(result && result.message ? result.message : 'Could not activate bootcamp.', 'error');
          }
        });
      });
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

  function primeAIBootcampForUpcomingUserFixture(seasonData) {
    if (!seasonData || !window.Nexus || !window.Nexus.shouldAIActivateBootcamp) return;
    const userTeam = userTeamRef();
    if (!userTeam || !userTeam.name) return;

    const phase = seasonData.phase || 'regular';
    if (phase === 'finished') return;

    let targetSeason = seasonData;
    let opponent = null;
    let token = null;

    if (phase === 'playoffs' && seasonData.playoffsBracket && Array.isArray(seasonData.playoffsBracket.matches)) {
      const round = seasonData.playoffsBracket.round || 0;
      const ourMatch = seasonData.playoffsBracket.matches.find(function(m) {
        return m && m.teamA && m.teamB && (m.teamA.name === userTeam.name || m.teamB.name === userTeam.name);
      });
      if (!ourMatch) return;
      opponent = ourMatch.teamA.name === userTeam.name ? ourMatch.teamB : ourMatch.teamA;
      token = 'playoffs:' + round + ':' + userTeam.name;
    } else if (phase === 'relegation' && seasonData.relegationCandidates && seasonData.challengerPromotion) {
      const main = seasonData.relegationCandidates || [];
      const challenger = seasonData.challengerPromotion || [];
      for (let i = 0; i < Math.max(main.length, challenger.length); i++) {
        const a = main[i];
        const b = challenger[i];
        if (!a || !b) continue;
        if (a.name === userTeam.name) { opponent = b; break; }
        if (b.name === userTeam.name) { opponent = a; break; }
      }
      if (!opponent) return;
      token = 'relegation:' + (seasonData.currentMatchday || 0) + ':' + userTeam.name;
    } else {
      const isChallengerManager = userTeam.tier === 'Challenger';
      if (isChallengerManager && challengerSeason && challengerSeason.teams && challengerSeason.teams.some(function(t) { return t.name === userTeam.name; })) {
        targetSeason = challengerSeason;
      }
      const md = targetSeason.currentMatchday || 0;
      const matches = normalizeMatchdayMatches((targetSeason.matchdays || [])[md]);
      const ourMatch = matches.find(function(m) {
        return m && m.teamA && m.teamB && (m.teamA.name === userTeam.name || m.teamB.name === userTeam.name);
      });
      if (!ourMatch) return;
      opponent = ourMatch.teamA.name === userTeam.name ? ourMatch.teamB : ourMatch.teamA;
      token = 'regular:' + md + ':' + userTeam.name;
    }

    if (!opponent || !opponent.name) return;
    if (targetSeason._aiBootcampPreviewToken === token) return;
    targetSeason._aiBootcampPreviewToken = token;
    window.Nexus.shouldAIActivateBootcamp(opponent, userTeam);
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
    if (userTeam) primeAIBootcampForUpcomingUserFixture(seasonData);
    const teamPlanKeys = window.Nexus.TEAM_TRAINING_PLAN_KEYS || [];
    if (userTeam && teamPlanKeys.length && (userTeam.activeTeamTraining == null || userTeam.activeTeamTraining === '' || !teamPlanKeys.includes(userTeam.activeTeamTraining))) {
      userTeam.activeTeamTraining = teamPlanKeys[0];
    }
    const powerVsOppEl = document.getElementById('uiFixturePowerVsOpponent');
    if (powerVsOppEl) powerVsOppEl.textContent = '—';
    function setPowerVsOpponent(myTeam, oppTeam) {
      if (!powerVsOppEl || !myTeam || !oppTeam || !window.Nexus.calculateTeamExpectedPower) return;
      var defaultEnv = { coachQuality: 50, infrastructure: 50, psychologySupport: 50, pressure: 50 };
      var envMy = (environmentMap && environmentMap[myTeam.name]) || defaultEnv;
      var envOpp = (environmentMap && environmentMap[oppTeam.name]) || defaultEnv;
      var dataMy = window.Nexus.calculateTeamExpectedPower(myTeam, { environment: envMy, meta: currentMeta });
      var dataOpp = window.Nexus.calculateTeamExpectedPower(oppTeam, { environment: envOpp, meta: currentMeta });
      var pMy = dataMy && dataMy.finalPower != null ? dataMy.finalPower : 0;
      var pOpp = dataOpp && dataOpp.finalPower != null ? dataOpp.finalPower : 0;
      if (typeof calculateWinProbability !== 'function') { powerVsOppEl.textContent = '—'; return; }
      var prob = calculateWinProbability(pMy, pOpp);
      powerVsOppEl.textContent = Math.round(prob * 100) + '%';
    }
    const activeBootcamp = (userTeam && userTeam.activeBootcamp && (userTeam.activeBootcamp.remainingMatchdays || 0) > 0) ? userTeam.activeBootcamp : null;
    const trainingEl = document.getElementById('uiActiveTeamTraining');
    const trainingDescEl = document.getElementById('uiActiveTeamTrainingDesc');
    const fixtureBootcampEl = document.getElementById('uiFixtureBootcamp');
    const planName = (userTeam && userTeam.activeTeamTraining) ? userTeam.activeTeamTraining : '—';
    if (trainingEl) {
      trainingEl.textContent = activeBootcamp
        ? (activeBootcamp.name + ' (' + activeBootcamp.remainingMatchdays + 'd)')
        : planName;
    }
    if (trainingDescEl) {
      let desc = '';
      if (activeBootcamp) {
        desc = ' — Bootcamp active (team training effects replaced)';
      } else {
        const plans = window.Nexus.TEAM_TRAINING_PLANS;
        desc = (planName !== '—' && plans && plans[planName] && plans[planName].description) ? ' — ' + plans[planName].description : '';
      }
      trainingDescEl.textContent = desc;
    }
    if (fixtureBootcampEl) {
      if (!activeBootcamp) {
        fixtureBootcampEl.innerHTML = '<div class="fixture__bootcamp-title">Bootcamp</div><div class="fixture__bootcamp-body">No active bootcamp.</div>';
      } else {
        const effect = activeBootcamp.effect || {};
        const details = [];
        if (effect.statBoosts) {
          Object.keys(effect.statBoosts).forEach(function(statKey) {
            const mult = effect.statBoosts[statKey];
            if (mult == null) return;
            const delta = Math.round((mult - 1) * 100);
            const sign = delta >= 0 ? '+' : '';
            details.push(sign + delta + '% ' + formatStatKey(statKey));
          });
        }
        if (effect.allStatsBonus != null) {
          const deltaAll = Math.round((effect.allStatsBonus - 1) * 100);
          const signAll = deltaAll >= 0 ? '+' : '';
          details.push(signAll + deltaAll + '% all stats');
        }
        if (effect.synergyBonus != null) {
          const syn = Math.round(effect.synergyBonus * 100);
          details.push('+' + syn + '% team synergy');
        }
        if (effect.metaFavoredBonus != null) {
          const fav = Math.round(effect.metaFavoredBonus * 100);
          details.push('+' + fav + '% favored-role meta bonus');
        }
        if (effect.metaNerfedReduction != null) {
          const red = Math.round(effect.metaNerfedReduction * 100);
          details.push(red + '% nerfed-role penalty reduction');
        }
        if (effect.pressureReduction != null) {
          const pressure = Math.round(effect.pressureReduction * 100);
          details.push('-' + pressure + '% pressure impact');
        }
        if (effect.mentalBoost != null) {
          details.push('+' + effect.mentalBoost + ' effective Mental');
        }
        const detailsHtml = details.length
          ? '<ul class="fixture__bootcamp-list">' + details.map(function(item) { return '<li>' + item + '</li>'; }).join('') + '</ul>'
          : '';
        fixtureBootcampEl.innerHTML = '<div class="fixture__bootcamp-title">' + activeBootcamp.name + ' · ' + activeBootcamp.remainingMatchdays + ' matchday(s) left</div><div class="fixture__bootcamp-body">Effects active this matchday:</div>' + detailsHtml;
      }
    }
    const phase = seasonData.phase || 'regular';
    const matchdayInfoEl = document.getElementById('uiMatchdayInfo');

    const fixturePanel = document.getElementById('fixturePanel');
    const titleEl = document.getElementById('uiFixtureTitle');
    if (fixturePanel) {
      fixturePanel.classList.remove('panel--playoffs', 'panel--relegation', 'panel--invitational');
      if (phase === 'playoffs') fixturePanel.classList.add('panel--playoffs');
      else if (phase === 'relegation') fixturePanel.classList.add('panel--relegation');
      else if (phase === 'invitational') fixturePanel.classList.add('panel--invitational');
    }
    if (titleEl) {
      if (phase === 'finished') titleEl.textContent = 'Season complete';
      else if (phase === 'playoffs' && seasonData.playoffsBracket) {
        const r = seasonData.playoffsBracket.round;
        titleEl.textContent = r === 2 ? 'Championship – Final' : 'Championship – Quarterfinals';
      } else if (phase === 'invitational' && seasonData.invitationalBracket) {
        const ir = seasonData.invitationalBracket.round;
        titleEl.textContent = ir === 1 ? 'Invitational – Quarterfinals' : ir === 2 ? 'Invitational – Semifinals' : 'Invitational – Final';
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
        if (isYou && typeof setPowerVsOpponent === 'function') {
          var oppTeam = nextMatch.teamA.name === userTeam.name ? nextMatch.teamB : nextMatch.teamA;
          setPowerVsOpponent(userTeam, oppTeam);
        }
      } else {
        teamNameEl.textContent = 'Playoffs';
        oppEl.textContent = 'Round ' + bracket.round;
        if (badgeLeft) { badgeLeft.textContent = 'OPP'; badgeLeft.classList.remove('badge--you'); }
        if (badgeRight) badgeRight.textContent = 'OPP';
      }
      return;
    }

    if (phase === 'invitational' && seasonData.invitationalBracket) {
      const ib = seasonData.invitationalBracket;
      const roundLabel = ib.round === 1 ? 'QF' : ib.round === 2 ? 'SF' : 'Final';
      if (matchdayInfoEl) matchdayInfoEl.textContent = 'Invitational · ' + roundLabel;
      const nextInv = ib.matches[0];
      if (nextInv) {
        const isYou = nextInv.teamA.name === userTeam.name || nextInv.teamB.name === userTeam.name;
        teamNameEl.textContent = nextInv.teamA.name;
        oppEl.textContent = nextInv.teamB.name;
        if (badgeLeft) { badgeLeft.textContent = isYou ? 'YOU' : 'OPP'; badgeLeft.classList.toggle('badge--you', isYou); }
        if (badgeRight) badgeRight.textContent = isYou ? 'OPP' : 'OPP';
        if (isYou && typeof setPowerVsOpponent === 'function') {
          var invOpp = nextInv.teamA.name === userTeam.name ? nextInv.teamB : nextInv.teamA;
          setPowerVsOpponent(userTeam, invOpp);
        }
      } else {
        teamNameEl.textContent = 'Invitational';
        oppEl.textContent = roundLabel;
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

    const todayMatches = normalizeMatchdayMatches((dataForFixture.matchdays || [])[dataForFixture.currentMatchday]);
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
      if (typeof setPowerVsOpponent === 'function') {
        var opponentTeam = ourMatch.teamA.name === userTeam.name ? ourMatch.teamB : ourMatch.teamA;
        setPowerVsOpponent(userTeam, opponentTeam);
      }
    } else {
      teamNameEl.textContent = '—';
      oppEl.textContent = 'Matchday ' + (dataForFixture.currentMatchday + 1) + ' (no your game)';
      const mapEl = document.getElementById('uiFixtureMap');
      if (mapEl) { mapEl.textContent = '—'; mapEl.style.display = ''; }
      if (badgeLeft) { badgeLeft.textContent = 'OPP'; badgeLeft.classList.remove('badge--you'); }
      if (badgeRight) badgeRight.textContent = 'OPP';
    }

    // --- Team Snapshot: Momentum, Form strip, Confidence, Synergy ---
    const snapUserTeam = league[0];
    if (snapUserTeam) {
      // Momentum score
      const momentumEl = document.getElementById('uiMomentum');
      if (momentumEl) {
        const score = getTeamMomentumScore(snapUserTeam);
        const sign = score > 0 ? '+' : '';
        momentumEl.textContent = sign + score;
        momentumEl.className = 'status__v'
          + (score > 1 ? ' status__v--positive' : score < -1 ? ' status__v--negative' : '');
      }

      // Form strip (W/L dots)
      const formStripEl = document.getElementById('uiFormStrip');
      if (formStripEl) {
        const form = snapUserTeam.recentForm || [];
        if (form.length) {
          formStripEl.innerHTML = form.map(r =>
            '<span class="form-dot form-dot--' + (r === 'W' ? 'win' : 'loss') + '">' + r + '</span>'
          ).join('');
        } else {
          formStripEl.innerHTML = '<span class="form-dot form-dot--empty">No results yet</span>';
        }
      }

      // Confidence — based on how many starters are hot vs cold
      const confidenceEl = document.getElementById('uiConfidence');
      if (confidenceEl) {
        const starters = (snapUserTeam.starterSlots || []).filter(Boolean);
        const hotCount = starters.filter(p => getPlayerFormState(p) === 'hot').length;
        const coldCount = starters.filter(p => getPlayerFormState(p) === 'cold').length;
        let conf, confClass;
        if (hotCount >= 3) { conf = 'High'; confClass = 'status__v--positive'; }
        else if (hotCount >= 2 && coldCount === 0) { conf = 'Good'; confClass = 'status__v--positive'; }
        else if (coldCount >= 3) { conf = 'Low'; confClass = 'status__v--negative'; }
        else if (coldCount >= 2) { conf = 'Shaky'; confClass = 'status__v--negative'; }
        else { conf = 'Medium'; confClass = ''; }
        confidenceEl.textContent = conf;
        confidenceEl.className = 'status__v' + (confClass ? ' ' + confClass : '');
      }

      // Synergy — wire up the existing synergy calculation
      const synEl = document.getElementById('uiSyn');
      if (synEl && window.Nexus && window.Nexus.calculateTeamSynergy) {
        const activeMeta = meta && meta.name ? meta : (Nexus.getCurrentMeta ? Nexus.getCurrentMeta() : null);
        const envForSyn = (environmentMap && environmentMap[snapUserTeam.name]) || {};
        const starters5 = (snapUserTeam.starterSlots || []).filter(Boolean).slice(0, 5);
        if (starters5.length) {
          const synData = window.Nexus.calculateTeamSynergy(starters5, activeMeta, envForSyn, null);
          const mult = synData && synData.synergyMultiplier != null ? synData.synergyMultiplier : 1;
          const pct = Math.round((mult - 1) * 100);
          const sign = pct >= 0 ? '+' : '';
          synEl.textContent = sign + pct + '%';
          synEl.className = 'status__v' + (pct > 0 ? ' status__v--positive' : pct < 0 ? ' status__v--negative' : '');
        }
      }
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

    let positionValue = null;
    if (!standings || !standings[userTeam.name]) {
      posEl.textContent = '—';
      recEl.textContent = '0W - 0L';
      if (winRateEl) winRateEl.textContent = '—';
    } else {
      const sorted = Nexus.getSortedStandings(standings);
      const posIndex = sorted.findIndex(t => t.teamName === userTeam.name);
      positionValue = posIndex === -1 ? null : posIndex + 1;
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
      } else if (isChallengerManager) {
        outcome = 'Challenger Championship: Did not qualify';
      } else {
        outcome = getMainPlayoffOutcome(seasonData, userTeam.name, positionValue, false);
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

  function getMoraleBadgeHTML(player) {
    const m = player.morale != null ? player.morale : 70;
    const info = Nexus.getMoraleInfo ? Nexus.getMoraleInfo(m) : { label: 'Neutral', cssClass: 'morale--neutral' };
    // Only show badge if not Neutral (avoid cluttering cards for most players)
    if (info.label === 'Neutral') return '';
    return '<span class="morale-badge ' + info.cssClass + '" title="Morale: ' + info.label + ' (' + Math.round(m) + ')">' + info.label + '</span>';
  }

  function getFormBadgeHTML(player) {
    const state = getPlayerFormState(player);
    if (state === 'hot') return '<span class="form-badge form-badge--hot" title="Hot form">🔥</span>';
    if (state === 'cold') return '<span class="form-badge form-badge--cold" title="Cold form">❄️</span>';
    return '';
  }

  function getInjuryBadgeHTML(player) {
    const inj = Nexus.getPlayerInjury ? Nexus.getPlayerInjury(player) : (player && player.injury && player.injury.severity ? player.injury : null);
    if (!inj) return '';
    const label = (INJURY_TYPES[inj.type] && INJURY_TYPES[inj.type].label) || inj.type;
    const md = inj.matchdaysLeft;
    if (inj.severity === 'Major') {
      return '<span class="injury-badge injury-badge--major" title="' + label + ' – Out ' + md + ' matchday(s)">🔴 OUT (' + md + 'md)</span>';
    }
    if (inj.severity === 'Moderate') {
      return '<span class="injury-badge injury-badge--moderate" title="' + label + ' – ' + md + ' matchday(s) remaining">🟠 ' + label + ' (' + md + 'md)</span>';
    }
    return '<span class="injury-badge injury-badge--minor" title="' + label + ' – ' + md + ' matchday(s) remaining">🟡 ' + label + ' (' + md + 'md)</span>';
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
        const injBadge = getInjuryBadgeHTML(p);
        const formBadge = getFormBadgeHTML(p);
        const moraleBadge = getMoraleBadgeHTML(p);
        card.innerHTML = `
          <div class="player-card__header">
            <strong>${getPlayerDisplayName(p)}</strong>
            <span class="player-card__badges">${ageBadges} ${badge} ${formBadge}</span>
          </div>
          ${moraleBadge ? '<div class="player-card__morale">' + moraleBadge + '</div>' : ''}
          ${injBadge ? '<div class="player-card__injury">' + injBadge + '</div>' : ''}
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
        const injBadgeBench = getInjuryBadgeHTML(p);
        const formBadgeBench = getFormBadgeHTML(p);
        const moraleBadgeBench = getMoraleBadgeHTML(p);
        row.innerHTML = `
          <span class="bench-row__name">${getPlayerDisplayName(p)} <span class="age-badge ${getAgePhaseClass(p.age)}">${p.age != null ? p.age : '?'}</span>${formBadgeBench}${moraleBadgeBench}</span>
          <span class="bench-row__role">Primary: ${p.roleBias.primaryRoleBias}</span>
          <span class="bench-row__role bench-row__role--sec">Secondary: ${p.roleBias.secondaryRoleBias}</span>
          <span class="${contractClass}">${years}y · $${salary.toLocaleString()}/mo</span>
          ${badge ? '<span class="bench-badge">' + badge + '</span>' : ''}
          ${injBadgeBench ? '<span class="bench-injury">' + injBadgeBench + '</span>' : ''}
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
          const injBadgeReserve = getInjuryBadgeHTML(p);
          const formBadgeReserve = getFormBadgeHTML(p);
          const moraleBadgeReserve = getMoraleBadgeHTML(p);
          row.innerHTML = `
            <span class="reserve-row__name">${getPlayerDisplayName(p)} <span class="age-badge ${getAgePhaseClass(p.age)}">${p.age != null ? p.age : '?'}</span>${formBadgeReserve}${moraleBadgeReserve}</span>
            <span class="reserve-row__role">Primary: ${p.roleBias.primaryRoleBias}</span>
            <span class="reserve-row__role reserve-row__role--sec">Secondary: ${p.roleBias.secondaryRoleBias}</span>
            <span class="${contractClass}">${years}y · $${salary.toLocaleString()}/mo</span>
            ${badge ? '<span class="reserve-badge">' + badge + '</span>' : ''}
            ${injBadgeReserve ? '<span class="reserve-injury">' + injBadgeReserve + '</span>' : ''}
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
    const transferListBtn = document.getElementById('playerDetailTransferList');
    const sellBtn = document.getElementById('playerDetailSell');
    const closeBtn = document.getElementById('playerDetailClose');
    const moraleSection = document.getElementById('playerDetailMoraleSection');
    const moraleBarEl = document.getElementById('playerDetailMoraleBar');
    const moraleLabelEl = document.getElementById('playerDetailMoraleLabel');
    const injurySection = document.getElementById('playerDetailInjurySection');
    const injuryStatusEl = document.getElementById('playerDetailInjuryStatus');
    const clinicBtn = document.getElementById('playerDetailClinicVisit');
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

      // Morale section
      if (moraleBarEl && moraleLabelEl) {
        const m = player.morale != null ? player.morale : 70;
        const info = Nexus.getMoraleInfo ? Nexus.getMoraleInfo(m) : { label: 'Neutral', cssClass: 'morale--neutral' };
        moraleBarEl.style.width = m + '%';
        moraleBarEl.className = 'morale-bar ' + info.cssClass;
        moraleLabelEl.textContent = info.label + ' (' + Math.round(m) + ')';
        moraleLabelEl.className = info.cssClass;
      }

      // Injury section (only shown on roster page player modal)
      const inj = Nexus.getPlayerInjury ? Nexus.getPlayerInjury(player) : null;
      if (injurySection && injuryStatusEl && clinicBtn) {
        if (inj) {
          const label = (INJURY_TYPES[inj.type] && INJURY_TYPES[inj.type].label) || inj.type;
          const cost = (Nexus.INJURY_CLINIC_COST && Nexus.INJURY_CLINIC_COST[inj.severity]) || 0;
          injurySection.style.display = '';
          const sevText = inj.severity === 'Major' ? '🔴 Major' : inj.severity === 'Moderate' ? '🟠 Moderate' : '🟡 Minor';
          injuryStatusEl.textContent = sevText + ' ' + label + ' — ' + inj.matchdaysLeft + ' matchday(s) remaining';
          const clinicLabel = inj.severity === 'Major'
            ? 'Send to Clinic — reduce to Moderate ($' + cost.toLocaleString() + ')'
            : 'Send to Clinic — instant heal ($' + cost.toLocaleString() + ')';
          clinicBtn.textContent = clinicLabel;
          clinicBtn.style.display = 'inline-block';
        } else {
          injurySection.style.display = 'none';
          clinicBtn.style.display = 'none';
        }
      }

      // Transfer list button (roster only)
      if (transferListBtn) {
        const onList = player.transferListed === true;
        transferListBtn.textContent = onList ? 'Remove from transfer list' : 'Transfer list';
        transferListBtn.style.display = 'inline-block';
      }

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

      // Injury gate: block Major, warn Moderate
      const inj = Nexus.getPlayerInjury ? Nexus.getPlayerInjury(player) : null;
      if (inj && inj.severity === 'Major') {
        const label = (INJURY_TYPES[inj.type] && INJURY_TYPES[inj.type].label) || inj.type;
        showNotification(getPlayerDisplayName(player) + ' is out with a Major ' + label + ' injury (' + inj.matchdaysLeft + ' matchdays). Cannot start.', 'error');
        return;
      }
      if (inj && inj.severity === 'Moderate') {
        const label = (INJURY_TYPES[inj.type] && INJURY_TYPES[inj.type].label) || inj.type;
        showNotification('Warning: ' + getPlayerDisplayName(player) + ' has a Moderate ' + label + ' injury. Playing risks aggravation to Major.', 'error', 6000);
        // Allow anyway — player's choice
      }

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
    if (clinicBtn) {
      clinicBtn.addEventListener('click', () => {
        if (!detailPlayer) return;
        const yourTeam = league && league[0];
        if (!yourTeam) return;
        const inj = Nexus.getPlayerInjury ? Nexus.getPlayerInjury(detailPlayer) : null;
        if (!inj) return;
        const cost = (Nexus.INJURY_CLINIC_COST && Nexus.INJURY_CLINIC_COST[inj.severity]) || 0;
        const name = getPlayerDisplayName(detailPlayer);
        const msg = inj.severity === 'Major'
          ? 'Send ' + name + ' to clinic? Cost: $' + cost.toLocaleString() + '. Reduces injury to Moderate (3 matchdays).'
          : 'Send ' + name + ' to clinic for instant recovery? Cost: $' + cost.toLocaleString() + '.';
        showConfirm(msg, () => {
          const result = Nexus.applyClinicVisit(detailPlayer, yourTeam);
          if (result && result.success) {
            showNotification(result.message, 'success');
            if (season && season.inbox && typeof addMail === 'function') addMail(season, { type: 'success', icon: '🏥', title: getPlayerDisplayName(detailPlayer) + ' — Clinic visit', body: result.message || 'Clinic visit successful.', actionRoute: 'roster', actionLabel: 'Roster' });
            if (typeof updateFinanceUI === 'function') updateFinanceUI(yourTeam);
            closeDetailModal();
            updateRosterUI();
          } else {
            showNotification((result && result.message) || 'Clinic visit failed.', 'error');
            if (season && season.inbox && typeof addMail === 'function') addMail(season, { type: 'error', icon: '🏥', title: getPlayerDisplayName(detailPlayer) + ' — Clinic', body: (result && result.message) || 'Clinic visit failed.', actionRoute: 'roster', actionLabel: 'Roster' });
          }
        });
      });
    }
    offerContractBtn.addEventListener('click', () => {
      if (!detailPlayer) return;
      const playerToOffer = detailPlayer;
      closeDetailModal();
      document.dispatchEvent(new CustomEvent('nexus:openContractOffer', { detail: { player: playerToOffer } }));
    });
    if (transferListBtn) {
      transferListBtn.addEventListener('click', () => {
        if (!detailPlayer) return;
        const yourTeam = league && league[0];
        if (!yourTeam || !season || !season.inbox) return;
        const p = detailPlayer;
        const name = getPlayerDisplayName(p);
        if (p.transferListed === true) {
          p.transferListed = false;
          showNotification(name + ' removed from transfer list.', 'info');
          if (typeof updateRosterUI === 'function') updateRosterUI();
          closeDetailModal();
          return;
        }
        showConfirm('Put ' + name + ' on the transfer list? Other clubs can make offers. You can remove them later.', () => {
          p.transferListed = true;
          showNotification(name + ' added to transfer list.', 'info');
          if (typeof triggerPlayerChat === 'function') triggerPlayerChat(season, p, 'transfer_listed');
          if (typeof updateInboxBadge === 'function') updateInboxBadge();
          if (typeof updateRosterUI === 'function') updateRosterUI();
          closeDetailModal();
        });
      });
    }
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
          if (season && season.inbox && typeof addMail === 'function') addMail(season, { type: 'info', icon: '💰', title: 'Sold ' + name, body: result.message || ('Sold ' + name), actionRoute: 'roster', actionLabel: 'Roster' });
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
          if (seasonData && seasonData.inbox && typeof addMail === 'function') addMail(seasonData, { type: 'info', icon: '✍', title: 'Player signed', body: result.message || ('Signed ' + getPlayerDisplayName(listing.player)), actionRoute: 'roster', actionLabel: 'Roster' });
          if (typeof triggerPlayerChat === 'function' && seasonData && seasonData.inbox && listing.player) triggerPlayerChat(seasonData, listing.player, 'new_signing');
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
          if (seasonData && seasonData.inbox && typeof addMail === 'function') addMail(seasonData, { type: 'info', icon: '✍', title: 'Player signed from club', body: result.message || ('Signed ' + getPlayerDisplayName(player)), actionRoute: 'roster', actionLabel: 'Roster' });
          if (typeof triggerPlayerChat === 'function' && seasonData && seasonData.inbox && player) triggerPlayerChat(seasonData, player, 'new_signing');
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
          if (seasonData && seasonData.inbox && typeof addMail === 'function') addMail(seasonData, { type: 'info', icon: '✍', title: 'Free agent signed', body: result.message || ('Signed ' + getPlayerDisplayName(player)), actionRoute: 'roster', actionLabel: 'Roster' });
          if (typeof triggerPlayerChat === 'function' && seasonData && seasonData.inbox && player) triggerPlayerChat(seasonData, player, 'new_signing');
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
        if (season && season.inbox && typeof addMail === 'function') addMail(season, { type: 'info', icon: '🌟', title: 'Promoted to roster', body: getPlayerDisplayName(currentProspect) + ' was promoted from the academy.', actionRoute: 'roster', actionLabel: 'Roster' });
        if (typeof triggerPlayerChat === 'function' && season && season.inbox) triggerPlayerChat(season, currentProspect, 'youth_promoted');
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
      if (typeof triggerPlayerChat === 'function' && season && season.inbox) triggerPlayerChat(season, prospect, 'youth_released');
      if (season && season.inbox && typeof addMail === 'function') addMail(season, { type: 'info', icon: '👋', title: 'Released from academy', body: getPlayerDisplayName(prospect) + ' was released from the youth academy.' + (age <= 17 ? ' (back to youth market)' : ''), actionRoute: 'market', actionLabel: 'Market' });
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
          if (season && season.inbox && typeof addMail === 'function') addMail(season, { type: 'info', icon: '📚', title: 'Signed to academy', body: getPlayerDisplayName(prospect) + ' joined the youth academy.', actionRoute: 'market', actionLabel: 'Market' });
          if (typeof triggerPlayerChat === 'function' && season && season.inbox) triggerPlayerChat(season, prospect, 'signed_to_academy');
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

    (seasonData.matchdays || []).forEach((dayMatchesRaw, dayIndex) => {
      const dayMatches = normalizeMatchdayMatches(dayMatchesRaw);
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
    challengerSeason.matchdays.forEach((dayMatchesRaw, dayIndex) => {
      const dayMatches = normalizeMatchdayMatches(dayMatchesRaw);
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

  // =====================================================================
  // INBOX UI — defined inside initUI to access season/league closure vars
  // =====================================================================

  window.Nexus.onOpponentBootcampActivated = function(aiTeamName, bootcampName) {
    if (!season || !season.inbox || typeof addMail !== 'function') return;
    addMail(season, {
      type: 'info',
      icon: '🏕',
      title: aiTeamName + ' activated ' + bootcampName,
      body: aiTeamName + ' activated ' + bootcampName + ' before facing you. You can set your own bootcamp in Operations.',
      actionRoute: 'operations',
      actionTab: 'bootcamp',
      actionLabel: 'Go to Bootcamp'
    });
  };

  function updateInboxBadge() {
    if (!season || !season.inbox) return;
    const mailUnread = season.inbox.mails.filter(function(m) { return !m.read; }).length;
    const chatUnread = season.inbox.chats.filter(function(c) { return c.unread; }).length;
    const mailBadgeEl = document.getElementById('inboxMailUnread');
    const chatBadgeEl = document.getElementById('inboxChatUnread');
    const navBadgeEl  = document.getElementById('inboxNavBadge');
    if (mailBadgeEl) { mailBadgeEl.textContent = mailUnread || ''; mailBadgeEl.style.display = mailUnread ? '' : 'none'; }
    if (chatBadgeEl) { chatBadgeEl.textContent = chatUnread || ''; chatBadgeEl.style.display = chatUnread ? '' : 'none'; }
    const total = mailUnread + chatUnread;
    if (navBadgeEl)  { navBadgeEl.textContent  = total || '';      navBadgeEl.style.display  = total      ? '' : 'none'; }
  }

  function renderMailList() {
    const listEl   = document.getElementById('inboxMailList');
    const viewerEl = document.getElementById('inboxMailViewer');
    if (!listEl || !viewerEl || !season || !season.inbox) return;
    const mails = season.inbox.mails;
    if (!mails.length) {
      listEl.innerHTML   = '<p class="inbox-empty-list">No messages yet.</p>';
      viewerEl.innerHTML = '<div class="inbox-placeholder"><p>Your mailbox is empty.</p></div>';
      return;
    }
    listEl.innerHTML = mails.map(function(m, i) {
      return '<div class="inbox-list-item' + (m.read ? '' : ' is-unread') + '" data-mail-idx="' + i + '">' +
        '<span class="inbox-list-icon">' + m.icon + '</span>' +
        '<div class="inbox-list-meta">' +
          '<div class="inbox-list-title">' + m.title + '</div>' +
          '<div class="inbox-list-sub">MD ' + (m.matchday + 1) + '</div>' +
        '</div>' +
        (m.read ? '' : '<span class="inbox-unread-dot"></span>') +
      '</div>';
    }).join('');
    listEl.querySelectorAll('.inbox-list-item').forEach(function(el) {
      el.addEventListener('click', function() {
        listEl.querySelectorAll('.inbox-list-item').forEach(function(e) { e.classList.remove('is-selected'); });
        el.classList.add('is-selected');
        const mail = season.inbox.mails[parseInt(el.getAttribute('data-mail-idx'), 10)];
        if (!mail) return;
        mail.read = true;
        el.classList.remove('is-unread');
        const dot = el.querySelector('.inbox-unread-dot');
        if (dot) dot.remove();
        updateInboxBadge();
        let bodyHtml = mail.body;
        let actionHtml = '';
        if (mail.offers && Array.isArray(mail.offers) && mail.offers.length) {
          bodyHtml = '<p>You have job offers from the following teams. Click <strong>Negotiate</strong> to view or accept an offer.</p>' +
            '<div class="inbox-job-offers">' + mail.offers.map(function(off, idx) {
              return '<div class="inbox-job-offer-row">' +
                '<span class="inbox-job-offer-name">' + (off.teamName || '—') + '</span>' +
                (off.salary != null ? '<span class="inbox-job-offer-salary">$' + Number(off.salary).toLocaleString() + '/mo</span>' : '') +
                '<button type="button" class="btn btn--primary inbox-mail-action inbox-job-offer-btn" data-offer-index="' + idx + '">Negotiate</button>' +
                '</div>';
            }).join('') + '</div>';
        } else if (mail.actionRoute) {
          actionHtml = '<button class="btn btn--primary inbox-mail-action" data-route="' + mail.actionRoute + '"' + (mail.actionTab ? ' data-tab="' + mail.actionTab + '"' : '') + '>' + (mail.actionLabel || 'View') + '</button>';
        }
        viewerEl.innerHTML =
          '<div class="inbox-mail-view">' +
            '<div class="inbox-mail-view__header">' +
              '<span class="inbox-mail-view__icon">' + mail.icon + '</span>' +
              '<div>' +
                '<div class="inbox-mail-view__title">' + mail.title + '</div>' +
                '<div class="inbox-mail-view__meta">Matchday ' + (mail.matchday + 1) + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="inbox-mail-view__body">' + bodyHtml + '</div>' +
            actionHtml +
          '</div>';
        viewerEl.querySelectorAll('.inbox-mail-action[data-route]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            const route = btn.getAttribute('data-route');
            const tab = btn.getAttribute('data-tab');
            const navBtn = document.querySelector('.menu__item[data-route="' + route + '"]');
            if (navBtn) navBtn.click();
            if (tab && route === 'operations') {
              const tabBtn = document.querySelector('.operations-tab[data-operations-tab="' + tab + '"]');
              if (tabBtn) tabBtn.click();
            }
          });
        });
        viewerEl.querySelectorAll('.inbox-job-offer-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            if (!mail.offers || !mail.offers.length) return;
            const idx = parseInt(btn.getAttribute('data-offer-index'), 10);
            const off = mail.offers[idx];
            if (!off) return;
            const allTeams = [].concat(league || [], challengerLeague || []);
            const team = allTeams.find(function(t) { return t && t.name === off.teamName; });
            if (!team) {
              showNotification('That team is no longer available.', 'info');
              return;
            }
            currentJobOffers = [{ team: team, salary: off.salary, reason: off.reason }];
            renderJobOffers(currentJobOffers, userTeamRef());
            const jobModal = document.getElementById('jobOffersModal');
            if (jobModal) jobModal.style.display = 'flex';
          });
        });
      });
    });
  }

  function renderChatThread(thread, viewerEl) {
    if (!thread || !viewerEl) return;
    function buildThread() {
      const lastMsg   = thread.messages[thread.messages.length - 1];
      const hasOptions = lastMsg && lastMsg.from === 'player' && lastMsg.options && lastMsg.options.length && !thread.resolved;
      const messagesHtml = thread.messages.map(function(msg) {
        const cls    = msg.from === 'player' ? 'inbox-msg inbox-msg--player' : 'inbox-msg inbox-msg--manager';
        const sender = msg.from === 'player' ? thread.playerName : 'You';
        return '<div class="' + cls + '"><div class="inbox-msg__sender">' + sender + ' · MD ' + (msg.matchday + 1) + '</div><div class="inbox-msg__text">' + msg.text + '</div></div>';
      }).join('');
      const optionsHtml = hasOptions
        ? '<div class="inbox-options">' + lastMsg.options.map(function(opt, i) {
            return '<button class="btn btn--secondary inbox-option-btn" data-option="' + i + '">' + opt.label + '</button>';
          }).join('') + '</div>'
        : (thread.resolved ? '<div class="inbox-resolved-banner">Conversation resolved.</div>' : '');
      viewerEl.innerHTML =
        '<div class="inbox-chat-view">' +
          '<div class="inbox-chat-view__header"><span class="inbox-list-icon">' + thread.icon + '</span><strong>' + thread.playerName + '</strong></div>' +
          '<div class="inbox-chat-messages" id="inboxChatMessages">' + messagesHtml + '</div>' +
          optionsHtml +
        '</div>';
      const msgsEl = viewerEl.querySelector('#inboxChatMessages');
      if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
      viewerEl.querySelectorAll('.inbox-option-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          applyChatOption(season, thread.playerId, parseInt(btn.getAttribute('data-option'), 10));
          renderChatList();
          const newIdx = season.inbox.chats.indexOf(thread);
          if (newIdx >= 0) {
            const item = document.querySelector('[data-chat-idx="' + newIdx + '"]');
            if (item) { item.classList.add('is-selected'); }
          }
          buildThread();
        });
      });
    }
    buildThread();
  }

  function renderChatList() {
    const listEl   = document.getElementById('inboxChatList');
    const viewerEl = document.getElementById('inboxChatViewer');
    if (!listEl || !viewerEl || !season || !season.inbox) return;
    const chats = season.inbox.chats;
    if (!chats.length) {
      listEl.innerHTML   = '<p class="inbox-empty-list">No conversations yet.</p>';
      viewerEl.innerHTML = '<div class="inbox-placeholder"><p>No player conversations this season.</p></div>';
      return;
    }
    listEl.innerHTML = chats.map(function(c, i) {
      const lastMsg = c.messages[c.messages.length - 1];
      const preview = lastMsg ? lastMsg.text.replace(/"/g, '').substring(0, 55) + '…' : '';
      return '<div class="inbox-list-item' + (c.unread ? ' is-unread' : '') + (c.resolved ? ' is-resolved' : '') + '" data-chat-idx="' + i + '">' +
        '<span class="inbox-list-icon">' + c.icon + '</span>' +
        '<div class="inbox-list-meta">' +
          '<div class="inbox-list-title">' + c.playerName + (c.resolved ? ' <span class="inbox-resolved-tag">Resolved</span>' : '') + '</div>' +
          '<div class="inbox-list-sub">' + preview + '</div>' +
        '</div>' +
        (c.unread ? '<span class="inbox-unread-dot"></span>' : '') +
      '</div>';
    }).join('');
    listEl.querySelectorAll('.inbox-list-item').forEach(function(el) {
      el.addEventListener('click', function() {
        listEl.querySelectorAll('.inbox-list-item').forEach(function(e) { e.classList.remove('is-selected'); });
        el.classList.add('is-selected');
        const thread = season.inbox.chats[parseInt(el.getAttribute('data-chat-idx'), 10)];
        if (!thread) return;
        thread.unread = false;
        el.classList.remove('is-unread');
        const dot = el.querySelector('.inbox-unread-dot');
        if (dot) dot.remove();
        updateInboxBadge();
        renderChatThread(thread, viewerEl);
      });
    });
  }

  function updateInboxUI() {
    if (!season || !season.inbox) return;
    updateInboxBadge();
    const mailTabBtn  = document.getElementById('inboxTabMails');
    const chatTabBtn  = document.getElementById('inboxTabChats');
    const mailsPanel  = document.getElementById('inboxMailsPanel');
    const chatsPanel  = document.getElementById('inboxChatsPanel');
    if (!mailTabBtn || !chatTabBtn || !mailsPanel || !chatsPanel) return;
    const showMails = function() {
      mailsPanel.style.display = ''; chatsPanel.style.display = 'none';
      mailTabBtn.classList.add('is-active'); chatTabBtn.classList.remove('is-active');
      renderMailList();
    };
    const showChats = function() {
      chatsPanel.style.display = ''; mailsPanel.style.display = 'none';
      chatTabBtn.classList.add('is-active'); mailTabBtn.classList.remove('is-active');
      renderChatList();
    };
    mailTabBtn.onclick = showMails;
    chatTabBtn.onclick = showChats;
    // Keep current tab active, default to mails
    if (chatsPanel.style.display === '') { showChats(); } else { showMails(); }
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

})();
