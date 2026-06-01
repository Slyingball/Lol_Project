import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

const Q_BASE = [70, 120, 170, 220, 270];
const W_BASE = [80, 125, 170, 215, 260];
const R_BASE = [250, 350, 450];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q deals physical damage
    const q = calculatePhysicalDamage(Q_BASE[qR - 1] + 1.10 * p.bonusAD, p.target, p.armorPenPercent, p.armorPenFlat);

    // W scales with bonus armor and bonus MR
    const w = calculateMagicDamage(
        W_BASE[wR - 1] + 0.40 * (p.bonusArmor + p.bonusMR),
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    // R
    const r = calculateMagicDamage(
        R_BASE[rR - 1] + 0.40 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    return [
        { abilityId: 'Q', abilityName: 'Volcanic Rupture (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Bellows Breath (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'R', abilityName: 'Call of the Forge God (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Ornn', {
    name: 'Ornn',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Volcanic Rupture', maxRank: 5 },
        { key: 'w', label: 'W — Bellows Breath', maxRank: 5 },
        { key: 'e', label: 'E — Searing Charge', maxRank: 5 },
        { key: 'r', label: 'R — Call of the Forge God', maxRank: 3 },
    ],
});
