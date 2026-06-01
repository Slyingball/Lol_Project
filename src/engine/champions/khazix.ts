import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Q — Taste Their Fear
const Q_BASE = [80, 105, 130, 155, 180];
const Q_RATIO_BONUS_AD = 1.15;

// W — Void Spike
const W_BASE = [95, 125, 155, 185, 215];
const W_RATIO_BONUS_AD = 1.0;

// E — Leap
const E_BASE = [65, 100, 135, 170, 205];
const E_RATIO_BONUS_AD = 0.2;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));

    const isolated = p.extras.isolated === 1;

    // Q standard
    const qRawStandard = Q_BASE[qR - 1] + (p.bonusAD * Q_RATIO_BONUS_AD);
    const qRaw = isolated ? qRawStandard * 2.1 : qRawStandard;

    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + (p.bonusAD * W_RATIO_BONUS_AD);
    const w = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + (p.bonusAD * E_RATIO_BONUS_AD);
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const qName = isolated ? 'Taste Their Fear (Q) — Cible Isolée (×2.1)' : 'Taste Their Fear (Q) — Standard';

    return [
        { abilityId: 'Q', abilityName: qName, rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Void Spike (W)', rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Leap (E)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
    ];
}

registerChampion('Khazix', {
    name: "Kha'Zix",
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Taste Their Fear', maxRank: 5 },
        { key: 'isolated', label: 'Q — Cible Isolée', maxRank: 1, extraParam: { label: 'Isolé (0/1)', min: 0, max: 1, default: 0 } },
        { key: 'w', label: 'W — Void Spike', maxRank: 5 },
        { key: 'e', label: 'E — Leap', maxRank: 5 },
    ],
});
