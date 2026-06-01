import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Caustic Spittle
const Q_BASE = [90, 140, 190, 240, 290];
const Q_RATIO_AP = 0.7;

// W — Bio-Arcane Barrage (Max HP % magic damage on auto-attacks)
const W_HP_PCT_BASE = [0.03, 0.0375, 0.045, 0.0525, 0.06];
const W_RATIO_AP_PCT = 0.01; // +1% per 100 AP (0.01% per 1 AP)

// E — Void Ooze
const E_BASE = [75, 120, 165, 210, 255];
const E_RATIO_AP = 0.7;

// R — Living Artillery
const R_BASE = [100, 140, 180];
const R_RATIO_BONUS_AD = 0.65;
const R_RATIO_AP = 0.35;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const lowHP = p.extras.lowHP === 1;

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W
    const wHPPct = W_HP_PCT_BASE[wR - 1] + (p.ap * 0.01 * W_RATIO_AP_PCT);
    const wRaw = p.target.maxHP * wHPPct;
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + (p.ap * E_RATIO_AP);
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R (Double damage below 40% HP)
    const rBaseRaw = R_BASE[rR - 1] + (p.bonusAD * R_RATIO_BONUS_AD) + (p.ap * R_RATIO_AP);
    const rRaw = lowHP ? rBaseRaw * 2.0 : rBaseRaw;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const rName = lowHP ? 'Living Artillery (R) — Cible < 40% PV (Doublé)' : 'Living Artillery (R) — Standard';

    return [
        { abilityId: 'Q', abilityName: 'Caustic Spittle (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Bio-Arcane Barrage (W) — dégâts PV max', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Void Ooze (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: rName, rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('KogMaw', {
    name: "Kog'Maw",
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Caustic Spittle', maxRank: 5 },
        { key: 'w', label: 'W — Bio-Arcane Barrage', maxRank: 5 },
        { key: 'e', label: 'E — Void Ooze', maxRank: 5 },
        { key: 'r', label: 'R — Living Artillery', maxRank: 3 },
        { key: 'lowHP', label: 'R — Cible < 40% PV', maxRank: 1, extraParam: { label: 'Moins de 40% PV (0/1)', min: 0, max: 1, default: 0 } },
    ],
});
