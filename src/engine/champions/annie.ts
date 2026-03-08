/**
 * Annie — The Dark Child
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Disintegrate: 70/100/130/160/190 + 80% AP (magic, targeted)
const Q_BASE = [70, 100, 130, 160, 190];

// W — Incinerate: 70/115/160/205/250 + 85% AP (magic, AoE cone)
const W_BASE = [70, 115, 160, 205, 250];

// E — Molten Shield: 30/45/60/75/90 + 40% AP (magic, touch damage)
const E_BASE = [30, 45, 60, 75, 90];

// R — Summon: Tibbers: 150/275/400 + 75% AP (magic, initial burst)
//   Tibbers aura: 20/30/40 + 12% AP per second
const R_BASE = [150, 275, 400];
const R_AURA = [20, 30, 40];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const qRaw = Q_BASE[qR - 1] + 0.80 * p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const wRaw = W_BASE[wR - 1] + 0.85 * p.ap;
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const eRaw = E_BASE[eR - 1] + 0.40 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const rRaw = R_BASE[rR - 1] + 0.75 * p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Tibbers aura per second
    const rAuraRaw = R_AURA[rR - 1] + 0.12 * p.ap;
    const rAura = calculateMagicDamage(rAuraRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Full combo: Q + W + R
    const comboRaw = qRaw + wRaw + rRaw;
    const combo = calculateMagicDamage(comboRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Disintegrate (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Incinerate (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Molten Shield (E) — toucher', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Summon: Tibbers (R) — burst', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
        { abilityId: 'R_aura', abilityName: 'Tibbers aura — par seconde', rank: rR, damageType: 'magic', rawDamage: rAura.rawDamage, finalDamage: rAura.finalDamage },
        { abilityId: 'combo', abilityName: 'Full combo Q+W+R', rank: 0, damageType: 'magic', rawDamage: combo.rawDamage, finalDamage: combo.finalDamage },
    ];
}

registerChampion('Annie', {
    name: 'Annie',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Disintegrate', maxRank: 5 },
        { key: 'w', label: 'W — Incinerate', maxRank: 5 },
        { key: 'e', label: 'E — Molten Shield', maxRank: 5 },
        { key: 'r', label: 'R — Summon: Tibbers', maxRank: 3 },
    ],
});
