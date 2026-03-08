/**
 * Brand — The Burning Vengeance
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Passive — Blaze: ablaze targets take 2.5% max HP over 4s (magic)
//   3 stacks → explosion: 9-13% max HP (magic)

// Q — Sear: 80/110/140/170/200 + 65% AP (magic, stun if ablaze)
const Q_BASE = [80, 110, 140, 170, 200];

// W — Pillar of Flame: 75/120/165/210/255 + 60% AP (magic, AoE)
const W_BASE = [75, 120, 165, 210, 255];

// E — Conflagration: 70/95/120/145/170 + 45% AP (magic, spread if ablaze)
const E_BASE = [70, 95, 120, 145, 170];

// R — Pyroclasm: 100/200/300 + 25% AP per bounce (magic, 5 bounces)
const R_BASE = [100, 200, 300];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive blaze (per tick over 4s)
    const blazeRaw = 0.025 * p.target.maxHP;
    const blaze = calculateMagicDamage(blazeRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Passive explosion (3 stacks)
    const explodeRaw = 0.10 * p.target.maxHP;
    const explode = calculateMagicDamage(explodeRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const qRaw = Q_BASE[qR - 1] + 0.65 * p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const wRaw = W_BASE[wR - 1] + 0.60 * p.ap;
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const eRaw = E_BASE[eR - 1] + 0.45 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const rPerBounce = R_BASE[rR - 1] + 0.25 * p.ap;
    const rBounce = calculateMagicDamage(rPerBounce, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'passive_blaze', abilityName: 'Blaze (Passif) — brûlure totale', rank: 0, damageType: 'magic', rawDamage: blaze.rawDamage, finalDamage: blaze.finalDamage },
        { abilityId: 'passive_explode', abilityName: 'Blaze (Passif) — explosion 3 stacks', rank: 0, damageType: 'magic', rawDamage: explode.rawDamage, finalDamage: explode.finalDamage },
        { abilityId: 'Q', abilityName: 'Sear (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Pillar of Flame (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Conflagration (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Pyroclasm (R) — par rebond', rank: rR, damageType: 'magic', rawDamage: rBounce.rawDamage, finalDamage: rBounce.finalDamage, hits: 5, totalFinalDamage: rBounce.finalDamage * 5 },
    ];
}

registerChampion('Brand', {
    name: 'Brand',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Sear', maxRank: 5 },
        { key: 'w', label: 'W — Pillar of Flame', maxRank: 5 },
        { key: 'e', label: 'E — Conflagration', maxRank: 5 },
        { key: 'r', label: 'R — Pyroclasm', maxRank: 3 },
    ],
});
