import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Powerball
const Q_BASE = [80, 110, 140, 170, 200];
const Q_RATIO_AP = 1.0;

// W — Defensive Ball Curl (On-hit to attackers, scales with total armor)
const W_BASE = [15, 23, 31, 39, 47];
const W_RATIO_ARMOR = 0.1;

// R — Soaring Slam (Per second)
const R_BASE = [100, 175, 250];
const R_RATIO_AP = 0.6;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + (p.armor * W_RATIO_ARMOR);
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R
    const rRawSingle = R_BASE[rR - 1] + (p.ap * R_RATIO_AP);
    const rSingle = calculateMagicDamage(rRawSingle, p.target, p.magicPenPercent, p.magicPenFlat);
    const rTotalRaw = rRawSingle * 4; // Model standard 4 seconds slam duration
    const rTotal = calculateMagicDamage(rTotalRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Powerball (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Defensive Ball Curl (W) — épines (sur auto reçue)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'R_single', abilityName: 'Soaring Slam (R) — par seconde', rank: rR, damageType: 'magic', rawDamage: rSingle.rawDamage, finalDamage: rSingle.finalDamage },
        { abilityId: 'R_total', abilityName: 'Soaring Slam (R) — durée totale (4 sec)', rank: rR, damageType: 'magic', rawDamage: rTotal.rawDamage, finalDamage: rTotal.finalDamage, hits: 4, totalFinalDamage: rSingle.finalDamage * 4 },
    ];
}

registerChampion('Rammus', {
    name: 'Rammus',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Powerball', maxRank: 5 },
        { key: 'w', label: 'W — Defensive Ball Curl', maxRank: 5 },
        { key: 'r', label: 'R — Soaring Slam', maxRank: 3 },
    ],
});
