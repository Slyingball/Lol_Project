import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Q — Icathian Rain
const Q_BASE = [40, 55, 70, 85, 100];
const Q_RATIO_BONUS_AD = 0.5;
const Q_RATIO_AP = 0.4;

// W — Void Seeker
const W_BASE = [30, 55, 80, 105, 130];
const W_RATIO_TOTAL_AD = 1.3;
const W_RATIO_AP = 1.2;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));

    const evolvedQ = p.extras.evolvedQ === 1;
    const plasmaStacks = Math.max(1, Math.min(5, p.extras.plasmaStacks ?? 1));

    // Q missile base damage
    const singleQRaw = Q_BASE[qR - 1] + (p.bonusAD * Q_RATIO_BONUS_AD) + (p.ap * Q_RATIO_AP);
    
    // Q total damage calculation (1st hit = 100%, subsequent hits = 25%)
    const numMissiles = evolvedQ ? 18 : 10;
    const totalQRaw = singleQRaw * (1 + (numMissiles - 1) * 0.25);

    const singleQ = calculatePhysicalDamage(singleQRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const totalQ = calculatePhysicalDamage(totalQRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + (p.totalAD * W_RATIO_TOTAL_AD) + (p.ap * W_RATIO_AP);
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Passive — Caustic Wounds
    // 4 stacks deal small magic damage, 5th stack triggers explosion
    const missingHP = p.target.maxHP - p.target.currentHP;
    
    // 1-4 stacks: Base 4-16 (by level) + 15%-25% AP (by stack count)
    const passiveBase = 4 + (12 * (p.level - 1) / 17);
    const stackRatio = 0.15 + (plasmaStacks - 1) * 0.025; // 15% to 25% AP
    const passiveStackRaw = passiveBase + (p.ap * stackRatio);
    const passiveStack = calculateMagicDamage(passiveStackRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // 5th stack rupture explosion: 15% (+ 6% per 100 AP) of missing HP
    const explosionPct = 0.15 + (p.ap * 0.01 * 0.06);
    const passiveExplRaw = missingHP * explosionPct;
    const passiveExpl = calculateMagicDamage(passiveExplRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const results: AbilityDamageResult[] = [
        { abilityId: 'Q_single', abilityName: 'Icathian Rain (Q) — 1 projectile', rank: qR, damageType: 'physical', rawDamage: singleQ.rawDamage, finalDamage: singleQ.finalDamage },
        { abilityId: 'Q_total', abilityName: `Icathian Rain (Q) — Cible unique (${numMissiles} proj.)`, rank: qR, damageType: 'physical', rawDamage: totalQ.rawDamage, finalDamage: totalQ.finalDamage },
        { abilityId: 'W', abilityName: 'Void Seeker (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
    ];

    if (plasmaStacks === 5) {
        results.push({ abilityId: 'Passive_expl', abilityName: 'Caustic Wounds (Passif) — Explosion 5 stacks', rank: 1, damageType: 'magic', rawDamage: passiveExpl.rawDamage, finalDamage: passiveExpl.finalDamage });
    } else {
        results.push({ abilityId: 'Passive_stack', abilityName: `Caustic Wounds (Passif) — Accumulation (Stack ${plasmaStacks})`, rank: 1, damageType: 'magic', rawDamage: passiveStack.rawDamage, finalDamage: passiveStack.finalDamage });
    }

    return results;
}

registerChampion('Kaisa', {
    name: "Kai'Sa",
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Icathian Rain', maxRank: 5 },
        { key: 'evolvedQ', label: 'Q — Icathian Rain Évolué', maxRank: 1, extraParam: { label: 'Q Évolué (0/1)', min: 0, max: 1, default: 0 } },
        { key: 'w', label: 'W — Void Seeker', maxRank: 5 },
        { key: 'plasmaStacks', label: 'Passif — Piles de Plasma', maxRank: 1, extraParam: { label: 'Stacks Plasma (1-5)', min: 1, max: 5, default: 1 } },
    ],
});
