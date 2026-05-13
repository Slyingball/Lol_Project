/**
 * Gwen — The Hallowed Seamstress
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage, calculateTrueDamage } from '../damageCalculator';

// Passive — Thousand Cuts:
//   On-hit bonus magic: 1% max HP (+ 1% per 100 AP, max 2.5%)
//   Heals 30% of Thousand Cuts damage dealt to champions
function passiveOnHitRaw(ap: number, targetMaxHP: number): number {
    const hpPercent = Math.min(0.025, 0.01 + 0.01 * (ap / 100));
    return hpPercent * targetMaxHP;
}

// Q — Snip Snip!: 9–13 snips (scales with stacks) — per snip: 11/22/33/44/55 + 5% AP (magic)
//   Center snips: deal true damage equal to 75/80/85/90/95% of outer damage + 75/80/85/90/95% AP bonus
//   Modelled: 4 outer snips + 1 center snip (minimum realistic burst)
const Q_OUTER_BASE   = [11, 22, 33, 44, 55];
const Q_CENTER_RATIO = [0.75, 0.80, 0.85, 0.90, 0.95];
const Q_CENTER_AP    = [0.75, 0.80, 0.85, 0.90, 0.95]; // bonus AP scaling on center true dmg

// W — Hallowed Mist: no damage, shields and makes Gwen untargetable from outside

// E — Skip 'n Slash: 10/15/20/25/30 + 15% AP (magic on-hit, empowers next auto)
//   Also enhances autos for 4s (attack speed + range + on-hit)
const E_BASE = [10, 15, 20, 25, 30];

// R — Needlework:
//   First cast: 1 needle — 70/110/150 + 8% AP (magic)
//   Second cast: 3 needles
//   Third cast: 5 needles
//   Each needle applies a stack
const R_NEEDLE_BASE = [70, 110, 150];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive — on-hit magic
    const passiveRaw = passiveOnHitRaw(p.ap, p.target.maxHP);
    const passive    = calculateMagicDamage(passiveRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Q — outer snip (magic) × 4 typical
    const qOuterRaw    = Q_OUTER_BASE[qR - 1] + 0.05 * p.ap;
    const qOuter       = calculateMagicDamage(qOuterRaw, p.target, p.magicPenPercent, p.magicPenFlat);
    const qOuter4      = calculateMagicDamage(qOuterRaw * 4, p.target, p.magicPenPercent, p.magicPenFlat);

    // Q — center snip (true damage)
    const qCenterRaw   = qOuterRaw * Q_CENTER_RATIO[qR - 1] + Q_CENTER_AP[qR - 1] * p.ap;
    const qCenter      = calculateTrueDamage(qCenterRaw);

    // Q full combo (4 outer + 1 center true)
    const qFullMagic   = calculateMagicDamage(qOuterRaw * 4, p.target, p.magicPenPercent, p.magicPenFlat);

    // E — empowered auto on-hit
    const eRaw = E_BASE[eR - 1] + 0.15 * p.ap;
    const e    = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R — per needle
    const rNeedleRaw = R_NEEDLE_BASE[rR - 1] + 0.08 * p.ap;
    const rNeedle    = calculateMagicDamage(rNeedleRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R — full sequence (1 + 3 + 5 = 9 needles)
    const rFullRaw = rNeedleRaw * 9;
    const rFull    = calculateMagicDamage(rFullRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'passive',      abilityName: `Thousand Cuts (Passif) — on-hit (${Math.round(Math.min(2.5, 1 + p.ap / 100) * 10) / 10}% PV max)`, rank: 0,  damageType: 'magic', rawDamage: passive.rawDamage,   finalDamage: passive.finalDamage },
        { abilityId: 'Q_outer',      abilityName: 'Snip Snip! (Q) — par ciseau (ext.)',  rank: qR, damageType: 'magic', rawDamage: qOuter.rawDamage,    finalDamage: qOuter.finalDamage },
        { abilityId: 'Q_outer_4',    abilityName: 'Snip Snip! (Q) — ×4 ciseaux ext.',   rank: qR, damageType: 'magic', rawDamage: qOuter4.rawDamage,   finalDamage: qOuter4.finalDamage },
        { abilityId: 'Q_center',     abilityName: 'Snip Snip! (Q) — ciseau central (vrai dégât)', rank: qR, damageType: 'true', rawDamage: qCenter.rawDamage,  finalDamage: qCenter.finalDamage },
        { abilityId: 'E',            abilityName: 'Skip \'n Slash (E) — auto améliorée', rank: eR, damageType: 'magic', rawDamage: e.rawDamage,         finalDamage: e.finalDamage },
        { abilityId: 'R_needle',     abilityName: 'Needlework (R) — par aiguille',       rank: rR, damageType: 'magic', rawDamage: rNeedle.rawDamage,   finalDamage: rNeedle.finalDamage },
        { abilityId: 'R_full',       abilityName: 'Needlework (R) — séquence complète (9 aiguilles)', rank: rR, damageType: 'magic', rawDamage: rFull.rawDamage, finalDamage: rFull.finalDamage },
    ];
}

registerChampion('Gwen', {
    name: 'Gwen',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Snip Snip!',       maxRank: 5 },
        { key: 'e', label: 'E — Skip \'n Slash',   maxRank: 5 },
        { key: 'r', label: 'R — Needlework',        maxRank: 3 },
    ],
});