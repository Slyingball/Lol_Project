import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Q — Piercing Light
const Q_BASE = [95, 125, 155, 185, 215];
const Q_RATIO_BONUS_AD = [0.6, 0.75, 0.9, 1.05, 1.2];

// W — Ardent Blaze
const W_BASE = [75, 110, 145, 180, 215];
const W_RATIO_AP = 0.9;

// R — The Culling
const R_BASE = [15, 30, 45];
const R_RATIO_TOTAL_AD = 0.25;
const R_RATIO_AP = 0.15;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const rShots = Math.max(22, Math.min(34, p.extras.rShots ?? 28));

    // Passive (Lightslinger second auto-shot damage multiplier: 50% to 100% based on level)
    const passiveMultiplier = 0.5 + 0.5 * (p.level - 1) / 17;
    const passiveRaw = p.totalAD * passiveMultiplier;
    const passive = calculatePhysicalDamage(passiveRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.bonusAD * Q_RATIO_BONUS_AD[qR - 1]);
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + (p.ap * W_RATIO_AP);
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R
    const rSingleRaw = R_BASE[rR - 1] + (p.totalAD * R_RATIO_TOTAL_AD) + (p.ap * R_RATIO_AP);
    const rSingle = calculatePhysicalDamage(rSingleRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const rTotalRaw = rSingleRaw * rShots;
    const rTotal = calculatePhysicalDamage(rTotalRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Passive', abilityName: `Lightslinger (Passif) — 2e tir (${Math.round(passiveMultiplier * 100)}% AD)`, rank: 1, damageType: 'physical', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q', abilityName: 'Piercing Light (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Ardent Blaze (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'R_single', abilityName: 'The Culling (R) — par projectile', rank: rR, damageType: 'physical', rawDamage: rSingle.rawDamage, finalDamage: rSingle.finalDamage },
        { abilityId: 'R_total', abilityName: `The Culling (R) — Total (${rShots} tirs)`, rank: rR, damageType: 'physical', rawDamage: rTotal.rawDamage, finalDamage: rTotal.finalDamage, hits: rShots, totalFinalDamage: rSingle.finalDamage * rShots },
    ];
}

registerChampion('Lucian', {
    name: 'Lucian',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Piercing Light', maxRank: 5 },
        { key: 'w', label: 'W — Ardent Blaze', maxRank: 5 },
        { key: 'r', label: 'R — The Culling', maxRank: 3 },
        { key: 'rShots', label: 'R — Nombre de tirs', maxRank: 1, extraParam: { label: 'Tirs (22-34)', min: 22, max: 34, default: 28 } },
    ],
});
