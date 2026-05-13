/**
 * Jayce — The Defender of Tomorrow
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Jayce switches between Hammer (melee) and Cannon (ranged) stances.
// Each stance has Q / W / E — R transforms (no damage on transform).

// ══ CANNON STANCE ══════════════════════════════════════════════════════════════

// Q (Cannon) — Shock Blast: 70/120/170/220/270/320 + 100% bonus AD (physical)
//   Through Acceleration Gate: ×1.4 damage + increased speed
const Q_CANNON_BASE = [70, 120, 170, 220, 270, 320];

// W (Cannon) — Hyper Charge: empowers next 3 autos to fire at max attack speed
//   Each empowered auto: 70/76/82/88/94/100% total AD (physical)
const W_CANNON_AD_RATIO = [0.70, 0.76, 0.82, 0.88, 0.94, 1.00];

// E (Cannon) — Acceleration Gate: 60/90/120/150/180/210 + 0% AP (magic, AoE arc)
const E_CANNON_BASE = [60, 90, 120, 150, 180, 210];

// ══ HAMMER STANCE ══════════════════════════════════════════════════════════════

// Q (Hammer) — To the Skies!: 40/80/120/160/200/240 + 100% bonus AD (physical, AoE slam)
const Q_HAMMER_BASE = [40, 80, 120, 160, 200, 240];

// W (Hammer) — Lightning Field:
//   Passive: restores 6/8/10/12/14/16 mana per auto
//   Active: 20/35/50/65/80/95 + 25% bonus AD (magic, AoE pulse, 4s)
//   ~8 ticks per activation
const W_HAMMER_BASE = [20, 35, 50, 65, 80, 95];

// E (Hammer) — Thundering Blow: 8/10.4/12.8/15.2/17.6/20% max HP + 100% bonus AD (magic, knockback)
const E_HAMMER_HP_PERCENT = [0.08, 0.104, 0.128, 0.152, 0.176, 0.20];

// Jayce spells go rank 1–6 (no separate R rank), controlled by a single shared rank
// We use `q` rank 1–6 to represent the shared spell level.

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    // Jayce spells share a level 1-6 progression; use q rank clamped to 6
    const r = Math.max(1, Math.min(6, p.ranks.q ?? 1));

    // ── Cannon Q — normal & accelerated
    const qcRaw  = Q_CANNON_BASE[r - 1] + 1.00 * p.bonusAD;
    const qcAcc  = qcRaw * 1.40;
    const qc     = calculatePhysicalDamage(qcRaw,  p.target, p.armorPenPercent, p.armorPenFlat);
    const qcAccC = calculatePhysicalDamage(qcAcc,  p.target, p.armorPenPercent, p.armorPenFlat);

    // ── Cannon W — empowered auto (×3)
    const wcRaw  = W_CANNON_AD_RATIO[r - 1] * p.totalAD;
    const wc     = calculatePhysicalDamage(wcRaw,        p.target, p.armorPenPercent, p.armorPenFlat);
    const wc3    = calculatePhysicalDamage(wcRaw * 3,    p.target, p.armorPenPercent, p.armorPenFlat);

    // ── Cannon E — arc damage
    const ecRaw  = E_CANNON_BASE[r - 1];
    const ec     = calculateMagicDamage(ecRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // ── Hammer Q — slam
    const qhRaw  = Q_HAMMER_BASE[r - 1] + 1.00 * p.bonusAD;
    const qh     = calculatePhysicalDamage(qhRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // ── Hammer W — per tick (magic) & full 8 ticks
    const whRaw  = W_HAMMER_BASE[r - 1] + 0.25 * p.bonusAD;
    const wh     = calculateMagicDamage(whRaw,      p.target, p.magicPenPercent, p.magicPenFlat);
    const whFull = calculateMagicDamage(whRaw * 8,  p.target, p.magicPenPercent, p.magicPenFlat);

    // ── Hammer E — % max HP knockback (magic)
    const ehHpRaw = E_HAMMER_HP_PERCENT[r - 1] * p.target.maxHP;
    const ehAdRaw = 1.00 * p.bonusAD;
    const ehRaw   = ehHpRaw + ehAdRaw;
    const eh      = calculateMagicDamage(ehRaw, p.target, p.magicPenPercent, p.magicPenFlat);

    // ── Canon combo: E+Q accelerated (signature burst)
    const comboRaw = qcAcc + ecRaw;
    const comboQ   = calculatePhysicalDamage(qcAcc,  p.target, p.armorPenPercent, p.armorPenFlat);
    const comboE   = calculateMagicDamage(ecRaw,     p.target, p.magicPenPercent, p.magicPenFlat);

    return [
        // Cannon
        { abilityId: 'Q_cannon',      abilityName: 'Shock Blast (Q Canon)',                           rank: r, damageType: 'physical', rawDamage: qc.rawDamage,      finalDamage: qc.finalDamage },
        { abilityId: 'Q_cannon_acc',  abilityName: 'Shock Blast (Q Canon) — accéléré (×1.4)',        rank: r, damageType: 'physical', rawDamage: qcAccC.rawDamage,  finalDamage: qcAccC.finalDamage },
        { abilityId: 'W_cannon',      abilityName: 'Hyper Charge (W Canon) — par auto empowered',    rank: r, damageType: 'physical', rawDamage: wc.rawDamage,      finalDamage: wc.finalDamage },
        { abilityId: 'W_cannon_3',    abilityName: 'Hyper Charge (W Canon) — ×3 autos',              rank: r, damageType: 'physical', rawDamage: wc3.rawDamage,     finalDamage: wc3.finalDamage },
        { abilityId: 'E_cannon',      abilityName: 'Acceleration Gate (E Canon) — arc',              rank: r, damageType: 'magic',    rawDamage: ec.rawDamage,      finalDamage: ec.finalDamage },
        { abilityId: 'EQ_cannon',     abilityName: 'Combo E+Q Canon — Q accéléré (physique)',        rank: r, damageType: 'physical', rawDamage: comboQ.rawDamage,  finalDamage: comboQ.finalDamage },
        // Hammer
        { abilityId: 'Q_hammer',      abilityName: 'To the Skies! (Q Marteau)',                      rank: r, damageType: 'physical', rawDamage: qh.rawDamage,      finalDamage: qh.finalDamage },
        { abilityId: 'W_hammer_tick', abilityName: 'Lightning Field (W Marteau) — par tick',         rank: r, damageType: 'magic',    rawDamage: wh.rawDamage,      finalDamage: wh.finalDamage },
        { abilityId: 'W_hammer_full', abilityName: 'Lightning Field (W Marteau) — durée (×8 ticks)', rank: r, damageType: 'magic',    rawDamage: whFull.rawDamage,  finalDamage: whFull.finalDamage },
        { abilityId: 'E_hammer',      abilityName: `Thundering Blow (E Marteau) — ${Math.round(E_HAMMER_HP_PERCENT[r - 1] * 100 * 10) / 10}% PV max`, rank: r, damageType: 'magic', rawDamage: eh.rawDamage, finalDamage: eh.finalDamage },
    ];
}

registerChampion('Jayce', {
    name: 'Jayce',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Niveau de sort (1–6)', maxRank: 6 },
    ],
});