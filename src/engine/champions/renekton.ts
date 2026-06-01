import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Q — Cull the Meek
const Q_BASE = [60, 90, 120, 150, 180];
const Q_RATIO_BONUS_AD = 1.0;
const Q_EMP_BASE = [90, 135, 180, 225, 270];
const Q_EMP_RATIO_BONUS_AD = 1.4;

// W — Ruthless Predator (Standard is 2 hits, Empowered is 3 hits)
const W_BASE = [10, 30, 50, 70, 90];
const W_RATIO_TOTAL_AD = 1.5;
const W_EMP_BASE = [15, 45, 75, 105, 135];
const W_EMP_RATIO_TOTAL_AD = 2.25;

// E — Slice and Dice
const E_BASE = [35, 60, 85, 110, 135];
const E_RATIO_BONUS_AD = 0.9;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));

    const furyEmpowered = p.extras.furyEmpowered === 1;

    // Q
    const qRawStd = Q_BASE[qR - 1] + (p.bonusAD * Q_RATIO_BONUS_AD);
    const qRawEmp = Q_EMP_BASE[qR - 1] + (p.bonusAD * Q_EMP_RATIO_BONUS_AD);
    const qRaw = furyEmpowered ? qRawEmp : qRawStd;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W
    const wRawStd = W_BASE[wR - 1] + (p.totalAD * W_RATIO_TOTAL_AD);
    const wRawEmp = W_EMP_BASE[wR - 1] + (p.totalAD * W_EMP_RATIO_TOTAL_AD);
    const wRaw = furyEmpowered ? wRawEmp : wRawStd;
    const w = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + (p.bonusAD * E_RATIO_BONUS_AD);
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const qName = furyEmpowered ? 'Cull the Meek (Q) — Courroux (50 Fureur)' : 'Cull the Meek (Q) — Standard';
    const wName = furyEmpowered ? 'Ruthless Predator (W) — Courroux (3 coups)' : 'Ruthless Predator (W) — Standard (2 coups)';

    return [
        { abilityId: 'Q', abilityName: qName, rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'Q_std', abilityName: 'Cull the Meek (Q) — Standard', rank: qR, damageType: 'physical', rawDamage: qRawStd, finalDamage: calculatePhysicalDamage(qRawStd, p.target, p.armorPenPercent, p.armorPenFlat).finalDamage },
        { abilityId: 'W', abilityName: wName, rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage, hits: furyEmpowered ? 3 : 2 },
        { abilityId: 'E', abilityName: 'Slice and Dice (E) — par dash', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
    ];
}

registerChampion('Renekton', {
    name: 'Renekton',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Cull the Meek', maxRank: 5 },
        { key: 'furyEmpowered', label: 'Compétences améliorées (50+ Fureur)', maxRank: 1, extraParam: { label: 'Fureur Active (0/1)', min: 0, max: 1, default: 0 } },
        { key: 'w', label: 'W — Ruthless Predator', maxRank: 5 },
        { key: 'e', label: 'E — Slice and Dice', maxRank: 5 },
    ],
});
