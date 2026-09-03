import './CurrencyHUD.css';
 
export default function CurrencyHUD({ pearls, goldenPearls }) {
  return (
    <div className="currency-hud">
      <div className="currency-row">
        <span className="currency-icon">🦪</span>
        <span className="currency-value">{pearls}</span>
      </div>
      <div className="currency-row currency-row-gold">
        <span className="currency-icon">🪙</span>
        <span className="currency-value">{goldenPearls}</span>
      </div>
    </div>
  );
}