/**
 * Cassiopeia — The Serpent's Embrace
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Noxious Blast: 75/110/145/180/215 + 90% AP (magic, poison 3s)
const Q_BASE = [75, 110, 145, 180, 215];

// W — Miasma: 20/25/30/35/40 per second + 15% AP (magic, grounding, 5s)
const W_BASE = [20, 25, 30, 35, 40];

// E — Twin Fang: 52/60/68/76/84 + 10% AP (magic, 0.75s CD on poisoned targets)
const E_BASE = [52, 60, 68, 76, 84];

// R — Petrifying Gaze: 150/250/350 + 50% AP (magic, stun if facing)
const R_BASE = [150, 250, 350];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const qRaw = Q_BASE[qR - 1] + 0.90 * p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W total (5 seconds)
    const wTotalRaw = (W_BASE[wR - 1] + 0.15 * p.ap) * 5;
    const w = calculateMagicDamage(wTotalRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E single cast
    const eRaw = E_BASE[eR - 1] + 0.10 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E DPS (≈4 casts in 3s poison window)
    const eDps = calculateMagicDamage(eRaw * 4, p.target, p.magicPenPercent, p.magicPenFlat);

    const rRaw = R_BASE[rR - 1] + 0.50 * p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Noxious Blast (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Miasma (W) — total 5s', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Twin Fang (E) — single', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'E_burst', abilityName: 'Twin Fang (E) — ×4 burst', rank: eR, damageType: 'magic', rawDamage: eDps.rawDamage, finalDamage: eDps.finalDamage },
        { abilityId: 'R', abilityName: 'Petrifying Gaze (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Cassiopeia', {
    name: 'Cassiopeia',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Noxious Blast', maxRank: 5 },
        { key: 'w', label: 'W — Miasma', maxRank: 5 },
        { key: 'e', label: 'E — Twin Fang', maxRank: 5 },
        { key: 'r', label: 'R — Petrifying Gaze', maxRank: 3 },
    ],
});
