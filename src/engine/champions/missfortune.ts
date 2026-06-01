import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

const Q_BASE = [20, 45, 70, 95, 120];
const E_BASE = [80, 115, 150, 185, 220];
const R_WAVE = [75, 90, 105];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const q = calculatePhysicalDamage(
        Q_BASE[qR - 1] + 1.00 * p.bonusAD,
        p.target,
        p.armorPenPercent,
        p.armorPenFlat
    );

    // E deals magic damage
    const e = calculateMagicDamage(
        E_BASE[eR - 1] + 0.80 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    const rWave = calculatePhysicalDamage(
        R_WAVE[rR - 1] + 0.75 * p.bonusAD,
        p.target,
        p.armorPenPercent,
        p.armorPenFlat
    );

    return [
        { abilityId: 'Q', abilityName: 'Double Up (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E', abilityName: 'Make It Rain (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        {
            abilityId: 'R',
            abilityName: 'Bullet Time (R) — Wave',
            rank: rR,
            damageType: 'physical',
            rawDamage: rWave.rawDamage,
            finalDamage: rWave.finalDamage,
            hits: 12,
            totalFinalDamage: rWave.finalDamage * 12
        },
    ];
}

registerChampion('MissFortune', {
    name: 'Miss Fortune',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Double Up', maxRank: 5 },
        { key: 'w', label: 'W — Strut', maxRank: 5 },
        { key: 'e', label: 'E — Make It Rain', maxRank: 5 },
        { key: 'r', label: 'R — Bullet Time', maxRank: 3 },
    ],
});
