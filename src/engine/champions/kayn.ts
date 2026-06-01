import { registerChampion, type AbilityCalcParams } from './registry';
import type { AbilityDamageResult } from '../../types/damage';
import { calculatePhysicalDamage, calculateMagicDamage } from '../damageCalculator';

// Q — Reaping Slash (Per hit, max 2 hits)
const Q_BASE = [75, 95, 115, 135, 155];
const Q_RATIO_BONUS_AD = 0.65;

// W — Blade's Reach
const W_BASE = [90, 135, 180, 225, 270];
const W_RATIO_BONUS_AD = 1.3;

// R — Umbral Trespass (Base & Assassin)
const R_BASE = [150, 250, 350];
const R_RATIO_BONUS_AD = 1.75;

function calculate(p: AbilityCalcParams): AbilityDamageResult[] {
    const qR = Math.max(1, Math.min(5, p.ranks.q ?? 1));
    const wR = Math.max(1, Math.min(5, p.ranks.w ?? 1));
    const rR = Math.max(1, Math.min(3, p.ranks.r ?? 1));

    const form = p.extras.form ?? 0; // 0 = Base, 1 = Assassin, 2 = Rhaast

    const results: AbilityDamageResult[] = [];

    if (form === 2) {
        // ── Rhaast (Darkin) ──
        // Q deals % Max HP
        // Q: 65% total AD + [3.5% + 5.5% per 100 bonus AD]% target Max HP
        const qMaxHPPct = 0.035 + (p.bonusAD / 100) * 0.055;
        const qRawPerHit = (p.totalAD * 0.65) + (p.target.maxHP * qMaxHPPct);
        const qHit = calculatePhysicalDamage(qRawPerHit, p.target, p.armorPenPercent, p.armorPenFlat);
        results.push({ abilityId: 'Q_hit', abilityName: 'Reaping Slash (Q — Rhaast) — 1 coup', rank: qR, damageType: 'physical', rawDamage: qHit.rawDamage, finalDamage: qHit.finalDamage });
        results.push({ abilityId: 'Q_total', abilityName: 'Reaping Slash (Q — Rhaast) — Total (2 coups)', rank: qR, damageType: 'physical', rawDamage: qHit.rawDamage * 2, finalDamage: qHit.finalDamage * 2, hits: 2, totalFinalDamage: qHit.finalDamage * 2 });

        // W
        const wRaw = W_BASE[wR - 1] + (p.bonusAD * W_RATIO_BONUS_AD);
        const w = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);
        results.push({ abilityId: 'W', abilityName: 'Blade\'s Reach (W — Rhaast)', rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage });

        // R deals % Max HP
        // R: 15% + 13% per 100 bonus AD of target Max HP
        const rMaxHPPct = 0.15 + (p.bonusAD / 100) * 0.13;
        const rRaw = p.target.maxHP * rMaxHPPct;
        const r = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);
        results.push({ abilityId: 'R', abilityName: 'Umbral Trespass (R — Rhaast)', rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage });

    } else {
        // ── Base & Shadow Assassin ──
        // Q: 75/95/115/135/155 + 65% bonus AD per hit
        const qRawPerHit = Q_BASE[qR - 1] + (p.bonusAD * Q_RATIO_BONUS_AD);
        const qHit = calculatePhysicalDamage(qRawPerHit, p.target, p.armorPenPercent, p.armorPenFlat);
        const nameSuffix = form === 1 ? ' — Assassin' : '';
        results.push({ abilityId: 'Q_hit', abilityName: `Reaping Slash (Q${nameSuffix}) — 1 coup`, rank: qR, damageType: 'physical', rawDamage: qHit.rawDamage, finalDamage: qHit.finalDamage });
        results.push({ abilityId: 'Q_total', abilityName: `Reaping Slash (Q${nameSuffix}) — Total (2 coups)`, rank: qR, damageType: 'physical', rawDamage: qHit.rawDamage * 2, finalDamage: qHit.finalDamage * 2, hits: 2, totalFinalDamage: qHit.finalDamage * 2 });

        // W
        const wRaw = W_BASE[wR - 1] + (p.bonusAD * W_RATIO_BONUS_AD);
        const w = calculatePhysicalDamage(wRaw, p.target, p.armorPenPercent, p.armorPenFlat);
        results.push({ abilityId: 'W', abilityName: `Blade's Reach (W${nameSuffix})`, rank: wR, damageType: 'physical', rawDamage: w.rawDamage, finalDamage: w.finalDamage });

        // R
        const rRaw = R_BASE[rR - 1] + (p.bonusAD * R_RATIO_BONUS_AD);
        const r = calculatePhysicalDamage(rRaw, p.target, p.armorPenPercent, p.armorPenFlat);
        results.push({ abilityId: 'R', abilityName: `Umbral Trespass (R${nameSuffix})`, rank: rR, damageType: 'physical', rawDamage: r.rawDamage, finalDamage: r.finalDamage });

        // Shadow Assassin Passive: 15% - 45% of final damage dealt is dealt as magic damage
        if (form === 1) {
            const passivePct = 0.15 + (0.30 * (p.level - 1) / 17);
            const passiveMagicRaw = r.rawDamage * passivePct;
            const passiveMagic = calculateMagicDamage(passiveMagicRaw, p.target, p.magicPenPercent, p.magicPenFlat);
            results.push({ abilityId: 'SA_Passive', abilityName: 'The Darkin Scythe (Passif SA) — Dégâts magiques bonus sur R', rank: 1, damageType: 'magic', rawDamage: passiveMagic.rawDamage, finalDamage: passiveMagic.finalDamage });
        }
    }

    return results;
}

registerChampion('Kayn', {
    name: 'Kayn',
    calculateAbilities: calculate,
    spellSlots: [
        { key: 'q', label: 'Q — Reaping Slash', maxRank: 5 },
        { key: 'w', label: 'W — Blade\'s Reach', maxRank: 5 },
        { key: 'r', label: 'R — Umbral Trespass', maxRank: 3 },
        { key: 'form', label: 'Forme de Kayn', maxRank: 1, extraParam: { label: 'Forme (0:Base, 1:Assassin, 2:Rhaast)', min: 0, max: 2, default: 0 } },
    ],
});
