/**
 * Camille — The Steel Shadow
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateTrueDamage } from '../damageCalculator';

// Q — Precision Protocol:
//   Q1: 20/25/30/35/40 + 80/85/90/95/100% total AD (physical)
//   Q2: same but converts to TRUE damage after 1.5s delay + bonus damage
const Q1_BASE = [20, 25, 30, 35, 40];
const Q1_AD_RATIO = [0.80, 0.85, 0.90, 0.95, 1.00];
// Q2 empowered: 40-100% bonus damage (by level) on top of Q1, true damage
function q2BonusRatio(level: number): number {
    return 0.40 + (1.00 - 0.40) * ((level - 1) / 17);
}

// W — Tactical Sweep: 70/100/130/160/190 + 60% bonus AD (physical, outer cone)
//   Outer half: bonus 5/5.5/6/6.5/7% target max HP (physical)
const W_BASE = [70, 100, 130, 160, 190];
const W_HP = [0.05, 0.055, 0.06, 0.065, 0.07];

// E — Hookshot: 70/100/130/160/190 + 75% bonus AD (physical)
const E_BASE = [70, 100, 130, 160, 190];

// R — The Hextech Ultimatum: 5/10/15 + 4/6/8% target current HP (magic)
const R_BASE = [5, 10, 15];
const R_HP = [0.04, 0.06, 0.08];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q1
    const q1Raw = Q1_BASE[qR - 1] + Q1_AD_RATIO[qR - 1] * p.totalAD;
    const q1 = calculatePhysicalDamage(q1Raw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q2 (true damage)
    const q2Raw = q1Raw * (1 + q2BonusRatio(p.level));
    const q2 = calculateTrueDamage(q2Raw);

    // W outer
    const wRaw = W_BASE[wR - 1] + 0.60 * p.bonusAD + W_HP[wR - 1] * p.target.maxHP;
    const w = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + 0.75 * p.bonusAD;
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R
    const rRaw = R_BASE[rR - 1] + R_HP[rR - 1] * p.target.currentHP;
    const r = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q1', abilityName: 'Precision Protocol (Q1)', rank: qR, damageType: 'physical', rawDamage: q1.rawDamage, finalDamage: q1.finalDamage },
        { abilityId: 'Q2', abilityName: 'Precision Protocol (Q2) — true', rank: qR, damageType: 'true', rawDamage: q2.rawDamage, finalDamage: q2.finalDamage },
        { abilityId: 'W', abilityName: 'Tactical Sweep (W) — outer', rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Hookshot (E)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Hextech Ultimatum (R)', rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Camille', {
    name: 'Camille',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Precision Protocol', maxRank: 5 },
        { key: 'w', label: 'W — Tactical Sweep', maxRank: 5 },
        { key: 'e', label: 'E — Hookshot', maxRank: 5 },
        { key: 'r', label: 'R — Hextech Ultimatum', maxRank: 3 },
    ],
});
