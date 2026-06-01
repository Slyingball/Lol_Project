import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

const Q_BASE = [400, 550, 700, 850, 1000];
const W_BASE = [180, 225, 270, 315, 360];
const E_BASE = [48, 72, 96, 120, 144];
const R_BASE = [625, 950, 1275];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const q = {
        rawDamage: Q_BASE[qR - 1],
        finalDamage: Q_BASE[qR - 1],
    };

    const w = calculateMagicDamage(
        W_BASE[wR - 1] + 1.50 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    const e = calculateMagicDamage(
        E_BASE[eR - 1] + 0.45 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    const r = calculateMagicDamage(
        R_BASE[rR - 1] + 3.00 * p.ap,
        p.target,
        p.magicPenPercent,
        p.magicPenFlat
    );

    return [
        { abilityId: 'Q', abilityName: 'Consume (Q)', rank: qR, damageType: 'true', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Biggest Snowball Ever! (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Snowball Barrage (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Absolute Zero (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Nunu', {
    name: 'Nunu & Willump',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Consume', maxRank: 5 },
        { key: 'w', label: 'W — Biggest Snowball Ever!', maxRank: 5 },
        { key: 'e', label: 'E — Snowball Barrage', maxRank: 5 },
        { key: 'r', label: 'R — Absolute Zero', maxRank: 3 },
    ],
});