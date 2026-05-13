/**
 * Janna — The Storm's Fury
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Janna is primarily a support. Her damage is low but relevant in some builds.

// Passive — Tailwind: nearby allies gain 8% movement speed (no damage)

// Q — Howling Gale: 60/85/110/135/160 + 35% AP (magic, AoE knockup)
//   Fully charged: ×1.5 damage
const Q_BASE = [60, 85, 110, 135, 160];

// W — Zephyr: 55/80/105/130/155 + 50% AP (magic, single target slow)
//   Passive: Janna gains bonus MS equal to her bonus MS (irrelevant for damage)
const W_BASE = [55, 80, 105, 130, 155];

// E — Eye of the Storm: shield only, no damage

// R — Monsoon: 100/150/200 + 50% AP (magic, AoE knockback on cast)
//   Healing channel: 100/150/200 + 25% AP per second for 3s (no damage)
const R_BASE = [100, 150, 200];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q — normal & fully charged
    const qRaw        = Q_BASE[qR - 1] + 0.35 * p.ap;
    const qCharged    = qRaw * 1.50;
    const q           = calculateMagicDamage(qRaw,     p.target, p.magicPenPercent, p.magicPenFlat);
    const qChargedCal = calculateMagicDamage(qCharged, p.target, p.magicPenPercent, p.magicPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + 0.50 * p.ap;
    const w    = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R — knockback burst (cast damage only)
    const rRaw = R_BASE[rR - 1] + 0.50 * p.ap;
    const r    = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q',         abilityName: 'Howling Gale (Q) — non chargé',      rank: qR, damageType: 'magic', rawDamage: q.rawDamage,          finalDamage: q.finalDamage },
        { abilityId: 'Q_charged', abilityName: 'Howling Gale (Q) — chargé (×1.5)',   rank: qR, damageType: 'magic', rawDamage: qChargedCal.rawDamage, finalDamage: qChargedCal.finalDamage },
        { abilityId: 'W',         abilityName: 'Zephyr (W)',                           rank: wR, damageType: 'magic', rawDamage: w.rawDamage,           finalDamage: w.finalDamage },
        { abilityId: 'R',         abilityName: 'Monsoon (R) — impact knockback',       rank: rR, damageType: 'magic', rawDamage: r.rawDamage,           finalDamage: r.finalDamage },
    ];
}

registerChampion('Janna', {
    name: 'Janna',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Howling Gale',  maxRank: 5 },
        { key: 'w', label: 'W — Zephyr',        maxRank: 5 },
        { key: 'r', label: 'R — Monsoon',       maxRank: 3 },
    ],
});