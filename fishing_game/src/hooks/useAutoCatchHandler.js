import { getSellPrice } from "../utils/getSellPrice";

export function useAutoCatchHandler({
  isAutoSellEnabled,
  bestiary,
  setBestiary,
  setInventory,
  totalCatches,
  setTotalCatches,
  totalPearlsEarned,
  setTotalPearlsEarned,
  setPearls,
  sellMultiplier,
  processAchievementUnlocks,
  addToast,
}) {
  function handleAutoCatch(catches) {
    if (isAutoSellEnabled) {
      let runningPearls = 0;
      let runningTotalCatches = totalCatches;
      let runningTotalPearlsEarned = totalPearlsEarned;

      catches.forEach(({ species, modifier }) => {
        const sellPrice = getSellPrice(species, modifier, sellMultiplier);
        runningPearls += sellPrice;
        runningTotalCatches += 1;
        runningTotalPearlsEarned += sellPrice;
      });

      setPearls((prevPearls) => prevPearls + runningPearls);
      setTotalCatches(runningTotalCatches);
      setTotalPearlsEarned(runningTotalPearlsEarned);

      processAchievementUnlocks({ bestiary, totalCatches: runningTotalCatches, totalPearlsEarned: runningTotalPearlsEarned });
      addToast(`🤖 +${runningPearls}🦪`);
    } else {
      let runningInventoryAdditions = [];
      let runningBestiary = { ...bestiary };
      let runningTotalCatches = totalCatches;

      catches.forEach(({ species, modifier }) => {
        runningInventoryAdditions.push({
          instanceId: crypto.randomUUID(),
          speciesId: species.id,
          modifierId: modifier.id,
        });

        const bestiaryKey = `${species.id}-${modifier.id}`;
        runningBestiary[bestiaryKey] = (runningBestiary[bestiaryKey] || 0) + 1;
        runningTotalCatches += 1;
      });

      setInventory((prevInventory) => [...prevInventory, ...runningInventoryAdditions]);
      setTotalCatches(runningTotalCatches);
      setBestiary(runningBestiary);

      processAchievementUnlocks({ bestiary: runningBestiary, totalCatches: runningTotalCatches, totalPearlsEarned });
    }
  }

  return { handleAutoCatch };
}