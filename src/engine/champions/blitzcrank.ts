/**
 * Blitzcrank — The Great Steam Golem
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage, calculatePhysicalDamage } from '../damageCalculator';

// Q — Rocket Grab: 105/155/205/255/305 + 120% AP (magic, pull)
const Q_BASE = [105, 155, 205, 255, 305];

// W — Overdrive: speed boost (no damage)

// E — Power Fist: 175/225/275/325/375% total AD (physical, knockup)
const E_RATIO = [1.75, 2.25, 2.75, 3.25, 3.75];

// R — Static Field: passive = 50/100/150 + 30% AP per AA (magic)
//   active = 275/400/525 + 100% AP (magic, AoE silence)
const R_BASE = [275, 400, 525];
const R_PASSIVE_BASE = [50, 100, 150];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const qRaw = Q_BASE[qR - 1] + 1.20 * p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const eRaw = E_RATIO[eR - 1] * p.totalAD;
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const rRaw = R_BASE[rR - 1] + p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const rPassiveRaw = R_PASSIVE_BASE[rR - 1] + 0.30 * p.ap;
    const rPassive = calculateMagicDamage(rPassiveRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Combo Q + E + R
    const comboRaw = qRaw + eRaw + rRaw;
    const comboPhys = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const comboMagic = calculateMagicDamage(qRaw + rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Rocket Grab (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E', abilityName: 'Power Fist (E)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R_passive', abilityName: 'Static Field (R) — passif on-hit', rank: rR, damageType: 'magic', rawDamage: rPassive.rawDamage, finalDamage: rPassive.finalDamage },
        { abilityId: 'R', abilityName: 'Static Field (R) — actif', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
        { abilityId: 'combo', abilityName: 'Combo Q+E+R', rank: 0, damageType: 'magic', rawDamage: comboRaw, finalDamage: comboPhys.finalDamage + comboMagic.finalDamage },
    ];
}

registerChampion('Blitzcrank', {
    name: 'Blitzcrank',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Rocket Grab', maxRank: 5 },
        { key: 'e', label: 'E — Power Fist', maxRank: 5 },
        { key: 'r', label: 'R — Static Field', maxRank: 3 },
    ],
});
