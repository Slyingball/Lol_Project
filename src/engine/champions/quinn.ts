import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage } from '../damageCalculator';

// Q — Blinding Assault
const Q_BASE = [20, 45, 70, 95, 120];
const Q_RATIO_TOTAL_AD = [0.8, 0.9, 1.0, 1.1, 1.2];
const Q_RATIO_AP = 0.5;

// E — Vault
const E_BASE = [40, 70, 100, 130, 160];
const E_RATIO_BONUS_AD = 0.2;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const eR = Math.max(1, Math.min(5, p.ranks.e ?? 1));

    // Passive — Harrier (Vulnerable mark auto-attack damage: 10-95 + 10%-50% total AD)
    const passiveBase = 10 + 85 * (p.level - 1) / 17;
    const passiveRatio = 0.1 + 0.4 * (p.level - 1) / 17;
    const passiveRaw = passiveBase + (p.totalAD * passiveRatio);
    const passive = calculatePhysicalDamage(passiveRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // Q
    const qRaw = Q_BASE[qR - 1] + (p.totalAD * Q_RATIO_TOTAL_AD[qR - 1]) + (p.ap * Q_RATIO_AP);
    const q = calculatePhysicalDamage(qRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    // E
    const eRaw = E_BASE[eR - 1] + (p.bonusAD * E_RATIO_BONUS_AD);
    const e = calculatePhysicalDamage(eRaw, p.target, p.armorPenPercent, p.armorPenFlat);

    return [
        { abilityId: 'Passive', abilityName: `Harrier (Passif) — dégâts marque (+${Math.round(passiveRatio * 100)}% AD)`, rank: 1, damageType: 'physical', rawDamage: passive.rawDamage, finalDamage: passive.finalDamage },
        { abilityId: 'Q', abilityName: 'Blinding Assault (Q)', rank: qR, damageType: 'physical', rawDamage: q.rawDamage, finalDamage: q.finalDamage },
        { abilityId: 'E', abilityName: 'Vault (E)', rank: eR, damageType: 'physical', rawDamage: e.rawDamage, finalDamage: e.finalDamage },
    ];
}

registerChampion('Quinn', {
    name: 'Quinn',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Blinding Assault', maxRank: 5 },
        { key: 'e', label: 'E — Vault', maxRank: 5 },
    ],
});
