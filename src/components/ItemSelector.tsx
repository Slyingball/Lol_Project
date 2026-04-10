import { useState } from 'react';
import { useCalculatorStore } from '../store/useCalculatorStore';
import { getItemIconUrl } from '../services/dataDragon';

type ItemCategory = 'Tous' | 'Tireur' | 'Mage' | 'Tank' | 'Combattant' | 'Assassin';

function matchCategory(tags: string[], cat: ItemCategory) {
    if (cat === 'Tous') return true;
    if (cat === 'Tireur') return tags.includes('Damage') && (tags.includes('CriticalStrike') || tags.includes('AttackSpeed') || tags.includes('LifeSteal'));
    if (cat === 'Mage') return tags.includes('SpellDamage');
    if (cat === 'Tank') return tags.includes('Health') && (tags.includes('Armor') || tags.includes('SpellBlock'));
    if (cat === 'Combattant') return tags.includes('Damage') && tags.includes('Health');
    if (cat === 'Assassin') return tags.includes('Damage') && tags.includes('ArmorPenetration');
    return false;
}

export function ItemSelector() {
    const { availableItems, selectedItems, addItem, removeItem, version } = useCalculatorStore();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<ItemCategory>('Tireur');

    const filtered = availableItems
        .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
        .filter((item) => matchCategory(item.tags, category));

    const categories: ItemCategory[] = ['Tous', 'Tireur', 'Mage', 'Combattant', 'Tank', 'Assassin'];

    const groupedItems: Record<string, typeof availableItems> = {
        'Starter Items': [],
        'Consumable Items': [],
        'Boots': [],
        'Basic Items': [],
        'Epic Items': [],
        'Legendary Items': []
    };

    filtered.forEach(item => {
        if (item.tags.includes('Consumable')) groupedItems['Consumable Items'].push(item);
        else if (item.tags.includes('Boots')) groupedItems['Boots'].push(item);
        else if (item.tags.includes('Lane') || item.tags.includes('Jungle') || item.tags.includes('GoldPer') || (item.gold < 500 && item.tags.includes('HealthRegen'))) groupedItems['Starter Items'].push(item);
        else if (item.gold >= 2100) groupedItems['Legendary Items'].push(item);
        else if (item.gold >= 600) groupedItems['Epic Items'].push(item);
        else groupedItems['Basic Items'].push(item);
    });

    return (
        <div className="card">
            <h2 className="section-title">🛡️ Objets</h2>

            {/* Selected items */}
            {selectedItems.length > 0 && (
                <div className="selected-items">
                    {selectedItems.map((instance) => (
                        <div key={instance.uid} className="selected-item-badge" title={instance.item.name}>
                            <img src={getItemIconUrl(instance.item.id, version)} alt={instance.item.name} />
                            <button className="remove-btn" onClick={() => removeItem(instance.uid)}>×</button>
                        </div>
                    ))}
                </div>
            )}

            <div className="role-filter" style={{ marginBottom: '10px' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`role-btn ${category === cat ? 'active' : ''}`}
                        onClick={() => setCategory(cat)}
                    >
                        <span className="role-label">{cat}</span>
                    </button>
                ))}
            </div>

            <input
                className="search-input"
                type="text"
                placeholder="Rechercher un objet…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="item-groups" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {Object.entries(groupedItems).filter(([, items]) => items.length > 0).map(([tier, items]) => (
                    <div key={tier} className="item-tier-section">
                        <h3 className="item-tier-title">{tier}</h3>
                        <div className="item-tier-grid">
                            {items.map((item) => {
                                const count = selectedItems.filter((i) => i.item.id === item.id).length;
                                return (
                                    <button
                                        key={item.id}
                                        className={`item-tile ${count > 0 ? 'active' : ''}`}
                                        onClick={() => addItem(item)}
                                        title={`${item.name} — ${item.gold}g`}
                                    >
                                        <img src={getItemIconUrl(item.id, version)} alt={item.name} loading="lazy" />
                                        {count > 1 && <span className="item-count-badge">x{count}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
