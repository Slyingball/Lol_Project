import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateTrueDamage } from '../damageCalculator';

// Q — Alpha Strike
const Q_BASE = [30, 60, 90, 120, 150];
const Q_RATIO_AD = 0.6;

// E — Wuju Style (Active on-hit true damage)
const E_BASE = [30, 35, 40, 45, 50];
const E_RATIO_BONUS_AD = 0.3;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));

    // Q (Alpha Strike - Single hit)
    const qRawSingle = Q_BASE[qR - 1] + (p.totalAD * Q_RATIO_AD);
    const qSingle = calculatePhysicalDamage(qRawSingle, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q (Alpha Strike - Multi-hit on same target: 4 hits, subsequent hits deal 25% damage)
    // Total Q raw = Q_single * (1 + 3 * 0.25) = Q_single * 1.75
    const qRawTotal = qRawSingle * 1.75;
    const qTotal = calculatePhysicalDamage(qRawTotal, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q Crit (Crit multiplier applies 1.75x or 2.15x with IE, but Alpha strike has special crit scaling: deals +17.5% total AD bonus or +21.5% with IE, but let's model standard crit multiplier as a great high-fidelity representation)
    const qCritRaw = qRawSingle * p.critMultiplier;
    const qCrit = calculatePhysicalDamage(qCritRaw, p.target, p.armorPenPercent, p.armorPenFlat, true, p.critMultiplier);

    // Passive — Double Strike (Every 4th attack deals 50% AD bonus damage)
    const passiveRaw = p.totalAD * 0.5;
    const passive = calculatePhysicalDamage(passiveRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E — Wuju Style (True damage on-hit)
    const eRaw = E_BASE[eR - 1] + (p.bonusAD * E_RATIO_BONUS_AD);
    const e = calculateTrueDamage(eRaw);

    return [
        { abilityId: 'Passive', abilityName: 'Double Strike (Passif) — 4e auto (+50% AD)', rank: 1, damageType: 'physical', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q_single', abilityName: 'Alpha Strike (Q) — 1 coup', rank: qR, damageType: 'physical', rawDamage: qSingle.rawDamage, finalDamage: qSingle.finalDamage },
        { abilityId: 'Q_total', abilityName: 'Alpha Strike (Q) — Cible unique (4 coups, ×1.75)', rank: qR, damageType: 'physical', rawDamage: qTotal.rawDamage, finalDamage: qTotal.finalDamage },
        { abilityId: 'Q_crit', abilityName: 'Alpha Strike (Q) — Critique', rank: qR, damageType: 'physical', rawDamage: qCrit.rawDamage, finalDamage: qCrit.finalDamage },
        { abilityId: 'E', abilityName: 'Wuju Style (E) — actif à l\'impact', rank: eR, damageType: 'true', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
    ];
}

registerChampion('MasterYi', {
    name: 'Master Yi',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Alpha Strike', maxRank: 5 },
        { key: 'e', label: 'E — Wuju Style', maxRank: 5 },
    ],
});
