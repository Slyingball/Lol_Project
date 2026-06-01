import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Q — Dance of Arrows
const Q_BASE = [50, 75, 100, 125, 150];
const Q_RATIO_BONUS_AD = 0.75;

// W — Wolf's Frenzy (Per bite)
const W_BASE = [25, 30, 35, 40, 45];
const W_RATIO_BONUS_AD = 0.2;
const W_RATIO_AP = 0.2;

// E — Mounting Dread (Execute)
const E_BASE = [80, 100, 120, 140, 160];
const E_RATIO_BONUS_AD = 0.8;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));

    const marks = Math.max(0, Math.min(25, p.extras.marks ?? 4));

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.bonusAD * Q_RATIO_BONUS_AD) + (15 * marks);
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W (per Wolf bite)
    // base W + 20% bonus AD + 20% AP + (1.5% + 1% per mark) of target's current HP
    const wCurrentHPPct = 0.015 + (marks * 0.01);
    const wRaw = W_BASE[wR - 1] + (p.bonusAD * W_RATIO_BONUS_AD) + (p.ap * W_RATIO_AP) + (p.target.currentHP * wCurrentHPPct);
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    // base E + 80% bonus AD + (8% + 0.5% per mark) of missing HP
    const missingHP = p.target.maxHP - p.target.currentHP;
    const eMissingHPPct = 0.08 + (marks * 0.005);
    const eRaw = E_BASE[eR - 1] + (p.bonusAD * E_RATIO_BONUS_AD) + (missingHP * eMissingHPPct);
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q', abilityName: `Dance of Arrows (Q) — ${marks} marques`, rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Wolf\'s Frenzy (W) — par morsure', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Mounting Dread (E) — coup de grâce', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
    ];
}

registerChampion('Kindred', {
    name: 'Kindred',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Dance of Arrows', maxRank: 5 },
        { key: 'w', label: 'W — Wolf\'s Frenzy', maxRank: 5 },
        { key: 'e', label: 'E — Mounting Dread', maxRank: 5 },
        { key: 'marks', label: 'Marques de Kindred', maxRank: 1, extraParam: { label: 'Nombre de marques', min: 0, max: 25, default: 4 } },
    ],
});
