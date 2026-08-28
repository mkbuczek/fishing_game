import { useState } from 'react';
import './App.css';
import FishingHUD from './components/FishingHUD';
import CastButton from './components/CastButton';
import CurrencyHUD from './components/CurrencyHUD';
import ResultPopup from './components/ResultPopup';
import ButtonDock from './components/ButtonDock';
import DockButton from './components/DockButton';
import ShopPanel from './components/ShopPanel';

function App() {
  const [gamePhase, setGamePhase] = useState('idle'); // 'idle' | 'fishing' | 'result'
  const [resultData, setResultData] = useState(null); // { outcome, reward } | null
  const [pearls, setPearls] = useState(0); // Player's current pearl count
  const [activePanel, setActivePanel] = useState(null); // null | 'shop'

  // Handle the "Cast Line" button click
  function handleCast() {
    setGamePhase('fishing');
  }

  // Handle the result of the fishing minigame (win/loss)
  function handleFishingResult(outcome) {
    const fishReward = Math.floor(Math.random() * (20 - 1 + 1)) + 1; // Random hard-coded reward between 1 and 20 pearls
    const reward = outcome === 'caught' ? fishReward : 0;

    setPearls((prevPearls) => prevPearls + reward); // Update the player's pearl count

    setResultData({ outcome, reward });
    setGamePhase('result');
  }

  // Handle the dismissal of the result popup
  function handleDismissResult() {
    setResultData(null);
    setGamePhase('idle');
  }
  
  return (
    <div className="app">
      <div className="top-bar">
        <CastButton onClick={handleCast} disabled={gamePhase !== 'idle'} />
        <CurrencyHUD pearls={pearls} />
      </div>
 
      <div className="game-area">
        {gamePhase === 'fishing' && <FishingHUD onResult={handleFishingResult} />}
      </div>

      <ButtonDock>
        <DockButton icon="🛒" label="Shop" onClick={() => setActivePanel('shop')} disabled={gamePhase !== 'idle'}/>
      </ButtonDock>

      {activePanel === 'shop' && (
        <ShopPanel onClose={() => setActivePanel(null)} />
      )}

      {gamePhase === 'result' && resultData && (
        <ResultPopup
          outcome={resultData.outcome}
          reward={resultData.reward}
          onDismiss={handleDismissResult}
        />
      )}
    </div>
  );
}

export default App;