import upgrades from '../data/upgrades';

export function computePlayerEffects(ownedUpgrades) {
    const effects = {};

    upgrades.forEach((upgrade) => {
        if (!upgrade.effectKey) return; // skip stat upgrades

        const level = ownedUpgrades[upgrade.id] || 0;
        const totalBonus = upgrade.tiers
            .slice(0, level)
            .reduce((sum, tier) => sum + tier.bonus, 0);

        effects[upgrade.effectKey] = totalBonus;
    });

    return effects;
}