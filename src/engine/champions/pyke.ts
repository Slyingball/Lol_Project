import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateTrueDamage } from '../damageCalculator';

// Q — Bone Skewer
const Q_BASE = [75, 110, 145, 180, 215];
const Q_RATIO_BONUS_AD = 0.6;

// E — Phantom Undertow
const E_BASE = [105, 135, 165, 195, 225];
const E_RATIO_BONUS_AD = 1.0;

// R — Death from Below (Threshold scaling by level)
// Level 1: 120, Level 18: 475. Interpolation: 120 + 355 * (level - 1) / 17
const R_RATIO_BONUS_AD = 0.8;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.bonusAD * Q_RATIO_BONUS_AD);
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + (p.bonusAD * E_RATIO_BONUS_AD);
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R Execution Threshold (deals True damage equal to the threshold on low HP)
    const rThresholdBase = 120 + 355 * (p.level - 1) / 17;
    const rThresholdRaw = rThresholdBase + (p.bonusAD * R_RATIO_BONUS_AD);
    const rThreshold = calculateTrueDamage(rThresholdRaw);

    // R non-execute damage (deals 50% physical damage if not executed)
    const rNonExec = calculatePhysicalDamage(rThresholdRaw * 0.5, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Bone Skewer (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E', abilityName: 'Phantom Undertow (E)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R_exec', abilityName: `Death from Below (R) — Seuil d'exécution (brut)`, rank: rR, damageType: 'true', rawDamage: rThreshold.rawDamage, finalDamage: rThreshold.finalDamage },
        { abilityId: 'R_phys', abilityName: 'Death from Below (R) — Non-exécuté (50% physique)', rank: rR, damageType: 'physical', rawDamage: rNonExec.rawDamage, finalDamage: rNonExec.finalDamage },
    ];
}

registerChampion('Pyke', {
    name: 'Pyke',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Bone Skewer', maxRank: 5 },
        { key: 'e', label: 'E — Phantom Undertow', maxRank: 5 },
        { key: 'r', label: 'R — Death from Below', maxRank: 3 },
    ],
});
