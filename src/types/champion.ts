// ─── Raw Data Dragon shapes ────────────────────────────────────────────────

export interface DDragonChampionBaseStats {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  critperlevel: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
}

export interface DDragonSpell {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  maxrank: number;
  cooldown: number[];
  cost: number[];
  effect: (null | number[])[];
  range: number[];
  costType: string;
}

export interface DDragonPassive {
  name: string;
  description: string;
}

export interface DDragonChampionData {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  partype: string;
  stats: DDragonChampionBaseStats;
  spells: DDragonSpell[];
  passive: DDragonPassive;
}

// ─── Computed champion model ────────────────────────────────────────────────

/** Raw stats directly from Data Dragon (base values + per-level growth). */
export interface ChampionBaseStats {
  hp: number;
  hpPerLevel: number;
  armor: number;
  armorPerLevel: number;
  spellBlock: number;
  spellBlockPerLevel: number;
  attackDamage: number;
  attackDamagePerLevel: number;
  attackSpeed: number;
  attackSpeedPerLevel: number;
  moveSpeed: number;
  hpRegen: number;
  hpRegenPerLevel: number;
}

/** Stats after scaling to a specific level. */
export interface ChampionStatsAtLevel {
  hp: number;
  armor: number;
  spellBlock: number;
  attackDamage: number;    // base AD only
  attackSpeed: number;
  moveSpeed: number;
  hpRegen: number;
}

/** Full champion enriched with computed stats + hardcoded ratio overrides. */
export interface Champion {
  id: string;
  name: string;
  title: string;
  tags: string[];
  baseStats: ChampionBaseStats;
  /** Ad growth override (used when DDragon reports 0, e.g. Garen 16.5.1 bug) */
  adGrowthOverride?: number;
}
