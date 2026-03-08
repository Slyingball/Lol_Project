/**
 * Briar — The Restrained Hunger
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Q — Head Rush: 60/90/120/150/180 + 80% bonus AD (physical, stun, armor shred)
const Q_BASE = [60, 90, 120, 150, 180];

// W — Blood Frenzy / Snack Attack:
//   passive autos: 5/20/35/50/65 + 50% bonus AD (physical, per hit)
const W_BASE = [5, 20, 35, 50, 65];
//   recast chomp: 10/60/110/160/210 + 50% bonus AD + 8% missing HP (physical)
const W2_BASE = [10, 60, 110, 160, 210];

// E — Chilling Scream: 150/225/300/375/450 + 110% bonus AD + 100% AP (magic, charge)
const E_BASE = [150, 225, 300, 375, 450];

// R — Certain Death: 150/300/450 + 50% bonus AD + 25% AP (physical, global)
const R_BASE = [150, 300, 450];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const qRaw = Q_BASE[qR - 1] + 0.80 * p.bonusAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W per hit
    const wHitRaw = W_BASE[wR - 1] + 0.50 * p.bonusAD;
    const wHit = calculatePhysicalDamage(wHitRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W chomp
    const missingHP = p.target.maxHP - p.target.currentHP;
    const w2Raw = W2_BASE[wR - 1] + 0.50 * p.bonusAD + 0.08 * missingHP;
    const w2 = calculatePhysicalDamage(w2Raw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + 1.10 * p.bonusAD + p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R
    const rRaw = R_BASE[rR - 1] + 0.50 * p.bonusAD + 0.25 * p.ap;
    const r = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Head Rush (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W_hit', abilityName: 'Blood Frenzy (W) — par AA', rank: wR, damageType: 'physical', rawDamage: wHit.rawDamage, finalDamage: wHit.finalDamage },
        { abilityId: 'W_chomp', abilityName: 'Snack Attack (W) — morsure', rank: wR, damageType: 'physical', rawDamage: w2.rawDamage, finalDamage: w2.finalDamage },
        { abilityId: 'E', abilityName: 'Chilling Scream (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Certain Death (R)', rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Briar', {
    name: 'Briar',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Head Rush', maxRank: 5 },
        { key: 'w', label: 'W — Blood Frenzy', maxRank: 5 },
        { key: 'e', label: 'E — Chilling Scream', maxRank: 5 },
        { key: 'r', label: 'R — Certain Death', maxRank: 3 },
    ],
});
