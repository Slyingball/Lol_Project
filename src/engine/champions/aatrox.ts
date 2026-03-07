/**
 * Aatrox — The Darkin Blade
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Q — The Darkin Blade (3 casts)
// Q1: 10/30/50/70/90 + 60% total AD
// Q2: 125% of Q1
// Q3: 150% of Q1
// Sweet spot: +50% bonus damage
const Q_BASE = [10, 30, 50, 70, 90];

// W — Infernal Chains: 30/40/50/60/70 + 40% total AD (physical)
const W_BASE = [30, 40, 50, 60, 70];

// E — Umbral Dash: passive → heals; active → short dash (no damage)
// Passive: 18/20/22/24/26% healing from champion damage

// R — World Ender: self-buff → +20/30/40% total AD, increased healing, revive
const R_AD_BONUS = [0.20, 0.30, 0.40];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // R bonus AD
    const rBonusAD = R_AD_BONUS[rR - 1] * p.totalAD;
    const effectiveTotalAD = p.totalAD + rBonusAD;

    // Q1
    const q1Raw = Q_BASE[qR - 1] + 0.60 * p.totalAD;
    const q1 = calculatePhysicalDamage(q1Raw, p.target, p.armorPenPercent, p.armorPenFlat);
    // Q1 sweet spot
    const q1Sweet = calculatePhysicalDamage(q1Raw * 1.5, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q2 (125% of Q1)
    const q2Raw = q1Raw * 1.25;
    const q2Sweet = calculatePhysicalDamage(q2Raw * 1.5, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q3 (150% of Q1)
    const q3Raw = q1Raw * 1.5;
    const q3Sweet = calculatePhysicalDamage(q3Raw * 1.5, p.target, p.armorPenPercent, p.armorPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + 0.40 * p.totalAD;
    const w = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E passive healing %
    const eHealPercent = [18, 20, 22, 24, 26][eR - 1];

    // Q1 with R active (sweet spot)
    const q1RRaw = Q_BASE[qR - 1] + 0.60 * effectiveTotalAD;
    const q1RSweet = calculatePhysicalDamage(q1RRaw * 1.5, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q1', abilityName: 'Darkin Blade (Q1)', rank: qR, damageType: 'physical', rawDamage: q1.rawDamage, finalDamage: q1.finalDamage },
        { abilityId: 'Q1_sweet', abilityName: 'Darkin Blade (Q1) — sweet spot', rank: qR, damageType: 'physical', rawDamage: q1Sweet.rawDamage, finalDamage: q1Sweet.finalDamage },
        { abilityId: 'Q2_sweet', abilityName: 'Darkin Blade (Q2) — sweet spot', rank: qR, damageType: 'physical', rawDamage: q2Sweet.rawDamage, finalDamage: q2Sweet.finalDamage },
        { abilityId: 'Q3_sweet', abilityName: 'Darkin Blade (Q3) — sweet spot', rank: qR, damageType: 'physical', rawDamage: q3Sweet.rawDamage, finalDamage: q3Sweet.finalDamage },
        { abilityId: 'W', abilityName: 'Infernal Chains (W)', rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: `Umbral Dash (E) — ${eHealPercent}% vampirisme`, rank: eR, damageType: 'physical', rawDamage: 0, finalDamage: 0 },
        { abilityId: 'Q1_R', abilityName: `Q1 sweet spot + R actif (+${Math.round(R_AD_BONUS[rR - 1] * 100)}% AD)`, rank: rR, damageType: 'physical', rawDamage: q1RSweet.rawDamage, finalDamage: q1RSweet.finalDamage },
    ];
}

registerChampion('Aatrox', {
    name: 'Aatrox',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — The Darkin Blade', maxRank: 5 },
        { key: 'w', label: 'W — Infernal Chains', maxRank: 5 },
        { key: 'e', label: 'E — Umbral Dash', maxRank: 5 },
        { key: 'r', label: 'R — World Ender', maxRank: 3 },
    ],
});
