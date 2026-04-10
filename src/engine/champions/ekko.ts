import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

const Q_BASE = [100, 140, 180, 220, 260]; // combined out and return
const E_BASE = [50, 75, 100, 125, 150];
const R_BASE = [150, 300, 450];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const qRaw = Q_BASE[qR - 1] + 0.90 * p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const eRaw = E_BASE[eR - 1] + 0.40 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const rRaw = R_BASE[rR - 1] + 1.75 * p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Timewinder (Q) - full', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Parallel Convergence (W) - passive exec', rank: wR, damageType: 'magic', rawDamage: 0, finalDamage: 0 },
        { abilityId: 'E', abilityName: 'Phase Dive (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Chronobreak (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Ekko', {
    name: 'Ekko',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Timewinder', maxRank: 5 },
        { key: 'w', label: 'W — Parallel Convergence', maxRank: 5 },
        { key: 'e', label: 'E — Phase Dive', maxRank: 5 },
        { key: 'r', label: 'R — Chronobreak', maxRank: 3 },
    ],
});
