import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

const Q_BASE = [70, 115, 160, 205, 250];
const W_BASE = [60, 110, 160, 210, 260];
const E_BASE = [60, 100, 140, 180, 220];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));

    const q = calculatePhysicalDamage(
        Q_BASE[qR - 1] + 1.15 * p.bonusAD,
        p.target,
        p.armorPenPercent,
        p.armorPenFlat
    );

    const w = calculatePhysicalDamage(
        W_BASE[wR - 1] + 1.00 * p.ap,
        p.target,
        p.armorPenPercent,
        p.armorPenFlat
    );

    const e = calculatePhysicalDamage(
        E_BASE[eR - 1] + 1.50 * p.bonusAD,
        p.target,
        p.armorPenPercent,
        p.armorPenFlat
    );

    return [
        { abilityId: 'Q', abilityName: 'Comet Spear (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Shield Vault (W)', rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Aegis Assault (E Slam)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
    ];
}

registerChampion('Pantheon', {
    name: 'Pantheon',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Comet Spear', maxRank: 5 },
        { key: 'w', label: 'W — Shield Vault', maxRank: 5 },
        { key: 'e', label: 'E — Aegis Assault', maxRank: 5 },
        { key: 'r', label: 'R — Grand Starfall', maxRank: 3 },
    ],
});