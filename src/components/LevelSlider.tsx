import { useCalculatorStore } from '../store/useCalculatorStore';

export function LevelSlider() {
    const { level, setLevel, champion, spellSlots, ranks, extras, setRank, setExtra } =
        useCalculatorStore();

    if (!champion) return null;

    return (
        <div className="card compact">
            <h2 className="section-title">⚡ Niveau &amp; Rangs</h2>

            {/* Champion level */}
            <div className="slider-row">
                <label>Niveau champion</label>
                <input
                    type="range"
                    min={1}
                    max={20}
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                />
                <span className="slider-value">{level}</span>
            </div>

            {/* Dynamic spell rank sliders from registry */}
            {spellSlots.map((slot) => {
                if (slot.extraParam) {
                    // Extra numeric param (e.g. E spin count, passive stacks)
                    const val = extras[slot.key] ?? slot.extraParam.default;
                    return (
                        <div className="slider-row" key={slot.key}>
                            <label>{slot.extraParam.label}</label>
                            <input
                                type="range"
                                min={slot.extraParam.min}
                                max={slot.extraParam.max}
                                value={val}
                                onChange={(e) => setExtra(slot.key, Number(e.target.value))}
                            />
                            <span className="slider-value">{val}</span>
                        </div>
                    );
                }

                // Normal spell rank slider
                const val = ranks[slot.key] ?? 1;
                return (
                    <div className="slider-row" key={slot.key}>
                        <label>{slot.label}</label>
                        <input
                            type="range"
                            min={1}
                            max={slot.maxRank}
                            value={val}
                            onChange={(e) => setRank(slot.key, Number(e.target.value))}
                        />
                        <span className="slider-value">{val}</span>
                    </div>
                );
            })}

            {spellSlots.length === 0 && (
                <p className="no-data-hint">
                    💡 Données d'abilities non disponibles pour ce champion. Les auto-attaques sont toujours calculées.
                </p>
            )}
        </div>
    );
}
