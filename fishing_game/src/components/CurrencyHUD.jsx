import './CurrencyHUD.css';
 
export default function CurrencyHUD({ pearls, goldenPearls }) {
  return (
    <div className="currency-hud">
      {pearls} 🦪
      <br></br>
      {goldenPearls} 🪙
    </div>
  );
}