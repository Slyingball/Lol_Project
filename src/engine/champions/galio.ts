/**
 * Galio — The Colossus
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Passive — Colossal Smash: 15-200 (by level) + 100% AD + 60% AP (magic, AoE)
function passiveDmg(level: number, totalAD: number, ap: number): number {
    return 15 + (200 - 15) * ((level - 1) / 17) + totalAD + 0.60 * ap;
}

// Q — Winds of War: 70/105/140/175/210 + 75% AP (initial)
//   + tornado: 6% (+4% per 100 AP) of target max HP over 2s
const Q_BASE = [70, 105, 140, 175, 210];

// W — Shield of Durand: channel → taunt; no direct damage
// (passive: anti-magic shield)

// E — Justice Punch: 90/130/170/210/250 + 90% AP
const E_BASE = [90, 130, 170, 210, 250];

// R — Hero's Entrance: 150/250/350 + 70% AP (magic) on landing
const R_BASE = [150, 250, 350];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive
    const pRaw = passiveDmg(p.level, p.totalAD, p.ap);
    const passive = calculateMagicDamage(pRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Q initial hit
    const qRaw = Q_BASE[qR - 1] + 0.75 * p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Q tornado (% max HP)
    const tornadoRatio = 0.06 + 0.04 * (p.ap / 100);
    const qTornadoRaw = tornadoRatio * p.target.maxHP;
    const qTornado = calculateMagicDamage(qTornadoRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + 0.90 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R
    const rRaw = R_BASE[rR - 1] + 0.70 * p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'passive', abilityName: 'Colossal Smash (Passif)', rank: 0, damageType: 'magic', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q', abilityName: 'Winds of War (Q) — impact', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'Q_tornado', abilityName: 'Winds of War (Q) — tornade', rank: qR, damageType: 'magic', rawDamage: qTornado.rawDamage, finalDamage: qTornado.finalDamage },
        { abilityId: 'E', abilityName: 'Justice Punch (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: "Hero's Entrance (R)", rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Galio', {
    name: 'Galio',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Winds of War', maxRank: 5 },
        { key: 'e', label: 'E — Justice Punch', maxRank: 5 },
        { key: 'r', label: "R — Hero's Entrance", maxRank: 3 },
    ],
});
