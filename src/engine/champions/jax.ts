/**
 * Jax — Grandmaster at Arms
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage, calculateTrueDamage } from '../damageCalculator';

// Passive — Relentless Assault: stacking attack speed on consecutive autos (no direct damage)

// Q — Leap Strike: 65/105/145/185/225 + 100% bonus AD + 60% AP (physical)
const Q_BASE = [65, 105, 145, 185, 225];

// W — Empower: empowers next auto/Q — 40/75/110/145/180 + 60% AP (magic, on-hit)
const W_BASE = [40, 75, 110, 145, 180];

// E — Counter Strike:
//   Passive: dodges all auto-attacks during stance
//   Active (slam): 55/80/105/130/155 + 50% bonus AD (physical, AoE)
//     +20% damage per dodged auto (up to +100%, i.e. ×2.0 at 5 autos)
const E_BASE = [55, 80, 105, 130, 155];

// R — Grandmaster's Might:
//   Passive: every 3rd auto deals 100/140/180 + 70% AP bonus magic damage
//   Active: +25/35/45 bonus AD for 8s
const R_PASSIVE_BASE = [100, 140, 180];
const R_ACTIVE_AD    = [25, 35, 45];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // R active bonus AD
    const rBonusAD        = R_ACTIVE_AD[rR - 1];
    const effectiveBonusAD = p.bonusAD + rBonusAD;
    const effectiveTotalAD = p.totalAD + rBonusAD;

    // Q — base & with R active
    const qRaw     = Q_BASE[qR - 1] + 1.00 * p.bonusAD + 0.60 * p.ap;
    const qRRaw    = Q_BASE[qR - 1] + 1.00 * effectiveBonusAD + 0.60 * p.ap;
    const q        = calculatePhysicalDamage(qRaw,  p.target, p.armorPenPercent, p.armorPenFlat);
    const qR_calc  = calculatePhysicalDamage(qRRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W — empowered auto on-hit (magic)
    const wRaw = W_BASE[wR - 1] + 0.60 * p.ap;
    const w    = calculateMagicDamage(wRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // E — no dodge stacks & max stacks (5 dodged autos → ×2.0)
    const eBaseRaw = E_BASE[eR - 1] + 0.50 * p.bonusAD;
    const eMax     = eBaseRaw * 2.00;
    const eBase_c  = calculatePhysicalDamage(eBaseRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const eMaxCalc = calculatePhysicalDamage(eMax,     p.target, p.armorPenPercent, p.armorPenFlat);

    // R passive — every 3rd auto (magic)
    const rPassRaw = R_PASSIVE_BASE[rR - 1] + 0.70 * p.ap;
    const rPass    = calculateMagicDamage(rPassRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // Q + W combo (most common burst opener)
    const qwComboPhysRaw = qRaw;
    const qwComboMagRaw  = wRaw;
    const qwPhys = calculatePhysicalDamage(qwComboPhysRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const qwMag  = calculateMagicDamage(qwComboMagRaw,    p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        { abilityId: 'Q',          abilityName: 'Leap Strike (Q)',                              rank: qR, damageType: 'physical', rawDamage: q.rawDamage,        finalDamage: q.finalDamage },
        { abilityId: 'Q_R',        abilityName: `Leap Strike (Q) + R actif (+${rBonusAD} AD)`, rank: qR, damageType: 'physical', rawDamage: qR_calc.rawDamage,  finalDamage: qR_calc.finalDamage },
        { abilityId: 'W',          abilityName: 'Empower (W) — auto améliorée',                 rank: wR, damageType: 'magic',    rawDamage: w.rawDamage,        finalDamage: w.finalDamage },
        { abilityId: 'E_base',     abilityName: 'Counter Strike (E) — sans esquive',            rank: eR, damageType: 'physical', rawDamage: eBase_c.rawDamage,  finalDamage: eBase_c.finalDamage },
        { abilityId: 'E_max',      abilityName: 'Counter Strike (E) — max esquives (×2.0)',     rank: eR, damageType: 'physical', rawDamage: eMaxCalc.rawDamage, finalDamage: eMaxCalc.finalDamage },
        { abilityId: 'R_passive',  abilityName: 'Grandmaster (R passif) — 3e auto',            rank: rR, damageType: 'magic',    rawDamage: rPass.rawDamage,    finalDamage: rPass.finalDamage },
        { abilityId: 'QW_phys',    abilityName: 'Combo Q+W — Leap Strike (physique)',           rank: qR, damageType: 'physical', rawDamage: qwPhys.rawDamage,   finalDamage: qwPhys.finalDamage },
        { abilityId: 'QW_mag',     abilityName: 'Combo Q+W — Empower (magique)',                rank: wR, damageType: 'magic',    rawDamage: qwMag.rawDamage,    finalDamage: qwMag.finalDamage },
    ];
}

registerChampion('Jax', {
    name: 'Jax',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Leap Strike',      maxRank: 5 },
        { key: 'w', label: 'W — Empower',          maxRank: 5 },
        { key: 'e', label: 'E — Counter Strike',   maxRank: 5 },
        { key: 'r', label: 'R — Grandmaster\'s Might', maxRank: 3 },
    ],
});