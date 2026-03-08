/**
 * Ambessa — The Matriarch of War
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Passive — Drakehound's Step: next AA after ability = 10-80 (by level) + 75% bonus AD (physical)
function passiveDmg(level: number, bonusAD: number): number {
    return 10 + (80 - 10) * ((level - 1) / 17) + 0.75 * bonusAD;
}

// Q — Cunning Sweep / Sundering Slam: 40/65/90/115/140 + 60% bonus AD
const Q_BASE = [40, 65, 90, 115, 140];

// W — Repudiation: 60/90/120/150/180 + 80% bonus AD (shield + dash)
const W_BASE = [60, 90, 120, 150, 180];

// E — Lacerate: 50/85/120/155/190 + 100% bonus AD
const E_BASE = [50, 85, 120, 155, 190];

// R — Public Execution: 150/275/400 + 120% bonus AD
const R_BASE = [150, 275, 400];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const pRaw = passiveDmg(p.level, p.bonusAD);
    const passive = calculatePhysicalDamage(pRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const qRaw = Q_BASE[qR - 1] + 0.60 * p.bonusAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const wRaw = W_BASE[wR - 1] + 0.80 * p.bonusAD;
    const w = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const eRaw = E_BASE[eR - 1] + 1.00 * p.bonusAD;
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const rRaw = R_BASE[rR - 1] + 1.20 * p.bonusAD;
    const r = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'passive', abilityName: "Drakehound's Step (Passif)", rank: 0, damageType: 'physical', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q', abilityName: 'Cunning Sweep (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Repudiation (W)', rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Lacerate (E)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Public Execution (R)', rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Ambessa', {
    name: 'Ambessa',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Cunning Sweep', maxRank: 5 },
        { key: 'w', label: 'W — Repudiation', maxRank: 5 },
        { key: 'e', label: 'E — Lacerate', maxRank: 5 },
        { key: 'r', label: 'R — Public Execution', maxRank: 3 },
    ],
});
