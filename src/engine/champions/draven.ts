import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

const Q_BASE = [40, 45, 50, 55, 60];
const Q_RATIO = [0.75, 0.85, 0.95, 1.05, 1.15];
const E_BASE = [75, 110, 145, 180, 215];
const R_BASE = [175, 275, 375];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1)); // W is just AS/MS
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const qRaw = Q_BASE[qR - 1] + Q_RATIO[qR - 1] * p.bonusAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const eRaw = E_BASE[eR - 1] + 0.50 * p.bonusAD;
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const rRaw = R_BASE[rR - 1] + 1.10 * p.bonusAD;
    const r = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Spinning Axe (Q) - bonus', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Blood Rush (W) - buff only', rank: wR, damageType: 'physical', rawDamage: 0, finalDamage: 0 },
        { abilityId: 'E', abilityName: 'Stand Aside (E)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Whirling Death (R)', rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Draven', {
    name: 'Draven',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Spinning Axe', maxRank: 5 },
        { key: 'w', label: 'W — Blood Rush', maxRank: 5 },
        { key: 'e', label: 'E — Stand Aside', maxRank: 5 },
        { key: 'r', label: 'R — Whirling Death', maxRank: 3 },
    ],
});
