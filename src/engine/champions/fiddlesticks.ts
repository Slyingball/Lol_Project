import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

const Q_PCT = [0.06, 0.07, 0.08, 0.09, 0.10];
const W_BASE = [120, 190, 260, 330, 400]; // Total over duration
const E_BASE = [70, 105, 140, 175, 210];
const R_BASE = [625, 1125, 1625]; // Total over duration

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const qRatio = Q_PCT[qR - 1] + (0.02 * (p.ap / 100));
    const qRaw = qRatio * p.target.maxHP;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const wRaw = W_BASE[wR - 1] + 1.20 * p.ap;
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const eRaw = E_BASE[eR - 1] + 0.50 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const rRaw = R_BASE[rR - 1] + 2.25 * p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Terrify (Q) - dmg', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Bountiful Harvest (W) - full', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Reap (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Crowstorm (R) - full', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Fiddlesticks', {
    name: 'Fiddlesticks',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Terrify', maxRank: 5 },
        { key: 'w', label: 'W — Bountiful Harvest', maxRank: 5 },
        { key: 'e', label: 'E — Reap', maxRank: 5 },
        { key: 'r', label: 'R — Crowstorm', maxRank: 3 },
    ],
});
