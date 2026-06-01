import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

const Q_BASE = [60, 100, 140, 180, 220];
const W_BASE = [70, 115, 160, 205, 250];
const E_BASE = [60, 90, 120, 150, 180];
const R_BASE = [200, 275, 350];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const q = calculateMagicDamage(Q_BASE[qR - 1] + 0.60 * p.ap, p.target, p.magicPenPercent, p.magicPenFlat);
    const w = calculateMagicDamage(W_BASE[wR - 1] + 0.70 * p.ap, p.target, p.magicPenPercent, p.magicPenFlat);
    const e = calculateMagicDamage(E_BASE[eR - 1] + 0.30 * p.ap, p.target, p.magicPenPercent, p.magicPenFlat);
    const r = calculateMagicDamage(R_BASE[rR - 1] + 0.90 * p.ap, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Command: Attack (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Command: Dissonance (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Command: Protect (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Command: Shockwave (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Orianna', {
    name: 'Orianna',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Command: Attack', maxRank: 5 },
        { key: 'w', label: 'W — Command: Dissonance', maxRank: 5 },
        { key: 'e', label: 'E — Command: Protect', maxRank: 5 },
        { key: 'r', label: 'R — Command: Shockwave', maxRank: 3 },
    ],
});