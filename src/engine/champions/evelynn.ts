import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

const Q_DART = [25, 30, 35, 40, 45];
const Q_SPIKE = [25, 30, 35, 40, 45];
const E_PCT = [0.03, 0.035, 0.04, 0.045, 0.05];
const R_BASE = [125, 250, 375];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1)); // W charm MR shred
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q full: dart + 3 spikes
    const qDartRaw = Q_DART[qR - 1] + 0.30 * p.ap;
    const qSpikeRaw = Q_SPIKE[qR - 1] + 0.30 * p.ap;
    const qRaw = qDartRaw + 3 * qSpikeRaw;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E: base % max HP + AP ratio
    const eRatio = E_PCT[eR - 1] + (0.015 * (p.ap / 100));
    const eRaw = eRatio * p.target.maxHP;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R: base + 75% AP, doubled vs low HP (we'll just do base for now)
    const rRaw = R_BASE[rR - 1] + 0.75 * p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Hate Spike (Q) - full', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Allure (W) - debuff only', rank: wR, damageType: 'magic', rawDamage: 0, finalDamage: 0 },
        { abilityId: 'E', abilityName: 'Whiplash (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Last Caress (R) - normal', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Evelynn', {
    name: 'Evelynn',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Hate Spike', maxRank: 5 },
        { key: 'w', label: 'W — Allure', maxRank: 5 },
        { key: 'e', label: 'E — Whiplash', maxRank: 5 },
        { key: 'r', label: 'R — Last Caress', maxRank: 3 },
    ],
});
