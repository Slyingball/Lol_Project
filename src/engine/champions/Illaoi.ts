/**
 * Illaoi — The Kraken Priestess
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Passive — Prophet of an Elder God: spawns tentacles periodically; tentacle slam
//   Tentacle slam: 10-162 (by level) + 120% total AD (physical)
function passiveTentacleRaw(level: number, totalAD: number): number {
    return 10 + (162 - 10) * ((level - 1) / 17) + 1.20 * totalAD;
}

// Q — Tentacle Smash: 20/60/100/140/180 + 120% total AD (physical)
const Q_BASE = [20, 60, 100, 140, 180];

// W — Harsh Lesson: empowered auto — 4/4.5/5/5.5/6% target max HP + 100% total AD (physical)
//   Also triggers all nearby tentacles to slam
const W_HP_PERCENT = [0.04, 0.045, 0.05, 0.055, 0.06];

// E — Test of Spirit: 80/120/160/200/240 + 30% AP (magic, extracts spirit/vessel)
//   Vessel takes 12/14/16/18/20% more damage from Illaoi's abilities
const E_BASE = [80, 120, 160, 200, 240];

// R — Leap of Faith: 160/220/280 + 120% total AD (physical, AoE)
//   Spawns 1 tentacle per champion hit (max 5)
const R_BASE = [160, 220, 280];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive — tentacle slam
    const passRaw = passiveTentacleRaw(p.level, p.totalAD);
    const passive = calculatePhysicalDamage(passRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q
    const qRaw = Q_BASE[qR - 1] + 1.20 * p.totalAD;
    const q    = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W — empowered auto (% max HP + base AD)
    const wHpRaw  = W_HP_PERCENT[wR - 1] * p.target.maxHP;
    const wAdRaw  = 1.00 * p.totalAD;
    const wRaw    = wHpRaw + wAdRaw;
    const w       = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W + 1 tentacle triggered (common scenario)
    const wPlusTentRaw = wRaw + passRaw;
    const wPlusTent    = calculatePhysicalDamage(wPlusTentRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E — spirit extraction hit
    const eRaw = E_BASE[eR - 1] + 0.30 * p.ap;
    const e    = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R — AoE slam
    const rRaw = R_BASE[rR - 1] + 1.20 * p.totalAD;
    const r    = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R + 1 tentacle per hit (minimum single champion)
    const rPlusTentRaw = rRaw + passRaw;
    const rPlusTent    = calculatePhysicalDamage(rPlusTentRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'passive',       abilityName: 'Claque de Tentacule (Passif)',                       rank: 0,  damageType: 'physical', rawDamage: passive.rawDamage,    finalDamage: passive.finalDamage },
        { abilityId: 'Q',             abilityName: 'Tentacle Smash (Q)',                                 rank: qR, damageType: 'physical', rawDamage: q.rawDamage,          finalDamage: q.finalDamage },
        { abilityId: 'W',             abilityName: `Harsh Lesson (W) — auto (${Math.round(W_HP_PERCENT[wR - 1] * 100 * 10) / 10}% PV max)`, rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'W_tent',        abilityName: 'W + 1 tentacule déclenché',                          rank: wR, damageType: 'physical', rawDamage: wPlusTent.rawDamage,  finalDamage: wPlusTent.finalDamage },
        { abilityId: 'E',             abilityName: 'Test of Spirit (E) — extraction',                    rank: eR, damageType: 'magic',    rawDamage: e.rawDamage,          finalDamage: e.finalDamage },
        { abilityId: 'R',             abilityName: 'Leap of Faith (R) — impact AoE',                    rank: rR, damageType: 'physical', rawDamage: r.rawDamage,          finalDamage: r.finalDamage },
        { abilityId: 'R_tent',        abilityName: 'Leap of Faith (R) + 1 tentacule',                   rank: rR, damageType: 'physical', rawDamage: rPlusTent.rawDamage,  finalDamage: rPlusTent.finalDamage },
    ];
}

registerChampion('Illaoi', {
    name: 'Illaoi',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Tentacle Smash',  maxRank: 5 },
        { key: 'w', label: 'W — Harsh Lesson',    maxRank: 5 },
        { key: 'e', label: 'E — Test of Spirit',  maxRank: 5 },
        { key: 'r', label: 'R — Leap of Faith',   maxRank: 3 },
    ],
});