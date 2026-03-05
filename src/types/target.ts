/** Stats describing the enemy target. */
export interface TargetStats {
    name: string;
    level: number;
    maxHP: number;
    currentHP: number;
    armor: number;
    magicResist: number;
    bonusArmor: number;     // from items/buffs (for armour-reduction calc)
}

export const DEFAULT_TARGET: TargetStats = {
    name: 'Dummy',
    level: 11,
    maxHP: 2000,
    currentHP: 2000,
    armor: 100,
    magicResist: 60,
    bonusArmor: 0,
};
