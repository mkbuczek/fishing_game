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

// determines whether a child upgrade should render
// visible once owned or first tier's requirements are met
function isUpgradeVisible(upgrade, ownedUpgrades) {
    const currentLevel = ownedUpgrades[upgrade.id] || 0;
    if (currentLevel > 0) return true;

    const firstTierRequires = upgrade.tiers[0].requires;
    return firstTierRequires.every((req) => (ownedUpgrades[req.id] || 0) >= req.level);
}

function UpgradeItem({ upgrade, ownedUpgrades, pearls, goldenPearls, onPurchase, isChild }) {
    const currentLevel = ownedUpgrades[upgrade.id] || 0;
    const isMaxed = currentLevel >= upgrade.tiers.length;

    if (isMaxed) {
        const lastTier = upgrade.tiers[upgrade.tiers.length - 1];
        return (
            <div className={isChild ? 'shop-item shop-item-maxed shop-item-child' : 'shop-item shop-item-maxed'}>
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

    const currency = upgrade.currency ?? "pearls";
    const balance = currency === "goldenPearls" ? goldenPearls : pearls;
    const canAfford = balance >= cost && !isLocked;

    return (
        <button
            className={isChild
                ? (canAfford ? 'shop-item shop-item-child' : 'shop-item shop-item-unavailable shop-item-child')
                : (canAfford ? 'shop-item' : 'shop-item shop-item-unavailable')}
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
}

export default function ShopPanel({ onClose, pearls, goldenPearls, ownedUpgrades, onPurchase }) {
    const availableCategories = [...new Set(upgrades.map((u) => u.category))];
    const [activeCategory, setActiveCategory] = useState(availableCategories[0]);
    const visibleUpgrades = upgrades.filter((u) => u.category === activeCategory);
    const topLevelUpgrades = visibleUpgrades.filter((u) => !u.parentId);

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
                {topLevelUpgrades.map((upgrade) => {
                    const children = visibleUpgrades
                        .filter((u) => u.parentId === upgrade.id)
                        .filter((child) => isUpgradeVisible(child, ownedUpgrades));

                    return (
                        <div key={upgrade.id} className={children.length > 0 ? 'shop-upgrade-wrapper shop-upgrade-group' : 'shop-upgrade-wrapper'}>
                            <UpgradeItem
                                upgrade={upgrade}
                                ownedUpgrades={ownedUpgrades}
                                pearls={pearls}
                                goldenPearls={goldenPearls}
                                onPurchase={onPurchase}
                                isChild={false}
                            />
                            {children.length > 0 && (
                                <div className="shop-upgrade-children">
                                    {children.map((child) => (
                                        <UpgradeItem
                                            key={child.id}
                                            upgrade={child}
                                            ownedUpgrades={ownedUpgrades}
                                            pearls={pearls}
                                            goldenPearls={goldenPearls}
                                            onPurchase={onPurchase}
                                            isChild={true}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Panel>
    );
}