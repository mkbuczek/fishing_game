import Panel from './Panel';
import fish from '../data/fish';
import fishModifiers from '../data/fishModifiers';
import { getSellPrice } from '../utils/getSellPrice';
import './InventoryPanel.css';

export default function InventoryPanel({ onClose, inventory, capacity, sellReward, onSell }) {
    return (
        <Panel title={`Inventory (${inventory.length}/${capacity})`} onClose={onClose} className="panel-inventory">
            {inventory.length === 0 ? (
                <p className="inventory-empty-text">Your inventory is empty. Go catch something!</p>
            ) : (
                <div className="inventory-list">
                    {inventory.map((item) => {
                        const species = fish.find((f) => f.id === item.speciesId);
                        const modifier = fishModifiers.find((m) => m.id === item.modifierId);
                        const displayName = modifier.name ? `${modifier.name} ${species.name}` : species.name;
                        const sellPrice = getSellPrice(species, modifier, sellReward);

                        return (
                            <div key={item.instanceId} className="inventory-item">
                                <div className="inventory-item-square">
                                    <span
                                        className="catch-name-gradient inventory-item-name"
                                        style={{
                                            '--grad-start': modifier.gradient[0],
                                            '--grad-end': modifier.gradient[1],
                                            '--anim-duration': modifier.animationDuration,
                                        }}  
                                    >
                                        {displayName}
                                    </span>
                                    <span className="inventory-item-icon">{species.icon}</span>
                                </div>
                                <button className="inventory-sell-button" onClick={() => onSell(item.instanceId)}>
                                    Sell: {sellPrice}🦪
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </Panel>
    );
}