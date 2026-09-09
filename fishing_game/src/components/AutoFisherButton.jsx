import './AutoFisherButton.css';

export default function AutoFisherTab({ onClick, disabled, isPaused }) {
    return (
        <button className="auto-fisher-button" onClick={onClick} disabled={disabled}>
            Auto Fisher
            {isPaused && <span className="auto-fisher-button-badge">!</span>}
        </button>
    );
}