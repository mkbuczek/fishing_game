import fish from "./fish";
import fishModifiers from "./fishModifiers";

const milestones = [5, 10, 25, 50];
const pearlMilestones = [100, 500, 1000, 5000];
const catchMilestones = [10, 25, 50, 100]; 

function generateSpeciesAchievements() {
    const achievements = [];

    fish.forEach((species) => {
        milestones.forEach((milestone) => {
            achievements.push({
                id: `catch-${species.id}-${milestone}`,
                name: `Catch ${milestone} ${species.name}`,
                description: `Catch ${milestone} ${species.name} of any rarity.`,
                icon: species.icon,
                conditionType: 'speciesCatchCount',
                target: species.id,
                threshold: milestone,
                reward: Math.round(Math.sqrt(milestone)),
            });
        });
    });

    return achievements;
}

function generateModifierAchievements() {
    const achievements = [];

    fishModifiers.forEach((modifier) => {
        const label = modifier.name || 'Common';
        const isCommon = modifier.id === 'common';
        const modifierMilestones = isCommon ? milestones : [1, ...milestones];

        modifierMilestones.forEach((milestone) => {
            achievements.push({
                id: `catch-${modifier.id}-${milestone}`,
                name: `Catch ${milestone} ${label} Fish`,
                description: `Catch ${milestone} ${label} fish of any species.`,
                icon: '✨',
                conditionType: 'modifierCatchCount',
                target: modifier.id,
                threshold: milestone,
                reward: milestone * modifier.rewardMultiplier,
            });
        });
    });

    return achievements;
}

function generatePearlAchievements() {
    return pearlMilestones.map((threshold) => ({
        id: `pearls-${threshold}`,
        name: `${threshold.toLocaleString()} Pearls Earned`,
        description: `Earn ${threshold.toLocaleString()} lifetime pearls.`,
        icon: '💰',
        conditionType: 'totalPearlsEarned',
        threshold,
        reward: Math.round(Math.sqrt(threshold) - 6),
    }));
}

function generateCatchAchievements() {
    return catchMilestones.map((threshold) => ({
        id: `total-catches-${threshold}`,
        name: `Catch ${threshold.toLocaleString()} Fish`,
        description: `Catch ${threshold.toLocaleString()} fish overall.`,
        icon: '🐟',
        conditionType: 'totalCatchCount',
        threshold,
        reward: Math.round(Math.sqrt(threshold)),
    }));
}

const handmadeAchievements = [
    {
        id: 'catch-1-fish',
        name: 'First Catch',
        description: 'Catch your very first fish!',
        icon: '🎣',
        conditionType: 'totalCatchCount',
        threshold: 1,
        reward: 1,
    },
]

const achievements = [
  ...handmadeAchievements,
  ...generateSpeciesAchievements(),
  ...generateModifierAchievements(),
  ...generatePearlAchievements(),
  ...generateCatchAchievements(),
];

export default achievements;