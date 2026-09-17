import { useState } from "react";
import Panel from './Panel';
import fish from "../data/fish";
import fishModifiers from "../data/fishModifiers";
import { doesFishMatchObjective } from "../utils/questProgress";
import { buildGradient } from '../utils/buildGradient';
import './TurnInPanel.css';

export default function TurnInPanel({ onClose, inventory, objective, onConfirm }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const remaining = objective.target - objective.progress;

    function toggleSelect(instanceId, isMatch) {
        if (!isMatch) return; // clicking an inactive fish does nothing

        setSelectedIds((prev) => {
            if (prev.includes(instanceId)) {
                return prev.filter((id) => id !== instanceId); // clicking a selected fish again deselects it
            }
            if (prev.length >= remaining) {
                return prev; // already selected enough, ignore further picks until one is removed
            }
            return [...prev, instanceId];
        });
    }

    function handleConfirm() {
        onConfirm(selectedIds);
        onClose();
    }

    return (
        <Panel title="Turn In Fish" onClose={onClose} className="panel-turnin">
            <p className="turnin-instructions">
                Select fish to turn in ({selectedIds.length}/{remaining} selected)
            </p>

            <div className="turnin-grid inventory-list">
                {inventory.map((item) => {
                    const isMatch = doesFishMatchObjective(item, objective);
                    const isSelected = selectedIds.includes(item.instanceId);
                    const species = fish.find((f) => f.id === item.speciesId);
                    const modifier = fishModifiers.find((m) => m.id === item.modifierId);
                    const displayName = modifier.name ? `${modifier.name} ${species.name}` : species.name;

                    return (
                        <div key={item.instanceId} className="inventory-item turnin-item">
                            <div
                                className={
                                    !isMatch ? 'inventory-item-square turnin-item-inactive'
                                    : isSelected ? 'inventory-item-square turnin-item-selected'
                                    : 'inventory-item-square'
                                }
                                onClick={() => toggleSelect(item.instanceId, isMatch)}
                            >
                                <span
                                    className="catch-name-gradient inventory-item-name"
                                    style={{ backgroundImage: buildGradient(modifier.gradient) }}
                                >
                                    {displayName}
                                </span>
                                <span className="inventory-item-icon">{species.icon}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                className="turnin-confirm-button"
                disabled={selectedIds.length === 0}
                onClick={handleConfirm}
            >
                Confirm
            </button>
        </Panel>
    );
}