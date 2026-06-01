import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateTrueDamage } from '../damageCalculator';

// Q — Queen's Wrath (Bonus per hit, up to 3 hits)
const Q_BASE = [21, 27, 33, 39, 45];
const Q_RATIO_BONUS_AD = 0.5;

// E — Furious Bite
const E_BASE = [70, 85, 100, 115, 130];
const E_RATIO_BONUS_AD = 1.0;

// R — Void Rush
const R_BASE = [150, 300, 450];
const R_RATIO_BONUS_AD = 1.75;
const R_RATIO_MISSING_HP = [0.2, 0.25, 0.3];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const maxFury = p.extras.maxFury === 1;

    // Q (per auto)
    const qRaw = Q_BASE[qR - 1] + (p.bonusAD * Q_RATIO_BONUS_AD);
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E (Double damage and True damage type if Max Fury)
    const eRawStandard = E_BASE[eR - 1] + (p.bonusAD * E_RATIO_BONUS_AD);
    const eRaw = maxFury ? eRawStandard * 2.0 : eRawStandard;
    const e = maxFury
        ? calculateTrueDamage(eRaw)
        : calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R
    const missingHP = p.target.maxHP - p.target.currentHP;
    const rRaw = R_BASE[rR - 1] + (p.bonusAD * R_RATIO_BONUS_AD) + (missingHP * R_RATIO_MISSING_HP[rR - 1]);
    const r = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const eName = maxFury ? 'Furious Bite (E) — Fureur Max (×2 Brut)' : 'Furious Bite (E) — Fureur Standard';

    return [
        { abilityId: 'Q_single', abilityName: 'Queen\'s Wrath (Q) — par coup', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'Q_total', abilityName: 'Queen\'s Wrath (Q) — Total (3 coups)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage * 3, finalDamage: q.finalDamage * 3, hits: 3, totalFinalDamage: q.finalDamage * 3 },
        { abilityId: 'E', abilityName: eName, rank: eR, damageType: maxFury ? 'true' : 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Void Rush (R) — coup de grâce', rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Reksai', {
    name: "Rek'Sai",
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Queen\'s Wrath', maxRank: 5 },
        { key: 'e', label: 'E — Furious Bite', maxRank: 5 },
        { key: 'maxFury', label: 'E — Fureur au Max', maxRank: 1, extraParam: { label: 'Fureur Max (0/1)', min: 0, max: 1, default: 0 } },
        { key: 'r', label: 'R — Void Rush', maxRank: 3 },
    ],
});
