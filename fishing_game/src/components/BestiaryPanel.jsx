import Panel from './Panel';
import './BestiaryPanel.css';
import { useState } from 'react';
import fish from '../data/fish';
import fishModifiers from '../data/fishModifiers';
import { buildGradient } from '../utils/buildGradient';

export default function BestiaryPanel({ onClose, bestiary }) {
    const [activeTab, setActiveTab] = useState(fishModifiers[0].id);
    const activeModifier = fishModifiers.find((m) => m.id === activeTab);

    return (
        <Panel title={"Bestiary"} onClose={onClose} className="panel-bestiary">
            <div className="bestiary-tabs">
                {fishModifiers.map((modifier) => (
                    <button
                        key={modifier.id}
                        className={activeTab === modifier.id ? 'bestiary-tab bestiary-tab-active' : 'bestiary-tab'}
                        onClick={() => setActiveTab(modifier.id)}
                    >
                        {modifier.name || 'Common'}
                    </button>
                ))}
            </div>

            <div className="bestiary-grid">
                {fish.map((species) => {
                    const key = `${species.id}-${activeTab}`;
                    const count = bestiary[key] || 0;
                    const isDiscovered = count > 0;
                    const displayName = activeModifier.name ? `${activeModifier.name} ${species.name}` : species.name;

                    return (
                        <div key={species.id} className={isDiscovered ? 'bestiary-entry' : 'bestiary-entry bestiary-entry-locked'}>
                            <div className="bestiary-entry-square">
                            {isDiscovered ? (
                                <span
                                    className="catch-name-gradient bestiary-entry-name"
                                    style={{backgroundImage: buildGradient(activeModifier.gradient)}} 
                                >
                                    {displayName}
                                </span>
                            ) : (
                                <span className="bestiary-entry-name">???</span>
                            )}
                            <span className="bestiary-entry-icon">{isDiscovered ? species.icon : '❓'}</span>
                            </div>
                        <span className="bestiary-entry-count">{isDiscovered ? `Caught: ${count}` : ''}</span>
                        </div>
                    );
                })}
            </div>
        </Panel>
    );
}