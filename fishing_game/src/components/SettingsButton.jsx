import './SettingsButton.css';
 
export default function SettingsButton({ onClick }) {
  return (
    <button className="settings-button" onClick={onClick} aria-label="Settings">
      ⚙️
    </button>
  );
}