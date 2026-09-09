import { useState } from 'react';
import Panel from './Panel';
import upgrades from '../data/upgrades';
import './ShopPanel.css';
import { getTierCost } from '../utils/getTierCost';
import { getUpgradeLabel } from '../utils/getUpgradeLabel';

const categoryLabels = {
    stat: 'Stats',
    auto: 'Auto',
}

const currencyIcons = {
    pearls: '🦪',
    goldenPearls: '🪙',
};
 
function getMissingRequirementNames(requires, ownedUpgrades) {
    return requires
        .filter((req) => (ownedUpgrades[req.id] || 0) < req.level)
        .map((req) => {
            const reqUpgrade = upgrades.find((u) => u.id === req.id);
            return reqUpgrade.tiers[req.level - 1].name;
        })
        .join(', ');
}

export default function ShopPanel({ onClose, pearls, goldenPearls, ownedUpgrades, onPurchase }) {
    const availableCategories = [...new Set(upgrades.map((u) => u.category))];
    const [activeCategory, setActiveCategory] = useState(availableCategories[0]);
    const visibleUpgrades = upgrades.filter((u) => u.category === activeCategory);

    return (
        <Panel
            title="Shop"
            onClose={onClose}
            className="panel-shop"
            headerExtra={
                availableCategories.length > 1 && (
                    <div className="shop-tabs">
                        {availableCategories.map((category) => (
                            <button
                                key={category}
                                className={activeCategory === category ? 'shop-tab shop-tab-active' : 'shop-tab'}
                                onClick={() => setActiveCategory(category)}
                            >
                                {categoryLabels[category] || category}
                            </button>
                        ))}
                    </div>
                )
            }
        >

            <div className="shop-list">
                {visibleUpgrades.map((upgrade) => {
                    const currentLevel = ownedUpgrades[upgrade.id] || 0;
                    const isMaxed = currentLevel >= upgrade.tiers.length;

                    if (isMaxed) {
                        const lastTier = upgrade.tiers[upgrade.tiers.length - 1];
                        return (
                            <div key={upgrade.id} className="shop-item shop-item-maxed">
                                <div className="shop-item-row">
                                    <span className="shop-item-name">{getUpgradeLabel(upgrade, currentLevel, lastTier.name, isMaxed)}</span>
                                    <span className="shop-item-cost">MAXED</span>
                                </div>
                            </div>
                        );
                    }

                    const nextTier = upgrade.tiers[currentLevel];
                    const cost = getTierCost(upgrade, currentLevel);
                    const missingNames = getMissingRequirementNames(nextTier.requires, ownedUpgrades);
                    const isLocked = missingNames.length > 0;

                    const currency = upgrade.currency ?? "pearls"; // default currency to pearls
                    const balance = currency === "goldenPearls" ? goldenPearls : pearls;
                    const canAfford = balance >= cost && !isLocked;


                    return (
                        <button
                            key={upgrade.id}
                            className={canAfford ? 'shop-item' : 'shop-item shop-item-unavailable'}
                            disabled={!canAfford}
                            onClick={() => onPurchase(upgrade)}
                        >
                            <div className="shop-item-row">
                                <span className="shop-item-name">{isLocked ? '???' : getUpgradeLabel(upgrade, currentLevel, nextTier.name, isMaxed)}</span>
                                <span className="shop-item-cost">{isLocked ? '' : `${cost}${currencyIcons[currency] || '🦪'}`}</span>
                            </div>
                            <span className="shop-item-tooltip">
                                {isLocked ? `Requires ${missingNames}!` : upgrade.tooltip}
                            </span>
                        </button>
                    );
                })}
            </div>
        </Panel>
    );
}