/**
 * Braum — The Heart of the Freljord
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Passive — Concussive Blows: 4th hit stuns + 16-120 (by level) magic damage

// Q — Winter's Bite: 75/125/175/225/275 + 2.5% Braum max HP (magic, slow)
const Q_BASE = [75, 125, 175, 225, 275];

// W — Stand Behind Me: dash to ally (no damage)
// E — Unbreakable: shield wall (no damage)

// R — Glacial Fissure: 150/300/450 + 60% AP (magic, knockup line)
const R_BASE = [150, 300, 450];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive stun damage
    const passiveRaw = 16 + (120 - 16) * ((p.level - 1) / 17);
    const passive = calculateMagicDamage(passiveRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Q (2.5% Braum's max HP — approximated with target HP for now)
    const qRaw = Q_BASE[qR - 1] + 0.025 * 2000 + p.ap * 0; // Braum doesn't scale AP
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const rRaw = R_BASE[rR - 1] + 0.60 * p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'passive', abilityName: 'Concussive Blows (Passif) — stun', rank: 0, damageType: 'magic', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q', abilityName: "Winter's Bite (Q)", rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'R', abilityName: 'Glacial Fissure (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Braum', {
    name: 'Braum',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: "Q — Winter's Bite", maxRank: 5 },
        { key: 'r', label: 'R — Glacial Fissure', maxRank: 3 },
    ],
});
