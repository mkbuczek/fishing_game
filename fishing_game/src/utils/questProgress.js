import fishModifiers from "../data/fishModifiers";
import { getModifierCatchCount } from "./bestiaryStats";

const lifetimeValueGetters = {
    totalCatches: (objective, context) => context.totalCatches,
    bestiaryCount: (objective, context) => Object.keys(context.bestiary).length,
    achievementCount: (objective, context) => context.unlockedAchievements.length,
    modifierCatchCount: (objective, context) => {
        if (objective.modifierId === null) {
            // "any modifier" = sum every non-common modifier's catch count
            return fishModifiers
                .filter((modifier) => modifier.id !== 'common')
                .reduce((sum, modifier) => sum + getModifierCatchCount(context.bestiary, modifier.id), 0);
        }
        return getModifierCatchCount(context.bestiary, objective.modifierId)
    },
};

function getLifetimeValue(objective, context) {
    const getter = lifetimeValueGetters[objective.type];
    if (!getter) return 0; // unknown getter type
    return getter(objective, context);
}

export function getObjectiveProgress(objective, context) {
    // lifetime objectives call the lifetime getters
    if (objective.scope === 'lifetime') {
        return getLifetimeValue(objective, context);
    }
    // scope / turnIn
    // the counter lives on the active quest instance
    return objective.progress ?? 0;
}

export function isObjectiveComplete(objective, context) {
    return getObjectiveProgress(objective, context) >= objective.target;
}

export function isQuestComplete(quest, context) {
    return quest.objectives.every((objective) => isObjectiveComplete(objective, context));
}

export function isUnlockConditionMet(unlockCondition, context) {
    if (!unlockCondition) return true;
    return getLifetimeValue(unlockCondition, context) >= unlockCondition.target;
}

export function getObjectiveProgressPercent(objective, context) {
    const progress = getObjectiveProgress(objective, context);
    return Math.min(100, Math.round((progress / objective.target) * 100));
}

export function doesFishMatchObjective(item, objective) {
    const speciesMatches = objective.speciesId === null || objective.speciesId === item.speciesId;
    const modifierMatches = objective.modifierId === null || objective.modifierId === item.modifierId;
    return speciesMatches && modifierMatches;
}