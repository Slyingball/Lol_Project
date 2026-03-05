/**
 * Jinx — The Loose Cannon
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Q — Switcheroo! (Fishbones — rocket auto): 110% AD + 10/17.5/25/32.5/40% AD (AoE)
// Rocket bonus: 10/17.5/25/32.5/40 % bonus AD
const Q_ROCKET_RATIO = [0.10, 0.175, 0.25, 0.325, 0.40];

// W — Zap!: 10/60/110/160/210 + 160% total AD
const W_BASE = [10, 60, 110, 160, 210];

// E — Flame Chompers!: 70/120/170/220/270 + 100% AP (magic)
const E_BASE = [70, 120, 170, 220, 270];

// R — Super Mega Death Rocket!: 25/35/45 + 15% bonus AD (min) → 250/350/450 + 150% bonus AD (max)
const R_MIN_BASE = [25, 35, 45];
const R_MAX_BASE = [250, 350, 450];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q rocket auto
    const qRaw = p.totalAD * (1.1 + Q_ROCKET_RATIO[qR - 1]);
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + 1.6 * p.totalAD;
    const w = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E (magic)
    const eRaw = E_BASE[eR - 1] + p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R min / max
    const rMinRaw = R_MIN_BASE[rR - 1] + 0.15 * p.bonusAD + 0.25 * (p.target.maxHP - p.target.currentHP);
    const rMaxRaw = R_MAX_BASE[rR - 1] + 1.5 * p.bonusAD + 0.25 * (p.target.maxHP - p.target.currentHP);
    const rMin = calculatePhysicalDamage(rMinRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const rMax = calculatePhysicalDamage(rMaxRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Switcheroo! (Q) — Rocket', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Zap! (W)', rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Flame Chompers! (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R_min', abilityName: 'Mega Rocket (R) — Min', rank: rR, damageType: 'physical', rawDamage: rMin.rawDamage, finalDamage: rMin.finalDamage },
        { abilityId: 'R_max', abilityName: 'Mega Rocket (R) — Max', rank: rR, damageType: 'physical', rawDamage: rMax.rawDamage, finalDamage: rMax.finalDamage },
    ];
}

registerChampion('Jinx', {
    name: 'Jinx',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Switcheroo!', maxRank: 5 },
        { key: 'w', label: 'W — Zap!', maxRank: 5 },
        { key: 'e', label: 'E — Flame Chompers!', maxRank: 5 },
        { key: 'r', label: 'R — Super Mega Death Rocket!', maxRank: 3 },
    ],
});
