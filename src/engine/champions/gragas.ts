/**
 * Gragas — The Rabble Rouser
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Passive — Happy Hour: heals 6% max HP every 8s on ability use (no damage)

// Q — Barrel Roll: 80/120/160/200/240 + 70% AP (magic, detonates after delay or re-cast)
//   Fully charged: +50% damage
const Q_BASE = [80, 120, 160, 200, 240];

// W — Drunken Rage: 20/50/80/110/140 + 50% AP (magic, empowered next auto)
//   Reduces damage taken by 10/12/14/16/18% for 2.5s
const W_BASE = [20, 50, 80, 110, 140];

// E — Body Slam: 80/130/180/230/280 + 60% AP (magic, AoE)
const E_BASE = [80, 130, 180, 230, 280];

// R — Explosive Cask: 200/325/450 + 80% AP (magic, AoE knockback)
const R_BASE = [200, 325, 450];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q — normal & fully charged
    const qRaw         = Q_BASE[qR - 1] + 0.70 * p.ap;
    const qCharged     = qRaw * 1.50;
    const q            = calculateMagicDamage(qRaw,     p.target, p.magicPenPercent, p.magicPenFlat);
    const qChargedCalc = calculateMagicDamage(qCharged, p.target, p.magicPenPercent, p.magicPenFlat);

    // W — empowered auto (magic)
    const wRaw = W_BASE[wR - 1] + 0.50 * p.ap;
    const w    = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + 0.60 * p.ap;
    const e    = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R
    const rRaw = R_BASE[rR - 1] + 0.80 * p.ap;
    const r    = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q',         abilityName: 'Barrel Roll (Q)',                    rank: qR, damageType: 'magic', rawDamage: q.rawDamage,            finalDamage: q.finalDamage },
        { abilityId: 'Q_charged', abilityName: 'Barrel Roll (Q) — chargé (×1.5)',   rank: qR, damageType: 'magic', rawDamage: qChargedCalc.rawDamage, finalDamage: qChargedCalc.finalDamage },
        { abilityId: 'W',         abilityName: 'Drunken Rage (W) — auto améliorée', rank: wR, damageType: 'magic', rawDamage: w.rawDamage,            finalDamage: w.finalDamage },
        { abilityId: 'E',         abilityName: 'Body Slam (E)',                      rank: eR, damageType: 'magic', rawDamage: e.rawDamage,            finalDamage: e.finalDamage },
        { abilityId: 'R',         abilityName: 'Explosive Cask (R)',                 rank: rR, damageType: 'magic', rawDamage: r.rawDamage,            finalDamage: r.finalDamage },
    ];
}

registerChampion('Gragas', {
    name: 'Gragas',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Barrel Roll',     maxRank: 5 },
        { key: 'w', label: 'W — Drunken Rage',    maxRank: 5 },
        { key: 'e', label: 'E — Body Slam',        maxRank: 5 },
        { key: 'r', label: 'R — Explosive Cask',  maxRank: 3 },
    ],
});