import Panel from './Panel';
import upgrades from '../data/upgrades';
import './ShopPanel.css';
 
export default function ShopPanel({ onClose, pearls, ownedUpgrades, onPurchase }) {
    const availableUpgrades = upgrades.filter((upgrade) => {
        return !ownedUpgrades.includes(upgrade.id);
    });

    return (
        <Panel title="Shop" onClose={onClose}>
        {availableUpgrades.length === 0 ? (
            <p className="shop-empty">No upgrades available! Come back later!</p>
        ) : (
            <div className="shop-list">
            {availableUpgrades.map((upgrade) => {
                const canAfford = pearls >= upgrade.cost;

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