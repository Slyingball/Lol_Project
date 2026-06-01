import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Shatterstrike
const Q_BASE = [70, 110, 150, 190, 230];
const Q_RATIO_AP = 0.6;

// W — Ferromancy (Crash Down / Mount Up)
const W_BASE = [60, 100, 140, 180, 220];
const W_RATIO_AP = 0.6;

// E — Full Tilt
const E_BASE = [25, 35, 45, 55, 65];
const E_RATIO_AP = 0.3;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + (p.ap * W_RATIO_AP);
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + (p.ap * E_RATIO_AP);
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Shatterstrike (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Ferromancy (W) — Crash Down/Mount Up', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Full Tilt (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
    ];
}

registerChampion('Rell', {
    name: 'Rell',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Shatterstrike', maxRank: 5 },
        { key: 'w', label: 'W — Ferromancy', maxRank: 5 },
        { key: 'e', label: 'E — Full Tilt', maxRank: 5 },
    ],
});
