import { Swords } from 'lucide-react';
import { ChampionSelector } from './components/ChampionSelector';
import { LevelSlider } from './components/LevelSlider';
import { ItemSelector } from './components/ItemSelector';
import { TargetInput } from './components/TargetInput';
import { DamageDisplay } from './components/DamageDisplay';
import { useCalculatorStore } from './store/useCalculatorStore';

function App() {
  const { isLoading, version } = useCalculatorStore();

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <Swords className="logo-icon" size={20} color="var(--accent)" />
            <span className="logo-text">LoL Damage Calculator</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isLoading && <span className="header-loading">Syncing…</span>}
            <span className="header-badge">Patch {version}</span>
          </div>
        </div>
      </header>

      <main className="main-grid">
        <aside className="col-left">
          <ChampionSelector />
        </aside>

        <section className="col-center">
          <LevelSlider />
          <ItemSelector />
          <TargetInput />
        </section>

        <section className="col-right">
          <DamageDisplay />
        </section>
      </main>

      <footer className="footer">
        Non affilié à Riot Games · Données via Riot Data Dragon
      </footer>
    </div>
  );
}

export default App;
