import upgrades from '../data/upgrades';

export function computePlayerStats(baseStats, ownedUpgrades) {
  const stats = { ...baseStats };

  upgrades.forEach((upgrade) => {
    if (!upgrade.statKey) return; // skip effect upgrades

    const currentLevel = ownedUpgrades[upgrade.id] || 0;
    for (let i = 0; i < currentLevel; i++) {
      stats[upgrade.statKey] += upgrade.tiers[i].bonus;
    }
  });

  return stats;
}