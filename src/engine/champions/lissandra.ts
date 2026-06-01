import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Ice Shard
const Q_BASE = [80, 110, 140, 170, 200];
const Q_RATIO_AP = 0.85;

// W — Ring of Frost
const W_BASE = [70, 105, 140, 175, 210];
const W_RATIO_AP = 0.7;

// E — Glacial Path
const E_BASE = [70, 115, 160, 205, 250];
const E_RATIO_AP = 0.6;

// R — Frozen Tomb
const R_BASE = [150, 250, 350];
const R_RATIO_AP = 0.75;

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
        { abilityId: 'Q', abilityName: 'Ice Shard (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Ring of Frost (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Glacial Path (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Frozen Tomb (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Lissandra', {
    name: 'Lissandra',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Ice Shard', maxRank: 5 },
        { key: 'w', label: 'W — Ring of Frost', maxRank: 5 },
        { key: 'e', label: 'E — Glacial Path', maxRank: 5 },
        { key: 'r', label: 'R — Frozen Tomb', maxRank: 3 },
    ],
});
