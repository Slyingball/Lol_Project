/**
 * Zed — The Master of Shadows
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Q — Razor Shuriken: 80/115/150/185/220 + 100% bonus AD
const Q_BASE = [80, 115, 150, 185, 220];

// E — Shadow Slash: 70/95/120/145/170 + 80% bonus AD
const E_BASE = [70, 95, 120, 145, 170];

// R — Death Mark: detonation = 100% total AD + 25%/40%/55% of damage dealt during mark
// Simplified: we calculate the base pop damage
const R_RATIO = [0.25, 0.40, 0.55];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q
    const qRaw = Q_BASE[qR - 1] + p.bonusAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + 0.80 * p.bonusAD;
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R pop (base only — without stored damage)
    const rPopRaw = p.totalAD;
    const rPop = calculatePhysicalDamage(rPopRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Full combo stored: Q + E + 2 autos → R amplifies
    const comboDmgRaw = qRaw + eRaw + p.totalAD * 2;
    const rFullRaw = p.totalAD + R_RATIO[rR - 1] * comboDmgRaw;
    const rFull = calculatePhysicalDamage(rFullRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Razor Shuriken (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E', abilityName: 'Shadow Slash (E)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R_base', abilityName: 'Death Mark (R) — pop seul', rank: rR, damageType: 'physical', rawDamage: rPop.rawDamage, finalDamage: rPop.finalDamage },
        { abilityId: 'R_combo', abilityName: 'Death Mark (R) — full combo', rank: rR, damageType: 'physical', rawDamage: rFull.rawDamage, finalDamage: rFull.finalDamage },
    ];
}

registerChampion('Zed', {
    name: 'Zed',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Razor Shuriken', maxRank: 5 },
        { key: 'e', label: 'E — Shadow Slash', maxRank: 5 },
        { key: 'r', label: 'R — Death Mark', maxRank: 3 },
    ],
});
