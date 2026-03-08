/**
 * Aurelion Sol — The Star Forger (reworked)
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Passive — Cosmic Creator: abilities grant Stardust, empowering them

// Q — Breath of Light: 15/25/35/45/55 + 30% AP per second (magic, channel)
const Q_BASE = [15, 25, 35, 45, 55];

// W — Astral Flight: long-range dash (no damage, resets Q)

// E — Singularity: 40/50/60/70/80 + 40% AP (magic, AoE)
//   Detonation: 80/100/120/140/160 + 60% AP
const E_BASE = [40, 50, 60, 70, 80];
const E_DET_BASE = [80, 100, 120, 140, 160];

// R — Falling Star / The Skies Descend:
//   Falling Star: 150/250/350 + 65% AP (magic)
//   Skies Descend (75 stardust): 187.5/312.5/437.5 + 81.25% AP + knockup
const R_BASE = [150, 250, 350];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q per second
    const qPerSecRaw = Q_BASE[qR - 1] + 0.30 * p.ap;
    const qPerSec = calculateMagicDamage(qPerSecRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E impact
    const eRaw = E_BASE[eR - 1] + 0.40 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E detonation
    const eDetRaw = E_DET_BASE[eR - 1] + 0.60 * p.ap;
    const eDet = calculateMagicDamage(eDetRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R — Falling Star
    const rRaw = R_BASE[rR - 1] + 0.65 * p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R — The Skies Descend (upgraded, ×1.25)
    const rUpRaw = rRaw * 1.25;
    const rUp = calculateMagicDamage(rUpRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Breath of Light (Q) — par seconde', rank: qR, damageType: 'magic', rawDamage: qPerSec.rawDamage, finalDamage: qPerSec.finalDamage },
        { abilityId: 'E', abilityName: 'Singularity (E) — impact', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'E_det', abilityName: 'Singularity (E) — détonation', rank: eR, damageType: 'magic', rawDamage: eDet.rawDamage, finalDamage: eDet.finalDamage },
        { abilityId: 'R', abilityName: 'Falling Star (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
        { abilityId: 'R_up', abilityName: 'The Skies Descend (R) — upgrade', rank: rR, damageType: 'magic', rawDamage: rUp.rawDamage, finalDamage: rUp.finalDamage },
    ];
}

registerChampion('AurelionSol', {
    name: 'Aurelion Sol',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Breath of Light', maxRank: 5 },
        { key: 'e', label: 'E — Singularity', maxRank: 5 },
        { key: 'r', label: 'R — Falling Star', maxRank: 3 },
    ],
});
