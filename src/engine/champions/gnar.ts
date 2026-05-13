/**
 * Gnar — The Missing Link
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// ─── MINI GNAR ────────────────────────────────────────────────────────────────

// Passive — Rage Gene: auto-attacks generate Rage; no direct damage scaling

// Q (mini) — Boomerang Throw: 5/45/85/125/165 + 115% total AD (physical, returns for 50%)
const Q_MINI_BASE    = [5,  45, 85, 125, 165];
const Q_MINI_RETURN  = 0.5; // 50% of outgoing damage on return

// W (mini) — Hyper: passive — every 3rd auto deals 10/20/30/40/50 + 5/6/7/8/9% max HP bonus physical
const W_MINI_BASE       = [10, 20, 30, 40, 50];
const W_MINI_HP_PERCENT = [0.05, 0.06, 0.07, 0.08, 0.09];

// E (mini) — Hop: 20/35/50/65/80 + 20% AP + 6% bonus AD (magic) on landing
const E_MINI_BASE = [20, 35, 50, 65, 80];

// ─── MEGA GNAR ────────────────────────────────────────────────────────────────

// Q (mega) — Boulder Toss: 5/45/85/125/165 + 120% total AD (physical, returns for 40%)
const Q_MEGA_BASE   = [5,  45, 85, 125, 165];
const Q_MEGA_RETURN = 0.4;

// W (mega) — Wallop: 25/50/75/100/125 + 120% total AD (physical, AoE)
const W_MEGA_BASE = [25, 50, 75, 100, 125];

// E (mega) — Crunch: 25/45/65/85/105 + 50% total AD (physical, AoE on landing)
const E_MEGA_BASE = [25, 45, 65, 85, 105];

// R — GNAR!: 200/300/400 + 200% AP (magic, AoE, extra vs stunned/walls)
const R_BASE = [200, 300, 400];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // ── Mini Q (outgoing + return)
    const qMiniRaw    = Q_MINI_BASE[qR - 1] + 1.15 * p.totalAD;
    const qMiniOut    = calculatePhysicalDamage(qMiniRaw,                 p.target, p.armorPenPercent, p.armorPenFlat);
    const qMiniReturn = calculatePhysicalDamage(qMiniRaw * Q_MINI_RETURN, p.target, p.armorPenPercent, p.armorPenFlat);

    // ── Mini W (3rd auto, max HP %)
    const wMiniBaseRaw  = W_MINI_BASE[wR - 1];
    const wMiniHPRaw    = W_MINI_HP_PERCENT[wR - 1] * p.target.maxHP;
    const wMiniRaw      = wMiniBaseRaw + wMiniHPRaw;
    const wMini         = calculatePhysicalDamage(wMiniRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // ── Mini E (magic on landing)
    const eMiniRaw = E_MINI_BASE[eR - 1] + 0.20 * p.ap + 0.06 * p.bonusAD;
    const eMini    = calculateMagicDamage(eMiniRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // ── Mega Q (outgoing + return)
    const qMegaRaw    = Q_MEGA_BASE[qR - 1] + 1.20 * p.totalAD;
    const qMegaOut    = calculatePhysicalDamage(qMegaRaw,                 p.target, p.armorPenPercent, p.armorPenFlat);
    const qMegaReturn = calculatePhysicalDamage(qMegaRaw * Q_MEGA_RETURN, p.target, p.armorPenPercent, p.armorPenFlat);

    // ── Mega W
    const wMegaRaw = W_MEGA_BASE[wR - 1] + 1.20 * p.totalAD;
    const wMega    = calculatePhysicalDamage(wMegaRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // ── Mega E
    const eMegaRaw = E_MEGA_BASE[eR - 1] + 0.50 * p.totalAD;
    const eMega    = calculatePhysicalDamage(eMegaRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // ── R — GNAR! (magic)
    const rRaw = R_BASE[rR - 1] + 2.00 * p.ap;
    const r    = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        // Mini Gnar
        { abilityId: 'Q_mini_out',    abilityName: 'Boomerang Throw (Q mini) — aller',     rank: qR, damageType: 'physical', rawDamage: qMiniOut.rawDamage,    finalDamage: qMiniOut.finalDamage },
        { abilityId: 'Q_mini_return', abilityName: 'Boomerang Throw (Q mini) — retour',    rank: qR, damageType: 'physical', rawDamage: qMiniReturn.rawDamage, finalDamage: qMiniReturn.finalDamage },
        { abilityId: 'W_mini',        abilityName: `Hyper (W mini) — 3e auto (${Math.round(W_MINI_HP_PERCENT[wR - 1] * 100)}% PV max)`, rank: wR, damageType: 'physical', rawDamage: wMini.rawDamage, finalDamage: wMini.finalDamage },
        { abilityId: 'E_mini',        abilityName: 'Hop (E mini) — atterrissage',           rank: eR, damageType: 'magic',    rawDamage: eMini.rawDamage,       finalDamage: eMini.finalDamage },
        // Mega Gnar
        { abilityId: 'Q_mega_out',    abilityName: 'Boulder Toss (Q mega) — aller',         rank: qR, damageType: 'physical', rawDamage: qMegaOut.rawDamage,    finalDamage: qMegaOut.finalDamage },
        { abilityId: 'Q_mega_return', abilityName: 'Boulder Toss (Q mega) — retour',        rank: qR, damageType: 'physical', rawDamage: qMegaReturn.rawDamage, finalDamage: qMegaReturn.finalDamage },
        { abilityId: 'W_mega',        abilityName: 'Wallop (W mega)',                        rank: wR, damageType: 'physical', rawDamage: wMega.rawDamage,       finalDamage: wMega.finalDamage },
        { abilityId: 'E_mega',        abilityName: 'Crunch (E mega)',                        rank: eR, damageType: 'physical', rawDamage: eMega.rawDamage,       finalDamage: eMega.finalDamage },
        { abilityId: 'R',             abilityName: 'GNAR! (R)',                              rank: rR, damageType: 'magic',    rawDamage: r.rawDamage,           finalDamage: r.finalDamage },
    ];
}

registerChampion('Gnar', {
    name: 'Gnar',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Boomerang / Boulder Toss', maxRank: 5 },
        { key: 'w', label: 'W — Hyper / Wallop',           maxRank: 5 },
        { key: 'e', label: 'E — Hop / Crunch',             maxRank: 5 },
        { key: 'r', label: 'R — GNAR!',                    maxRank: 3 },
    ],
});