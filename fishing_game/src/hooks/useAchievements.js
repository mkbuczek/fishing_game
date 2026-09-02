import { useState } from 'react';
import achievements from '../data/achievements';
import { getSpeciesCatchCount, getModifierCatchCount } from '../utils/bestiaryStats';

export function useAchievements(initialUnlocked, initialGoldenPearls, onUnlock) {
  const [unlockedAchievements, setUnlockedAchievements] = useState(initialUnlocked);
  const [goldenPearls, setGoldenPearls] = useState(initialGoldenPearls);

  function checkNewAchievements(stats) {
    return achievements.filter((achievement) => {
      if (unlockedAchievements.includes(achievement.id)) return false;

      let currentValue;
      switch (achievement.conditionType) {
        case 'totalCatchCount': currentValue = stats.totalCatches; break;
        case 'totalPearlsEarned': currentValue = stats.totalPearlsEarned; break;
        case 'speciesCatchCount': currentValue = getSpeciesCatchCount(stats.bestiary, achievement.target); break;
        case 'modifierCatchCount': currentValue = getModifierCatchCount(stats.bestiary, achievement.target); break;
        default: return false;
      }
      return currentValue >= achievement.threshold;
    });
  }

  function processAchievementUnlocks(stats) {
    const newlyUnlocked = checkNewAchievements(stats);
    if (newlyUnlocked.length === 0) return;

    newlyUnlocked.forEach((achievement) => onUnlock(achievement));
    setUnlockedAchievements((prev) => [...prev, ...newlyUnlocked.map((a) => a.id)]);
    setGoldenPearls((prev) => prev + newlyUnlocked.reduce((sum, a) => sum + a.reward, 0));
  }

  function resetAchievements() {
    setUnlockedAchievements([]);
    setGoldenPearls(0);
  }

  return { unlockedAchievements, goldenPearls, processAchievementUnlocks, resetAchievements };
}