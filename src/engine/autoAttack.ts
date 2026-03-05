import type { TargetStats } from '../types/target';
import type { AutoAttackResult, SingleDamageResult } from '../types/damage';
import { calculatePhysicalDamage } from './damageCalculator';

/** Base crit damage multiplier in League (175%). */
const BASE_CRIT_MULTIPLIER = 1.75;
/** IE bonus crit damage (215% total). */
const IE_CRIT_MULTIPLIER = 2.15;

/**
 * Returns the crit multiplier based on items.
 * - No IE: 1.75
 * - With IE: 2.15
 */
export function getCritMultiplier(hasIE: boolean): number {
    return hasIE ? IE_CRIT_MULTIPLIER : BASE_CRIT_MULTIPLIER;
}

/**
 * Calculates auto-attack damage (normal + crit + expected).
 */
export function calculateAutoAttack(
    totalAD: number,
    critChance: number,
    hasIE: boolean,
    target: TargetStats,
    armorPenPercent = 0,
    armorPenFlat = 0
): AutoAttackResult {
    const critMult = getCritMultiplier(hasIE);

    const normal: SingleDamageResult = calculatePhysicalDamage(
        totalAD,
        target,
        armorPenPercent,
        armorPenFlat,
        false,
        1
    );

    const crit: SingleDamageResult = calculatePhysicalDamage(
        totalAD,
        target,
        armorPenPercent,
        armorPenFlat,
        true,
        critMult
    );

    const expected =
        normal.finalDamage * (1 - critChance) + crit.finalDamage * critChance;

    return {
        label: 'Auto-attaque',
        normal,
        crit,
        expected,
    };
}
