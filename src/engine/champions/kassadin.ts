import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Null Sphere
const Q_BASE = [65, 95, 125, 155, 185];
const Q_RATIO_AP = 0.7;

// W — Nether Blade (Active)
const W_BASE = [50, 75, 100, 125, 150];
const W_RATIO_AP = 0.8;

// E — Force Pulse
const E_BASE = [60, 90, 120, 150, 180];
const E_RATIO_AP = 0.85;

// R — Riftwalk
const R_BASE = [70, 90, 110];
const R_RATIO_AP = 0.4;
const R_RATIO_MANA = 0.02;

// R — Riftwalk (Bonus par stack)
const R_STACK_BASE = [35, 45, 55];
const R_STACK_RATIO_AP = 0.1;
const R_STACK_RATIO_MANA = 0.01;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));
    
    const rStacks = Math.max(0, Math.min(4, p.extras.rStacks ?? 0)); // Max 4 stacks
    const maxMana = p.maxMana ?? 0;

    // Q, W, E
    const qRaw = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const wRaw = W_BASE[wR - 1] + (p.ap * W_RATIO_AP);
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const eRaw = E_BASE[eR - 1] + (p.ap * E_RATIO_AP);
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R
    const rBaseDmg = R_BASE[rR - 1] + (p.ap * R_RATIO_AP) + (maxMana * R_RATIO_MANA);
    const rStackDmg = (R_STACK_BASE[rR - 1] + (p.ap * R_STACK_RATIO_AP) + (maxMana * R_STACK_RATIO_MANA)) * rStacks;
    const rRaw = rBaseDmg + rStackDmg;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Null Sphere (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Nether Blade (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Force Pulse (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: `Riftwalk (R) — ${rStacks} Stacks`, rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Kassadin', {
    name: 'Kassadin',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Null Sphere', maxRank: 5 },
        { key: 'w', label: 'W — Nether Blade', maxRank: 5 },
        { key: 'e', label: 'E — Force Pulse', maxRank: 5 },
        { key: 'r', label: 'R — Riftwalk', maxRank: 3 },
    ],
});