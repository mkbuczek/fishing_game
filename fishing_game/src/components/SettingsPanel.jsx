import { useState } from 'react';
import Panel from './Panel';
import './SettingsPanel.css';

export default function SettingsPanel({ onClose, onReset }) {
    const [confirmingReset, setConfirmingReset] = useState(false);

    function handleResetClick() {
        if (confirmingReset) {
            onReset();
            setConfirmingReset(false);
            onClose();
        } else {
            setConfirmingReset(true);
        }
    }

    return (
        <Panel title="Settings" onClose={onClose} className="panel-settings">
            <button
                className={confirmingReset ? 'settings-reset-button settings-reset-confirm' : 'settings-reset-button'}
                onClick={handleResetClick}
            >
                {confirmingReset ? 'Click again to confirm' : 'Reset Save'}
            </button> 
            {confirmingReset && (
                <p className="settings-reset-warning">
                    This will permanently erase your save data!
                </p>
            )}
        </Panel>
    );
}