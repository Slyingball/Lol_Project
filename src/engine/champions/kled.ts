import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Q — Bear Trap on a Rope (Mounted)
const QM_LATCH_BASE = [30, 55, 80, 105, 130];
const QM_LATCH_BONUS_AD = 0.6;
const QM_PULL_BASE = [60, 110, 160, 210, 260];
const QM_PULL_BONUS_AD = 1.2;

// Q — Pocket Pistol (Dismounted, per pellet)
const QD_PELLET_BASE = [15, 19, 23, 27, 31];
const QD_PELLET_BONUS_AD = 0.4;

// W — Violent Tendencies (4th strike)
const W_BASE = [20, 30, 40, 50, 60];
const W_HP_PCT_BASE = [0.045, 0.05, 0.055, 0.06, 0.065];

// R — Chaaaaaaaarge!!! (Max distance)
const R_HP_PCT_BASE = [0.12, 0.15, 0.18];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const pellets = Math.max(1, Math.min(5, p.extras.pellets ?? 5));

    // Mounted Q
    const qmLatchRaw = QM_LATCH_BASE[qR - 1] + (p.bonusAD * QM_LATCH_BONUS_AD);
    const qmLatch = calculatePhysicalDamage(qmLatchRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const qmPullRaw = QM_PULL_BASE[qR - 1] + (p.bonusAD * QM_PULL_BONUS_AD);
    const qmPull = calculatePhysicalDamage(qmPullRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Dismounted Q (Pocket Pistol)
    const qdPelletRaw = QD_PELLET_BASE[qR - 1] + (p.bonusAD * QD_PELLET_BONUS_AD);
    const qdPellet = calculatePhysicalDamage(qdPelletRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const qdTotalRaw = qdPelletRaw * pellets;
    const qdTotal = calculatePhysicalDamage(qdTotalRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // W (4th strike deals flat + % Max HP scaling with bonus AD)
    const wHPPct = W_HP_PCT_BASE[wR - 1] + (p.bonusAD / 100) * 0.05;
    const wRaw = W_BASE[wR - 1] + (p.target.maxHP * wHPPct);
    const w = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R
    const rHPPct = R_HP_PCT_BASE[rR - 1] + (p.bonusAD / 100) * 0.12;
    const rRaw = p.target.maxHP * rHPPct;
    const r = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'QM_latch', abilityName: 'Bear Trap on a Rope (Q Monté) — impact', rank: qR, damageType: 'physical', rawDamage: qmLatch.rawDamage, finalDamage: qmLatch.finalDamage },
        { abilityId: 'QM_pull', abilityName: 'Bear Trap on a Rope (Q Monté) — traction', rank: qR, damageType: 'physical', rawDamage: qmPull.rawDamage, finalDamage: qmPull.finalDamage },
        { abilityId: 'QD_pellet', abilityName: 'Pocket Pistol (Q Piéton) — par plomb', rank: qR, damageType: 'physical', rawDamage: qdPellet.rawDamage, finalDamage: qdPellet.finalDamage },
        { abilityId: 'QD_total', abilityName: `Pocket Pistol (Q Piéton) — Total (${pellets} plombs)`, rank: qR, damageType: 'physical', rawDamage: qdTotal.rawDamage, finalDamage: qdTotal.finalDamage },
        { abilityId: 'W', abilityName: 'Violent Tendencies (W) — 4e coup', rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage },
        { abilityId: 'R', abilityName: 'Chaaaaaaaarge!!! (R) — Dégâts max', rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage },
    ];
}

registerChampion('Kled', {
    name: 'Kled',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Skill de tir (Monté/Piéton)', maxRank: 5 },
        { key: 'pellets', label: 'Q — Plombs Piéton', maxRank: 1, extraParam: { label: 'Plombs au but (1-5)', min: 1, max: 5, default: 5 } },
        { key: 'w', label: 'W — Violent Tendencies', maxRank: 5 },
        { key: 'r', label: 'R — Chaaaaaaaarge!!!', maxRank: 3 },
    ],
});
