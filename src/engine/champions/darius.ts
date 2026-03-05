/**
 * Darius — The Hand of Noxus
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateTrueDamage } from '../damageCalculator';

// Passive — Hemorrhage: 13-30 + 30% bonus AD per stack, max 5 stacks (bleed)
function passivePerStack(level: number, bonusAD: number): number {
    const base = 13 + (30 - 13) * ((level - 1) / 17);
    return base + 0.3 * bonusAD;
}

// Q — Decimate (blade): 50/80/110/140/170 + 100% total AD
const Q_BASE = [50, 80, 110, 140, 170];

// W — Crippling Strike: 100% total AD + 40/45/50/55/60% total AD
const W_RATIO = [0.40, 0.45, 0.50, 0.55, 0.60];

// R — Noxian Guillotine: 100/200/300 + 75% bonus AD (true damage)
const R_BASE = [100, 200, 300];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));
    const stacks = p.extras.passiveStacks ?? 5;

    // Passive
    const pPerStack = passivePerStack(p.level, p.bonusAD);
    const pTotal = pPerStack * stacks;

    // Q blade hit
    const qRaw = Q_BASE[qR - 1] + p.totalAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W
    const wRaw = p.totalAD + W_RATIO[wR - 1] * p.totalAD;
    const w = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R (true damage, +20% per stack)
    const rRaw = (R_BASE[rR - 1] + 0.75 * p.bonusAD) * (1 + 0.20 * stacks);
    const r = calculateTrueDamage(rRaw);

    return [
        { abilityId: 'passive', abilityName: `Hemorrhage (Passif) — ×${stacks} stacks`, rank: 0, damageType: 'physical', rawDamage: pTotal, finalDamage: calculatePhysicalDamage(pTotal, p.target, p.armorPenPercent, p.armorPenFlat).finalDamage },
        { abilityId: 'Q', abilityName: 'Decimate (Q) — lame', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Crippling Strike (W)', rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'R', abilityName: `Noxian Guillotine (R) — ${stacks} stacks`, rank: rR, damageType: 'true', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Darius', {
    name: 'Darius',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Decimate', maxRank: 5 },
        { key: 'w', label: 'W — Crippling Strike', maxRank: 5 },
        { key: 'r', label: 'R — Noxian Guillotine', maxRank: 3 },
        { key: 'passive_extra', label: 'Stacks passif', maxRank: 1, extraParam: { label: 'Stacks', min: 0, max: 5, default: 5 } },
    ],
});
