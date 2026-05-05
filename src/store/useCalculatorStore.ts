import { create } from 'zustand';
import type { Champion } from '../types/champion';
import type { Item, AggregatedItemStats, ItemInstance } from '../types/item';
import type { TargetStats } from '../types/target';
import type { CalculationResult } from '../types/damage';
import { DEFAULT_TARGET } from '../types/target';
import { computeChampionStatsAtLevel, aggregateItemStats } from '../engine/statCalculator';
import { calculateAutoAttack, getCritMultiplier } from '../engine/autoAttack';
import { getChampionConfig, type SpellSlotConfig } from '../engine/champions';
import { MAX_ITEM_SLOTS } from '../services/constants';

interface CalculatorState {
    // Champion
    champion: Champion | null;
    level: number;
    // Dynamic spell ranks & extras
    ranks: Record<string, number>;
    extras: Record<string, number>;
    // Items
    availableItems: Item[];
    selectedItems: ItemInstance[];
    // Target
    target: TargetStats;
    // API
    version: string;
    isLoading: boolean;
    error: string | null;
    // Result
    result: CalculationResult | null;
    // Dynamic spell slots from registry
    spellSlots: SpellSlotConfig[];

    // Actions
    setChampion: (champion: Champion) => void;
    setLevel: (level: number) => void;
    setRank: (key: string, value: number) => void;
    setExtra: (key: string, value: number) => void;
    addItem: (item: Item) => void;
    removeItem: (uid: string) => void;
    setTarget: (target: Partial<TargetStats>) => void;
    setAvailableItems: (items: Item[]) => void;
    setVersion: (version: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    computeDamage: () => void;
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
    champion: null,
    level: 11,
    ranks: {},
    extras: {},
    availableItems: [],
    selectedItems: [],
    target: DEFAULT_TARGET,
    version: '16.5.1',
    isLoading: false,
    error: null,
    result: null,
    spellSlots: [],

    setChampion: (champion) => {
        // Look up ability config from registry
        const config = getChampionConfig(champion.id);

        // Apply AD growth override if defined in the registry
        if (config?.adGrowthOverride !== undefined) {
            champion.adGrowthOverride = config.adGrowthOverride;
        }

        // Set default ranks & extras
        const ranks: Record<string, number> = {};
        const extras: Record<string, number> = {};
        const slots = config?.spellSlots ?? [];

        for (const slot of slots) {
            if (slot.extraParam) {
                extras[slot.key] = slot.extraParam.default;
            } else {
                ranks[slot.key] = Math.min(3, slot.maxRank); // default to rank 3 or max
            }
        }

        set({ champion, spellSlots: slots, ranks, extras });
        get().computeDamage();
    },

    setLevel: (level) => { set({ level }); get().computeDamage(); },
    setRank: (key, value) => {
        set((s) => ({ ranks: { ...s.ranks, [key]: value } }));
        get().computeDamage();
    },
    setExtra: (key, value) => {
        set((s) => ({ extras: { ...s.extras, [key]: value } }));
        get().computeDamage();
    },
    addItem: (item) => {
        if (get().selectedItems.length >= MAX_ITEM_SLOTS) return;
        const uid = Math.random().toString(36).slice(2, 11);
        set((s) => ({ selectedItems: [...s.selectedItems, { uid, item }] }));
        get().computeDamage();
    },
    removeItem: (uid) => {
        set((s) => ({ selectedItems: s.selectedItems.filter((i) => i.uid !== uid) }));
        get().computeDamage();
    },
    setTarget: (partial) => {
        set((s) => ({ target: { ...s.target, ...partial } }));
        get().computeDamage();
    },
    setAvailableItems: (availableItems) => set({ availableItems }),
    setVersion: (version) => set({ version }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    computeDamage: () => {
        const { champion, level, ranks, extras, selectedItems, target } = get();
        if (!champion) return;

        const stats = computeChampionStatsAtLevel(champion, level);
        const itemStats: AggregatedItemStats = aggregateItemStats(selectedItems.map((i) => i.item));

        const baseAD = stats.attackDamage;
        const bonusAD = itemStats.bonusAD;
        const totalAD = baseAD + bonusAD;
        const ap = itemStats.ap;
        const critChance = itemStats.critChance;
        const hasIE = itemStats.hasCritDamageBonus;
        const critMultiplier = getCritMultiplier(hasIE);

        // Auto-attack (works for ALL champions)
        const autoAttack = calculateAutoAttack(
            totalAD, critChance, hasIE, target,
            itemStats.armorPenPercent, itemStats.armorPenFlat
        );

        // Abilities (from registry, if available)
        const config = getChampionConfig(champion.id);
        const abilities = config
            ? config.calculateAbilities({
                totalAD, baseAD, bonusAD, ap, level,
                ranks, extras, target,
                armorPenPercent: itemStats.armorPenPercent,
                armorPenFlat: itemStats.armorPenFlat,
                magicPenPercent: itemStats.magicPenPercent,
                magicPenFlat: itemStats.magicPenFlat,
                critChance, critMultiplier,
            })
            : []; // No abilities hardcoded for this champion

        const result: CalculationResult = {
            championName: champion.name,
            level,
            totalAD, baseAD, bonusAD,
            critChance, hasIE, critMultiplier,
            autoAttack,
            abilities,
        };

        set({ result });
    },
}));
