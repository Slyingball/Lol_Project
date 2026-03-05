export type DamageType = 'physical' | 'magic' | 'true';

export interface SingleDamageResult {
    type: DamageType;
    rawDamage: number;
    finalDamage: number;       // after mitigation
    isCrit: boolean;
}

export interface AutoAttackResult {
    label: string;
    normal: SingleDamageResult;
    crit: SingleDamageResult;
    expected: number;          // normal × (1 - critChance) + crit × critChance
}

export interface AbilityDamageResult {
    abilityId: string;
    abilityName: string;
    rank: number;
    damageType: DamageType;
    rawDamage: number;
    finalDamage: number;       // after mitigation
    /** For multi-hit abilities (e.g. Garen E), total = finalDamage × hits */
    hits?: number;
    totalFinalDamage?: number;
}

export interface CalculationResult {
    championName: string;
    level: number;
    totalAD: number;           // base AD + bonus AD from items
    baseAD: number;
    bonusAD: number;
    critChance: number;        // 0–1
    hasIE: boolean;
    critMultiplier: number;    // 1.75 normally, 2.15 with IE
    autoAttack: AutoAttackResult;
    abilities: AbilityDamageResult[];
}
