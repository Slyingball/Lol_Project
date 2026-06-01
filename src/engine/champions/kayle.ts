import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Radiant Blast
const Q_BASE = [60, 100, 140, 180, 220];
const Q_RATIO_BONUS_AD = 0.6;
const Q_RATIO_AP = 0.5;

// E — Starfire Spellblade (Passive)
const E_PASSIVE_BASE = [15, 20, 25, 30, 35];
const E_PASSIVE_RATIO_AP = 0.2;

// E — Starfire Spellblade (Active execution % missing HP)
const E_ACTIVE_BASE_PCT = [0.08, 0.085, 0.09, 0.095, 0.10];
const E_ACTIVE_RATIO_AP_PCT = 0.015; // +1.5% per 100 AP (0.015% per 1 AP)

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.bonusAD * Q_RATIO_BONUS_AD) + (p.ap * Q_RATIO_AP);
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E Passive (On-Hit)
    const ePassiveRaw = E_PASSIVE_BASE[eR - 1] + (p.ap * E_PASSIVE_RATIO_AP);
    const ePassive = calculateMagicDamage(ePassiveRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E Active (Missing HP execution)
    const missingHP = p.target.maxHP - p.target.currentHP;
    const activePct = E_ACTIVE_BASE_PCT[eR - 1] + (p.ap * 0.01 * E_ACTIVE_RATIO_AP_PCT);
    const eActiveRaw = missingHP * activePct;
    const eActive = calculateMagicDamage(eActiveRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Radiant Blast (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E_passive', abilityName: 'Starfire Spellblade (E) — Passif à l\'impact', rank: eR, damageType: 'magic', rawDamage: ePassive.rawDamage, finalDamage: ePassive.finalDamage },
        { abilityId: 'E_active', abilityName: 'Starfire Spellblade (E) — Actif (Exécution)', rank: eR, damageType: 'magic', rawDamage: eActive.rawDamage, finalDamage: eActive.finalDamage },
    ];
}

registerChampion('Kayle', {
    name: 'Kayle',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Radiant Blast', maxRank: 5 },
        { key: 'e', label: 'E — Starfire Spellblade', maxRank: 5 },
    ],
});
