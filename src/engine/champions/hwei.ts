/**
 * Hwei — The Visionary
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculateMagicDamage } from '../damageCalculator';

// Hwei has a unique 3×3 spell system: QQ / QW / QE / WQ / WW / WE / EQ / EW / EE
// Only damage abilities are modelled here. W (Serenity) = utility/heals, E (Torment) = CC/utility

// ── QQ — Devastating Fire: 70/110/150/190/230 + 70% AP (magic, projectile)
const QQ_BASE = [70, 110, 150, 190, 230];

// ── QW — Severing Bolt: 80/125/170/215/260 + 90% AP (magic, delayed detonation)
//   Bonus vs immobile/CC'd: up to ×2.0 total
const QW_BASE = [80, 125, 170, 215, 260];

// ── QE — Molten Fissure: 50/75/100/125/150 + 45% AP (magic, AoE zone, multi-hit)
//   Applies burning: 20/30/40/50/60 + 15% AP per tick (approx 3 ticks)
const QE_INITIAL_BASE = [50, 75, 100, 125, 150];
const QE_TICK_BASE    = [20, 30, 40,  50,  60];

// ── WQ — Fleeting Current: no direct damage (speed zone)
// ── WW — Pool of Reflection: no damage (shield zone)
// ── WE — Grim Visage: no damage (fear/slow)

// ── EQ — Gaze of Agony: 80/120/160/200/240 + 70% AP (magic, tethered pull)
const EQ_BASE = [80, 120, 160, 200, 240];

// ── EW — Eternal Torment: 50/80/110/140/170 + 55% AP (magic, DoT per second, ~4s)
const EW_BASE = [50, 80, 110, 140, 170];

// ── EE — Anguish: 70/110/150/190/230 + 65% AP (magic, AoE explosion)
const EE_BASE = [70, 110, 150, 190, 230];

// ── R — Spiraling Despair: 50/75/100 + 12% AP per second (magic, AoE, 3.5s duration)
//   Also applies stacking slow. ~4 ticks total
const R_TICK_BASE = [50, 75, 100];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // QQ
    const qqRaw = QQ_BASE[qR - 1] + 0.70 * p.ap;
    const qq    = calculateMagicDamage(qqRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // QW — normal & vs immobilised (×2)
    const qwRaw     = QW_BASE[qR - 1] + 0.90 * p.ap;
    const qw        = calculateMagicDamage(qwRaw,        p.target, p.magicPenPercent, p.magicPenFlat);
    const qwImmob   = calculateMagicDamage(qwRaw * 2.0,  p.target, p.magicPenPercent, p.magicPenFlat);

    // QE — initial + 3 ticks
    const qeInitRaw = QE_INITIAL_BASE[qR - 1] + 0.45 * p.ap;
    const qeTickRaw = QE_TICK_BASE[qR - 1]    + 0.15 * p.ap;
    const qeInit    = calculateMagicDamage(qeInitRaw,       p.target, p.magicPenPercent, p.magicPenFlat);
    const qeTick    = calculateMagicDamage(qeTickRaw,       p.target, p.magicPenPercent, p.magicPenFlat);
    const qeFull    = calculateMagicDamage(qeInitRaw + qeTickRaw * 3, p.target, p.magicPenPercent, p.magicPenFlat);

    // EQ
    const eqRaw = EQ_BASE[eR - 1] + 0.70 * p.ap;
    const eq    = calculateMagicDamage(eqRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // EW — per second tick (~4 ticks)
    const ewTickRaw = EW_BASE[eR - 1] + 0.55 * p.ap;
    const ewTick    = calculateMagicDamage(ewTickRaw,       p.target, p.magicPenPercent, p.magicPenFlat);
    const ewFull    = calculateMagicDamage(ewTickRaw * 4,   p.target, p.magicPenPercent, p.magicPenFlat);

    // EE
    const eeRaw = EE_BASE[eR - 1] + 0.65 * p.ap;
    const ee    = calculateMagicDamage(eeRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // R — per tick & full (3.5s ≈ 4 ticks)
    const rTickRaw = R_TICK_BASE[rR - 1] + 0.12 * p.ap;
    const rTick    = calculateMagicDamage(rTickRaw,     p.target, p.magicPenPercent, p.magicPenFlat);
    const rFull    = calculateMagicDamage(rTickRaw * 4, p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'QQ',        abilityName: 'Feu Dévastateur (QQ)',                       rank: qR, damageType: 'magic', rawDamage: qq.rawDamage,      finalDamage: qq.finalDamage },
        { abilityId: 'QW',        abilityName: 'Éclair Tranchant (QW)',                       rank: qR, damageType: 'magic', rawDamage: qw.rawDamage,      finalDamage: qw.finalDamage },
        { abilityId: 'QW_immob',  abilityName: 'Éclair Tranchant (QW) — cible immobile (×2)',rank: qR, damageType: 'magic', rawDamage: qwImmob.rawDamage,  finalDamage: qwImmob.finalDamage },
        { abilityId: 'QE_init',   abilityName: 'Fissure en Fusion (QE) — impact',            rank: qR, damageType: 'magic', rawDamage: qeInit.rawDamage,   finalDamage: qeInit.finalDamage },
        { abilityId: 'QE_tick',   abilityName: 'Fissure en Fusion (QE) — par tick de feu',  rank: qR, damageType: 'magic', rawDamage: qeTick.rawDamage,   finalDamage: qeTick.finalDamage },
        { abilityId: 'QE_full',   abilityName: 'Fissure en Fusion (QE) — total (3 ticks)',   rank: qR, damageType: 'magic', rawDamage: qeFull.rawDamage,   finalDamage: qeFull.finalDamage },
        { abilityId: 'EQ',        abilityName: 'Regard d\'Agonie (EQ)',                       rank: eR, damageType: 'magic', rawDamage: eq.rawDamage,       finalDamage: eq.finalDamage },
        { abilityId: 'EW_tick',   abilityName: 'Tourment Éternel (EW) — par seconde',        rank: eR, damageType: 'magic', rawDamage: ewTick.rawDamage,   finalDamage: ewTick.finalDamage },
        { abilityId: 'EW_full',   abilityName: 'Tourment Éternel (EW) — durée complète (×4)',rank: eR, damageType: 'magic', rawDamage: ewFull.rawDamage,   finalDamage: ewFull.finalDamage },
        { abilityId: 'EE',        abilityName: 'Angoisse (EE)',                               rank: eR, damageType: 'magic', rawDamage: ee.rawDamage,       finalDamage: ee.finalDamage },
        { abilityId: 'R_tick',    abilityName: 'Désespoir en Spirale (R) — par seconde',     rank: rR, damageType: 'magic', rawDamage: rTick.rawDamage,    finalDamage: rTick.finalDamage },
        { abilityId: 'R_full',    abilityName: 'Désespoir en Spirale (R) — total (3.5s)',    rank: rR, damageType: 'magic', rawDamage: rFull.rawDamage,    finalDamage: rFull.finalDamage },
    ];
}

registerChampion('Hwei', {
    name: 'Hwei',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Sujet : Destruction',  maxRank: 5 },
        { key: 'e', label: 'E — Sujet : Tourment',     maxRank: 5 },
        { key: 'r', label: 'R — Désespoir en Spirale', maxRank: 3 },
    ],
});