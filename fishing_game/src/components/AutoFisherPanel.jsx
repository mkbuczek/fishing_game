import Panel from "./Panel";
import './AutoFisherPanel.css';

export default function AutoFisherPanel({ onClose, isAutoFisherEnabled, onToggleAutoFisher }) {
    return (
        <Panel title="Auto Fisher" onClose={onClose} className="panel-auto-fisher">
            <div className="auto-fisher-toggle-row">
                <span className="auto-fisher-toggle-label">Toggle Auto Fisher</span>
                <button
                    className={isAutoFisherEnabled ? 'auto-fisher-switch auto-fisher-switch-on' : 'auto-fisher-switch'}
                    onClick={onToggleAutoFisher}
                >
                    <span className="auto-fisher-switch-knob" />
                </button>
            </div>
        </Panel>
    );
}