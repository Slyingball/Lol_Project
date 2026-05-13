/**
 * Jhin — The Virtuoso
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Passive — Whisper:
//   4th shot: deals +15/20/25% of target's MISSING HP bonus physical damage
//   Jhin's crit: deals 150% + 15% crit damage (no on-hit healing, reduced crit)
//   Jhin converts excess attack speed into bonus AD
//   AD formula: base AD × (0.4 + 0.4 × (crit chance) + 0.25 × (bonus AS ratio))
//   Simplified: model crit damage multiplier at 0% and 100% crit
function passive4thShotMissingHPRaw(missingHPPercent: number, targetMissingHP: number, rank: number): number {
    const ratio = [0.15, 0.20, 0.25][rank - 1];
    return ratio * targetMissingHP;
}

// Q — Dancing Grenade: 50/75/100/125/150 + 35% bonus AD + 40% AP (physical)
//   Bounces up to 4 times, each kill increases damage by 35% (stacks multiplicatively)
const Q_BASE = [50, 75, 100, 125, 150];

// W — Deadly Flourish: 50/85/120/155/190 + 50% bonus AD (physical)
//   Roots targets that were hit by a trap or ally
const W_BASE = [50, 85, 120, 155, 190];

// E — Captive Audience: trap + mark; no direct damage from E itself
//   Lotus trap triggers: 20/80/140/200/260 + 160% bonus AD (physical, detonation)
const E_BASE = [20, 80, 140, 200, 260];

// R — Curtain Call (4 shots):
//   Per shot: 50/125/200 + 25% bonus AD + 15% target's CURRENT HP (physical)
//   Fully charged 4th shot: ×2.0 damage
const R_BASE = [50, 125, 200];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const missingHP = p.target.maxHP - p.target.currentHP;

    // Passive — 4th shot missing HP bonus (rR used for the scaling tier)
    const pass4thHP  = passive4thShotMissingHPRaw(0, missingHP, rR);
    const pass4thAuto = calculatePhysicalDamage(p.totalAD + pass4thHP, p.target, p.armorPenPercent, p.armorPenFlat);

    // Passive — 4th shot crit (×1.5 + 15%)
    const pass4thCritRaw = (p.totalAD + pass4thHP) * 1.65;
    const pass4thCrit    = calculatePhysicalDamage(pass4thCritRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q — first bounce (no kill bonus)
    const qRaw   = Q_BASE[qR - 1] + 0.35 * p.bonusAD;
    const q1     = calculatePhysicalDamage(qRaw,          p.target, p.armorPenPercent, p.armorPenFlat);
    // Q — 4 bounces with 3 kills (×1.35^3 ≈ ×2.46)
    const q4Kill = calculatePhysicalDamage(qRaw * Math.pow(1.35, 3), p.target, p.armorPenPercent, p.armorPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + 0.50 * p.bonusAD;
    const w    = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E — lotus trap detonation
    const eRaw = E_BASE[eR - 1] + 1.60 * p.bonusAD;
    const e    = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R — per shot (normal)
    const rShotRaw  = R_BASE[rR - 1] + 0.25 * p.bonusAD + 0.15 * p.target.currentHP;
    const rShot     = calculatePhysicalDamage(rShotRaw,       p.target, p.armorPenPercent, p.armorPenFlat);
    // R — 4th shot (charged, ×2.0)
    const rShot4Raw = rShotRaw * 2.0;
    const rShot4    = calculatePhysicalDamage(rShot4Raw,      p.target, p.armorPenPercent, p.armorPenFlat);
    // R — full sequence (3 normal + 1 charged)
    const rFull     = calculatePhysicalDamage(rShotRaw * 3 + rShot4Raw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'passive_4th',      abilityName: `4e tir (Passif) — auto + ${Math.round([15,20,25][rR-1])}% HP manq.`, rank: rR, damageType: 'physical', rawDamage: pass4thAuto.rawDamage, finalDamage: pass4thAuto.finalDamage },
        { abilityId: 'passive_4th_crit', abilityName: '4e tir (Passif) — critique (×1.65)',                                  rank: rR, damageType: 'physical', rawDamage: pass4thCrit.rawDamage, finalDamage: pass4thCrit.finalDamage },
        { abilityId: 'Q1',               abilityName: 'Dancing Grenade (Q) — 1er rebond',                                    rank: qR, damageType: 'physical', rawDamage: q1.rawDamage,           finalDamage: q1.finalDamage },
        { abilityId: 'Q4_kill',          abilityName: 'Dancing Grenade (Q) — 4e rebond (3 kills, ×2.46)',                    rank: qR, damageType: 'physical', rawDamage: q4Kill.rawDamage,       finalDamage: q4Kill.finalDamage },
        { abilityId: 'W',                abilityName: 'Deadly Flourish (W)',                                                  rank: wR, damageType: 'physical', rawDamage: w.rawDamage,            finalDamage: w.finalDamage },
        { abilityId: 'E',                abilityName: 'Captive Audience (E) — détonation piège',                             rank: eR, damageType: 'physical', rawDamage: e.rawDamage,            finalDamage: e.finalDamage },
        { abilityId: 'R_shot',           abilityName: 'Curtain Call (R) — par tir (15% PV actuels)',                         rank: rR, damageType: 'physical', rawDamage: rShot.rawDamage,        finalDamage: rShot.finalDamage },
        { abilityId: 'R_shot4',          abilityName: 'Curtain Call (R) — 4e tir chargé (×2.0)',                             rank: rR, damageType: 'physical', rawDamage: rShot4.rawDamage,       finalDamage: rShot4.finalDamage },
        { abilityId: 'R_full',           abilityName: 'Curtain Call (R) — séquence complète (3+1)',                          rank: rR, damageType: 'physical', rawDamage: rFull.rawDamage,        finalDamage: rFull.finalDamage },
    ];
}

registerChampion('Jhin', {
    name: 'Jhin',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Dancing Grenade',    maxRank: 5 },
        { key: 'w', label: 'W — Deadly Flourish',    maxRank: 5 },
        { key: 'e', label: 'E — Captive Audience',   maxRank: 5 },
        { key: 'r', label: 'R — Curtain Call',       maxRank: 3 },
    ],
});