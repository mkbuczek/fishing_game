const questNpcs = [
    {
        id: 'npc1',
        name: 'Marlon',
        specialty: 'Species Variety',
        icon: '🎣',
        unlockCondition: { type: 'totalCatches', target: 5 },
        questLine: [
            {
                id: 'npc1-quest-1',
                title: 'A Simple Start',
                description: 'Bring me a couple of common catches to prove you can reel `em in.',
                objectives: [
                    {
                        id: 'obj-1',
                        type: 'turnInSpecies',
                        scope: 'turnIn',
                        speciesId: null,
                        modifierId: null,
                        target: 2,
                    },
                                        {
                        id: 'obj-2',
                        type: 'totalCatches',
                        scope: 'lifetime',
                        target: 10,
                    },
                ],
                reward: { pearls: 50 },
            },
            {
                id: 'npc1-quest-2',
                title: 'Test 2',
                description: 'test 2!',
                objectives: [
                    {
                        id: 'obj-1',
                        type: 'turnInSpecies',
                        scope: 'turnIn',
                        speciesId: 'minnow',
                        modifierId: 'huge',
                        target: 1,
                    },
                    {
                        id: 'obj-2',
                        type: 'totalCatches',
                        scope: 'lifetime',
                        target: 10,
                    },
                ],
                reward: { pearls: 150 },
            },
        ],
    },
    {
        id: 'npc2',
        name: 'Celestia',
        specialty: 'Modifier Specialist',
        icon: '💎',
        unlockCondition: { type: 'modifierCatchCount', target: 1, modifierId: null },
        questLine: [
            {
                id: 'npc2-quest-1',
                title: 'Glimmering Fish',
                description: 'test 1!',
                objectives: [
                    {
                        id: 'obj-1',
                        type: 'turnInSpecies',
                        scope: 'turnIn',
                        speciesId: null,
                        modifierId: 'gold',
                        target: 1,
                    },
                    {
                        id: 'obj-2',
                        type: 'scopedCatchCount',
                        scope: 'scoped',
                        target: 3,
                        countsAutoFisher: true,
                    },
                ],
                reward: { pearls: 200 },
            },
        ],
    },
    {
        id: 'npc3',
        name: 'Geres',
        specialty: 'Bestiary Expert',
        icon: '🧾',
        unlockCondition: { type: 'bestiaryCount', target: 5 },
        questLine: [
            {
                id: 'npc3-quest-1',
                title: 'Fill the Pages',
                description: 'test 1!',
                objectives: [
                    {
                        id: 'obj-1',
                        type: 'bestiaryCount',
                        scope: 'lifetime',
                        target: 25,
                    },
                ],
                reward: { pearls: 250 },
            },
        ],
    },
];

export default questNpcs;