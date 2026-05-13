/**
 * Jarvan IV — The Exemplar of Demacia
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Passive — Martial Cadence: first hit on a target deals 8% current HP bonus physical damage
//   (10s cooldown per target, max 400 vs monsters)
function passiveRaw(targetCurrentHP: number): number {
    return 0.08 * targetCurrentHP;
}

// Q — Dragon Strike: 80/120/160/200/240 + 130% bonus AD (physical, linear skillshot)
//   Knocks up on collision with E flag
const Q_BASE = [80, 120, 160, 200, 240];

// W — Golden Aegis: shield, no damage

// E — Demacian Standard: 60/90/120/150/180 + 80% bonus AD (magic, AoE)
//   Passive: +20/25/30/35/40 bonus AD
const E_BASE = [60, 90, 120, 150, 180];

// R — Cataclysm: 200/325/450 + 150% bonus AD (physical, AoE)
const R_BASE = [200, 325, 450];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive
    const passRaw = passiveRaw(p.target.currentHP);
    const passive = calculatePhysicalDamage(passRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q
    const qRaw = Q_BASE[qR - 1] + 1.30 * p.bonusAD;
    const q    = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E — flag drop
    const eRaw = E_BASE[eR - 1] + 0.80 * p.bonusAD;
    const e    = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E passive bonus AD (informational — shown as 0 damage entry)
    const eBonusAD = [20, 25, 30, 35, 40][eR - 1];

    // Q + E combo (knockup — flag must be placed first)
    const qeComboRaw = qRaw + eRaw;
    // Treated as mixed — show separately; combo label sums both hits conceptually
    const qeQ = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const qeE = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R
    const rRaw = R_BASE[rR - 1] + 1.50 * p.bonusAD;
    const r    = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'passive', abilityName: 'Martial Cadence (Passif) — 8% PV actuels',     rank: 0,  damageType: 'physical', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q',       abilityName: 'Dragon Strike (Q)',                              rank: qR, damageType: 'physical', rawDamage: q.rawDamage,       finalDamage: q.finalDamage },
        { abilityId: 'E',       abilityName: `Demacian Standard (E) — impact (+${eBonusAD} bonus AD passif)`, rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'QE_Q',    abilityName: 'Combo Q+E — Dragon Strike (physique)',          rank: qR, damageType: 'physical', rawDamage: qeQ.rawDamage,     finalDamage: qeQ.finalDamage },
        { abilityId: 'QE_E',    abilityName: 'Combo Q+E — Standard (magique)',                rank: eR, damageType: 'magic',    rawDamage: qeE.rawDamage,     finalDamage: qeE.finalDamage },
        { abilityId: 'R',       abilityName: 'Cataclysm (R)',                                 rank: rR, damageType: 'physical', rawDamage: r.rawDamage,       finalDamage: r.finalDamage },
    ];
}

registerChampion('JarvanIV', {
    name: 'Jarvan IV',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Dragon Strike',      maxRank: 5 },
        { key: 'e', label: 'E — Demacian Standard',  maxRank: 5 },
        { key: 'r', label: 'R — Cataclysm',          maxRank: 3 },
    ],
});