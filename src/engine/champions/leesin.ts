/**
 * Lee Sin — The Blind Monk
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Q1 — Sonic Wave: 55/80/105/130/155 + 100% bonus AD
const Q1_BASE = [55, 80, 105, 130, 155];
// Q2 — Resonating Strike: same base + 100% bonus AD + 8% target missing HP
const Q2_MISSING_HP_RATIO = 0.08;

// E — Tempest: 100/130/160/190/220 + 100% bonus AD (magic)
const E_BASE = [100, 130, 160, 190, 220];

// R — Dragon's Rage: 175/400/625 + 200% bonus AD
const R_BASE = [175, 400, 625];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q1
    const q1Raw = Q1_BASE[qR - 1] + p.bonusAD;
    const q1 = calculatePhysicalDamage(q1Raw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q2 (+ 8% missing HP)
    const missingHP = p.target.maxHP - p.target.currentHP;
    const q2Raw = Q1_BASE[qR - 1] + p.bonusAD + Q2_MISSING_HP_RATIO * missingHP;
    const q2 = calculatePhysicalDamage(q2Raw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E (magic damage but we'll treat via physical pen for simplicity since it's physical in latest patches)
    const eRaw = E_BASE[eR - 1] + p.bonusAD;
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R
    const rRaw = R_BASE[rR - 1] + 2.0 * p.bonusAD;
    const r = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q1', abilityName: 'Sonic Wave (Q1)', rank: qR, damageType: 'physical', rawDamage: q1.rawDamage, finalDamage: q1.finalDamage },
        { abilityId: 'Q2', abilityName: 'Resonating Strike (Q2)', rank: qR, damageType: 'physical', rawDamage: q2.rawDamage, finalDamage: q2.finalDamage },
        { abilityId: 'E', abilityName: 'Tempest (E)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: "Dragon's Rage (R)", rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('LeeSin', {
    name: 'Lee Sin',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Sonic Wave / Resonating Strike', maxRank: 5 },
        { key: 'e', label: 'E — Tempest', maxRank: 5 },
        { key: 'r', label: "R — Dragon's Rage", maxRank: 3 },
    ],
});
