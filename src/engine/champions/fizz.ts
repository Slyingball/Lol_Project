/**
 * Fizz — The Tidal Trickster
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage, calculatePhysicalDamage, calculateTrueDamage } from '../damageCalculator';

// Passive — Nimble Fighter: no unit collision + reduces auto-attack damage taken (no damage dealt)

// Q — Urchin Strike: 10/40/70/100/130 + 60% AP + applies on-hit (magic + physical)
const Q_BASE = [10, 40, 70, 100, 130];

// W — Seastone Trident:
//   Active: 20/35/50/65/80 + 45% AP per hit, 3 hits (magic)
//   Passive on-hit: 4/5/6/7/8% missing HP bonus magic damage
const W_ACTIVE_BASE = [20, 35, 50, 65, 80];

// E — Playful / Trickster:
//   Playful (E1): 70/120/170/220/270 + 75% AP (magic, AoE)
//   Trickster (E2): 70/120/170/220/270 + 75% AP (magic, AoE)
const E_BASE = [70, 120, 170, 220, 270];

// R — Chum the Waters:
//   Small fish:    200/325/450  + 100% AP (magic)
//   Medium fish:   200/325/450  + 100% AP × 1.40 (magic)
//   Large fish:    200/325/450  + 100% AP × 1.80 (magic)
const R_BASE = [200, 325, 450];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q — magic component (on-hit is physical but minor; model as magic for simplicity)
    const qRaw = Q_BASE[qR - 1] + 0.60 * p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W active — per hit (magic)
    const wPerHitRaw = W_ACTIVE_BASE[wR - 1] + 0.45 * p.ap;
    const wPerHit = calculateMagicDamage(wPerHitRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W passive — missing HP %
    const wMissingHPPercent = [4, 5, 6, 7, 8][wR - 1];
    const wMissingHPRaw = (wMissingHPPercent / 100) * (p.target.maxHP - p.target.currentHP);
    const wMissingHP = calculateMagicDamage(wMissingHPRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E — Playful / Trickster (same base damage)
    const eRaw = E_BASE[eR - 1] + 0.75 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R — small / medium / large fish
    const rSmallRaw   = R_BASE[rR - 1] + 1.00 * p.ap;
    const rMediumRaw  = R_BASE[rR - 1] + 1.40 * p.ap;
    const rLargeRaw   = R_BASE[rR - 1] + 1.80 * p.ap;
    const rSmall  = calculateMagicDamage(rSmallRaw,  p.target, p.magicPenPercent, p.magicPenFlat);
    const rMedium = calculateMagicDamage(rMediumRaw, p.target, p.magicPenPercent, p.magicPenFlat);
    const rLarge  = calculateMagicDamage(rLargeRaw,  p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q',          abilityName: 'Urchin Strike (Q)',                     rank: qR, damageType: 'magic',    rawDamage: q.rawDamage,        finalDamage: q.finalDamage },
        { abilityId: 'W_active',   abilityName: 'Seastone Trident (W) — par coup',        rank: wR, damageType: 'magic',    rawDamage: wPerHit.rawDamage,  finalDamage: wPerHit.finalDamage, hits: 3, totalFinalDamage: wPerHit.finalDamage * 3 },
        { abilityId: 'W_passive',  abilityName: `Seastone Trident (W passif) — ${wMissingHPPercent}% HP manq.`, rank: wR, damageType: 'magic', rawDamage: wMissingHP.rawDamage, finalDamage: wMissingHP.finalDamage },
        { abilityId: 'E',          abilityName: 'Playful / Trickster (E)',                rank: eR, damageType: 'magic',    rawDamage: e.rawDamage,        finalDamage: e.finalDamage },
        { abilityId: 'R_small',    abilityName: 'Chum the Waters (R) — petit poisson',    rank: rR, damageType: 'magic',    rawDamage: rSmall.rawDamage,   finalDamage: rSmall.finalDamage },
        { abilityId: 'R_medium',   abilityName: 'Chum the Waters (R) — moyen poisson',    rank: rR, damageType: 'magic',    rawDamage: rMedium.rawDamage,  finalDamage: rMedium.finalDamage },
        { abilityId: 'R_large',    abilityName: 'Chum the Waters (R) — grand poisson',    rank: rR, damageType: 'magic',    rawDamage: rLarge.rawDamage,   finalDamage: rLarge.finalDamage },
    ];
}

registerChampion('Fizz', {
    name: 'Fizz',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Urchin Strike',      maxRank: 5 },
        { key: 'w', label: 'W — Seastone Trident',   maxRank: 5 },
        { key: 'e', label: 'E — Playful / Trickster', maxRank: 5 },
        { key: 'r', label: 'R — Chum the Waters',    maxRank: 3 },
    ],
});