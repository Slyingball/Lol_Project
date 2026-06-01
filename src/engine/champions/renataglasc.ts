import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Handshake
const Q_BASE = [80, 125, 170, 215, 260];
const Q_RATIO_AP = 0.8;

// E — Loyalty Program
const E_BASE = [65, 95, 125, 155, 185];
const E_RATIO_AP = 0.55;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));

    // Q (First latch and second throw deal same damage)
    const qRaw = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + (p.ap * E_RATIO_AP);
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q_latch', abilityName: 'Handshake (Q) — projectile initial', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'Q_throw', abilityName: 'Handshake (Q) — projection (Total)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage * 2, finalDamage: q.finalDamage * 2, hits: 2, totalFinalDamage: q.finalDamage * 2 },
        { abilityId: 'E', abilityName: 'Loyalty Program (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
    ];
}

registerChampion('RenataGlasc', {
    name: 'Renata Glasc',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Handshake', maxRank: 5 },
        { key: 'e', label: 'E — Loyalty Program', maxRank: 5 },
    ],
});
