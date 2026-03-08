/**
 * Cho'Gath — The Terror of the Void
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage, calculateTrueDamage } from '../damageCalculator';

// Q — Rupture: 80/135/190/245/300 + 100% AP (magic, knockup)
const Q_BASE = [80, 135, 190, 245, 300];

// W — Feral Scream: 75/125/175/225/275 + 70% AP (magic, silence)
const W_BASE = [75, 125, 175, 225, 275];

// E — Vorpal Spikes: 22/37/52/67/82 + 30% AP + 3% target max HP (magic, on-hit)
const E_BASE = [22, 37, 52, 67, 82];

// R — Feast: 300/475/650 + 50% AP + 10% bonus HP (true damage, execute)
const R_BASE = [300, 475, 650];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const qRaw = Q_BASE[qR - 1] + p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const wRaw = W_BASE[wR - 1] + 0.70 * p.ap;
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E on-hit
    const eRaw = E_BASE[eR - 1] + 0.30 * p.ap + 0.03 * p.target.maxHP;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R (true damage) — bonus HP approximated at 1000 for a fed Cho
    const bonusHP = 1000;
    const rRaw = R_BASE[rR - 1] + 0.50 * p.ap + 0.10 * bonusHP;
    const r = calculateTrueDamage(rRaw);

    return [
        { abilityId: 'Q', abilityName: 'Rupture (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Feral Scream (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Vorpal Spikes (E) — on-hit', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Feast (R) — true', rank: rR, damageType: 'true', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Chogath', {
    name: "Cho'Gath",
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Rupture', maxRank: 5 },
        { key: 'w', label: 'W — Feral Scream', maxRank: 5 },
        { key: 'e', label: 'E — Vorpal Spikes', maxRank: 5 },
        { key: 'r', label: 'R — Feast', maxRank: 3 },
    ],
});
