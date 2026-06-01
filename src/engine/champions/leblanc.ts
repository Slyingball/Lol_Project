import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Q — Sigil of Malice
const Q_BASE = [65, 90, 115, 140, 165];
const Q_RATIO_AP = 0.45;

// W — Distortion
const W_BASE = [75, 115, 155, 195, 235];
const W_RATIO_AP = 0.65;

// E — Ethereal Chains
const E_TETHER_BASE = [50, 70, 90, 110, 130];
const E_TETHER_RATIO_AP = 0.35;
const E_ROOT_BASE = [80, 120, 160, 200, 240];
const E_ROOT_RATIO_AP = 0.8;

// R — Mimic (Sigil / Distortion / Chains based on rank 1-3)
const RQ_BASE = [70, 140, 210];
const RQ_RATIO_AP = 0.65;

const RW_BASE = [150, 300, 450];
const RW_RATIO_AP = 0.75;

const RE_TETHER_BASE = [70, 140, 210];
const RE_TETHER_RATIO_AP = 0.4;
const RE_ROOT_BASE = [70, 140, 210];
const RE_ROOT_RATIO_AP = 0.8;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.ap * Q_RATIO_AP);
    const q = calculateMagicDamage(qRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // W
    const wRaw = W_BASE[wR - 1] + (p.ap * W_RATIO_AP);
    const w = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E
    const eTetherRaw = E_TETHER_BASE[eR - 1] + (p.ap * E_TETHER_RATIO_AP);
    const eTether = calculateMagicDamage(eTetherRaw, p.target, p.magicPenPercent, p.magicPenFlat);
    const eRootRaw = E_ROOT_BASE[eR - 1] + (p.ap * E_ROOT_RATIO_AP);
    const eRoot = calculateMagicDamage(eRootRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Mimic Q
    const rqRaw = RQ_BASE[rR - 1] + (p.ap * RQ_RATIO_AP);
    const rq = calculateMagicDamage(rqRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Mimic W
    const rwRaw = RW_BASE[rR - 1] + (p.ap * RW_RATIO_AP);
    const rw = calculateMagicDamage(rwRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Mimic E
    const reTetherRaw = RE_TETHER_BASE[rR - 1] + (p.ap * RE_TETHER_RATIO_AP);
    const reTether = calculateMagicDamage(reTetherRaw, p.target, p.magicPenPercent, p.magicPenFlat);
    const reRootRaw = RE_ROOT_BASE[rR - 1] + (p.ap * RE_ROOT_RATIO_AP);
    const reRoot = calculateMagicDamage(reRootRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q_initial', abilityName: 'Sigil of Malice (Q) — projectile', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'Q_detonation', abilityName: 'Sigil of Malice (Q) — détonation marque', rank: qR, damageType: 'magic', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'W', abilityName: 'Distortion (W)', rank: wR, damageType: 'magic', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'E_tether', abilityName: 'Ethereal Chains (E) — impact tether', rank: eR, damageType: 'magic', rawDamage: eTether.rawDamage, finalDamage: eTether.finalDamage },
        { abilityId: 'E_root', abilityName: 'Ethereal Chains (E) — immobilisation', rank: eR, damageType: 'magic', rawDamage: eRoot.rawDamage, finalDamage: eRoot.finalDamage },
        { abilityId: 'RQ_initial', abilityName: 'Mimic Q (R) — projectile imité', rank: rR, damageType: 'magic', rawDamage: rq.rawDamage, finalDamage: rq.finalDamage },
        { abilityId: 'RQ_detonation', abilityName: 'Mimic Q (R) — détonation imitée', rank: rR, damageType: 'magic', rawDamage: rq.rawDamage, finalDamage: rq.finalDamage },
        { abilityId: 'RW', abilityName: 'Mimic W (R) — Distortion imitée', rank: rR, damageType: 'magic', rawDamage: rw.rawDamage, finalDamage: rw.finalDamage },
        { abilityId: 'RE_tether', abilityName: 'Mimic E (R) — chaînes tether imité', rank: rR, damageType: 'magic', rawDamage: reTether.rawDamage, finalDamage: reTether.finalDamage },
        { abilityId: 'RE_root', abilityName: 'Mimic E (R) — root imité', rank: rR, damageType: 'magic', rawDamage: reRoot.rawDamage, finalDamage: reRoot.finalDamage },
    ];
}

registerChampion('Leblanc', {
    name: 'LeBlanc',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Sigil of Malice', maxRank: 5 },
        { key: 'w', label: 'W — Distortion', maxRank: 5 },
        { key: 'e', label: 'E — Ethereal Chains', maxRank: 5 },
        { key: 'r', label: 'R — Mimic', maxRank: 3 },
    ],
});
