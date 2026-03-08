/**
 * Ashe — The Frost Archer
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Passive — Frost Shot: AAs vs slowed targets deal 110% + (75% + crit chance × 100%) total AD
// Simplified: bonus damage on slowed targets

// Q — Ranger's Focus: AA becomes flurry (5 arrows per attack) = total 105/110/115/120/125% AD per flurry
const Q_RATIO = [1.05, 1.10, 1.15, 1.20, 1.25];

// W — Volley: 20/35/50/65/80 + 100% total AD (physical, AoE)
const W_BASE = [20, 35, 50, 65, 80];

// E — Hawkshot: reveals area (no damage)

// R — Enchanted Crystal Arrow: 200/300/400 + 100% AP (magic, global stun)
const R_BASE = [200, 300, 400];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive empowered AA (vs slowed)
    const passiveRaw = p.totalAD * (1.10 + p.critChance);
    const passive = calculatePhysicalDamage(passiveRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q flurry (total damage)
    const qRaw = Q_RATIO[qR - 1] * p.totalAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + p.totalAD;
    const w = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R (magic)
    const rRaw = R_BASE[rR - 1] + p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'passive', abilityName: 'Frost Shot (Passif) — AA cible ralentie', rank: 0, damageType: 'physical', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q', abilityName: "Ranger's Focus (Q) — flurry total", rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Volley (W)', rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'R', abilityName: 'Enchanted Crystal Arrow (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Ashe', {
    name: 'Ashe',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: "Q — Ranger's Focus", maxRank: 5 },
        { key: 'w', label: 'W — Volley', maxRank: 5 },
        { key: 'r', label: 'R — Enchanted Crystal Arrow', maxRank: 3 },
    ],
});
