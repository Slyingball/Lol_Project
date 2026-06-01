import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage, calculateTrueDamage } from '../damageCalculator';

// Q — Blooming Blows
const Q_BASE = [35, 45, 55, 65, 75];
const Q_RATIO_AP = 0.45;

// W — Watch Out! Eep!
const W_BASE = [70, 85, 100, 115, 130];
const W_RATIO_AP = 0.3;

// E — Swirlseed
const E_BASE = [70, 110, 150, 190, 230];
const E_RATIO_AP = 0.6;

// R — Lilting Lullaby
const R_BASE = [100, 150, 200];
const R_RATIO_AP = 0.4;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive
    // 5% + 1.25% per 100 AP of target max HP
    const passHPPct = 0.05 + (p.ap / 100) * 0.0125;
    const passRaw = p.target.maxHP * passHPPct;
    const passive = calculateMagicDamage(passRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Q (deals Magic on outer ring, and SAME value as True damage in center)
    const qRaw = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    const qMagic = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);
    const qTrue = calculateTrueDamage(qRaw);

    // W (Center deals 300% damage)
    const wRawNormal = W_BASE[wR - 1] + (p.ap * W_RATIO_AP);
    const wNormal = calculateMagicDamage(wRawNormal, p.target, p.magicPenPercent, p.magicPenFlat);
    const wCenter = calculateMagicDamage(wRawNormal * 3.0, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + (p.ap * E_RATIO_AP);
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R
    const rRaw = R_BASE[rR - 1] + (p.ap * R_RATIO_AP);
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Passive', abilityName: 'Dream-Laden Bough (Passif) — brûlure PV max (3 sec)', rank: 1, damageType: 'magic', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q_magic', abilityName: 'Blooming Blows (Q) — zone extérieure (magique)', rank: qR, damageType: 'magic', rawDamage: qMagic.rawDamage, finalDamage: qMagic.finalDamage },
        { abilityId: 'Q_true', abilityName: 'Blooming Blows (Q) — zone centrale (brut)', rank: qR, damageType: 'true', rawDamage: qTrue.rawDamage, finalDamage: qTrue.finalDamage },
        { abilityId: 'W_normal', abilityName: 'Watch Out! Eep! (W) — zone extérieure', rank: wR, damageType: 'magic', rawDamage: wNormal.rawDamage, finalDamage: wNormal.finalDamage },
        { abilityId: 'W_center', abilityName: 'Watch Out! Eep! (W) — centre (multiplié ×3)', rank: wR, damageType: 'magic', rawDamage: wCenter.rawDamage, finalDamage: wCenter.finalDamage },
        { abilityId: 'E', abilityName: 'Swirlseed (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Lilting Lullaby (R) — réveil', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Lillia', {
    name: 'Lillia',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Blooming Blows', maxRank: 5 },
        { key: 'w', label: 'W — Watch Out! Eep!', maxRank: 5 },
        { key: 'e', label: 'E — Swirlseed', maxRank: 5 },
        { key: 'r', label: 'R — Lilting Lullaby', maxRank: 3 },
    ],
});
