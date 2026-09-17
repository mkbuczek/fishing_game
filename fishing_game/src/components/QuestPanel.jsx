import Panel from './Panel';
import './QuestPanel.css';
import { useState } from 'react';
import questNpcs from '../data/questNpcs';
import { getObjectiveProgress, getObjectiveProgressPercent, isUnlockConditionMet, isQuestComplete } from '../utils/questProgress';

export default function QuestPanel({ onClose, context, questState, acceptQuest, claimQuest, onOpenTurnIn }) {
    const [activeNpcTab, setActiveNpcTab] = useState(null);
    const unlockedNpcs = questNpcs.filter((npc) => isUnlockConditionMet(npc.unlockCondition, context));

    const mockActiveQuests = questNpcs
        .filter((npc) => isUnlockConditionMet(npc.unlockCondition, context))
        .map((npc) => ({ npc, quest: npc.questLine[0] }));

    return (
        <Panel 
            title={`Quests`}
            onClose={onClose}
            className="panel-quest"
            headerExtra={
                <div className="quest-npc-tabs">
                    {questNpcs.map((npc) => {
                        const isUnlocked = isUnlockConditionMet(npc.unlockCondition, context);
                        return (
                            <button
                                key={npc.id}
                                className={activeNpcTab === npc.id ? 'quest-npc-tab quest-npc-tab-active' : 'quest-npc-tab'}
                                onClick={() => isUnlocked && setActiveNpcTab(npc.id)}
                                disabled={!isUnlocked}
                            >
                                <span className="quest-npc-tab-icon">{isUnlocked ? npc.icon : '🔒'}</span>
                                <span className="quest-npc-tab-name">{npc.name}</span>
                                <span className="quest-npc-tab-teaser">{npc.specialty}</span>
                            </button>
                        );
                    })}
                </div>
            }
        >
            {activeNpcTab ? (
                renderNpcOfferScreen(activeNpcTab)
            ) : (
            // no tab selected, main dashboard
                <div className="quest-grid">
                    {unlockedNpcs.map((npc) => {
                        const activeQuest = questState[npc.id].activeQuest;
                        if (!activeQuest) return null; // this NPC has nothing active

                        const questReady = isQuestComplete(activeQuest, context);

                        return (
                            <div key={activeQuest.id} className={questReady ? 'quest-card quest-card-complete' : 'quest-card'}>
                                <span className="quest-card-npc-icon">{npc.icon}</span>
                                <span className="quest-card-title">{activeQuest.title}</span>

                                <div className="quest-card-objectives">
                                    {activeQuest.objectives.map((objective) => {
                                        const percent = getObjectiveProgressPercent(objective, context);
                                        const progress = getObjectiveProgress(objective, context);

                                        return (
                                            <div key={objective.id} className="quest-objective-row">
                                                <span className="quest-objective-label">{describeObjective(objective)}</span>
                                                <div className="quest-objective-bar-track">
                                                    <div className="quest-objective-bar-fill" style={{ width: `${percent}%` }} />
                                                </div>
                                                <div className="quest-objective-footer">
                                                    {objective.scope === 'turnIn' && progress < objective.target && (
                                                        <button
                                                            className="quest-turnin-button"
                                                            onClick={() => onOpenTurnIn(npc.id, objective)}
                                                        >
                                                            Turn In
                                                        </button>
                                                    )}
                                                    <span className="quest-objective-progress-text">
                                                        {Math.min(progress, objective.target)}/{objective.target}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="quest-card-footer">
                                    <span className="quest-card-reward">{activeQuest.reward.pearls}🦪</span>
                                    {questReady && (
                                        <button
                                            className="quest-claim-button"
                                            disabled={!questReady}
                                            onClick={() => claimQuest(npc.id)}
                                        >
                                            Claim
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Panel>
    );

    // renders the quest offer screen for each NPC
    function renderNpcOfferScreen(npcId) {
        const npc = questNpcs.find((n) => n.id === npcId);
        const npcState = questState[npcId];
        const nextQuest = npc.questLine[npcState.currentIndex];

        if (npcState.activeQuest) {
            return (
                <div className="quest-detail">
                    <button className="quest-back-button" onClick={() => setActiveNpcTab(null)}>↩</button>
                    <span className="quest-detail-npc-icon">{npc.icon}</span>
                    <p className="quest-detail-message">You already have an active quest from {npc.name}!</p>
                </div>
            );
        }

        if (!nextQuest) {
            return (
                <div className="quest-detail">
                    <button className="quest-back-button" onClick={() => setActiveNpcTab(null)}>↩</button>
                    <span className="quest-detail-npc-icon">{npc.icon}</span>
                    <p className="quest-detail-message">{npc.name} has no more quests for you right now. Check back later!</p>
                </div>
            )
        }

        return (
            <div className="quest-detail">
                <button className="quest-back-button" onClick={() => setActiveNpcTab(null)}>↩</button>
                <span className="quest-detail-npc-icon">{npc.icon}</span>
                <p className="quest-detail-giver">{npc.name}</p>
                <h3 className="quest-detail-title">{nextQuest.title}</h3>
                <p className="quest-detail-description">{nextQuest.description}</p>
                <div className="quest-detail-reward">Reward: {nextQuest.reward.pearls}🦪</div>
                <button
                    className="quest-accept-button"
                    onClick={() => {
                        acceptQuest(npcId);
                        setActiveNpcTab(null); // return to main dashboard
                    }}
                >
                    Accept Quest
                </button>
            </div>
        );
    }
}

// TEMP helper — will move to a proper util once objective types are finalized
function describeObjective(objective) {
  switch (objective.type) {
    case 'turnInSpecies':
      return `Turn in ${objective.target} ${objective.speciesId ?? 'fish'}${objective.modifierId ? ` (${objective.modifierId})` : ''}`;
    case 'totalCatches':
      return `Catch ${objective.target} fish total`;
    case 'scopedCatchCount':
      return `Catch ${objective.target} fish`;
    case 'bestiaryCount':
      return `Discover ${objective.target} bestiary entries`;
    default:
      return objective.type;
  }
}