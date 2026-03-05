/**
 * Lux — The Lady of Luminosity
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Passive — Illumination: 20-190 (by level) + 20% AP
function passiveDmg(level: number, ap: number): number {
    return 20 + (190 - 20) * ((level - 1) / 17) + 0.20 * ap;
}

// Q — Light Binding: 80/120/160/200/240 + 60% AP
const Q_BASE = [80, 120, 160, 200, 240];

// E — Lucent Singularity: 60/110/160/210/260 + 65% AP
const E_BASE = [60, 110, 160, 210, 260];

// R — Final Spark: 300/400/500 + 100% AP
const R_BASE = [300, 400, 500];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const passive = passiveDmg(p.level, p.ap);
    const passiveResult = calculateMagicDamage(passive, p.target, p.magicPenPercent, p.magicPenFlat);

    const qRaw = Q_BASE[qR - 1] + 0.60 * p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const eRaw = E_BASE[eR - 1] + 0.65 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const rRaw = R_BASE[rR - 1] + 1.00 * p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'passive', abilityName: 'Illumination (Passif)', rank: 0, damageType: 'magic', rawDamage: passiveResult.rawDamage, finalDamage: passiveResult.finalDamage },
        { abilityId: 'Q', abilityName: 'Light Binding (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E', abilityName: 'Lucent Singularity (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Final Spark (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Lux', {
    name: 'Lux',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Light Binding', maxRank: 5 },
        { key: 'e', label: 'E — Lucent Singularity', maxRank: 5 },
        { key: 'r', label: 'R — Final Spark', maxRank: 3 },
    ],
});
