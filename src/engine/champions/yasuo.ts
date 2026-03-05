/**
 * Yasuo — The Unforgiven
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Q — Steel Tempest: 20/45/70/95/120 + 105% total AD
const Q_BASE = [20, 45, 70, 95, 120];

// E — Sweeping Blade: 60/70/80/90/100 + 20% bonus AD + 60% AP (magic)
const E_BASE = [60, 70, 80, 90, 100];

// R — Last Breath: 200/350/500 + 150% bonus AD
const R_BASE = [200, 350, 500];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q
    const qRaw = Q_BASE[qR - 1] + 1.05 * p.totalAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q crit
    const qCrit = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat, true, p.critMultiplier);

    // E (magic but simplified)
    const eRaw = E_BASE[eR - 1] + 0.20 * p.bonusAD + 0.60 * p.ap;
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R
    const rRaw = R_BASE[rR - 1] + 1.50 * p.bonusAD;
    const r = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Steel Tempest (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'Q_crit', abilityName: 'Steel Tempest (Q) — Crit', rank: qR, damageType: 'physical', rawDamage: qCrit.rawDamage, finalDamage: qCrit.finalDamage },
        { abilityId: 'E', abilityName: 'Sweeping Blade (E)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Last Breath (R)', rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Yasuo', {
    name: 'Yasuo',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Steel Tempest', maxRank: 5 },
        { key: 'e', label: 'E — Sweeping Blade', maxRank: 5 },
        { key: 'r', label: 'R — Last Breath', maxRank: 3 },
    ],
});
