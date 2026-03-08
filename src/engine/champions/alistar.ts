/**
 * Alistar — The Minotaur
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Passive — Triumphant Roar: heals nearby allies (no damage)

// Q — Pulverize: 60/100/140/180/220 + 50% AP (magic, AoE knockup)
const Q_BASE = [60, 100, 140, 180, 220];

// W — Headbutt: 55/110/165/220/275 + 70% AP (magic, knockback)
const W_BASE = [55, 110, 165, 220, 275];

// E — Trample: 80/110/140/170/200 + 40% AP (magic, over 5s, stun at 5 stacks)
const E_BASE = [80, 110, 140, 170, 200];

// R — Unbreakable Will: damage reduction 55/65/75% (no damage)
const R_REDUCTION = [55, 65, 75];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q
    const qRaw = Q_BASE[qR - 1] + 0.50 * p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + 0.70 * p.ap;
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E (total damage over duration)
    const eRaw = E_BASE[eR - 1] + 0.40 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W+Q combo (instant burst)
    const comboRaw = qRaw + wRaw;
    const combo = calculateMagicDamage(comboRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Pulverize (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Headbutt (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Trample (E) — total', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'WQ', abilityName: 'Combo W+Q', rank: 0, damageType: 'magic', rawDamage: combo.rawDamage, finalDamage: combo.finalDamage },
        { abilityId: 'R', abilityName: `Unbreakable Will (R) — ${R_REDUCTION[rR - 1]}% réduction`, rank: rR, damageType: 'physical', rawDamage: 0, finalDamage: 0 },
    ];
}

registerChampion('Alistar', {
    name: 'Alistar',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Pulverize', maxRank: 5 },
        { key: 'w', label: 'W — Headbutt', maxRank: 5 },
        { key: 'e', label: 'E — Trample', maxRank: 5 },
        { key: 'r', label: 'R — Unbreakable Will', maxRank: 3 },
    ],
});
