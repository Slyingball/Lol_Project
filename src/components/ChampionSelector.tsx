import { useEffect, useState } from 'react';
import { useCalculatorStore } from '../store/useCalculatorStore';
import {
    fetchLatestVersion,
    fetchChampionList,
    fetchChampionData,
    fetchItemData,
    getChampionIconUrl,
    type ChampionSummary,
} from '../services/dataDragon';

// ─── Role filter mapping ────────────────────────────────────────────────────
type Role = 'All' | 'Top' | 'Mid' | 'Jungle' | 'ADC' | 'Support';

const ROLE_LABELS: { role: Role; icon: string }[] = [
    { role: 'All', icon: '🔄' },
    { role: 'Top', icon: '🛡️' },
    { role: 'Jungle', icon: '🌿' },
    { role: 'Mid', icon: '🔮' },
    { role: 'ADC', icon: '🏹' },
    { role: 'Support', icon: '💛' },
];

/** Maps DDragon tags to approximate roles. */
const TAG_TO_ROLE: Record<string, Role[]> = {
    Fighter: ['Top', 'Jungle'],
    Tank: ['Top', 'Jungle', 'Support'],
    Mage: ['Mid', 'Support'],
    Assassin: ['Mid', 'Jungle'],
    Marksman: ['ADC'],
    Support: ['Support'],
};

/** Known junglers that DDragon tags alone can't identify. */
const KNOWN_JUNGLERS = new Set([
    'Amumu', 'Diana', 'Ekko', 'Elise', 'Evelynn', 'Fiddlesticks', 'Gragas',
    'Graves', 'Hecarim', 'Ivern', 'JarvanIV', 'Kayn', 'Khazix', 'Kindred',
    'LeeSin', 'Lillia', 'MasterYi', 'Nidalee', 'Nocturne', 'Nunu', 'Olaf',
    'RekSai', 'Rengar', 'Sejuani', 'Shaco', 'Shyvana', 'Skarner', 'Taliyah',
    'Udyr', 'Vi', 'Viego', 'Warwick', 'XinZhao', 'Zac', 'BelVeth', 'Briar',
    'Belveth', 'Rammus', 'Volibear', 'Wukong', 'Trundle', 'Poppy', 'Maokai',
    'Zyra', 'Brand', 'Karthus', 'Talon', 'Qiyana', 'Zed',
]);

function matchesRole(champ: ChampionSummary, role: Role): boolean {
    if (role === 'All') return true;

    // Check jungle by known-list first
    if (role === 'Jungle' && KNOWN_JUNGLERS.has(champ.id)) return true;

    // Check via DDragon tags
    for (const tag of champ.tags) {
        const roles = TAG_TO_ROLE[tag];
        if (roles?.includes(role)) return true;
    }
    return false;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ChampionSelector() {
    const { setChampion, setAvailableItems, setVersion, setLoading, setError, champion } =
        useCalculatorStore();
    const [champions, setChampions] = useState<ChampionSummary[]>([]);
    const [search, setSearch] = useState('');
    const [version, setVersionLocal] = useState('16.5.1');
    const [roleFilter, setRoleFilter] = useState<Role>('All');

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const v = await fetchLatestVersion();
                setVersionLocal(v);
                setVersion(v);
                const [list, items] = await Promise.all([
                    fetchChampionList(v),
                    fetchItemData(v),
                ]);
                setChampions(list);
                setAvailableItems(items);
            } catch (e) {
                setError(String(e));
            } finally {
                setLoading(false);
            }
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = champions
        .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        .filter((c) => matchesRole(c, roleFilter));

    async function handleSelect(id: string) {
        setLoading(true);
        try {
            const data = await fetchChampionData(id, version);
            // Known DDragon growth overrides
            if (id === 'Garen') data.adGrowthOverride = 4.5;
            setChampion(data);
        } catch (e) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card">
            <h2 className="section-title">🗡️ Champion</h2>
            {champion && (
                <div className="selected-champion">
                    <img
                        src={getChampionIconUrl(champion.id, version)}
                        alt={champion.name}
                        className="champ-icon-lg"
                    />
                    <div>
                        <div className="champ-name">{champion.name}</div>
                        <div className="champ-title">{champion.title}</div>
                    </div>
                </div>
            )}

            {/* Role filter */}
            <div className="role-filter">
                {ROLE_LABELS.map(({ role, icon }) => (
                    <button
                        key={role}
                        className={`role-btn ${roleFilter === role ? 'active' : ''}`}
                        onClick={() => setRoleFilter(role)}
                        title={role}
                    >
                        <span className="role-icon">{icon}</span>
                        <span className="role-label">{role}</span>
                    </button>
                ))}
            </div>

            <input
                className="search-input"
                type="text"
                placeholder="Rechercher un champion…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <div className="champion-grid">
                {filtered.slice(0, 60).map((c) => (
                    <button
                        key={c.id}
                        className={`champ-tile ${champion?.id === c.id ? 'active' : ''}`}
                        onClick={() => handleSelect(c.id)}
                        title={c.name}
                    >
                        <img
                            src={getChampionIconUrl(c.id, version)}
                            alt={c.name}
                            loading="lazy"
                        />
                        <span>{c.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
