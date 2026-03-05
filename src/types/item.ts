// ─── Data Dragon item stats keys ───────────────────────────────────────────

export interface DDragonItemStats {
    FlatPhysicalDamageMod?: number;   // Bonus AD
    FlatMagicDamageMod?: number;      // Ability Power
    FlatArmorMod?: number;            // Armor
    FlatSpellBlockMod?: number;       // Magic Resist
    FlatHPPoolMod?: number;           // Health
    FlatMPPoolMod?: number;           // Mana
    FlatCritChanceMod?: number;       // Crit chance (0–1)
    FlatCritDamageMod?: number;       // Bonus crit damage multiplier
    PercentAttackSpeedMod?: number;   // Attack speed bonus (0–1)
    PercentLifeStealMod?: number;     // Life steal (0–1)
    PercentMovementSpeedMod?: number; // Move speed bonus (0–1)
    FlatMovementSpeedMod?: number;    // Flat move speed
    rFlatArmorPenetrationMod?: number;
    rPercentArmorPenetrationMod?: number;
    rFlatMagicPenetrationMod?: number;
    rPercentMagicPenetrationMod?: number;
    [key: string]: number | undefined;
}

export interface DDragonItemData {
    name: string;
    description: string;
    colloq: string;
    plaintext: string;
    gold: { base: number; total: number; sell: number; purchasable: boolean };
    tags: string[];
    maps: Record<string, boolean>;
    stats: DDragonItemStats;
    depth?: number;
}

/** Normalised item usable by the engine. */
export interface Item {
    id: string;
    name: string;
    gold: number;
    tags: string[];
    stats: DDragonItemStats;
    /** True if purchasable on Summoner's Rift (map 11). */
    isSummonersRift: boolean;
    /** Special flag for Infinity Edge passive. */
    isInfinityEdge?: boolean;
}

/** Aggregated stats from a set of items. */
export interface AggregatedItemStats {
    bonusAD: number;
    ap: number;
    bonusArmor: number;
    bonusMR: number;
    bonusHP: number;
    critChance: number;       // 0–1
    hasCritDamageBonus: boolean; // true if any item grants +crit damage (IE)
    critDamageBonus: number;  // additional multiplier (e.g. 0.4 for IE)
    armorPenFlat: number;
    armorPenPercent: number;
    magicPenFlat: number;
    magicPenPercent: number;
    lifeSteal: number;
    attackSpeed: number;
}
