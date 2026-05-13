import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Bouncing Blade
const Q_BASE = [80, 110, 140, 170, 200];
const Q_RATIO_AP = 0.35;

// E — Shunpo
const E_BASE = [20, 35, 50, 65, 80];
const E_RATIO_AD = 0.40; // Total AD
const E_RATIO_AP = 0.25;

// R — Death Lotus (Par dague, max 15)
const R_BASE = [25, 37.5, 50];
const R_RATIO_BONUS_AD = 0.16;
const R_RATIO_AP = 0.19;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + (p.totalAD * E_RATIO_AD) + (p.ap * E_RATIO_AP);
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R (Par Dague)
    const rRaw = R_BASE[rR - 1] + (p.bonusAD * R_RATIO_BONUS_AD) + (p.ap * R_RATIO_AP);
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Passif (Ramasser une dague) - Dégâts simplifiés pour le niveau 11
    const passiveBase = p.extras.passiveLevelDmg ?? 150; // Variable selon le niveau du champion
    const passiveRaw = passiveBase + (p.bonusAD * 0.6) + (p.ap * 0.8);
    const passive = calculateMagicDamage(passiveRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'P', abilityName: 'Voracity (Passif - Dague)', rank: 1, damageType: 'magic', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q', abilityName: 'Bouncing Blade (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E', abilityName: 'Shunpo (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Death Lotus (R) — Par dague', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage, hits: 15, totalFinalDamage: r.finalDamage * 15 },
    ];
}

registerChampion('Katarina', {
    name: 'Katarina',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Bouncing Blade', maxRank: 5 },
        { key: 'e', label: 'E — Shunpo', maxRank: 5 },
        { key: 'r', label: 'R — Death Lotus', maxRank: 3 },
    ],
});