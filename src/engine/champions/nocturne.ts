import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

const Q_BASE = [60, 105, 150, 195, 240];
const E_BASE = [80, 125, 170, 215, 260];
const R_BASE = [150, 275, 400];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const q = calculatePhysicalDamage(
        Q_BASE[qR - 1] + 0.85 * p.bonusAD,
        p.target,
        p.armorPenPercent,
        p.armorPenFlat
    );

    const e = calculateMagicDamage(
        E_BASE[eR - 1] + 1.00 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    const r = calculatePhysicalDamage(
        R_BASE[rR - 1] + 1.20 * p.bonusAD,
        p.target,
        p.armorPenPercent,
        p.armorPenFlat
    );

    return [
        { abilityId: 'Q', abilityName: 'Duskbringer (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E', abilityName: 'Unspeakable Horror (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Paranoia (R)', rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Nocturne', {
    name: 'Nocturne',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Duskbringer', maxRank: 5 },
        { key: 'w', label: 'W — Shroud of Darkness', maxRank: 5 },
        { key: 'e', label: 'E — Unspeakable Horror', maxRank: 5 },
        { key: 'r', label: 'R — Paranoia', maxRank: 3 },
    ],
});