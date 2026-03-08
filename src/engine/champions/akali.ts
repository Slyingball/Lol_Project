/**
 * Akali — The Rogue Assassin
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage, calculatePhysicalDamage } from '../damageCalculator';

// Passive — Assassin's Mark: 35-182 (by level) + 55% bonus AD + 60% AP (magic)
function passiveDmg(level: number, bonusAD: number, ap: number): number {
    return 35 + (182 - 35) * ((level - 1) / 17) + 0.55 * bonusAD + 0.60 * ap;
}

// Q — Five Point Strike: 45/70/95/120/145 + 60% total AD + 60% AP (magic)
const Q_BASE = [45, 70, 95, 120, 145];

// E — Shuriken Flip: E1: 30/56/82/108/134 + 25.5% AD (physical)
//                     E2: 70/120/170/220/270 + 80% AP (magic)
const E1_BASE = [30, 56, 82, 108, 134];
const E2_BASE = [70, 120, 170, 220, 270];

// R — Perfect Execution: R1: 80/220/360 + 50% bonus AD + 30% AP (physical)
//                         R2: 80/220/360 + 50% bonus AD + 30% AP (magic) — scales with missing HP
const R1_BASE = [80, 220, 360];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive
    const pRaw = passiveDmg(p.level, p.bonusAD, p.ap);
    const passive = calculateMagicDamage(pRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Q
    const qRaw = Q_BASE[qR - 1] + 0.60 * p.totalAD + 0.60 * p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E1 (physical)
    const e1Raw = E1_BASE[eR - 1] + 0.255 * p.totalAD;
    const e1 = calculatePhysicalDamage(e1Raw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E2 (magic)
    const e2Raw = E2_BASE[eR - 1] + 0.80 * p.ap;
    const e2 = calculateMagicDamage(e2Raw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R1 (physical)
    const r1Raw = R1_BASE[rR - 1] + 0.50 * p.bonusAD + 0.30 * p.ap;
    const r1 = calculatePhysicalDamage(r1Raw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R2 (magic, min damage = same base, max = ×3 at low HP)
    const missingHPRatio = 1 - (p.target.currentHP / p.target.maxHP);
    const r2Multiplier = 1 + 2 * missingHPRatio; // scales up to ×3
    const r2Raw = (R1_BASE[rR - 1] + 0.50 * p.bonusAD + 0.30 * p.ap) * r2Multiplier;
    const r2 = calculateMagicDamage(r2Raw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'passive', abilityName: "Assassin's Mark (Passif)", rank: 0, damageType: 'magic', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q', abilityName: 'Five Point Strike (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E1', abilityName: 'Shuriken Flip (E1)', rank: eR, damageType: 'physical', rawDamage: e1.rawDamage, finalDamage: e1.finalDamage },
        { abilityId: 'E2', abilityName: 'Shuriken Flip (E2)', rank: eR, damageType: 'magic', rawDamage: e2.rawDamage, finalDamage: e2.finalDamage },
        { abilityId: 'R1', abilityName: 'Perfect Execution (R1)', rank: rR, damageType: 'physical', rawDamage: r1.rawDamage, finalDamage: r1.finalDamage },
        { abilityId: 'R2', abilityName: `Perfect Execution (R2) — ${Math.round(missingHPRatio * 100)}% HP manq.`, rank: rR, damageType: 'magic', rawDamage: r2.rawDamage, finalDamage: r2.finalDamage },
    ];
}

registerChampion('Akali', {
    name: 'Akali',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Five Point Strike', maxRank: 5 },
        { key: 'e', label: 'E — Shuriken Flip', maxRank: 5 },
        { key: 'r', label: 'R — Perfect Execution', maxRank: 3 },
    ],
});
