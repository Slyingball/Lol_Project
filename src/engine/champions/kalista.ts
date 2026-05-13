/**
 * Kalista — The Spear of Vengeance
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Passive — Martial Poise: Kalista dashes on every auto/Q cast (no damage scaling)

// Q — Pierce: 10/70/130/190/250 + 100% total AD (physical, skillshot)
//   Passes through and kills targets; applies Rend stacks
const Q_BASE = [10, 70, 130, 190, 250];

// W — Sentinel: 75/115/155/195/235 + 60% bonus AD (magic, soul mark on ally/structure hit)
//   Passive: soul sentinels patrol path (no direct damage)
const W_BASE = [75, 115, 155, 195, 235];

// E — Rend: pulls all Rend stacks from target (physical)
//   First spear: 20/30/40/50/60 + 60% bonus AD
//   Each additional spear: 5/8/11/14/17 + 20% bonus AD
//   The more stacks, the higher the damage
const E_FIRST_BASE = [20, 30, 40, 50, 60];
const E_EXTRA_BASE = [5,   8, 11, 14, 17];

// R — Fate's Call: pulls bound ally to Kalista (no direct damage from Kalista)
//   Ally then crashes like a projectile — damage done by the ally's crash, not Kalista

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));

    // Q — basic spear (physical)
    const qRaw = Q_BASE[qR - 1] + 1.00 * p.totalAD;
    const q    = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W — sentinel sentinel hit (magic)
    const wRaw = W_BASE[wR - 1] + 0.60 * p.bonusAD;
    const w    = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Helper for Rend damage
    const rendDmg = (stacks: number): number => {
        if (stacks <= 0) return 0;
        return (E_FIRST_BASE[eR - 1] + 0.60 * p.bonusAD)
             + Math.max(0, stacks - 1) * (E_EXTRA_BASE[eR - 1] + 0.20 * p.bonusAD);
    };

    const rendStacks = p.extras.rendStacks ?? 1;
    const rend = calculatePhysicalDamage(rendDmg(rendStacks), p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Pierce (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Sentinel (W) — impact sentinelle', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: `Rend (E) — ${rendStacks} lance${rendStacks > 1 ? 's' : ''}`, rank: eR, damageType: 'physical', rawDamage: rend.rawDamage, finalDamage: rend.finalDamage },
    ];
}

registerChampion('Kalista', {
    name: 'Kalista',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Pierce', maxRank: 5 },
        { key: 'w', label: 'W — Sentinel', maxRank: 5 },
        { key: 'e', label: 'E — Rend (Rang)', maxRank: 5 },
        { key: 'rendStacks', label: 'E — Lances Rend', maxRank: 1, extraParam: { label: 'Nombre de lances (E)', min: 1, max: 50, default: 1 } },
        { key: 'r', label: 'R — Fate\'s Call', maxRank: 3 },
    ],
});