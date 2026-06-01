import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Glitterlance
const Q_BASE = [70, 105, 140, 175, 210];
const Q_RATIO_AP = 0.5;

// E — Help, Pix! (Offensive)
const E_BASE = [80, 120, 160, 200, 240];
const E_RATIO_AP = 0.4;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));

    // Passive — Pix, Faerie Companion
    // Deals 15 to 117 based on level + 15% AP
    const passiveBase = 15 + (102 * (p.level - 1) / 17);
    const passiveRaw = passiveBase + (p.ap * 0.15);
    const passive = calculateMagicDamage(passiveRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + (p.ap * E_RATIO_AP);
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Passive', abilityName: 'Pix, Faerie Companion (Passif) — 3 tirs', rank: 1, damageType: 'magic', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q', abilityName: 'Glitterlance (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E', abilityName: 'Help, Pix! (E) — offensif', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
    ];
}

registerChampion('Lulu', {
    name: 'Lulu',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Glitterlance', maxRank: 5 },
        { key: 'e', label: 'E — Help, Pix!', maxRank: 5 },
    ],
});
