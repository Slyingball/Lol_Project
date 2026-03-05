import type { Champion, DDragonChampionData } from '../types/champion';
import type { DDragonItemData, Item } from '../types/item';
import { DDRAGON_BASE_URL, DEFAULT_VERSION, SR_MAP_ID } from './constants';

// ─── Version ────────────────────────────────────────────────────────────────

export async function fetchLatestVersion(): Promise<string> {
    const res = await fetch(`${DDRAGON_BASE_URL}/api/versions.json`);
    if (!res.ok) return DEFAULT_VERSION;
    const versions: string[] = await res.json();
    return versions[0] ?? DEFAULT_VERSION;
}

// ─── Champion ────────────────────────────────────────────────────────────────

export async function fetchChampionData(
    championId: string,
    version: string = DEFAULT_VERSION
): Promise<Champion> {
    const res = await fetch(
        `${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/champion/${championId}.json`
    );
    if (!res.ok) throw new Error(`Champion not found: ${championId}`);

    const json = await res.json();
    const raw: DDragonChampionData = json.data[championId];
    const s = raw.stats;

    return {
        id: raw.id,
        name: raw.name,
        title: raw.title,
        tags: raw.tags,
        baseStats: {
            hp: s.hp,
            hpPerLevel: s.hpperlevel,
            armor: s.armor,
            armorPerLevel: s.armorperlevel,
            spellBlock: s.spellblock,
            spellBlockPerLevel: s.spellblockperlevel,
            attackDamage: s.attackdamage,
            // DDragon 16.5.1 bug: Garen's attackdamageperlevel is 0 → override via adGrowthOverride
            attackDamagePerLevel: s.attackdamageperlevel,
            attackSpeed: s.attackspeed,
            attackSpeedPerLevel: s.attackspeedperlevel,
            moveSpeed: s.movespeed,
            hpRegen: s.hpregen,
            hpRegenPerLevel: s.hpregenperlevel,
        },
    };
}

// ─── Champion list ────────────────────────────────────────────────────────────

export interface ChampionSummary {
    id: string;
    name: string;
    tags: string[];
}

export async function fetchChampionList(
    version: string = DEFAULT_VERSION
): Promise<ChampionSummary[]> {
    const res = await fetch(
        `${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/champion.json`
    );
    if (!res.ok) throw new Error('Failed to fetch champion list');
    const json = await res.json();
    return Object.values(json.data as Record<string, { id: string; name: string; tags: string[] }>)
        .map((c) => ({ id: c.id, name: c.name, tags: c.tags }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Items ────────────────────────────────────────────────────────────────────

/** Known Infinity Edge IDs across patches */
const IE_IDS = new Set(['3031', '223031']);

export async function fetchItemData(
    version: string = DEFAULT_VERSION
): Promise<Item[]> {
    const res = await fetch(
        `${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/item.json`
    );
    if (!res.ok) throw new Error('Failed to fetch items');
    const json = await res.json();
    const raw: Record<string, DDragonItemData> = json.data;

    return Object.entries(raw)
        .filter(([, item]) => {
            // Only purchasable SR items with actual stats
            return (
                item.gold.purchasable &&
                item.maps[SR_MAP_ID] &&
                Object.keys(item.stats).length > 0
            );
        })
        .map(([id, item]) => ({
            id,
            name: item.name,
            gold: item.gold.total,
            tags: item.tags,
            stats: item.stats,
            isSummonersRift: true,
            isInfinityEdge: IE_IDS.has(id),
        }));
}

// ─── Image helpers ────────────────────────────────────────────────────────────

export function getChampionIconUrl(championId: string, version = DEFAULT_VERSION) {
    return `${DDRAGON_BASE_URL}/cdn/${version}/img/champion/${championId}.png`;
}

export function getItemIconUrl(itemId: string, version = DEFAULT_VERSION) {
    return `${DDRAGON_BASE_URL}/cdn/${version}/img/item/${itemId}.png`;
}
