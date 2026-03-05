import React, { useState } from 'react';
import { useCalculatorStore } from '../store/useCalculatorStore';
import { getItemIconUrl } from '../services/dataDragon';

export function ItemSelector() {
    const { availableItems, selectedItems, toggleItem, version } = useCalculatorStore();
    const [search, setSearch] = useState('');

    const filtered = availableItems
        .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 60);

    return (
        <div className="card">
            <h2 className="section-title">🛡️ Objets</h2>

            {/* Selected items */}
            {selectedItems.length > 0 && (
                <div className="selected-items">
                    {selectedItems.map((item) => (
                        <div key={item.id} className="selected-item-badge" title={item.name}>
                            <img src={getItemIconUrl(item.id, version)} alt={item.name} />
                            <button className="remove-btn" onClick={() => toggleItem(item)}>×</button>
                        </div>
                    ))}
                </div>
            )}

            <input
                className="search-input"
                type="text"
                placeholder="Rechercher un objet…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="item-grid">
                {filtered.map((item) => {
                    const isSelected = selectedItems.some((i) => i.id === item.id);
                    return (
                        <button
                            key={item.id}
                            className={`item-tile ${isSelected ? 'active' : ''}`}
                            onClick={() => toggleItem(item)}
                            title={`${item.name} — ${item.gold}g`}
                        >
                            <img src={getItemIconUrl(item.id, version)} alt={item.name} loading="lazy" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
