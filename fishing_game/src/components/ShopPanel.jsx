import Panel from './Panel';
import upgrades from '../data/upgrades';
import './ShopPanel.css';
 
export default function ShopPanel({ onClose, pearls, ownedUpgrades, onPurchase }) {
    // show all upgrades not yet owned
    const availableUpgrades = upgrades.filter((upgrade) => !ownedUpgrades.includes(upgrade.id));

    return (
        <Panel title="Shop" onClose={onClose}>
        {availableUpgrades.length === 0 ? (
            <div className="shop-list">
                <p className="shop-empty">No upgrades available! Come back later!</p>
            </div>
        ) : (
            <div className="shop-list">
            {availableUpgrades.map((upgrade) => {
                const requiredUpgrades = upgrade.requires || [];

                // find IDs not yet in ownedUpgrades
                const missingReqIds = requiredUpgrades.filter(reqId => !ownedUpgrades.includes(reqId))
                const isLocked = missingReqIds.length > 0;
                const canAfford = pearls >= upgrade.cost;

                if (isLocked) {
                    // convert prereq IDs into human-readable names
                    const prereqNames = missingReqIds
                        .map(reqId => upgrades.find(u => u.id === reqId)?.name)
                        .filter(Boolean)
                        .join(', ');

                    return (
                        <button
                            key={upgrade.id}
                            className="shop-item shop-item-locked"
                            disabled
                        >
                            <div className="shop-item-row">
                                <span className="shop-item-name">???</span>
                            </div>
                            <p className="shop-item-locked-text">Requires: {prereqNames}</p>
                        </button>
                    );
                }

                return (
                <button
                    key={upgrade.id}
                    className={canAfford ? 'shop-item' : 'shop-item shop-item-unavailable'}
                    disabled={!canAfford}
                    onClick={() => onPurchase(upgrade)}
                >
                    <div className="shop-item-row">
                    <span className="shop-item-name">{upgrade.name}</span>
                    <span className="shop-item-cost">{upgrade.cost} 🦪</span>
                    </div>
                    <span className="shop-item-tooltip">{upgrade.tooltip}</span>
                </button>
                );
            })}
            </div>
        )}
        </Panel>
    );
}