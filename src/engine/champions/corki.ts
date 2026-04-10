import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage, calculatePhysicalDamage } from '../damageCalculator';

const Q_BASE = [75, 120, 165, 210, 255];
const W_BASE = [60, 90, 120, 150, 180];
const E_BASE = [120, 170, 220, 270, 320];
const R_BASE = [80, 115, 150];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const qRaw = Q_BASE[qR - 1] + 0.70 * p.bonusAD + 0.50 * p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const wRaw = W_BASE[wR - 1] + 0.40 * p.ap;
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const eRaw = E_BASE[eR - 1] + 2.50 * p.bonusAD;
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const adRatio = [0.15, 0.45, 0.75][rR - 1];
    const rRaw = R_BASE[rR - 1] + adRatio * p.totalAD + 0.12 * p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Phosphorus Bomb (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Valkyrie (W) - tick', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: 'Gatling Gun (E) - total', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Missile Barrage (R) - normal', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Corki', {
    name: 'Corki',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Phosphorus Bomb', maxRank: 5 },
        { key: 'w', label: 'W — Valkyrie', maxRank: 5 },
        { key: 'e', label: 'E — Gatling Gun', maxRank: 5 },
        { key: 'r', label: 'R — Missile Barrage', maxRank: 3 },
    ],
});
