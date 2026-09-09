export function getUpgradeLabel(upgrade, tierIndex, tierName, isMaxed) {
    const currency = upgrade.currency ?? 'pearls'; //default to pearls
    let prependText;

    if (currency === 'goldenPearls') {
        prependText = isMaxed ? "" : "Unlock";
        return `${prependText} ${tierName}`.trim(); //goldenPearls
    }

    const displayTier = isMaxed ? upgrade.tiers.length : tierIndex + 1;
    return `Tier ${displayTier}: ${tierName}`; //pearls
}