/**
 * Caitlyn — The Sheriff of Piltover
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Passive — Headshot: 60-160% AD bonus (by level) + 125% crit chance scaling
function headshotDmg(level: number, totalAD: number, critChance: number): number {
    const ratio = 0.60 + (1.60 - 0.60) * ((level - 1) / 17);
    return ratio * totalAD + 1.25 * critChance * totalAD;
}

// Q — Piltover Peacemaker: 50/90/130/170/210 + 125/145/165/185/205% total AD
const Q_BASE = [50, 90, 130, 170, 210];
const Q_AD_RATIO = [1.25, 1.45, 1.65, 1.85, 2.05];

// W — Yordle Snap Trap: 30/70/110/150/190 + 40/50/60/70/80% bonus AD (bonus headshot)
const W_BASE = [30, 70, 110, 150, 190];

// E — 90 Caliber Net: 70/110/150/190/230 + 80% AP (magic)
const E_BASE = [70, 110, 150, 190, 230];

// R — Ace in the Hole: 300/525/750 + 200% bonus AD (physical, long-range)
const R_BASE = [300, 525, 750];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const pRaw = headshotDmg(p.level, p.totalAD, p.critChance);
    const passive = calculatePhysicalDamage(pRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const qRaw = Q_BASE[qR - 1] + Q_AD_RATIO[qR - 1] * p.totalAD;
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const wRaw = W_BASE[wR - 1] + [0.40, 0.50, 0.60, 0.70, 0.80][wR - 1] * p.bonusAD;
    const w = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const eRaw = E_BASE[eR - 1] + 0.80 * p.ap;
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    const rRaw = R_BASE[rR - 1] + 2.00 * p.bonusAD;
    const r = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'passive', abilityName: 'Headshot (Passif)', rank: 0, damageType: 'physical', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q', abilityName: 'Piltover Peacemaker (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Yordle Snap Trap (W)', rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E', abilityName: '90 Caliber Net (E)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Ace in the Hole (R)', rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Caitlyn', {
    name: 'Caitlyn',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Piltover Peacemaker', maxRank: 5 },
        { key: 'w', label: 'W — Yordle Snap Trap', maxRank: 5 },
        { key: 'e', label: 'E — 90 Caliber Net', maxRank: 5 },
        { key: 'r', label: 'R — Ace in the Hole', maxRank: 3 },
    ],
});
