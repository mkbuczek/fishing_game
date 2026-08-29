const exponentSteepness = 1

// utility function to create an exponential equation for upgrade tier costs
export function getTierCost(upgrade, tierIndex) {
  return Math.round(upgrade.baseCost * upgrade.costGrowth ** (tierIndex * exponentSteepness));
}