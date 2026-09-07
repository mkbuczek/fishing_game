export function getUpgradeLabel(upgrade, tierIndex, tierName) {
    const currency = upgrade.currency ?? 'pearls'; //default to pearls

    if (currency === 'goldenPearls') {
        return `Unlock ${tierName}`; //goldenPearls
    }

    return `Tier ${tierIndex + 1}: ${tierName}`; //pearls
}