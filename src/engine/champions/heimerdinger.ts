/**
 * Heimerdinger — The Revered Inventor
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Passive — Hextech Affinity: nearby ally items grant him +15% movement speed (no damage)

// Q — H-28G Evolution Turret:
//   Turret beam (charged shot): 135/170/205/240/275 + 55% AP (magic)
//   Turret normal shot: 28/40/52/64/76 + 20% AP (magic) per bolt (up to 3 turrets)
const Q_BEAM_BASE   = [135, 170, 205, 240, 275];
const Q_NORMAL_BASE = [28,  40,  52,  64,  76];

// W — Hextech Micro-Rockets: 5 rockets, each deals 60/90/120/150/180 + 45% AP (magic)
//   Same champion hit by all 5: 200/280/360/440/520 + 130% AP (total combined — capped)
const W_PER_ROCKET_BASE = [60,  90,  120, 150, 180];
const W_FULL_BASE       = [200, 280, 360, 440, 520];

// E — CH-2 Electron Storm Grenade: 60/100/140/180/220 + 60% AP (magic, stun area)
const E_BASE = [60, 100, 140, 180, 220];

// R — UPGRADE!!!: empowers next Q / W / E
//   R+Q (UPGRADE turret beam): 375/550/725 + 150% AP (magic)
//   R+W (UPGRADE rockets): all 5 hit same target for 250/375/500 + 150% AP total
//   R+E (UPGRADE grenade): 150/250/350 + 80% AP (magic, larger AoE + knockup)
const RQ_BASE = [375, 550, 725];
const RW_BASE = [250, 375, 500]; // full 5-rocket hit
const RE_BASE = [150, 250, 350];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q — turret beam shot
    const qBeamRaw   = Q_BEAM_BASE[qR - 1] + 0.55 * p.ap;
    const qBeam      = calculateMagicDamage(qBeamRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Q — normal turret shot
    const qNormalRaw = Q_NORMAL_BASE[qR - 1] + 0.20 * p.ap;
    const qNormal    = calculateMagicDamage(qNormalRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W — per rocket
    const wPerRaw  = W_PER_ROCKET_BASE[wR - 1] + 0.45 * p.ap;
    const wPer     = calculateMagicDamage(wPerRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W — all 5 rockets on same target (capped)
    const wFullRaw = W_FULL_BASE[wR - 1] + 1.30 * p.ap;
    const wFull    = calculateMagicDamage(wFullRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + 0.60 * p.ap;
    const e    = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R+Q — upgraded turret beam
    const rqRaw = RQ_BASE[rR - 1] + 1.50 * p.ap;
    const rq    = calculateMagicDamage(rqRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R+W — upgraded full rockets
    const rwRaw = RW_BASE[rR - 1] + 1.50 * p.ap;
    const rw    = calculateMagicDamage(rwRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R+E — upgraded grenade
    const reRaw = RE_BASE[rR - 1] + 0.80 * p.ap;
    const re    = calculateMagicDamage(reRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q_beam',   abilityName: 'Tourelle (Q) — rayon chargé',              rank: qR, damageType: 'magic', rawDamage: qBeam.rawDamage,  finalDamage: qBeam.finalDamage },
        { abilityId: 'Q_normal', abilityName: 'Tourelle (Q) — tir normal',                rank: qR, damageType: 'magic', rawDamage: qNormal.rawDamage, finalDamage: qNormal.finalDamage },
        { abilityId: 'W_rocket', abilityName: 'Micro-Fusées (W) — par roquette',          rank: wR, damageType: 'magic', rawDamage: wPer.rawDamage,    finalDamage: wPer.finalDamage, hits: 5, totalFinalDamage: wPer.finalDamage * 5 },
        { abilityId: 'W_full',   abilityName: 'Micro-Fusées (W) — 5 roquettes sur cible', rank: wR, damageType: 'magic', rawDamage: wFull.rawDamage,   finalDamage: wFull.finalDamage },
        { abilityId: 'E',        abilityName: 'Grenade Électrique (E)',                    rank: eR, damageType: 'magic', rawDamage: e.rawDamage,       finalDamage: e.finalDamage },
        { abilityId: 'RQ',       abilityName: 'R+Q — Rayon de Tourelle AMÉLIORÉ',         rank: rR, damageType: 'magic', rawDamage: rq.rawDamage,      finalDamage: rq.finalDamage },
        { abilityId: 'RW',       abilityName: 'R+W — Micro-Fusées AMÉLIORÉES (toutes)',   rank: rR, damageType: 'magic', rawDamage: rw.rawDamage,      finalDamage: rw.finalDamage },
        { abilityId: 'RE',       abilityName: 'R+E — Grenade AMÉLIORÉE',                  rank: rR, damageType: 'magic', rawDamage: re.rawDamage,      finalDamage: re.finalDamage },
    ];
}

registerChampion('Heimerdinger', {
    name: 'Heimerdinger',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — H-28G Evolution Turret',       maxRank: 5 },
        { key: 'w', label: 'W — Hextech Micro-Rockets',         maxRank: 5 },
        { key: 'e', label: 'E — CH-2 Electron Storm Grenade',  maxRank: 5 },
        { key: 'r', label: 'R — UPGRADE!!!',                    maxRank: 3 },
    ],
});