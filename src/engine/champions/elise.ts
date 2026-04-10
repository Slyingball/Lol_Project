import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

const Q_BASE = [40, 75, 110, 145, 180];
const W_BASE = [60, 105, 150, 195, 240];
const SPIDER_Q_BASE = [70, 105, 140, 175, 210];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1)); // no damage
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1)); // transformation

    // Human Q: Base + 4% target max HP + 3% per 100 AP
    const humanQHpRatio = 0.04 + (0.03 * (p.ap / 100));
    const humanQRaw = Q_BASE[qR - 1] + (humanQHpRatio * p.target.maxHP);
    const humanQ = calculateMagicDamage(humanQRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Human W
    const wRaw = W_BASE[wR - 1] + 0.95 * p.ap;
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Spider Q
    const missingHpApprox = p.target.maxHP * 0.5; // assuming target is 50% HP
    const spiderQMissingHpRatio = 0.08;
    const spiderQRaw = SPIDER_Q_BASE[qR - 1] + spiderQMissingHpRatio * missingHpApprox;
    const spiderQ = calculateMagicDamage(spiderQRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Neurotoxin (Human Q)', rank: qR, damageType: 'magic', rawDamage: humanQ.rawDamage, finalDamage: humanQ.finalDamage },
        { abilityId: 'W', abilityName: 'Volatile Spiderling (Human W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Cocoon / Rappel (E) - no dmg', rank: eR, damageType: 'magic', rawDamage: 0, finalDamage: 0 },
        { abilityId: 'Q', abilityName: 'Venomous Bite (Spider Q)', rank: qR, damageType: 'magic', rawDamage: spiderQ.rawDamage, finalDamage: spiderQ.finalDamage },
        { abilityId: 'R', abilityName: 'Spider Form (R)', rank: rR, damageType: 'magic', rawDamage: 0, finalDamage: 0 },
    ];
}

registerChampion('Elise', {
    name: 'Elise',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Neurotoxin / Venomous Bite', maxRank: 5 },
        { key: 'w', label: 'W — Volatile Spiderling', maxRank: 5 },
        { key: 'e', label: 'E — Cocoon / Rappel', maxRank: 5 },
        { key: 'r', label: 'R — Spider Form', maxRank: 3 },
    ],
});
