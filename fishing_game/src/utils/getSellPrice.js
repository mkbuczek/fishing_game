export function getSellPrice(species, modifier, sellReward) {
    return Math.round(species.basePrice * modifier.rewardMultiplier) + sellReward;
}