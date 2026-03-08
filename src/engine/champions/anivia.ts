/**
 * Anivia — The Cryophoenix
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Flash Frost: 50/80/110/140/170 + 25% AP pass-through + 50/80/110/140/170 + 25% AP stun detonation
const Q_BASE = [50, 80, 110, 140, 170];

// W — Crystallize: wall, no damage

// E — Frostbite: 50/80/110/140/170 + 60% AP (magic)
//   Empowered (chilled target): ×2 damage
const E_BASE = [50, 80, 110, 140, 170];

// R — Glacial Storm: 30/45/60 + 12.5% AP per second (magic, AoE)
//   Fully formed (3s): 90/135/180 + 37.5% AP per second
const R_BASE = [30, 45, 60];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q (pass + detonation = full burst)
    const qFullRaw = (Q_BASE[qR - 1] + 0.25 * p.ap) * 2;
    const qFull = calculateMagicDamage(qFullRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E normal
    const eRaw = E_BASE[eR - 1] + 0.60 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E empowered (chilled ×2)
    const eEmpRaw = eRaw * 2;
    const eEmp = calculateMagicDamage(eEmpRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R per second (base)
    const rPerSecRaw = R_BASE[rR - 1] + 0.125 * p.ap;
    const rPerSec = calculateMagicDamage(rPerSecRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R fully formed per second (×3)
    const rFullRaw = rPerSecRaw * 3;
    const rFull = calculateMagicDamage(rFullRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Flash Frost (Q) — full burst', rank: qR, damageType: 'magic', rawDamage: qFull.rawDamage, finalDamage: qFull.finalDamage },
        { abilityId: 'E', abilityName: 'Frostbite (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'E_emp', abilityName: 'Frostbite (E) — chilled ×2', rank: eR, damageType: 'magic', rawDamage: eEmp.rawDamage, finalDamage: eEmp.finalDamage },
        { abilityId: 'R_sec', abilityName: 'Glacial Storm (R) — par seconde', rank: rR, damageType: 'magic', rawDamage: rPerSec.rawDamage, finalDamage: rPerSec.finalDamage },
        { abilityId: 'R_full', abilityName: 'Glacial Storm (R) — max /s', rank: rR, damageType: 'magic', rawDamage: rFull.rawDamage, finalDamage: rFull.finalDamage },
    ];
}

registerChampion('Anivia', {
    name: 'Anivia',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Flash Frost', maxRank: 5 },
        { key: 'e', label: 'E — Frostbite', maxRank: 5 },
        { key: 'r', label: 'R — Glacial Storm', maxRank: 3 },
    ],
});
