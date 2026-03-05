/**
 * Ahri — The Nine-Tailed Fox
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage, calculateTrueDamage } from '../damageCalculator';

// Q — Orb of Deception: 40/65/90/115/140 + 45% AP (out) = magic, return = true
const Q_BASE = [40, 65, 90, 115, 140];

// W — Fox-Fire: 50/75/100/125/150 + 30% AP per fox-fire (3 fires)
const W_BASE = [50, 75, 100, 125, 150];

// E — Charm: 80/110/140/170/200 + 60% AP (magic)
const E_BASE = [80, 110, 140, 170, 200];

// R — Spirit Rush: 60/90/120 + 35% AP per dash (3 dashes)
const R_BASE = [60, 90, 120];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q out (magic)
    const qOutRaw = Q_BASE[qR - 1] + 0.45 * p.ap;
    const qOut = calculateMagicDamage(qOutRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Q return (true damage)
    const qReturnRaw = Q_BASE[qR - 1] + 0.45 * p.ap;
    const qReturn = calculateTrueDamage(qReturnRaw);

    // W (single fire)
    const wSingleRaw = W_BASE[wR - 1] + 0.30 * p.ap;
    const wSingle = calculateMagicDamage(wSingleRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + 0.60 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R per dash
    const rDashRaw = R_BASE[rR - 1] + 0.35 * p.ap;
    const rDash = calculateMagicDamage(rDashRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q_out', abilityName: 'Orb of Deception (Q) — aller', rank: qR, damageType: 'magic', rawDamage: qOut.rawDamage, finalDamage: qOut.finalDamage },
        { abilityId: 'Q_return', abilityName: 'Orb of Deception (Q) — retour', rank: qR, damageType: 'true', rawDamage: qReturn.rawDamage, finalDamage: qReturn.finalDamage },
        { abilityId: 'W', abilityName: 'Fox-Fire (W) — par feu', rank: wR, damageType: 'magic', rawDamage: wSingle.rawDamage, finalDamage: wSingle.finalDamage, hits: 3, totalFinalDamage: wSingle.finalDamage * 3 },
        { abilityId: 'E', abilityName: 'Charm (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Spirit Rush (R) — par dash', rank: rR, damageType: 'magic', rawDamage: rDash.rawDamage, finalDamage: rDash.finalDamage, hits: 3, totalFinalDamage: rDash.finalDamage * 3 },
    ];
}

registerChampion('Ahri', {
    name: 'Ahri',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Orb of Deception', maxRank: 5 },
        { key: 'w', label: 'W — Fox-Fire', maxRank: 5 },
        { key: 'e', label: 'E — Charm', maxRank: 5 },
        { key: 'r', label: 'R — Spirit Rush', maxRank: 3 },
    ],
});
