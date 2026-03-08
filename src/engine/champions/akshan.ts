/**
 * Akshan — The Rogue Sentinel
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Passive — Dirty Fighting: every 3rd hit deals 10-165 (by level) bonus magic damage
function passiveOnHit(level: number): number {
    return 10 + (165 - 10) * ((level - 1) / 17);
}

// Q — Avengerang: 5/25/45/65/85 + 80% total AD (physical, extends on hit)
const Q_BASE = [5, 25, 45, 65, 85];

// E — Heroic Swing: 30/45/60/75/90 + 17.5% bonus AD per shot (physical, fires multiple shots)
const E_BASE = [30, 45, 60, 75, 90];
const E_SHOTS = 5; // approximate shots in full swing

// R — Comeuppance: stores bullets → 20/25/30 + 10% total AD per bullet (physical)
//   min 5 bullets, max ~15-20 (scales with attack speed)
const R_PER_BULLET = [20, 25, 30];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive
    const pRaw = passiveOnHit(p.level);
    const passive = calculateMagicDamage(pRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Q (hits twice going + coming)
    const qRaw = Q_BASE[qR - 1] + 0.80 * p.totalAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E per shot
    const ePerShotRaw = E_BASE[eR - 1] + 0.175 * p.bonusAD;
    const ePerShot = calculatePhysicalDamage(ePerShotRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R per bullet (min 5)
    const rBulletRaw = R_PER_BULLET[rR - 1] + 0.10 * p.totalAD;
    const rBullet = calculatePhysicalDamage(rBulletRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'passive', abilityName: 'Dirty Fighting (Passif) — 3e coup', rank: 0, damageType: 'magic', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q', abilityName: 'Avengerang (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E', abilityName: 'Heroic Swing (E) — par tir', rank: eR, damageType: 'physical', rawDamage: ePerShot.rawDamage, finalDamage: ePerShot.finalDamage, hits: E_SHOTS, totalFinalDamage: ePerShot.finalDamage * E_SHOTS },
        { abilityId: 'R', abilityName: 'Comeuppance (R) — par balle', rank: rR, damageType: 'physical', rawDamage: rBullet.rawDamage, finalDamage: rBullet.finalDamage, hits: 5, totalFinalDamage: rBullet.finalDamage * 5 },
    ];
}

registerChampion('Akshan', {
    name: 'Akshan',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Avengerang', maxRank: 5 },
        { key: 'e', label: 'E — Heroic Swing', maxRank: 5 },
        { key: 'r', label: 'R — Comeuppance', maxRank: 3 },
    ],
});
