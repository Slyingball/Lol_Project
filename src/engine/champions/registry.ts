/**
 * Champion ability registry.
 *
 * Each champion that has hardcoded ability data registers here.
 * Champions without an entry still work — they just show auto-attack damage.
 */

import type { AbilityDamageResult } from '../../types/damage';
import type { TargetStats } from '../../types/target';

/** Function signature for a champion's ability calculator */
export interface ChampionAbilityConfig {
    /** Champion display name */
    name: string;
    /** AD per-level override (when DDragon reports 0) */
    adGrowthOverride?: number;
    /** Calculates all abilities and returns damage results */
    calculateAbilities: (params: AbilityCalcParams) => AbilityDamageResult[];
    /** Spell labels for the UI sliders */
    spellSlots: SpellSlotConfig[];
}

export interface SpellSlotConfig {
    key: string;         // e.g. 'q', 'e', 'r'
    label: string;       // e.g. 'Q — Decisive Strike'
    maxRank: number;     // usually 5 or 3
    /** Extra numeric param (e.g. E spin count) */
    extraParam?: { label: string; min: number; max: number; default: number };
}

export interface AbilityCalcParams {
    totalAD: number;
    baseAD: number;
    bonusAD: number;
    ap: number;
    level: number;
    ranks: Record<string, number>;    // e.g. { q: 3, e: 3, r: 1 }
    extras: Record<string, number>;   // e.g. { eSpins: 9 }
    target: TargetStats;
    armorPenPercent: number;
    armorPenFlat: number;
    magicPenPercent: number;
    magicPenFlat: number;
    critChance: number;
    critMultiplier: number;
}

// ─── Registry ───────────────────────────────────────────────────────────────

const registry = new Map<string, ChampionAbilityConfig>();

export function registerChampion(id: string, config: ChampionAbilityConfig) {
    registry.set(id, config);
}

export function getChampionConfig(id: string): ChampionAbilityConfig | undefined {
    return registry.get(id);
}

export function hasChampionConfig(id: string): boolean {
    return registry.has(id);
}

export function getRegisteredChampionIds(): string[] {
    return Array.from(registry.keys());
}
