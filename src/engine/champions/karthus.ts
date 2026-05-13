import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Lay Waste
const Q_BASE = [45, 62.5, 80, 97.5, 115];
const Q_RATIO_AP = 0.35;

// E — Defile (Par seconde)
const E_BASE = [30, 50, 70, 90, 110];
const E_RATIO_AP = 0.2;

// R — Requiem
const R_BASE = [200, 350, 500];
const R_RATIO_AP = 0.75;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));
    
    const isIsolated = p.extras.isolated ?? true; // Dégâts doublés si vrai

    // Q
    const qRawBase = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    const qRaw = isIsolated ? qRawBase * 2 : qRawBase;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + (p.ap * E_RATIO_AP);
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R
    const rRaw = R_BASE[rR - 1] + (p.ap * R_RATIO_AP);
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: `Lay Waste (Q) — ${isIsolated ? 'Isolé (Double)' : 'AoE'}`, rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E', abilityName: 'Defile (E) — par sec', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Requiem (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Karthus', {
    name: 'Karthus',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Lay Waste', maxRank: 5 },
        { key: 'e', label: 'E — Defile', maxRank: 5 },
        { key: 'r', label: 'R — Requiem', maxRank: 3 },
    ],
});