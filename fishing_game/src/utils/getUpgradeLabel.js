export function getUpgradeLabel(upgrade, tierIndex, tierName, isMaxed) {
    const currency = upgrade.currency ?? 'pearls'; //default to pearls
    let prependText;

    if (currency === 'goldenPearls') {
        prependText = isMaxed ? "" : "Unlock";
        return `${prependText} ${tierName}`; //goldenPearls
    }

    return `Tier ${tierIndex + 1}: ${tierName}`; //pearls
}