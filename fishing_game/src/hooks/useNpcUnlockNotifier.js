import { useEffect, useState } from 'react';
import questNpcs from '../data/questNpcs';
import { isUnlockConditionMet } from '../utils/questProgress';

// watches every NPC's unlock condition against live game stats
// fires a toast exactly once on unlock
export function useNpcUnlockNotifier(context, addToast, savedAnnouncedNpcs) {
    const [announcedNpcs, setAnnouncedNpcs] = useState(() => savedAnnouncedNpcs ?? []);

    useEffect(() => {
        questNpcs.forEach((npc) => {
            const isUnlocked = isUnlockConditionMet(npc.unlockCondition, context);
            const alreadyAnnounced = announcedNpcs.includes(npc.id);

            if (isUnlocked && !alreadyAnnounced) {
                addToast(`${npc.icon}${npc.name} is now offering quests!`);
                setAnnouncedNpcs((prev) => [...prev, npc.id]);
            }
        });
    }, [context, addToast, announcedNpcs]);

    function resetAnnouncedNpcs() {
        setAnnouncedNpcs([]);
    }

    return { announcedNpcs, resetAnnouncedNpcs };
}