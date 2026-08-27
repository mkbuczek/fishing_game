import './FishingHUD.css';
import { useState, useEffect, useRef } from 'react';

export default function FishingHUD({
  onResult,
  startingProgress = 40, // % of starting progress value (HARD-CODED FOR NOW)
  barHeight = 15,   // % of track height (HARD-CODED FOR NOW)
  upSpeed = 0.75, // % per frame (HARD-CODED FOR NOW)
  downSpeed = 0.5, // % per frame (HARD-CODED FOR NOW)
  fishHeight = 5, // % of track height the fish occupies (HARD-CODED FOR NOW)
  fishSpeed = 0.25, // % per frame the fish moves towards its target (HARD-CODED FOR NOW)
  fishTargetInterval = 200, // frames between picking a new target (HARD-CODED FOR NOW)
  fillRate = 0.3, // rate at which progress fills when the bar overlaps with the fish (HARD-CODED FOR NOW)
  drainRate = 0.25, // rate at which progress drains when the bar does not overlap with the fish (HARD-CODED FOR NOW)
}) {

  const [debug, setDebug] = useState(false);
  const [barBottom, setBarBottom] = useState(20);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(startingProgress);
  const [fishBottom, setFishBottom] = useState(50);

  const isHoldingRef = useRef(false); // current state of whether the player is holding the input
  const animationFrameId = useRef(null); // Id of the current animation frame request
  const barBottomRef = useRef(20); // bar's current position
  const fishBottomRef = useRef(50); // fish's current position
  const fishTargetRef = useRef(50); // where the fish is moving towards
  const fishTimerRef = useRef(0); // frames until next target change
  const progressRef = useRef(startingProgress); // current progress value
  const resolvedRef = useRef(false); // whether the minigame has resolved (win/loss)

  // Handle input events for mouse and keyboard
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code === 'Space') {
        event.preventDefault(); // Prevent scrolling when space is pressed
        setIsHolding(true);
      } else if (event.code === 'KeyF') {
        setDebug((prevDebug) => !prevDebug);
      }
    }

    function handleKeyUp(event) {
      if (event.code === 'Space') {
        setIsHolding(false);
      }
    }

    function handleMouseDown() {
      setIsHolding(true);
    }

    function handleMouseUp() {
      setIsHolding(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Update bar position based on whether the player is holding the input
  useEffect(() => {
    isHoldingRef.current = isHolding;
  }, [isHolding]);

  // Animation loop to update the HUD (bar position, fish position, and progress)
  useEffect(() => {
    function loop() {
        // --- Bar movement ---
        const delta = isHoldingRef.current ? upSpeed : -downSpeed;
        const nextBar = Math.max(0, Math.min(barBottomRef.current + delta, 100 - barHeight));
        barBottomRef.current = nextBar;
        setBarBottom(nextBar);

        // --- Fish AI: random walk ---
        fishTimerRef.current += 1;
        if (fishTimerRef.current >= fishTargetInterval) {
            fishTimerRef.current = 0;
            // Pick a new random target for the fish, keeping its hitbox within bounds
            const min = fishHeight / 2;
            const max = 100 - fishHeight / 2;
            fishTargetRef.current = min + Math.random() * (max - min);
        }

        // Move the fish towards its target
        const fishDelta = fishTargetRef.current - fishBottomRef.current;
        const step = Math.sign(fishDelta) * Math.min(fishSpeed, Math.abs(fishDelta));
        fishBottomRef.current += step;
        setFishBottom(fishBottomRef.current);
        
        // Overlap detection between the bar and the fish
        const barBottomEdge = nextBar;
        const barTopEdge = nextBar + barHeight;
        const fishBottomEdge = Math.max(0, fishBottomRef.current - fishHeight / 2);
        const fishTopEdge = Math.min(100, fishBottomRef.current + fishHeight / 2);

        const isOverlapping = barBottomEdge < fishTopEdge && barTopEdge > fishBottomEdge;

        // Progress update based on overlap
        const progressDelta = isOverlapping ? fillRate : -drainRate;
        const nextProgress = Math.max(0, Math.min(progressRef.current + progressDelta, 100));
        progressRef.current = nextProgress;
        setProgress(nextProgress);

        // Resolution check: catch or escape
        if (!resolvedRef.current) {
          if (nextProgress >= 100) {
            resolvedRef.current = true;
            onResult('caught');
          } else if (nextProgress <= 0) {
            resolvedRef.current = true;
            onResult('escaped');
          }
        }

        // Only keep looping if the game hasn't resolved yet
        if (!resolvedRef.current) {
          animationFrameId.current = requestAnimationFrame(loop);
        }
    }

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <div className="fishing-hud">
      <div className="hud-hook" aria-hidden="true">
        <div className="hook-rope" />
        <div className="hook-curl" />
      </div>

      <div className="hud-frame">
        <div className="water-window">
          <div className="fish-track">
            <div
              className="catch-bar"
              style={{ bottom: `${barBottom}%`, height: `${barHeight}%` }}
            />
            <div
              className="fish-icon"
              style={{ bottom: `${fishBottom}%` }}
            >
              🐟
            </div>

            {debug && (
              <div
                className="fish-hitbox-debug"
                style={{
                  bottom: `${Math.max(0, fishBottomRef.current - fishHeight / 2)}%`,
                  height: `${Math.min(100, fishBottomRef.current + fishHeight / 2) - Math.max(0, fishBottomRef.current - fishHeight / 2)}%`,
                }}
              />
            )}
          </div>
        </div>

        <div className="progress-meter">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ height: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <p className="hud-hint"><kbd>click</kbd> or <kbd>space</kbd> to reel up</p>
    </div>
  );
}