/**
 * Bard — The Wandering Caretaker
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Passive — Traveler's Call: meeps deal 35 (+14 per 5 chimes) + 30% AP (magic)
function meepDmg(ap: number, chimes: number): number {
    return 35 + 14 * Math.floor(chimes / 5) + 0.30 * ap;
}

// Q — Cosmic Binding: 80/125/170/215/260 + 65% AP (magic, stun if two targets hit)
const Q_BASE = [80, 125, 170, 215, 260];

// W — Caretaker's Shrine: heal (no damage)
// E — Magical Journey: portal (no damage)
// R — Tempered Fate: stasis (no damage)

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const chimes = p.extras.chimes ?? 40;

    const pRaw = meepDmg(p.ap, chimes);
    const passive = calculateMagicDamage(pRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    const qRaw = Q_BASE[qR - 1] + 0.65 * p.ap;
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'passive', abilityName: `Meep (Passif) — ${chimes} carillons`, rank: 0, damageType: 'magic', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q', abilityName: 'Cosmic Binding (Q)', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
    ];
}

registerChampion('Bard', {
    name: 'Bard',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Cosmic Binding', maxRank: 5 },
        { key: 'chimes_extra', label: 'Carillons', maxRank: 1, extraParam: { label: 'Carillons', min: 0, max: 100, default: 40 } },
    ],
});
