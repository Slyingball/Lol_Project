import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage, calculatePhysicalDamage, calculateTrueDamage } from '../damageCalculator';

const Q_BASE = [70, 80, 90, 100, 110];
const W_BASE = [110, 150, 190, 230, 270];
const Q_RATIO = [0.90, 0.95, 1.00, 1.05, 1.10]; // bAD ratio

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const qRaw = Q_BASE[qR - 1] + Q_RATIO[qR - 1] * p.bonusAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const wRaw = W_BASE[wR - 1] + 1.00 * p.ap;
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E: Bladework first hit can't crit
    const eRaw = p.totalAD;
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Passive / R true damage proc
    const passiveBasePct = 0.03;
    const passiveBonusPct = Math.floor(p.bonusAD / 100) * 0.04; 
    const passiveRaw = (passiveBasePct + passiveBonusPct) * p.target.maxHP;
    const passive = calculateTrueDamage(passiveRaw);

    return [
        { abilityId: 'Q', abilityName: 'Lunge (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Riposte (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Bladework (E) - hit 1', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Grand Challenge (R) - 1 vital', rank: rR, damageType: 'true', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
    ];
}

registerChampion('Fiora', {
    name: 'Fiora',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Lunge', maxRank: 5 },
        { key: 'w', label: 'W — Riposte', maxRank: 5 },
        { key: 'e', label: 'E — Bladework', maxRank: 5 },
        { key: 'r', label: 'R — Grand Challenge', maxRank: 3 },
    ],
});
