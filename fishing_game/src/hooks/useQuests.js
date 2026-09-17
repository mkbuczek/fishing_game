import { useState } from "react";
import questNpcs from "../data/questNpcs";

function initializeQuestState(savedState) {
    const state = {};
    questNpcs.forEach((npc) => {
        state[npc.id] = savedState?.[npc.id] ?? { currentIndex: 0, activeQuest: null };
    });
    return state;
}

export function useQuests(initialSavedState) {
    const [questState, setQuestState] = useState(() => initializeQuestState(initialSavedState));

    function acceptQuest(npcId, addToast) {
        const npc = questNpcs.find((n) => n.id === npcId);
        const currentIndex = questState[npcId].currentIndex;
        const questTemplate = npc.questLine[currentIndex];

        if(!questTemplate) return; // no more quests in this NPC's questline

        // copy template's objectives
        // lifetime objectives are not stored here
        const objectivesWithProgress = questTemplate.objectives.map((objective) => {
            if (objective.scope === 'scoped' || objective.scope === 'turnIn') {
                return { ...objective, progress: 0 };
            }
            return { ...objective };
        });

        const activeQuest = { ...questTemplate, objectives: objectivesWithProgress };

        setQuestState((prev) => ({
            ...prev,
            [npcId]: { ...prev[npcId], activeQuest },
        }));

        addToast(`Quest accepted: ${questTemplate.title}`);
    }

    function incrementScopedCatch(source, count = 1) {
        setQuestState((prev) => {
            const next = { ...prev };

            questNpcs.forEach((npc) => {
                const npcState = next[npc.id];
                if (!npcState.activeQuest) return; // no active quest for this NPC

                const updatedObjectives = npcState.activeQuest.objectives.map((objective) => {
                    if (objective.scope !== 'scoped') return objective; // only scoped objectives
                    if (source === 'auto' && !objective.countsAutoFisher) return objective; // respect autofisher flag

                    // count (default value 1) variable for autofisher support
                    return { ...objective, progress: objective.progress + count };
                });

                next[npc.id] = {
                    ...npcState,
                    activeQuest: { ...npcState.activeQuest, objectives: updatedObjectives },
                };
            });

            return next;
        })
    }

    function turnInFish(npcId, objectiveId, instanceIds, setInventory, addToast) {
        setInventory((prevInventory) =>
            prevInventory.filter((item) => !instanceIds.includes(item.instanceId))
        );

        setQuestState((prev) => {
            const npcState = prev[npcId];
            const updatedObjectives = npcState.activeQuest.objectives.map((objective) =>
                objective.id === objectiveId
                    ? { ...objective, progress: objective.progress + instanceIds.length }
                    : objective
            );

            return {
                ...prev,
                [npcId]: {
                    ...npcState,
                    activeQuest: { ...npcState.activeQuest, objectives: updatedObjectives },
                },
            };
        });

        addToast(`Turned in ${instanceIds.length} fish`);
    }

    function claimQuest(npcId, setPearls, addToast) {
        const npcState = questState[npcId];
        const quest = npcState.activeQuest;
        if (!quest) return;

        setPearls((prevPearls) => prevPearls + quest.reward.pearls);

        setQuestState((prev) => ({
            ...prev,
            [npcId]: { currentIndex: prev[npcId].currentIndex + 1, activeQuest: null },
        }));

        addToast(`${quest.title} complete! +${quest.reward.pearls}🦪`);
    }

    function resetQuestState() {
        setQuestState(initializeQuestState(null));
    }

    return { questState, acceptQuest, incrementScopedCatch, turnInFish, claimQuest, resetQuestState };
}