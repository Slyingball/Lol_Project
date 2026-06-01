import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

const Q_BASE = [70, 115, 160, 205, 250];
const W_BASE = [60, 85, 110, 135, 160];
const E_BASE = [45, 80, 115, 150, 185];
const R_BASE = [150, 225, 300];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const q = calculateMagicDamage(
        Q_BASE[qR - 1] + 0.40 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    const w = calculateMagicDamage(
        W_BASE[wR - 1] + 0.40 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    const e = calculateMagicDamage(
        E_BASE[eR - 1] + 0.40 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    const r = calculateMagicDamage(
        R_BASE[rR - 1] + 0.75 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    return [
        { abilityId: 'Q', abilityName: 'Bramble Smash (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Twisted Advance (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Sapling Toss (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Nature\'s Grasp (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Maokai', {
    name: 'Maokai',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Bramble Smash', maxRank: 5 },
        { key: 'w', label: 'W — Twisted Advance', maxRank: 5 },
        { key: 'e', label: 'E — Sapling Toss', maxRank: 5 },
        { key: 'r', label: 'R — Nature\'s Grasp', maxRank: 3 },
    ],
});