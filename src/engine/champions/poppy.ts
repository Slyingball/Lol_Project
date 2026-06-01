import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Q — Hammer Shock
const Q_BASE = [40, 60, 80, 100, 120];
const Q_RATIO_BONUS_AD = 0.9;
const Q_RATIO_MAX_HP = 0.09;

// E — Heroic Charge
const E_BASE = [60, 80, 100, 120, 140];
const E_RATIO_BONUS_AD = 0.5;

// R — Keeper's Verdict
const R_BASE = [200, 300, 400];
const R_RATIO_BONUS_AD = 0.9;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q (First slam and second eruption deal same damage)
    const qSingleRaw = Q_BASE[qR - 1] + (p.bonusAD * Q_RATIO_BONUS_AD) + (p.target.maxHP * Q_RATIO_MAX_HP);
    const qSingle = calculatePhysicalDamage(qSingleRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const qTotalRaw = qSingleRaw * 2;
    const qTotal = calculatePhysicalDamage(qTotalRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E
    const eDashRaw = E_BASE[eR - 1] + (p.bonusAD * E_RATIO_BONUS_AD);
    const eDash = calculatePhysicalDamage(eDashRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const eWallRaw = eDashRaw * 2;
    const eWall = calculatePhysicalDamage(eWallRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R
    const rRaw = R_BASE[rR - 1] + (p.bonusAD * R_RATIO_BONUS_AD);
    const r = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q_single', abilityName: 'Hammer Shock (Q) — 1er coup/éruption', rank: qR, damageType: 'physical', rawDamage: qSingle.rawDamage, finalDamage: qSingle.finalDamage },
        { abilityId: 'Q_total', abilityName: 'Hammer Shock (Q) — Total (2 coups)', rank: qR, damageType: 'physical', rawDamage: qTotal.rawDamage, finalDamage: qTotal.finalDamage, hits: 2, totalFinalDamage: qSingle.finalDamage * 2 },
        { abilityId: 'E_dash', abilityName: 'Heroic Charge (E) — impact initial', rank: eR, damageType: 'physical', rawDamage: eDash.rawDamage, finalDamage: eDash.finalDamage },
        { abilityId: 'E_wall', abilityName: 'Heroic Charge (E) — collision mur (Total)', rank: eR, damageType: 'physical', rawDamage: eWall.rawDamage, finalDamage: eWall.finalDamage },
        { abilityId: 'R', abilityName: 'Keeper\'s Verdict (R)', rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Poppy', {
    name: 'Poppy',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Hammer Shock', maxRank: 5 },
        { key: 'e', label: 'E — Heroic Charge', maxRank: 5 },
        { key: 'r', label: 'R — Keeper\'s Verdict', maxRank: 3 },
    ],
});
