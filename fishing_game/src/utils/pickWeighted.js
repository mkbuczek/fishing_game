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