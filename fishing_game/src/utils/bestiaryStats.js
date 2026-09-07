export function getSpeciesCatchCount(bestiary, speciesId) {
  return Object.entries(bestiary)
    .filter(([key]) => key.startsWith(`${speciesId}-`))
    .reduce((sum, [, count]) => sum + count, 0);
}
 
export function getModifierCatchCount(bestiary, modifierId) {
  return Object.entries(bestiary)
    .filter(([key]) => key.endsWith(`-${modifierId}`))
    .reduce((sum, [, count]) => sum + count, 0);
}