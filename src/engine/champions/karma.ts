import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Inner Flame
const Q_BASE = [70, 120, 170, 220, 270];
const Q_RATIO_AP = 0.5;

// R+Q — Mantra: Soulflare (Dégâts initiaux supplémentaires)
const RQ_BONUS_BASE = [40, 100, 160, 220]; // Basé sur le rang de R (1 à 4)
const RQ_BONUS_RATIO_AP = 0.3;

// W — Focused Resolve (Dégâts par tick, 2 ticks au total)
const W_BASE_PER_TICK = [20, 32.5, 45, 57.5, 70];
const W_RATIO_AP_PER_TICK = 0.45;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const rR = Math.max(1, Math.min(4, p.ranks.r ?? 1)); // Max rank 4 pour Karma
    const isMantraActive = p.extras.mantra === 1;

    // Q
    let qRaw = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    let qName = 'Inner Flame (Q)';
    
    if (isMantraActive) {
        qRaw += RQ_BONUS_BASE[rR - 1] + (p.ap * RQ_BONUS_RATIO_AP);
        qName = 'Soulflare (Mantra Q — Impact initial)';
    }
    
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R+Q Explosion
    let rqExplosion: AbilityDamageResult | null = null;
    if (isMantraActive) {
        const rqExplRaw = [40, 130, 220, 310][rR - 1] + (p.ap * 0.5);
        const res = calculateMagicDamage(rqExplRaw, p.target, p.magicPenPercent, p.magicPenFlat);
        rqExplosion = { 
            abilityId: 'RQ_Explosion', 
            abilityName: 'Soulflare (Mantra Q — Explosion)', 
            rank: rR, 
            damageType: 'magic', 
            rawDamage: res.rawDamage, 
            finalDamage: res.finalDamage 
        };
    }

    // W (par tick)
    const wRawTick = W_BASE_PER_TICK[wR - 1] + (p.ap * W_RATIO_AP_PER_TICK);
    const wTick = calculateMagicDamage(wRawTick, p.target, p.magicPenPercent, p.magicPenFlat);

    const results: AbilityDamageResult[] = [
        { abilityId: 'Q', abilityName: qName, rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Focused Resolve (W) — 1 Tick', rank: wR, damageType: 'magic', rawDamage: wTick.rawDamage, finalDamage: wTick.finalDamage, hits: 2, totalFinalDamage: wTick.finalDamage * 2 },
    ];

    if (rqExplosion) results.push(rqExplosion);

    return results;
}

registerChampion('Karma', {
    name: 'Karma',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Inner Flame', maxRank: 5 },
        { key: 'w', label: 'W — Focused Resolve', maxRank: 5 },
        { key: 'r', label: 'R — Mantra (Rang)', maxRank: 4 },
        { key: 'mantra', label: 'Mantra', maxRank: 1, extraParam: { label: 'Mantra Actif (0/1)', min: 0, max: 1, default: 0 } },
    ],
});