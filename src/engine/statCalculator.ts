import type { Champion, ChampionStatsAtLevel } from '../types/champion';
import type { Item, AggregatedItemStats } from '../types/item';

// ─── League official stat-at-level formula ───────────────────────────────────
// https://leagueoflegends.fandom.com/wiki/Champion_statistic

/**
 * Computes a champion stat at a given level using Riot's non-linear formula.
 *   stat(N) = base + growth × (N-1) × (0.7025 + 0.0175 × (N-1))
 */
export function calculateStatAtLevel(
    base: number,
    growth: number,
    level: number
): number {
    if (growth === 0) return base;
    const n = Math.max(1, Math.min(20, level));
    return base + growth * (n - 1) * (0.7025 + 0.0175 * (n - 1));
}

/**
 * Applies the Attack Speed formula.
 * attackspeed(N) = baseAS × (1 + (AS_ratio × level) / 100)
 */
function calculateAttackSpeed(baseAS: number, asPerLevel: number, level: number): number {
    const n = Math.max(1, Math.min(20, level));
    return baseAS * (1 + (asPerLevel * n) / 100);
}

// ─── Champion stats at level ─────────────────────────────────────────────────

export function computeChampionStatsAtLevel(
    champion: Champion,
    level: number
): ChampionStatsAtLevel {
    const s = champion.baseStats;
    // Use override if DDragon growth is 0 (e.g. Garen 16.5.1 bug)
    const adGrowth =
        s.attackDamagePerLevel === 0 && champion.adGrowthOverride !== undefined
            ? champion.adGrowthOverride
            : s.attackDamagePerLevel;

    return {
        hp: calculateStatAtLevel(s.hp, s.hpPerLevel, level),
        armor: calculateStatAtLevel(s.armor, s.armorPerLevel, level),
        spellBlock: calculateStatAtLevel(s.spellBlock, s.spellBlockPerLevel, level),
        attackDamage: calculateStatAtLevel(s.attackDamage, adGrowth, level),
        attackSpeed: calculateAttackSpeed(s.attackSpeed, s.attackSpeedPerLevel, level),
        moveSpeed: s.moveSpeed,
        hpRegen: calculateStatAtLevel(s.hpRegen, s.hpRegenPerLevel, level),
    };
}

// ─── Item aggregation ─────────────────────────────────────────────────────────

export function aggregateItemStats(items: Item[]): AggregatedItemStats {
    const agg: AggregatedItemStats = {
        bonusAD: 0,
        ap: 0,
        bonusArmor: 0,
        bonusMR: 0,
        bonusHP: 0,
        critChance: 0,
        hasCritDamageBonus: false,
        critDamageBonus: 0,
        armorPenFlat: 0,
        armorPenPercent: 0,
        magicPenFlat: 0,
        magicPenPercent: 0,
        lifeSteal: 0,
        attackSpeed: 0,
    };

    for (const item of items) {
        const s = item.stats;
        agg.bonusAD += s.FlatPhysicalDamageMod ?? 0;
        agg.ap += s.FlatMagicDamageMod ?? 0;
        agg.bonusArmor += s.FlatArmorMod ?? 0;
        agg.bonusMR += s.FlatSpellBlockMod ?? 0;
        agg.bonusHP += s.FlatHPPoolMod ?? 0;
        agg.critChance += s.FlatCritChanceMod ?? 0;
        agg.armorPenFlat += s.rFlatArmorPenetrationMod ?? 0;
        agg.armorPenPercent += s.rPercentArmorPenetrationMod ?? 0;
        agg.magicPenFlat += s.rFlatMagicPenetrationMod ?? 0;
        agg.magicPenPercent += s.rPercentMagicPenetrationMod ?? 0;
        agg.lifeSteal += s.PercentLifeStealMod ?? 0;
        agg.attackSpeed += s.PercentAttackSpeedMod ?? 0;

        // Infinity Edge: +40% crit damage on top of base 175%
        if (item.isInfinityEdge) {
            agg.hasCritDamageBonus = true;
            agg.critDamageBonus += 0.4; // +40% extra multiplier
        }
    }

    // Cap crit chance at 100%
    agg.critChance = Math.min(1, agg.critChance);

    return agg;
}
