import { useState, useEffect } from 'react';
import './App.css';
import FishingHUD from './components/FishingHUD';
import CastButton from './components/CastButton';
import CurrencyHUD from './components/CurrencyHUD';
import ResultPopup from './components/ResultPopup';
import ButtonDock from './components/ButtonDock';
import DockButton from './components/DockButton';
import ShopPanel from './components/ShopPanel';
import upgrades from './data/upgrades';

function App() {
  const baseStats = {
    startingProgress: 40, // % of starting progress value
    barHeight: 15,   // % of track height
    upSpeed: 0.75, // rate at which the catch bar moves up
    downSpeed: 0.5, // rate at which the catch bar moves down
    fillRate: 0.3, // rate at which progress fills when the bar overlaps with the fish
    drainRate: 0.25, // rate at which progress drains when the bar does not overlap with the fish
    catchReward: 0, // amount of extra pearls per catch
    luck: 0,
    biteMin: 0.5, // fastest possible bite, seconds
    biteMax: 10, // slowest possible bite, seconds
    biteExponent: 0.5, // <1 = skews towards slow, >1 = skews towards fast
  }

  const [gamePhase, setGamePhase] = useState('idle'); // 'idle' | 'waiting' | 'fishing' | 'result'
  const [resultData, setResultData] = useState(null); // { outcome, reward } | null
  const [pearls, setPearls] = useState(0); // player's current pearl count
  const [activePanel, setActivePanel] = useState(null); // null | 'shop'
  const [ownedUpgrades, setOwnedUpgrades] = useState([]);

  // handle the "Cast Line" button click
  function handleCast() {
    setGamePhase('waiting');
  }

  // handle the result of the fishing minigame (win/loss)
  function handleFishingResult(outcome) {
    const fishReward = Math.floor(Math.random() * (20 - 1 + 1)) + 1; // random hard-coded reward between 1 and 20 pearls
    const reward = outcome === 'caught' ? fishReward + playerStats.catchReward : 0;

    setPearls((prevPearls) => prevPearls + reward); // update the player's pearl count

    setResultData({ outcome, reward });
    setGamePhase('result');
  }

  // handle the dismissal of the result popup
  function handleDismissResult() {
    setResultData(null);
    setGamePhase('idle');
  }

  // handle upgrade purchases
  function handlePurchase(upgrade) {
    if (pearls < upgrade.cost) {
      return; // return if not enough money
    }

    const requiredUpgrades = upgrade.requires;
    if (requiredUpgrades.length !== 0) {
      const hasAllRequired = requiredUpgrades.every(reqId => ownedUpgrades.includes(reqId));

      if (!hasAllRequired) {
        return; // return if lacking upgrade prereqs
      }
    }

    setPearls((prevPearls) => prevPearls - upgrade.cost);
    setOwnedUpgrades((prevOwned) => [...prevOwned, upgrade.id]);
  }
  
  // compute player stats based on upgrade bonuses
  function computePlayerStats(ownedUpgrades) {
    const stats = { ...baseStats }; // spread stats array

    ownedUpgrades.forEach((id) => {
      const upgrade = upgrades.find((u) => u.id === id);

      if (upgrade) {
        stats[upgrade.statKey] += upgrade.statBonus;
      }
    });

    return stats;
  }

  // update player stats
  const playerStats = computePlayerStats(ownedUpgrades);

  // handle fish bite delay after cast
  useEffect(() => {
    if (gamePhase !== 'waiting') return;

    const { biteMin, biteMax, biteExponent } = playerStats;
    const biteRoll = Math.random() ** biteExponent;
    const delaySeconds = biteMin + biteRoll * (biteMax - biteMin);

    const timer = setTimeout(() => {
      setGamePhase('fishing');
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [gamePhase, playerStats.biteMin, playerStats.biteMax, playerStats.biteExponent]);

  // handle cancelling a cast
  useEffect(() => {
    if (gamePhase !== 'waiting') return;

    function handleCancelKey(event) {
      if (event.code === 'Space') {
        event.preventDefault();
        setGamePhase('idle');
      }
    }

    function handleCancelClick() {
      setGamePhase('idle');
    }

    window.addEventListener('keydown', handleCancelKey);
    window.addEventListener('mousedown', handleCancelClick);

    return () => {
      window.removeEventListener('keydown', handleCancelKey);
      window.removeEventListener('mousedown', handleCancelClick);
    };
  }, [gamePhase]);

  return (
    <div className="app">
      <div className="top-bar">
        <CastButton onClick={handleCast} disabled={gamePhase !== 'idle'} />
        <CurrencyHUD pearls={pearls} />
      </div>
 
      <div className="game-area">
        {gamePhase === 'waiting' && (
          <div className="waiting-state">
            <span className="waiting-bobber">🎣</span>
            <p className="waiting-text">Waiting for a bite
              <span className="waiting-dot">.</span>
              <span className="waiting-dot">.</span>
              <span className="waiting-dot">.</span>
            </p>
             <p className="waiting-text-cancel"><kbd>click</kbd> or <kbd>space</kbd> to cancel</p>
          </div>
        )}

        {gamePhase === 'fishing' && <FishingHUD
         onResult={handleFishingResult}
         startingProgress={playerStats.startingProgress}
         barHeight={playerStats.barHeight}
         upSpeed={playerStats.upSpeed}
         downSpeed={playerStats.downSpeed}
         fillRate={playerStats.fillRate}
         drainRate={playerStats.drainRate}
         />}
      </div>

      <ButtonDock>
        <DockButton icon="🛒" label="Shop" onClick={() => setActivePanel('shop')} disabled={gamePhase !== 'idle'}/>
      </ButtonDock>

      {activePanel === 'shop' && (
        <ShopPanel 
        onClose={() => setActivePanel(null)}
        pearls={pearls}
        ownedUpgrades={ownedUpgrades}
        onPurchase={handlePurchase}
        />
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