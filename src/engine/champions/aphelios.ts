/**
 * Aphelios — The Weapon of the Faithful
 * Patch 16.5.1 · Source: League Wiki
 * Simplified: Calibrum (Q range), Severum (Q heal), Gravitum (Q root),
 *             Infernum (Q AoE), Crescendum (Q turret)
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Q base across weapons: 60/85/110/135/160 + 42-60% bonus AD + 100% AP
const Q_BASE = [60, 85, 110, 135, 160];
const Q_BONUS_AD_RATIO = [0.42, 0.4625, 0.505, 0.5475, 0.60];

// R — Moonlight Vigil: 125/175/225 + 20% bonus AD + 100% AP (initial)
//   follow-up enhanced AA: 100% AD per mark
const R_BASE = [125, 175, 225];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q (generic across weapons)
    const qRaw = Q_BASE[qR - 1] + Q_BONUS_AD_RATIO[qR - 1] * p.bonusAD + p.ap;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R initial hit
    const rRaw = R_BASE[rR - 1] + 0.20 * p.bonusAD + p.ap;
    const r = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R follow-up AA
    const rFollowRaw = p.totalAD;
    const rFollow = calculatePhysicalDamage(rFollowRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Weapon Q (générique)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'R', abilityName: 'Moonlight Vigil (R) — impact', rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
        { abilityId: 'R_follow', abilityName: 'Moonlight Vigil (R) — AA follow-up', rank: rR, damageType: 'physical', rawDamage: rFollow.rawDamage, finalDamage: rFollow.finalDamage },
    ];
}

registerChampion('Aphelios', {
    name: 'Aphelios',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Weapon Active', maxRank: 5 },
        { key: 'r', label: 'R — Moonlight Vigil', maxRank: 3 },
    ],
});
