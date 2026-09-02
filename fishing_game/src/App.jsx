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
import ToastContainer from './components/ToastContainer';
import SettingsButton from './components/SettingsButton';
import SettingsPanel from './components/SettingsPanel';
import { useAchievements } from './hooks/useAchievements';
import AchievementPanel from './components/AchievementPanel';

function App() {
  const baseStats = {
    startingProgress: 50, // % of starting progress value
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

  // load save data
  const savedData = loadSave();

  // load achievements
  const { unlockedAchievements, goldenPearls, processAchievementUnlocks, resetAchievements } =
    useAchievements(
      savedData?.unlockedAchievements ?? [],
      savedData?.goldenPearls ?? 0,
      (achievement) => addToast(`🏆 ${achievement.name} unlocked!`)
    );

  const [gamePhase, setGamePhase] = useState('idle'); // 'idle' | 'waiting' | 'fishing' | 'result'
  const [resultData, setResultData] = useState(null); // { outcome, reward } | null
  const [pearls, setPearls] = useState(() => loadSave()?.pearls ?? 0); // player's current pearl count
  const [activePanel, setActivePanel] = useState(null); // null | 'shop'
  const [ownedUpgrades, setOwnedUpgrades] = useState(() => loadSave()?.ownedUpgrades ?? {}); // { lineId: levelOwned }
  const [currentFish, setCurrentFish] = useState(null); // { species, modifier } | null
  const [inventory, setInventory] = useState(() => loadSave()?.inventory ?? []);
  const [bestiary, setBestiary] = useState(() => loadSave()?.bestiary ?? {}); // key: `${speciesId}-${modifierId}` => catch count
  const [toasts, setToasts] = useState([]);
  const [totalCatches, setTotalCatches] = useState(() => loadSave()?.totalCatches ?? 0);
  const [totalPearlsEarned, setTotalPearlsEarned] = useState(() => loadSave()?.totalPearlsEarned ?? 0);

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

      // add new fish to bestiary
      const bestiaryKey = `${species.id}-${modifier.id}`;
      const updatedBestiary = {
        ...bestiary,
        [bestiaryKey]: (bestiary[bestiaryKey] || 0) + 1,
      };

      // update running totals
      const updatedTotalCatches = totalCatches + 1;
      setTotalCatches(updatedTotalCatches);
      setBestiary(updatedBestiary);

      // check for achievements
      processAchievementUnlocks({ bestiary: updatedBestiary, totalCatches: updatedTotalCatches, totalPearlsEarned });
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
    addToast(`${nextTier.name} purchased!`);
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

  // --- SAVE LOGIC ---
  // save whenever the state of data changes
  useEffect(() => {
    const saveData = { 
      pearls,
      ownedUpgrades,
      inventory,
      bestiary,
      totalCatches,
      totalPearlsEarned,
      unlockedAchievements,
      goldenPearls,
    };

    localStorage.setItem('fishingGameSave', JSON.stringify(saveData));
  }, [pearls, ownedUpgrades, inventory, bestiary, totalCatches, totalPearlsEarned, unlockedAchievements, goldenPearls]);

  function loadSave() {
    try {
      const raw = localStorage.getItem('fishingGameSave');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null; // fallback to null
    }
  }

  function handleResetSave() {
    localStorage.removeItem('fishingGameSave');
    setPearls(0);
    setOwnedUpgrades({});
    setInventory([]);
    setBestiary({});
    setTotalCatches(0);
    setTotalPearlsEarned(0);
    resetAchievements();
  }

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
    addToast(`+${sellPrice}🦪`);

    // update running total
    const updatedTotalPearlsEarned = totalPearlsEarned + sellPrice;
    setTotalPearlsEarned(updatedTotalPearlsEarned);

    // check for achievements
    processAchievementUnlocks({bestiary, totalCatches, totalPearlsEarned: updatedTotalPearlsEarned,});
  }

  // toast logic for purchases and sales
  function addToast(message) {
    const id = crypto.randomUUID();
    setToasts((prevToasts) => [...prevToasts, { id, message }]);
  }

  function handleDismissToast(id) {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }

  return (
    <div className="app">
      <div className="top-bar">
        <div className="cast-wrapper">
          <CastButton onClick={handleCast} disabled={gamePhase !== 'idle' || isInventoryFull} />
          {isInventoryFull && <p className="inventory-full-text">Your inventory is full!</p>}
        </div>
        <CurrencyHUD pearls={pearls} goldenPearls={goldenPearls} />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
        <SettingsButton onClick={() => setActivePanel('settings')} />
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
        <DockButton icon="🏆" label="Achievements" onClick={() => setActivePanel('achievement')} disabled={gamePhase !== 'idle'}/>
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

      {activePanel === 'settings' && (
        <SettingsPanel onClose={() => setActivePanel(null)} onReset={handleResetSave} />
      )}

      {activePanel === 'achievement' && (
        <AchievementPanel onClose={() => setActivePanel(null)} unlockedAchievements={unlockedAchievements} />
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