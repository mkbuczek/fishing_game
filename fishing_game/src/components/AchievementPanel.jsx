import Panel from './Panel';
import achievements from '../data/achievements';
import './AchievementPanel.css';
import { useState } from 'react';

export default function AchievementPanel({ onClose, unlockedAchievements }) {
    const [hoveredInfo, setHoveredInfo] = useState(null);

    return (
        <Panel 
            title={`Achievements (${unlockedAchievements.length}/${achievements.length})`}
            onClose={onClose}
            className="panel-achievement"
            sideInfo={hoveredInfo}
        >
            <div className="achievement-grid">
                {achievements.map((achievement) => {
                    const isUnlocked = unlockedAchievements.includes(achievement.id);

                    return (
                        <div
                            key={achievement.id}
                            className={isUnlocked ? 'achievement-entry' : 'achievement-entry achievement-entry-locked'}
                            onMouseEnter={() =>
                                setHoveredInfo(
                                    <>
                                        <span className="side-info-desc">{achievement.description}</span>
                                        <span className="side-info-reward">+{achievement.reward}🪙</span>
                                    </>
                                )}
                            onMouseLeave={() => setHoveredInfo(null)}
                        >
                            <div className="achievement-entry-square">
                                <span className="achievement-entry-name">
                                    {isUnlocked ? achievement.name : '???'}
                                </span>
                                <span className="achievement-entry-icon">
                                    {isUnlocked ? achievement.icon : '❓'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Panel>
    );
}