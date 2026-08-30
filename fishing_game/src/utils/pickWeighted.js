// utility function to pick a random item from a weighted list
// used for choosing a random fish from a pool
export function pickWeighted(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.spawnWeight, 0);
  let roll = Math.random() * totalWeight;
 
  for (const item of items) {
    if (roll < item.spawnWeight) {
      return item;
    }
    roll -= item.spawnWeight;
  }
 
  return items[items.length - 1];
}

// luck implementation
// rerolls fish modifier n times and picks best modifier
export function rollBestModifier(modifiers, rerollCount) {
    let best = pickWeighted(modifiers);
    for (let i = 0; i < rerollCount; i++) {
      const attempt = pickWeighted(modifiers);
      if (attempt.rewardMultiplier > best.rewardMultiplier) {
        best = attempt;
      }
    }
    return best;
}