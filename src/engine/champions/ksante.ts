/**
 * K'Sante — The Pride of Nazumah
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateTrueDamage } from '../damageCalculator';

// K'Sante has two stances: normal (Ntofos) and All Out (R-transformed).
// In All Out, Ntofos become true damage and he gains lethality.

// Passive — Dauntless Instinct: marked targets take bonus damage on next hit
//   Bonus: 1–11% max HP physical (scales with level) — applied by Q / E auto follow-up
function passiveMarkDmg(level: number, targetMaxHP: number): number {
    return (0.01 + (0.10 / 17) * (level - 1)) * targetMaxHP;
}

// Q — Ntofo Strikes (2 stacks → 3rd hit AoE stun):
//   1st/2nd hit: 50/80/110/140/170 + 40% total AD (physical, applies mark)
//   3rd hit (AoE): same base + stun
const Q_BASE = [50, 80, 110, 140, 170];

// W — Path Maker:
//   Min charge: 100/130/160/190/220 + 20% max HP (physical)
//   Max charge: 200/260/320/380/440 + 40% max HP (physical, knockback)
//   All Out — Min: same base as true damage
//   All Out — Max: same base as true damage
const W_MIN_BASE = [100, 130, 160, 190, 220];
const W_MAX_BASE = [200, 260, 320, 380, 440];
const W_MIN_HP   = [0.20, 0.20, 0.20, 0.20, 0.20];
const W_MAX_HP   = [0.40, 0.40, 0.40, 0.40, 0.40];

// E — Footwork: repositioning dash — no damage on its own
//   Empowers next auto: 50/70/90/110/130 + 200% total AD (physical, 1 hit)
const E_AUTO_BASE = [50, 70, 90, 110, 130];

// R — All Out: 200/275/350 + 200% bonus AD (physical → becomes true damage in All Out)
//   Dashes to marked target; transforms K'Sante
const R_BASE = [200, 275, 350];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive — mark proc
    const passRaw = passiveMarkDmg(p.level, p.target.maxHP);
    const passive = calculatePhysicalDamage(passRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q — single hit & with passive mark proc
    const qRaw       = Q_BASE[qR - 1] + 0.40 * p.totalAD;
    const q          = calculatePhysicalDamage(qRaw,           p.target, p.armorPenPercent, p.armorPenFlat);
    const qWithMark  = calculatePhysicalDamage(qRaw + passRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W — min charge (physical & All Out true)
    const wMinRaw  = W_MIN_BASE[wR - 1] + W_MIN_HP[wR - 1] * p.target.maxHP;
    const wMin     = calculatePhysicalDamage(wMinRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const wMinTrue = calculateTrueDamage(wMinRaw);

    // W — max charge (physical & All Out true)
    const wMaxRaw  = W_MAX_BASE[wR - 1] + W_MAX_HP[wR - 1] * p.target.maxHP;
    const wMax     = calculatePhysicalDamage(wMaxRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const wMaxTrue = calculateTrueDamage(wMaxRaw);

    // E — empowered auto
    const eRaw = E_AUTO_BASE[eR - 1] + 2.00 * p.totalAD;
    const e    = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R — burst (physical normal, true in All Out)
    const rRaw     = R_BASE[rR - 1] + 2.00 * p.bonusAD;
    const r        = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const rAllOut  = calculateTrueDamage(rRaw);

    return [
        { abilityId: 'passive',    abilityName: `Dauntless Instinct (Passif) — marque (~${Math.round(passiveMarkDmg(p.level, 1000) / 10)}% PV max)`, rank: 0,  damageType: 'physical', rawDamage: passive.rawDamage,   finalDamage: passive.finalDamage },
        { abilityId: 'Q',          abilityName: 'Ntofo Strikes (Q) — par coup',                   rank: qR, damageType: 'physical', rawDamage: q.rawDamage,         finalDamage: q.finalDamage },
        { abilityId: 'Q_mark',     abilityName: 'Ntofo Strikes (Q) + proc marque passif',         rank: qR, damageType: 'physical', rawDamage: qWithMark.rawDamage, finalDamage: qWithMark.finalDamage },
        { abilityId: 'W_min',      abilityName: 'Path Maker (W) — charge min (physique)',         rank: wR, damageType: 'physical', rawDamage: wMin.rawDamage,      finalDamage: wMin.finalDamage },
        { abilityId: 'W_max',      abilityName: 'Path Maker (W) — charge max (physique)',         rank: wR, damageType: 'physical', rawDamage: wMax.rawDamage,      finalDamage: wMax.finalDamage },
        { abilityId: 'W_min_true', abilityName: 'Path Maker (W) — charge min — All Out (vrai)',  rank: wR, damageType: 'true',     rawDamage: wMinTrue.rawDamage,  finalDamage: wMinTrue.finalDamage },
        { abilityId: 'W_max_true', abilityName: 'Path Maker (W) — charge max — All Out (vrai)',  rank: wR, damageType: 'true',     rawDamage: wMaxTrue.rawDamage,  finalDamage: wMaxTrue.finalDamage },
        { abilityId: 'E',          abilityName: 'Footwork (E) — auto empowered',                  rank: eR, damageType: 'physical', rawDamage: e.rawDamage,         finalDamage: e.finalDamage },
        { abilityId: 'R',          abilityName: 'All Out (R) — impact (physique)',                rank: rR, damageType: 'physical', rawDamage: r.rawDamage,         finalDamage: r.finalDamage },
        { abilityId: 'R_allout',   abilityName: 'All Out (R) — impact — All Out (vrai dégât)',   rank: rR, damageType: 'true',     rawDamage: rAllOut.rawDamage,   finalDamage: rAllOut.finalDamage },
    ];
}

registerChampion('KSante', {
    name: "K'Sante",
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Ntofo Strikes',  maxRank: 5 },
        { key: 'w', label: 'W — Path Maker',     maxRank: 5 },
        { key: 'e', label: 'E — Footwork',       maxRank: 5 },
        { key: 'r', label: 'R — All Out',        maxRank: 3 },
    ],
});