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
import fish from './data/fish';
import fishModifiers from './data/fishModifiers';
import { pickWeighted, rollBestModifier } from './utils/pickWeighted';
import { getSellPrice } from './utils/getSellPrice';
import InventoryPanel from './components/InventoryPanel';
import { getTierCost } from './utils/getTierCost';
import BestiaryPanel from './components/BestiaryPanel';

function App() {
  const baseStats = {
    startingProgress: 40, // % of starting progress value
    barHeight: 15,   // % of track height
    upSpeed: 0.75, // rate at which the catch bar moves up
    downSpeed: 0.5, // rate at which the catch bar moves down
    fillRate: 0.3, // rate at which progress fills when the bar overlaps with the fish
    drainRate: 0.25, // rate at which progress drains when the bar does not overlap with the fish
    sellMultiplier: 1, // multiplier for fish price increase
    luck: 0,
    biteMin: 0.5, // fastest possible bite, seconds
    biteMax: 10, // slowest possible bite, seconds
    biteExponent: 0.5, // <1 = skews towards slow, >1 = skews towards fast
    inventoryCapacity: 5 // how many fish can be stored in the inventory
  }

  const [gamePhase, setGamePhase] = useState('idle'); // 'idle' | 'waiting' | 'fishing' | 'result'
  const [resultData, setResultData] = useState(null); // { outcome, reward } | null
  const [pearls, setPearls] = useState(0); // player's current pearl count
  const [activePanel, setActivePanel] = useState(null); // null | 'shop'
  const [ownedUpgrades, setOwnedUpgrades] = useState({}); // { lineId: levelOwned }
  const [currentFish, setCurrentFish] = useState(null); // { species, modifier } | null
  const [inventory, setInventory] = useState([]);
  const [bestiary, setBestiary] = useState({}) // key: `${speciesId}-${modifierId}` => catch count

  // update player stats
  const playerStats = computePlayerStats(ownedUpgrades);
  // check if inventory is full
  const isInventoryFull = inventory.length === playerStats.inventoryCapacity;

  // handle the "Cast Line" button click
  function handleCast() {
    const species = pickWeighted(fish);
    const modifier = rollBestModifier(fishModifiers, playerStats.luck);
    setCurrentFish({ species, modifier });
    setGamePhase('waiting');
  }

  // handle the result of the fishing minigame (win/loss)
  function handleFishingResult(outcome) {
    const { species, modifier } = currentFish;

    // add new fish to inventory
    if (outcome === 'caught') {
      const newFish = {
        instanceId: crypto.randomUUID(),
        speciesId: species.id,
        modifierId: modifier.id,
      };
      setInventory((prevInventory) => [...prevInventory, newFish]);
    }

    const catchName = modifier.name ? `${modifier.name} ${species.name}` : species.name;

    // pass fishing result data to result popup
    setResultData({
      outcome,
      catchName,
      icon: species.icon,
      gradient: modifier.gradient,
    });
    setGamePhase('result');

    // add new fish to bestiary
    const bestiaryKey = `${species.id}-${modifier.id}`;
    setBestiary((prevBestiary) => ({
      ...prevBestiary,
      [bestiaryKey]: (prevBestiary[bestiaryKey] || 0) +1,
    }));
  }

  // handle the dismissal of the result popup
  function handleDismissResult() {
    setResultData(null);
    setGamePhase('idle');
  }

  // handle upgrade purchases
  function handlePurchase(upgrade) {
    const currentLevel = ownedUpgrades[upgrade.id] || 0;
    if (currentLevel >= upgrade.tiers.length) return; // return if already fully maxed

    const nextTier = upgrade.tiers[currentLevel];
    const cost = getTierCost(upgrade, currentLevel);
    if (pearls < cost) return; // return if not enough money

    const meetsRequirements = nextTier.requires.every(
      (req) => (ownedUpgrades[req.id] || 0) >= req.level
    );
    if (!meetsRequirements) return; // return if prereqs are not met

    //else, buy the upgrade
    setPearls((prevPearls) => prevPearls - cost);
    setOwnedUpgrades((prevOwned) => ({
      ...prevOwned,
      [upgrade.id]: currentLevel + 1,
    }));
  }
  
  // compute player stats based on upgrade bonuses
  function computePlayerStats(ownedUpgrades) {
    const stats = { ...baseStats }; // spread stats array

    upgrades.forEach((upgrade) => {
      const currentLevel = ownedUpgrades[upgrade.id] || 0;
      for (let i = 0; i < currentLevel; i++) {
        stats[upgrade.statKey] += upgrade.tiers[i].bonus;
      }
    });

    return stats;
  }

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

  // handle pressing space to cast
  useEffect(() => {
    if (gamePhase !== 'idle' || activePanel !== null) return;

    function handleCastKey(event) {
      if (event.code === 'Space' && !isInventoryFull) {
        event.preventDefault();
        handleCast();
      }
    }

    window.addEventListener('keydown', handleCastKey);
    return () => window.removeEventListener('keydown', handleCastKey);
  }, [gamePhase, activePanel, isInventoryFull]);

  // handle selling fish from the inventory
  function handleSellFish(instanceId) {
    const item = inventory.find((f) => f.instanceId === instanceId);
    if (!item) return;

    const species = fish.find((f) => f.id === item.speciesId);
    const modifier = fishModifiers.find((m) => m.id === item.modifierId);
    const sellPrice = getSellPrice(species, modifier, playerStats.sellMultiplier);

    // remove fish from inventory and give respective pearls
    setInventory((prevInventory) => prevInventory.filter((f) => f.instanceId !== instanceId));
    setPearls((prevPearls) => prevPearls + sellPrice);
  }

  return (
    <div className="app">
      <div className="top-bar">
        <div className="cast-wrapper">
          <CastButton onClick={handleCast} disabled={gamePhase !== 'idle' || isInventoryFull} />
          {isInventoryFull && <p className="inventory-full-text">Your inventory is full!</p>}
        </div>
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
         fishHeight={currentFish.species.fishHeight}
         fishSpeed={currentFish.species.fishSpeed}
         fishTargetInterval={currentFish.species.fishTargetInterval}
         />}
      </div>

      <ButtonDock>
        <DockButton icon="🛒" label="Shop" onClick={() => setActivePanel('shop')} disabled={gamePhase !== 'idle'}/>
        <DockButton icon="💼" label="Inventory" onClick={() => setActivePanel('inventory')} disabled={gamePhase !== 'idle'}/>
        <DockButton icon="🧾" label="Bestiary" onClick={() => setActivePanel('bestiary')} disabled={gamePhase !== 'idle'}/>
      </ButtonDock>

      {activePanel === 'shop' && (
        <ShopPanel 
          onClose={() => setActivePanel(null)}
          pearls={pearls}
          ownedUpgrades={ownedUpgrades}
          onPurchase={handlePurchase}
        />
      )}

      {activePanel === 'inventory' && (
        <InventoryPanel 
          onClose={() => setActivePanel(null)}
          inventory={inventory}
          capacity={playerStats.inventoryCapacity}
          sellMultiplier={playerStats.sellMultiplier}
          onSell={handleSellFish}
        />
      )}

      {activePanel === 'bestiary' && (
        <BestiaryPanel onClose={() => setActivePanel(null)} bestiary={bestiary} />
      )}

      {gamePhase === 'result' && resultData && (
        <ResultPopup
          outcome={resultData.outcome}
          reward={resultData.reward}
          catchName={resultData.catchName}
          icon={resultData.icon}
          gradient={resultData.gradient}
          onDismiss={handleDismissResult}
        />
      )}
    </div>
  );
}

export default App;