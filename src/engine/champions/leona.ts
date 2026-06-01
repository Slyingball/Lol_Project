import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Shield of Daybreak
const Q_BASE = [10, 35, 60, 85, 110];
const Q_RATIO_AP = 0.3;

// W — Eclipse
const W_BASE = [60, 100, 140, 180, 220];
const W_RATIO_AP = 0.4;

// E — Zenith Blade
const E_BASE = [50, 90, 130, 170, 210];
const E_RATIO_AP = 0.4;

// R — Solar Flare
const R_BASE = [100, 175, 250];
const R_RATIO_AP = 0.8;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + (p.ap * W_RATIO_AP);
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + (p.ap * E_RATIO_AP);
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R
    const rRaw = R_BASE[rR - 1] + (p.ap * R_RATIO_AP);
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Shield of Daybreak (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Eclipse (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Zenith Blade (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Solar Flare (R) — dégâts d\'impact', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Leona', {
    name: 'Leona',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Shield of Daybreak', maxRank: 5 },
        { key: 'w', label: 'W — Eclipse', maxRank: 5 },
        { key: 'e', label: 'E — Zenith Blade', maxRank: 5 },
        { key: 'r', label: 'R — Solar Flare', maxRank: 3 },
    ],
});
