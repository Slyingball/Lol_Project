/**
 * Bel'Veth — The Empress of the Void
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Q — Void Surge: 10/15/20/25/30 + 110% total AD (physical, 4 dashes)
const Q_BASE = [10, 15, 20, 25, 30];

// W — Above and Below: 70/110/150/190/230 + 100% bonus AD + 125% AP (magic, knockup)
const W_BASE = [70, 110, 150, 190, 230];

// E — Royal Maelstrom: 8/11/14/17/20 + 6/7/8/9/10% missing HP per hit (physical, rapid)
const E_BASE = [8, 11, 14, 17, 20];
const E_MISSING_RATIO = [0.06, 0.07, 0.08, 0.09, 0.10];

// R — Endless Banquet: True Form (no direct damage, buffs)

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));

    // Q per dash
    const qRaw = Q_BASE[qR - 1] + 1.10 * p.totalAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + p.bonusAD + 1.25 * p.ap;
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E per hit
    const missingHP = p.target.maxHP - p.target.currentHP;
    const eHitRaw = E_BASE[eR - 1] + E_MISSING_RATIO[eR - 1] * missingHP;
    const eHit = calculatePhysicalDamage(eHitRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Void Surge (Q) — par dash', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage, hits: 4, totalFinalDamage: q.finalDamage * 4 },
        { abilityId: 'W', abilityName: 'Above and Below (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Royal Maelstrom (E) — par hit', rank: eR, damageType: 'physical', rawDamage: eHit.rawDamage, finalDamage: eHit.finalDamage },
    ];
}

registerChampion('Belveth', {
    name: "Bel'Veth",
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Void Surge', maxRank: 5 },
        { key: 'w', label: 'W — Above and Below', maxRank: 5 },
        { key: 'e', label: 'E — Royal Maelstrom', maxRank: 5 },
    ],
});
