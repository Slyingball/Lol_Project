/**
 * Irelia — The Blade Dancer
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Passive — Ionian Fervor: max 4 stacks → +15-66 bonus magic damage on-hit (by level)
function passiveOnHit(level: number): number {
    return 15 + (66 - 15) * ((level - 1) / 17);
}

// Q — Bladesurge: 5/25/45/65/85 + 60% total AD (physical)
const Q_BASE = [5, 25, 45, 65, 85];

// W — Defiant Dance: 10/25/40/55/70 + 50% AD + 45% AP (physical, charged)
const W_BASE = [10, 25, 40, 55, 70];

// E — Flawless Duet: 80/125/170/215/260 + 80% AP (magic)
const E_BASE = [80, 125, 170, 215, 260];

// R — Vanguard's Edge: 125/250/375 + 70% AP (magic) on initial cast
const R_BASE = [125, 250, 375];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive on-hit (4 stacks)
    const pRaw = passiveOnHit(p.level);
    const passive = calculateMagicDamage(pRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Q
    const qRaw = Q_BASE[qR - 1] + 0.60 * p.totalAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W (max charge = ×2 damage)
    const wBaseRaw = W_BASE[wR - 1] + 0.50 * p.totalAD + 0.45 * p.ap;
    const wMax = calculatePhysicalDamage(wBaseRaw * 2, p.target, p.armorPenPercent, p.armorPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + 0.80 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R
    const rRaw = R_BASE[rR - 1] + 0.70 * p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'passive', abilityName: 'Ionian Fervor (Passif) — on-hit ×4', rank: 0, damageType: 'magic', rawDamage: passive.rawDamage * 4, finalDamage: passive.finalDamage * 4 },
        { abilityId: 'Q', abilityName: 'Bladesurge (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Defiant Dance (W) — max charge', rank: wR, damageType: 'physical', rawDamage: wMax.rawDamage, finalDamage: wMax.finalDamage },
        { abilityId: 'E', abilityName: 'Flawless Duet (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: "Vanguard's Edge (R)", rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Irelia', {
    name: 'Irelia',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Bladesurge', maxRank: 5 },
        { key: 'w', label: 'W — Defiant Dance', maxRank: 5 },
        { key: 'e', label: 'E — Flawless Duet', maxRank: 5 },
        { key: 'r', label: "R — Vanguard's Edge", maxRank: 3 },
    ],
});
