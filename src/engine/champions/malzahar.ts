import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

const Q_BASE = [70, 105, 140, 175, 210];
const E_BASE = [80, 115, 150, 185, 220];
const R_BASE = [125, 200, 275];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const q = calculateMagicDamage(
        Q_BASE[qR - 1] + 0.55 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    const e = calculateMagicDamage(
        E_BASE[eR - 1] + 0.80 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    const r = calculateMagicDamage(
        R_BASE[rR - 1] + 0.80 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    return [
        { abilityId: 'Q', abilityName: 'Call of the Void (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E', abilityName: 'Malefic Visions (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Nether Grasp (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Malzahar', {
    name: 'Malzahar',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Call of the Void', maxRank: 5 },
        { key: 'w', label: 'W — Void Swarm', maxRank: 5 },
        { key: 'e', label: 'E — Malefic Visions', maxRank: 5 },
        { key: 'r', label: 'R — Nether Grasp', maxRank: 3 },
    ],
});