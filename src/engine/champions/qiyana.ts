import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Q — Edge of Ixtal (Standard)
const Q_BASE = [50, 85, 120, 155, 190];
const Q_RATIO_BONUS_AD = 0.75;

// Q — Elemental Wrath (Brush/Grass/Ice element active)
const Q_ELEMENT_BASE = [80, 120, 160, 200, 240];
const Q_ELEMENT_RATIO_BONUS_AD = 1.2;

// E — Audacity
const E_BASE = [50, 80, 110, 140, 170];
const E_RATIO_BONUS_AD = 0.5;

// R — Supreme Display of Talent
const R_BASE = [100, 200, 300];
const R_RATIO_BONUS_AD = 1.7;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const elementActive = p.extras.elementActive === 1;

    // Q Standard
    const qRaw = Q_BASE[qR - 1] + (p.bonusAD * Q_RATIO_BONUS_AD);
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q Elemental
    const qElementRaw = Q_ELEMENT_BASE[qR - 1] + (p.bonusAD * Q_ELEMENT_RATIO_BONUS_AD);
    const qElement = calculatePhysicalDamage(qElementRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + (p.bonusAD * E_RATIO_BONUS_AD);
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R (Wall shockwave / River / Brush eruption deals same damage)
    const rRawSingle = R_BASE[rR - 1] + (p.bonusAD * R_RATIO_BONUS_AD);
    const rSingle = calculatePhysicalDamage(rRawSingle, p.target, p.armorPenPercent, p.armorPenFlat);
    const rTotalRaw = rRawSingle * 2;
    const rTotal = calculatePhysicalDamage(rTotalRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const qName = elementActive ? 'Elemental Wrath (Q) — Élément Actif' : 'Edge of Ixtal (Q) — Sans élément';

    return [
        { abilityId: 'Q', abilityName: qName, rank: qR, damageType: 'physical', rawDamage: elementActive ? qElement.rawDamage : q.rawDamage, finalDamage: elementActive ? qElement.finalDamage : q.finalDamage },
        { abilityId: 'Q_std', abilityName: 'Edge of Ixtal (Q) — Standard', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'Q_elem', abilityName: 'Elemental Wrath (Q) — Élémentaire', rank: qR, damageType: 'physical', rawDamage: qElement.rawDamage, finalDamage: qElement.finalDamage },
        { abilityId: 'E', abilityName: 'Audacity (E)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R_single', abilityName: 'Supreme Display (R) — onde de choc initiale', rank: rR, damageType: 'physical', rawDamage: rSingle.rawDamage, finalDamage: rSingle.finalDamage },
        { abilityId: 'R_total', abilityName: 'Supreme Display (R) — Total (onde + explosion mur)', rank: rR, damageType: 'physical', rawDamage: rTotal.rawDamage, finalDamage: rTotal.finalDamage, hits: 2, totalFinalDamage: rSingle.finalDamage * 2 },
    ];
}

registerChampion('Qiyana', {
    name: 'Qiyana',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Edge of Ixtal', maxRank: 5 },
        { key: 'elementActive', label: 'Q — Élément actif', maxRank: 1, extraParam: { label: 'Élément actif (0/1)', min: 0, max: 1, default: 1 } },
        { key: 'e', label: 'E — Audacity', maxRank: 5 },
        { key: 'r', label: 'R — Supreme Display', maxRank: 3 },
    ],
});
