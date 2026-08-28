import Panel from './Panel';
import './ShopPanel.css';
 
export default function ShopPanel({ onClose }) {
  return (
    <Panel title="Shop" onClose={onClose}>
      <div className="shop-list">
        <button className="shop-item">
            <div className="shop-item-row">
                <span className="shop-item-name">Faster Reel</span>
                <span className="shop-item-cost">50 🦪</span>
            </div>
            <span className="shop-item-tooltip">Increases reel speed</span>
        </button>
        <button className="shop-item">
            <div className="shop-item-row">
                <span className="shop-item-name">Better Hook</span>
                <span className="shop-item-cost">75 🦪</span>
            </div>
            <span className="shop-item-tooltip">Increases catch bar hitbox</span>
        </button>
        <button className="shop-item shop-item-unavailable">
            <div className="shop-item-row">
                <span className="shop-item-name">Better Bait</span>
                <span className="shop-item-cost">100 🦪</span>
            </div>
            <span className="shop-item-tooltip">Increases bite chance</span>
        </button>
      </div>
    </Panel>
  );
}