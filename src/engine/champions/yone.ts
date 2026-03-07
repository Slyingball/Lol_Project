/**
 * Yone — The Unforgotten
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Q — Mortal Steel: 20/45/70/95/120 + 105% total AD (physical) — can crit
const Q_BASE = [20, 45, 70, 95, 120];

// W — Spirit Cleave: 10/20/30/40/50 + 12% target max HP (mixed physical 50% / magic 50%)
const W_BASE = [10, 20, 30, 40, 50];

// E — Soul Unbound: marks and repeats 25/27.5/30/32.5/35% of damage dealt as true damage
// (utility — we show the % stored but no direct damage)
const E_REPEAT_RATIO = [0.25, 0.275, 0.30, 0.325, 0.35];

// R — Fate Sealed: 200/350/500 + 80% total AD (physical + magic 50/50)
const R_BASE = [200, 350, 500];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q
    const qRaw = Q_BASE[qR - 1] + 1.05 * p.totalAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const qCrit = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat, true, p.critMultiplier);

    // W — 50/50 split physical + magic
    const wTotalRaw = W_BASE[wR - 1] + 0.12 * p.target.maxHP;
    const wPhysRaw = wTotalRaw * 0.5;
    const wMagicRaw = wTotalRaw * 0.5;
    const wPhys = calculatePhysicalDamage(wPhysRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const wMagic = calculateMagicDamage(wMagicRaw, p.target, p.magicPenPercent, p.magicPenFlat);
    const wFinal = wPhys.finalDamage + wMagic.finalDamage;

    // E — % stored damage repeater
    const eRepeat = E_REPEAT_RATIO[eR - 1];

    // R — 50/50 physical + magic
    const rTotalRaw = R_BASE[rR - 1] + 0.80 * p.totalAD;
    const rPhysRaw = rTotalRaw * 0.5;
    const rMagicRaw = rTotalRaw * 0.5;
    const rPhys = calculatePhysicalDamage(rPhysRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const rMagic = calculateMagicDamage(rMagicRaw, p.target, p.magicPenPercent, p.magicPenFlat);
    const rFinal = rPhys.finalDamage + rMagic.finalDamage;

    return [
        { abilityId: 'Q', abilityName: 'Mortal Steel (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'Q_crit', abilityName: 'Mortal Steel (Q) — Crit', rank: qR, damageType: 'physical', rawDamage: qCrit.rawDamage, finalDamage: qCrit.finalDamage },
        { abilityId: 'W', abilityName: 'Spirit Cleave (W) — mixte', rank: wR, damageType: 'physical', rawDamage: wTotalRaw, finalDamage: wFinal },
        { abilityId: 'E', abilityName: `Soul Unbound (E) — ${Math.round(eRepeat * 100)}% dégâts stockés`, rank: eR, damageType: 'true', rawDamage: 0, finalDamage: 0 },
        { abilityId: 'R', abilityName: 'Fate Sealed (R) — mixte', rank: rR, damageType: 'physical', rawDamage: rTotalRaw, finalDamage: rFinal },
    ];
}

registerChampion('Yone', {
    name: 'Yone',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Mortal Steel', maxRank: 5 },
        { key: 'w', label: 'W — Spirit Cleave', maxRank: 5 },
        { key: 'e', label: 'E — Soul Unbound', maxRank: 5 },
        { key: 'r', label: 'R — Fate Sealed', maxRank: 3 },
    ],
});
