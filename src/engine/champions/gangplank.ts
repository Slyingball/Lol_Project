/**
 * Gangplank — The Saltwater Scourge
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateTrueDamage } from '../damageCalculator';

// Passive — Trial by Fire: every 15s → next auto deals 65-310 (by level) + 100% bonus AD bonus true damage
function passiveTrueDmg(level: number, bonusAD: number): number {
    return 65 + (310 - 65) * ((level - 1) / 17) + 1.00 * bonusAD;
}

// Q — Parrrley: 20/45/70/95/120 + 100% total AD (physical, applies on-hit, can crit)
const Q_BASE = [20, 45, 70, 95, 120];

// W — Remove Scurvy: heals (no damage)

// E — Powder Keg: stored barrel detonation
//   First barrel:   80/130/180/230/280 + 100% bonus AD (physical, AoE)
//   Each add. barrel adds 50% of Q damage
// Simplified: model the primary barrel explosion from Q trigger
const E_BASE = [80, 130, 180, 230, 280];

// R — Cannon Barrage: 75/100/125 per cannonball + 5% per upgrade (magic, AoE, ~6 cannonballs avg)
//   Upgrades: Death's Daughter (+100% dmg first ball), Raise Morale (+20% slow),
//             Fire at Will (+3 cannonballs) — modelled as base without upgrades
const R_BASE = [75, 100, 125]; // per cannonball
const R_AVG_BALLS = 6;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive — true damage (no mitigation)
    const passiveRaw = passiveTrueDmg(p.level, p.bonusAD);
    const passive = calculateTrueDamage(passiveRaw);

    // Q (physical, can crit — base value without crit)
    const qRaw = Q_BASE[qR - 1] + 1.00 * p.totalAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q with crit (×1.75 by default with Infinity Edge interactions — simplified ×1.75)
    const qCritRaw = qRaw * 1.75;
    const qCrit = calculatePhysicalDamage(qCritRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E — barrel explosion (physical, AoE)
    const eRaw = E_BASE[eR - 1] + 1.00 * p.bonusAD;
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E triggered by Q (Q damage + barrel explosion)
    const eQComboRaw = qRaw + eRaw;
    const eQCombo = calculatePhysicalDamage(eQComboRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R — per cannonball (physical, not magic despite being a barrage — modelled physical)
    const rBallRaw = R_BASE[rR - 1] + 0.05 * p.totalAD; // minor AD scaling per ball
    const rBall = calculatePhysicalDamage(rBallRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'passive',   abilityName: 'Trial by Fire (Passif)',                 rank: 0,  damageType: 'true',     rawDamage: passive.rawDamage,     finalDamage: passive.finalDamage },
        { abilityId: 'Q',         abilityName: 'Parrrley (Q)',                            rank: qR, damageType: 'physical', rawDamage: q.rawDamage,           finalDamage: q.finalDamage },
        { abilityId: 'Q_crit',    abilityName: 'Parrrley (Q) — coup critique (×1.75)',   rank: qR, damageType: 'physical', rawDamage: qCrit.rawDamage,       finalDamage: qCrit.finalDamage },
        { abilityId: 'E',         abilityName: 'Powder Keg (E) — explosion',              rank: eR, damageType: 'physical', rawDamage: e.rawDamage,           finalDamage: e.finalDamage },
        { abilityId: 'Q_E',       abilityName: 'Q + Powder Keg (combo)',                  rank: qR, damageType: 'physical', rawDamage: eQCombo.rawDamage,     finalDamage: eQCombo.finalDamage },
        { abilityId: 'R_ball',    abilityName: 'Cannon Barrage (R) — par boulet',         rank: rR, damageType: 'physical', rawDamage: rBall.rawDamage,       finalDamage: rBall.finalDamage, hits: R_AVG_BALLS, totalFinalDamage: rBall.finalDamage * R_AVG_BALLS },
    ];
}

registerChampion('Gangplank', {
    name: 'Gangplank',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Parrrley',        maxRank: 5 },
        { key: 'e', label: 'E — Powder Keg',      maxRank: 5 },
        { key: 'r', label: 'R — Cannon Barrage',  maxRank: 3 },
    ],
});