import './CastButton.css';
 
export default function CastButton({ onClick, disabled }) {
  return (
    <button className="cast-button" onClick={onClick} disabled={disabled}>
      Cast Line
    </button>
  );
}