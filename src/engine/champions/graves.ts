/**
 * Graves — The Outlaw
 * Patch 16.5.1 · Source: League Wiki
 */
import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Passive — New Destiny: shotgun auto — 4 pellets (8 at max range fall off)
//   Per pellet: 110% total AD (4 pellets = 440% total AD at close range)
//   Graves has innate 40/60/80 (by level bracket) bonus armor

// Q — End of the Line: 250/350/450/550/650 + 160% bonus AD (physical)
//   Returns and explodes: 200/280/360/440/520 + 130% bonus AD (physical)
const Q_INITIAL_BASE = [250, 350, 450, 550, 650];
const Q_RETURN_BASE  = [200, 280, 360, 440, 520];

// W — Smoke Screen: no damage, vision denial zone

// E — Quickdraw: 40/55/70/85/100 + 40% total AD (physical, empowers next 2 autos)
//   Dash + reload one shell
const E_BASE = [40, 55, 70, 85, 100];

// R — Collateral Damage: 250/400/550 + 150% bonus AD (physical, main target)
//   Explosion: 200/300/400 + 100% bonus AD (physical, AoE behind)
const R_MAIN_BASE = [250, 400, 550];
const R_AOE_BASE  = [200, 300, 400];

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    // Passive — auto (close range, all 4 pellets)
    const pelletRaw   = 1.10 * p.totalAD;
    const pellet      = calculatePhysicalDamage(pelletRaw, p.target, p.armorPenPercent, p.armorPenFlat);
    const auto4Pellet = calculatePhysicalDamage(pelletRaw * 4, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q — initial hit
    const qInitRaw = Q_INITIAL_BASE[qR - 1] + 1.60 * p.bonusAD;
    const qInit    = calculatePhysicalDamage(qInitRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q — return explosion
    const qRetRaw = Q_RETURN_BASE[qR - 1] + 1.30 * p.bonusAD;
    const qRet    = calculatePhysicalDamage(qRetRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q — full combo (both hits)
    const qComboRaw = qInitRaw + qRetRaw;
    const qCombo    = calculatePhysicalDamage(qComboRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E — damage on dash
    const eRaw = E_BASE[eR - 1] + 0.40 * p.totalAD;
    const e    = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R — main target
    const rMainRaw = R_MAIN_BASE[rR - 1] + 1.50 * p.bonusAD;
    const rMain    = calculatePhysicalDamage(rMainRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // R — AoE explosion
    const rAoERaw = R_AOE_BASE[rR - 1] + 1.00 * p.bonusAD;
    const rAoE    = calculatePhysicalDamage(rAoERaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'auto_pellet',  abilityName: 'Auto — par pellet (passif)',              rank: 0,  damageType: 'physical', rawDamage: pellet.rawDamage,      finalDamage: pellet.finalDamage },
        { abilityId: 'auto_4pellet', abilityName: 'Auto — 4 pellets (courte portée)',         rank: 0,  damageType: 'physical', rawDamage: auto4Pellet.rawDamage, finalDamage: auto4Pellet.finalDamage },
        { abilityId: 'Q_init',       abilityName: 'End of the Line (Q) — impact initial',    rank: qR, damageType: 'physical', rawDamage: qInit.rawDamage,       finalDamage: qInit.finalDamage },
        { abilityId: 'Q_return',     abilityName: 'End of the Line (Q) — explosion retour',  rank: qR, damageType: 'physical', rawDamage: qRet.rawDamage,        finalDamage: qRet.finalDamage },
        { abilityId: 'Q_combo',      abilityName: 'End of the Line (Q) — combo complet',     rank: qR, damageType: 'physical', rawDamage: qCombo.rawDamage,      finalDamage: qCombo.finalDamage },
        { abilityId: 'E',            abilityName: 'Quickdraw (E)',                            rank: eR, damageType: 'physical', rawDamage: e.rawDamage,           finalDamage: e.finalDamage },
        { abilityId: 'R_main',       abilityName: 'Collateral Damage (R) — cible directe',   rank: rR, damageType: 'physical', rawDamage: rMain.rawDamage,       finalDamage: rMain.finalDamage },
        { abilityId: 'R_aoe',        abilityName: 'Collateral Damage (R) — explosion AoE',   rank: rR, damageType: 'physical', rawDamage: rAoE.rawDamage,        finalDamage: rAoE.finalDamage },
    ];
}

registerChampion('Graves', {
    name: 'Graves',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — End of the Line',     maxRank: 5 },
        { key: 'e', label: 'E — Quickdraw',           maxRank: 5 },
        { key: 'r', label: 'R — Collateral Damage',   maxRank: 3 },
    ],
});