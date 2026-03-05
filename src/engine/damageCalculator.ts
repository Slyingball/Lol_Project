import type { TargetStats } from '../types/target';
import type { SingleDamageResult } from '../types/damage';

// ─── Mitigation formulas ──────────────────────────────────────────────────────

/**
 * Effective armor after applying percent and flat armor penetration.
 * Formula: eff_armor = armor × (1 − %pen) − flat_pen
 * Clamped at 0 (armor cannot go negative for the formula).
 */
export function calculateEffectiveArmor(
    armor: number,
    percentPen: number,
    flatPen: number
): number {
    const afterPercent = armor * (1 - percentPen);
    return Math.max(0, afterPercent - flatPen);
}

export function calculateEffectiveMR(
    mr: number,
    percentPen: number,
    flatPen: number
): number {
    const afterPercent = mr * (1 - percentPen);
    return Math.max(0, afterPercent - flatPen);
}

/** Damage multiplier from effective armor/MR: 100 / (100 + resistances). */
export function resistanceDamageMultiplier(effectiveResistance: number): number {
    if (effectiveResistance >= 0) {
        return 100 / (100 + effectiveResistance);
    }
    // Negative resistance increases damage
    return 2 - 100 / (100 - effectiveResistance);
}

// ─── Damage calculation functions ─────────────────────────────────────────────

export function calculatePhysicalDamage(
    rawDamage: number,
    target: TargetStats,
    armorPenPercent = 0,
    armorPenFlat = 0,
    isCrit = false,
    critMultiplier = 1
): SingleDamageResult {
    const effectiveArmor = calculateEffectiveArmor(
        target.armor,
        armorPenPercent,
        armorPenFlat
    );
    const multiplier = resistanceDamageMultiplier(effectiveArmor);
    const base = rawDamage * (isCrit ? critMultiplier : 1);
    return {
        type: 'physical',
        rawDamage: base,
        finalDamage: base * multiplier,
        isCrit,
    };
}

export function calculateMagicDamage(
    rawDamage: number,
    target: TargetStats,
    magicPenPercent = 0,
    magicPenFlat = 0
): SingleDamageResult {
    const effectiveMR = calculateEffectiveMR(
        target.magicResist,
        magicPenPercent,
        magicPenFlat
    );
    const multiplier = resistanceDamageMultiplier(effectiveMR);
    return {
        type: 'magic',
        rawDamage,
        finalDamage: rawDamage * multiplier,
        isCrit: false,
    };
}

export function calculateTrueDamage(rawDamage: number): SingleDamageResult {
    return {
        type: 'true',
        rawDamage,
        finalDamage: rawDamage,
        isCrit: false,
    };
}
