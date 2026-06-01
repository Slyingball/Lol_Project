import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

const Q_BASE = [70, 120, 170, 220, 270];
const E_BASE = [70, 120, 170, 220, 270];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));

    const q = calculatePhysicalDamage(
        Q_BASE[qR - 1] + 1.00 * p.bonusAD,
        p.target,
        p.armorPenPercent,
        p.armorPenFlat
    );

    const eRaw = E_BASE[eR - 1] + 0.50 * p.totalAD;

    return [
        { abilityId: 'Q', abilityName: 'Undertow (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E', abilityName: 'Reckless Swing (E)', rank: eR, damageType: 'true', rawDamage: eRaw, finalDamage: eRaw },
    ];
}

registerChampion('Olaf', {
    name: 'Olaf',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Undertow', maxRank: 5 },
        { key: 'w', label: 'W — Tough It Out', maxRank: 5 },
        { key: 'e', label: 'E — Reckless Swing', maxRank: 5 },
        { key: 'r', label: 'R — Ragnarok', maxRank: 3 },
    ],
});