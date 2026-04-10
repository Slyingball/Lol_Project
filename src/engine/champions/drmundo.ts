import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage, calculatePhysicalDamage } from '../damageCalculator';

const Q_PCT = [0.20, 0.225, 0.25, 0.275, 0.30];
const W_BASE = [20, 35, 50, 65, 80];
const E_BASE = [5, 15, 25, 35, 45]; // Approx

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const qRaw = Q_PCT[qR - 1] * p.target.maxHP;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const wRaw = W_BASE[wR - 1];
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const bonusHP = 1000;
    const eRaw = E_BASE[eR - 1] + 0.07 * bonusHP;
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Infected Bonesaw (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Heart Zapper (W) - tick', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Blunt Force Trauma (E)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Maximum Dosage (R) - buff only', rank: rR, damageType: 'physical', rawDamage: 0, finalDamage: 0 },
    ];
}

registerChampion('DrMundo', {
    name: 'Dr. Mundo',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Infected Bonesaw', maxRank: 5 },
        { key: 'w', label: 'W — Heart Zapper', maxRank: 5 },
        { key: 'e', label: 'E — Blunt Force Trauma', maxRank: 5 },
        { key: 'r', label: 'R — Maximum Dosage', maxRank: 3 },
    ],
});
