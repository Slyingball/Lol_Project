
import { useCalculatorStore } from '../store/useCalculatorStore';

export function TargetInput() {
    const { target, setTarget, champion } = useCalculatorStore();

    if (!champion) return null;

    return (
        <div className="card compact">
            <h2 className="section-title">🎯 Cible</h2>

            <div className="input-grid">
                <StatInput
                    label="HP Max"
                    value={target.maxHP}
                    onChange={(v) => setTarget({ maxHP: v, currentHP: Math.min(target.currentHP, v) })}
                    min={100}
                    max={10000}
                />
                <StatInput
                    label="HP Actuel"
                    value={target.currentHP}
                    onChange={(v) => setTarget({ currentHP: Math.max(0, Math.min(v, target.maxHP)) })}
                    min={0}
                    max={target.maxHP}
                />
                <StatInput
                    label="Armure"
                    value={target.armor}
                    onChange={(v) => setTarget({ armor: v })}
                    min={0}
                    max={500}
                />
                <StatInput
                    label="Résist. Magique"
                    value={target.magicResist}
                    onChange={(v) => setTarget({ magicResist: v })}
                    min={0}
                    max={500}
                />
            </div>

            {/* HP bar */}
            <div className="hp-bar-container">
                <div
                    className="hp-bar"
                    style={{ width: `${Math.round((target.currentHP / target.maxHP) * 100)}%` }}
                />
                <span className="hp-bar-label">
                    {Math.round(target.currentHP)} / {Math.round(target.maxHP)} HP (
                    {Math.round(((target.maxHP - target.currentHP) / target.maxHP) * 100)}% manquant)
                </span>
            </div>
        </div>
    );
}

interface StatInputProps {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
}

function StatInput({ label, value, onChange, min, max }: StatInputProps) {
    return (
        <div className="stat-input-group">
            <label>{label}</label>
            <input
                type="number"
                value={Math.round(value)}
                min={min}
                max={max}
                onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v)) onChange(v);
                }}
            />
        </div>
    );
}
