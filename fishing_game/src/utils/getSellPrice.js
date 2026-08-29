export function getSellPrice(species, modifier, sellMultiplier) {
    return Math.round(species.basePrice * modifier.rewardMultiplier * sellMultiplier);
}