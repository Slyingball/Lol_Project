
import { ChampionSelector } from './components/ChampionSelector';
import { LevelSlider } from './components/LevelSlider';
import { ItemSelector } from './components/ItemSelector';
import { TargetInput } from './components/TargetInput';
import { DamageDisplay } from './components/DamageDisplay';
import { useCalculatorStore } from './store/useCalculatorStore';

function App() {
  const { isLoading } = useCalculatorStore();

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⚔️</span>
            <span className="logo-text">LoL Damage Calculator</span>
          </div>
          {isLoading && <span className="header-loading">Chargement…</span>}
          <div className="header-badge">Patch 16.5.1</div>
        </div>
      </header>

      {/* Main layout */}
      <main className="main-grid">
        {/* Left column */}
        <aside className="col-left">
          <ChampionSelector />
        </aside>

        {/* Centre column */}
        <section className="col-center">
          <LevelSlider />
          <ItemSelector />
          <TargetInput />
        </section>

        {/* Right column — results */}
        <section className="col-right">
          <DamageDisplay />
        </section>
      </main>

      <footer className="footer">
        <span>Données via Riot Data Dragon · Non affilié à Riot Games</span>
      </footer>
    </div>
  );
}

export default App;
