import { useCalculatorStore } from '../store/useCalculatorStore';
import type { AbilityDamageResult } from '../types/damage';

const DAMAGE_COLOR: Record<string, string> = {
    physical: '#e8734a',
    magic: '#5b9bd5',
    true: '#c9b97a',
};

const DAMAGE_ICON: Record<string, string> = {
    physical: '⚔️',
    magic: '✨',
    true: '🔱',
};

export function DamageDisplay() {
    const { result, champion, isLoading, error } = useCalculatorStore();

    if (error) {
        return (
            <div className="card result-card">
                <p className="error-text">❌ Erreur : {error}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="card result-card">
                <div className="loading-spinner" />
                <p className="loading-text">Chargement des données…</p>
            </div>
        );
    }

    if (!champion || !result) {
        return (
            <div className="card result-card placeholder">
                <p>👆 Sélectionne un champion pour commencer</p>
            </div>
        );
    }

    const { autoAttack, abilities, totalAD, baseAD, bonusAD, critChance, hasIE, critMultiplier } =
        result;

    return (
        <div className="card result-card">
            <h2 className="section-title">📊 Résultats — {result.championName} niv.{result.level}</h2>

            {/* Stats summary */}
            <div className="stats-row">
                <StatBadge label="AD Total" value={Math.round(totalAD)} color="#e8734a" />
                <StatBadge label="AD Base" value={Math.round(baseAD)} color="#aaa" />
                <StatBadge label="AD Bonus" value={Math.round(bonusAD)} color="#5cdb95" />
                <StatBadge label="Crit Chance" value={`${Math.round(critChance * 100)}%`} color="#f7dc6f" />
                <StatBadge
                    label="Mult. Crit"
                    value={`×${critMultiplier.toFixed(2)}`}
                    color={hasIE ? '#f39c12' : '#aaa'}
                    tooltip={hasIE ? 'Infinity Edge actif (+40%)' : 'Standard (175%)'}
                />
            </div>

            {/* Auto-attack */}
            <div className="result-section">
                <h3 className="result-subtitle" style={{ color: DAMAGE_COLOR.physical }}>
                    ⚔️ Auto-attaque
                </h3>
                <div className="damage-row-grid">
                    <DamageRow label="Normale" value={autoAttack.normal.finalDamage} type="physical" />
                    <DamageRow label={`Crit ${hasIE ? '(IE)' : ''}`} value={autoAttack.crit.finalDamage} type="physical" highlight />
                    <DamageRow label={`Espérée (${Math.round(critChance * 100)}% crit)`} value={autoAttack.expected} type="physical" />
                </div>
            </div>

            {/* Abilities */}
            <div className="result-section">
                <h3 className="result-subtitle">🧙 Sorts</h3>
                {abilities.length > 0 ? (
                    abilities.map((ab) => (
                        <AbilityRow key={ab.abilityId} ability={ab} />
                    ))
                ) : (
                    <p className="no-data-hint">
                        ⚠️ Les ratios de ce champion ne sont pas encore enregistrés.
                        Seuls les dégâts d'auto-attaque sont calculés.
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatBadge({
    label,
    value,
    color,
    tooltip,
}: {
    label: string;
    value: string | number;
    color: string;
    tooltip?: string;
}) {
    return (
        <div className="stat-badge" title={tooltip}>
            <span className="stat-badge-value" style={{ color }}>
                {value}
            </span>
            <span className="stat-badge-label">{label}</span>
        </div>
    );
}

function DamageRow({
    label,
    value,
    type,
    highlight,
}: {
    label: string;
    value: number;
    type: string;
    highlight?: boolean;
}) {
    return (
        <div className={`damage-row ${highlight ? 'highlight' : ''}`}>
            <span className="damage-label">{label}</span>
            <span className="damage-value" style={{ color: DAMAGE_COLOR[type] }}>
                {Math.round(value)}
            </span>
        </div>
    );
}

function AbilityRow({ ability }: { ability: AbilityDamageResult }) {
    const icon = DAMAGE_ICON[ability.damageType];
    return (
        <div className="ability-row">
            <div className="ability-header">
                <span className="ability-name">
                    {icon} {ability.abilityName}
                </span>
                <span className="ability-rank">Rang {ability.rank}</span>
            </div>
            <div className="damage-row-grid">
                <DamageRow label="Brut" value={ability.rawDamage} type={ability.damageType} />
                <DamageRow label="Final" value={ability.finalDamage} type={ability.damageType} highlight />
                {ability.hits !== undefined && ability.totalFinalDamage !== undefined && (
                    <DamageRow
                        label={`Total (×${ability.hits} rot.)`}
                        value={ability.totalFinalDamage}
                        type={ability.damageType}
                    />
                )}
            </div>
        </div>
    );
}
