/**
 * Ivern — The Green Father
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Ivern is primarily a support/utility champion. His direct damage output is minimal.
// Passive — Friend of the Forest: enchants camps (no combat damage)
// Q — Rootcaller: 80/130/180/230/280 + 70% AP (magic, root + dash follow-up)
const Q_BASE = [80, 130, 180, 230, 280];

// W — Brushmaker: no damage (creates brush patches)

// E — Triggerseed: shield that bursts for 70/95/120/145/170 + 60% AP (magic, AoE slow)
const E_BASE = [70, 95, 120, 145, 170];

// R — Daisy!: summons Daisy (golem). Daisy's attacks deal physical damage.
//   Daisy basic attack: 100% of Ivern's total AD (physical)
//   Daisy 3rd hit shockwave: 100/200/300 + 40% AP (magic, AoE)
//   Daisy HP: 1200/2100/3000 + 100% AP + 80% bonus HP
const R_SHOCKWAVE_BASE = [100, 200, 300];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q — magic root projectile
    const qRaw = Q_BASE[qR - 1] + 0.70 * p.ap;
    const q    = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E — burst damage when shield expires/pops
    const eRaw = E_BASE[eR - 1] + 0.60 * p.ap;
    const e    = calculateMagicDamage(eRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R — Daisy basic attack (physical, via Ivern's AD)
    const daisyAutoRaw = 1.00 * p.totalAD;
    const daisyAuto    = calculateMagicDamage(daisyAutoRaw, p.target, p.magicPenPercent, p.magicPenFlat); // treated as magic on-hit

    // R — Daisy shockwave (3rd hit, magic AoE)
    const daisyShockRaw = R_SHOCKWAVE_BASE[rR - 1] + 0.40 * p.ap;
    const daisyShock    = calculateMagicDamage(daisyShockRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q',            abilityName: 'Rootcaller (Q)',                          rank: qR, damageType: 'magic', rawDamage: q.rawDamage,          finalDamage: q.finalDamage },
        { abilityId: 'E',            abilityName: 'Triggerseed (E) — explosion de bouclier', rank: eR, damageType: 'magic', rawDamage: e.rawDamage,          finalDamage: e.finalDamage },
        { abilityId: 'R_auto',       abilityName: 'Daisy! (R) — auto de Daisy',             rank: rR, damageType: 'magic', rawDamage: daisyAuto.rawDamage,  finalDamage: daisyAuto.finalDamage },
        { abilityId: 'R_shockwave',  abilityName: 'Daisy! (R) — onde de choc (3e coup)',    rank: rR, damageType: 'magic', rawDamage: daisyShock.rawDamage, finalDamage: daisyShock.finalDamage },
    ];
}

registerChampion('Ivern', {
    name: 'Ivern',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Rootcaller',   maxRank: 5 },
        { key: 'e', label: 'E — Triggerseed',  maxRank: 5 },
        { key: 'r', label: 'R — Daisy!',       maxRank: 3 },
    ],
});