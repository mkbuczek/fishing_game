import { useState, useEffect, useRef } from 'react';
import upgrades from '../data/upgrades';
import { pickWeighted, rollBestModifier } from '../utils/pickWeighted';
import fish from '../data/fish';
import fishModifiers from '../data/fishModifiers';

const defaultAutoFisherInterval = 60;

export function useAutoFisher({
    ownedUpgrades,
    playerStats,
    inventory,
    capacity,
    isEnabled,
    isAutoSellEnabled,
    onCatch,
    onInventoryFull
}) {
    const [isPaused, setIsPaused] = useState(false);
    const wasPausedRef = useRef(false); // tracks previous pause state to only toast on transition

    const baseLevel = ownedUpgrades['auto-fisher'] || 0;
    const isActive = isEnabled && baseLevel > 0;
    const hasRoom = isAutoSellEnabled || inventory.length < capacity;
    const isInventoryFull = baseLevel > 0 && !hasRoom;

    useEffect(() => {
        if (!isActive) {
            setIsPaused(false);
            wasPausedRef.current = false;
            return;
        }

        setIsPaused(isInventoryFull);

        if (isInventoryFull && !wasPausedRef.current) {
            onInventoryFull();
            wasPausedRef.current = true;
        } else if (!isInventoryFull) {
            wasPausedRef.current = false;
        }
    }, [isInventoryFull]);

    useEffect(() => {
        if (!isActive) return;

        // speed upgrade bonuses are summed and subtracted from the base interval
        const speedLevel = ownedUpgrades['auto-fisher-speed'] || 0;
        const speedUpgrade = upgrades.find((u) => u.id === 'auto-fisher-speed');
        const totalSpeedBonus = speedUpgrade.tiers
            .slice(0, speedLevel)
            .reduce((sum, tier) => sum + tier.bonus, 0);
        const intervalSeconds = defaultAutoFisherInterval - totalSpeedBonus;

        const timer = setInterval(() => {
            if (hasRoom) {
                const maxRarityLevel = ownedUpgrades['auto-fisher-modifier'] || 0; // 0 = common only
                const catchCountLevel = ownedUpgrades['auto-fisher-count'] || 0;
                const catchCount = 1 + catchCountLevel; // base 1 fish, +1 per tier

                const allowedModifiers = fishModifiers.slice(0, maxRarityLevel + 1); // capped pool ranked common to rarest

                const slotsLeft = isAutoSellEnabled ? catchCount : Math.min(catchCount, capacity - inventory.length);

                const catches = [];
                for (let i = 0; i < slotsLeft; i++) {
                    const species = pickWeighted(fish);
                    const modifier = rollBestModifier(allowedModifiers, playerStats.luck);
                    catches.push({ species, modifier });
                }
                if (catches.length > 0) {
                    onCatch(catches); //submit fish in a batch to guard against achievements doubling
                }
            }
        }, intervalSeconds * 1000);

        return () => clearInterval(timer); // clean old timer
    }, [ownedUpgrades, isEnabled, isAutoSellEnabled, inventory.length, capacity, playerStats.luck]);

    return { isPaused };
}