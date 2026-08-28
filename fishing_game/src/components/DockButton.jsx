import './DockButton.css';
 
export default function DockButton({ icon, label, onClick, disabled }) {
  return (
    <button className="dock-button" onClick={onClick} disabled={disabled}>
      <span className="dock-button-icon">{icon}</span>
      <span className="dock-button-label">{label}</span>
    </button>
  );
}