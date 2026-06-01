import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Gleaming Quill
const Q_BASE = [70, 115, 160, 205, 250];
const Q_RATIO_AP = 0.7;

// W — Grand Entrance
const W_BASE = [70, 125, 180, 235, 290];
const W_RATIO_AP = 0.8;

// R — The Quickness
const R_BASE = [100, 200, 300];
const R_RATIO_AP = 0.5;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + (p.ap * W_RATIO_AP);
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R
    const rRaw = R_BASE[rR - 1] + (p.ap * R_RATIO_AP);
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Gleaming Quill (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Grand Entrance (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'R', abilityName: 'The Quickness (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Rakan', {
    name: 'Rakan',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Gleaming Quill', maxRank: 5 },
        { key: 'w', label: 'W — Grand Entrance', maxRank: 5 },
        { key: 'r', label: 'R — The Quickness', maxRank: 3 },
    ],
});
