import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Thundering Shuriken
const Q_BASE = [75, 125, 175, 225, 275];
const Q_RATIO_AP = 0.85;

// W — Electrical Surge (Active)
const W_ACTIVE_BASE = [70, 95, 120, 145, 170];
const W_ACTIVE_RATIO_AP = 0.8;

// W — Electrical Surge (Passive 5th auto)
const W_PASSIVE_BASE = [35, 45, 55, 65, 75];
const W_PASSIVE_RATIO_BONUS_AD = 0.6;
const W_PASSIVE_RATIO_AP = 0.35;

// R — Slicing Maelstrom (Per tick, max 6 ticks)
const R_BASE = [40, 75, 110];
const R_RATIO_AP = 0.225;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const rTicks = Math.max(1, Math.min(6, p.extras.rTicks ?? 6));

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W Passive (On-Hit)
    const wPassiveRaw = W_PASSIVE_BASE[wR - 1] + (p.bonusAD * W_PASSIVE_RATIO_BONUS_AD) + (p.ap * W_PASSIVE_RATIO_AP);
    const wPassive = calculateMagicDamage(wPassiveRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W Active
    const wActiveRaw = W_ACTIVE_BASE[wR - 1] + (p.ap * W_ACTIVE_RATIO_AP);
    const wActive = calculateMagicDamage(wActiveRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R
    const rRawSingle = R_BASE[rR - 1] + (p.ap * R_RATIO_AP);
    const rSingle = calculateMagicDamage(rRawSingle, p.target, p.magicPenPercent, p.magicPenFlat);
    const rTotalRaw = rRawSingle * rTicks;
    const rTotal = calculateMagicDamage(rTotalRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Thundering Shuriken (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W_passive', abilityName: 'Electrical Surge (W) — Passif 5e attaque', rank: wR, damageType: 'magic', rawDamage: wPassive.rawDamage, finalDamage: wPassive.finalDamage },
        { abilityId: 'W_active', abilityName: 'Electrical Surge (W) — Actif', rank: wR, damageType: 'magic', rawDamage: wActive.rawDamage, finalDamage: wActive.finalDamage },
        { abilityId: 'R_single', abilityName: 'Slicing Maelstrom (R) — 1 tempête', rank: rR, damageType: 'magic', rawDamage: rSingle.rawDamage, finalDamage: rSingle.finalDamage },
        { abilityId: 'R_total', abilityName: `Slicing Maelstrom (R) — Total (×${rTicks} ticks)`, rank: rR, damageType: 'magic', rawDamage: rTotal.rawDamage, finalDamage: rTotal.finalDamage, hits: rTicks, totalFinalDamage: rSingle.finalDamage * rTicks },
    ];
}

registerChampion('Kennen', {
    name: 'Kennen',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Thundering Shuriken', maxRank: 5 },
        { key: 'w', label: 'W — Electrical Surge', maxRank: 5 },
        { key: 'r', label: 'R — Slicing Maelstrom', maxRank: 3 },
        { key: 'rTicks', label: 'R — Nombre de ticks', maxRank: 1, extraParam: { label: 'Nombre de frappes (1-6)', min: 1, max: 6, default: 6 } },
    ],
});
