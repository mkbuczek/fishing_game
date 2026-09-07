import Panel from './Panel';
import fish from '../data/fish';
import fishModifiers from '../data/fishModifiers';
import { getSellPrice } from '../utils/getSellPrice';
import './InventoryPanel.css';
import { buildGradient } from '../utils/buildGradient';

export default function InventoryPanel({ onClose, inventory, capacity, sellMultiplier, onSell }) {
    const emptySlotCount = capacity - inventory.length;

    return (
        <Panel title={`Inventory (${inventory.length}/${capacity})`} onClose={onClose} className="panel-inventory">
            <div className="inventory-list">
                {inventory.map((item) => {
                    const species = fish.find((f) => f.id === item.speciesId);
                    const modifier = fishModifiers.find((m) => m.id === item.modifierId);
                    const displayName = modifier.name ? `${modifier.name} ${species.name}` : species.name;
                    const sellPrice = getSellPrice(species, modifier, sellMultiplier);

                    return (
                        <div key={item.instanceId} className="inventory-item">
                            <div className="inventory-item-square">
                                <span
                                    className="catch-name-gradient inventory-item-name"
                                    style={{backgroundImage: buildGradient(modifier.gradient)}}  
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

                {Array.from({ length: emptySlotCount }).map((_, index) => (
                    <div key={`empty-${index}`} className="inventory-item">
                        <div className="inventory-item-square inventory-item-square-empty" />
                    </div> 
                ))}
            </div>
        </Panel>
    );
}