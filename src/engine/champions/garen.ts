/**
 * Garen — The Might of Demacia
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateTrueDamage } from '../damageCalculator';

// Q — Decisive Strike: 30/60/90/120/150 + 100% total AD
const Q_BASE = [30, 60, 90, 120, 150];

// E — Judgment: 4/8/12/16/20 per spin + 32-39% AD
const E_BASE = [4, 8, 12, 16, 20];
const E_RATIO = [0.32, 0.335, 0.35, 0.37, 0.39];

// R — Demacian Justice: 150/300/450 + 25/30/35% missing HP (true)
const R_BASE = [150, 300, 450];
const R_RATIO = [0.25, 0.30, 0.35];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));
    const spins = p.extras.eSpins ?? 9;

    // Q
    const qRaw = Q_BASE[qR - 1] + p.totalAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const qCrit = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat, true, p.critMultiplier);

    // E per spin
    const eRaw = E_BASE[eR - 1] + E_RATIO[eR - 1] * p.totalAD;
    const eSpin = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R
    const missingHP = p.target.maxHP - p.target.currentHP;
    const rRaw = R_BASE[rR - 1] + R_RATIO[rR - 1] * missingHP;
    const r = calculateTrueDamage(rRaw);

    return [
        { abilityId: 'Q', abilityName: 'Decisive Strike (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'Q_crit', abilityName: 'Decisive Strike (Q) — Crit', rank: qR, damageType: 'physical', rawDamage: qCrit.rawDamage, finalDamage: qCrit.finalDamage },
        { abilityId: 'E', abilityName: 'Judgment (E) — par rotation', rank: eR, damageType: 'physical', rawDamage: eSpin.rawDamage, finalDamage: eSpin.finalDamage, hits: spins, totalFinalDamage: eSpin.finalDamage * spins },
        { abilityId: 'R', abilityName: 'Demacian Justice (R)', rank: rR, damageType: 'true', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Garen', {
    name: 'Garen',
    adGrowthOverride: 4.5,
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Decisive Strike', maxRank: 5 },
        { key: 'e', label: 'E — Judgment', maxRank: 5 },
        { key: 'r', label: 'R — Demacian Justice', maxRank: 3 },
    ],
});
