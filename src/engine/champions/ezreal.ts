import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage, calculatePhysicalDamage } from '../damageCalculator';

const Q_BASE = [20, 45, 70, 95, 120];
const W_BASE = [80, 135, 190, 245, 300];
const E_BASE = [80, 130, 180, 230, 280];
const R_BASE = [350, 500, 650];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const qRaw = Q_BASE[qR - 1] + 1.30 * p.totalAD + 0.15 * p.ap;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const wApRatio = [0.70, 0.75, 0.80, 0.85, 0.90][wR - 1];
    const wRaw = W_BASE[wR - 1] + 0.60 * p.bonusAD + wApRatio * p.ap;
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const eRaw = E_BASE[eR - 1] + 0.50 * p.bonusAD + 0.75 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const rRaw = R_BASE[rR - 1] + 1.00 * p.bonusAD + 0.90 * p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Mystic Shot (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Essence Flux (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Arcane Shift (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Trueshot Barrage (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Ezreal', {
    name: 'Ezreal',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Mystic Shot', maxRank: 5 },
        { key: 'w', label: 'W — Essence Flux', maxRank: 5 },
        { key: 'e', label: 'E — Arcane Shift', maxRank: 5 },
        { key: 'r', label: 'R — Trueshot Barrage', maxRank: 3 },
    ],
});
