const upgrades = [
    {
        id: "faster-reel-1",
        name: "Faster Reel",
        tooltip: "Increases how fast progress fills",
        cost: 10,
        statKey: "fillRate",
        statBonus: 0.15,
        category: "stat",
        requires: [],
    },
    {
        id: "bigger-hitbox-1",
        name: "Better Hook",
        tooltip: "Increases catch bar hitbox",
        cost: 25,
        statKey: "barHeight",
        statBonus: 5,
        category: "stat",
        requires: [],
    },
    {
        id: "better-bait-1",
        name: "Better Bait",
        tooltip: "Makes fish bite quicker",
        cost: 30,
        statKey: "biteExponent",
        statBonus: 2,
        category: "stat",
        requires: [],
    },
    {
        id: "catch-reward-1",
        name: "Shiny Fish",
        tooltip: "Increases fish sell price",
        cost: 50,
        statKey: "sellReward",
        statBonus: 5,
        category: "stat",
        requires: ["faster-reel-1","bigger-hitbox-1","better-bait-1"],
    },
];

export default upgrades;