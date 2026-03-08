/**
 * Amumu — The Sad Mummy
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Passive — Cursed Touch: AAs apply Curse, +10% bonus true damage from magic

// Q — Bandage Toss: 70/95/120/145/170 + 85% AP (magic, stun)
const Q_BASE = [70, 95, 120, 145, 170];

// W — Despair: 12/16/20/24/28 + 1/1.15/1.3/1.45/1.6% (+0.25% per 100 AP) max HP per second
const W_BASE = [12, 16, 20, 24, 28];
const W_HP_RATIO = [0.01, 0.0115, 0.013, 0.0145, 0.016];

// E — Tantrum: 75/100/125/150/175 + 50% AP (magic, AoE)
const E_BASE = [75, 100, 125, 150, 175];

// R — Curse of the Sad Mummy: 200/300/400 + 80% AP (magic, AoE stun)
const R_BASE = [200, 300, 400];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const qRaw = Q_BASE[qR - 1] + 0.85 * p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W per second
    const wPerSec = W_BASE[wR - 1] + (W_HP_RATIO[wR - 1] + 0.0025 * (p.ap / 100)) * p.target.maxHP;
    const wPerSecResult = calculateMagicDamage(wPerSec, p.target, p.magicPenPercent, p.magicPenFlat);

    const eRaw = E_BASE[eR - 1] + 0.50 * p.ap;
    const e = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const rRaw = R_BASE[rR - 1] + 0.80 * p.ap;
    const r = calculateMagicDamage(rRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q', abilityName: 'Bandage Toss (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Despair (W) — par seconde', rank: wR, damageType: 'magic', rawDamage: wPerSecResult.rawDamage, finalDamage: wPerSecResult.finalDamage },
        { abilityId: 'E', abilityName: 'Tantrum (E)', rank: eR, damageType: 'magic', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
        { abilityId: 'R', abilityName: 'Curse of the Sad Mummy (R)', rank: rR, damageType: 'magic', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Amumu', {
    name: 'Amumu',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Bandage Toss', maxRank: 5 },
        { key: 'w', label: 'W — Despair', maxRank: 5 },
        { key: 'e', label: 'E — Tantrum', maxRank: 5 },
        { key: 'r', label: 'R — Curse of the Sad Mummy', maxRank: 3 },
    ],
});
