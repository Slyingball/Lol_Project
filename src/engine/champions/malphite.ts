import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage, calculatePhysicalDamage } from '../damageCalculator';

const Q_BASE = [70, 120, 170, 220, 270];
const E_BASE = [70, 110, 150, 190, 230];
const R_BASE = [200, 300, 400];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const q = calculateMagicDamage(
        Q_BASE[qR - 1] + 0.60 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    const wEmpowered = calculatePhysicalDamage(
        [30, 40, 50, 60, 70][wR - 1] +
        0.15 * p.armor +
        0.15 * p.ap,
        p.target,
        p.armorPenPercent,
        p.armorPenFlat
    );

    const e = calculateMagicDamage(
        E_BASE[eR - 1] +
        0.40 * p.armor +
        0.60 * p.ap,
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
        { abilityId: 'Q', abilityName: 'Seismic Shard (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Thunderclap (W) — First Hit', rank: wR, damageType: 'physical', rawDamage: wEmpowered.rawDamage, finalDamage: wEmpowered.finalDamage },
        { abilityId: 'E', abilityName: 'Ground Slam (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Unstoppable Force (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Malphite', {
    name: 'Malphite',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Seismic Shard', maxRank: 5 },
        { key: 'w', label: 'W — Thunderclap', maxRank: 5 },
        { key: 'e', label: 'E — Ground Slam', maxRank: 5 },
        { key: 'r', label: 'R — Unstoppable Force', maxRank: 3 },
    ],
});