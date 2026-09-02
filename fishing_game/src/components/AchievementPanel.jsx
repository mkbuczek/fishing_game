import Panel from './Panel';
import achievements from '../data/achievements';
import './AchievementPanel.css';

export default function AchievementPanel({ onClose, unlockedAchievements }) {
    return (
        <Panel 
            title={`Achievements (${unlockedAchievements.length}/${achievements.length})`}
            onClose={onClose}
            className="panel-achievement"
        >
            <div className="achievement-grid">
                {achievements.map((achievement) => {
                    const isUnlocked = unlockedAchievements.includes(achievement.id);

                    return (
                        <div
                            key={achievement.id}
                            className={isUnlocked ? 'achievement-entry' : 'achievement-entry achievement-entry-locked'}
                        >
                            <div className="achievement-entry-square">
                                <span className="achievement-entry-name">
                                    {isUnlocked ? achievement.name : '???'}
                                </span>
                                <span className="achievement-entry-icon">
                                    {isUnlocked ? achievement.icon : '❓'}
                                </span>
                            </div>
                            <span className="achievement-entry-reward">
                                {isUnlocked ? `+${achievement.reward}🪙` : ''}
                            </span>
                        </div>
                    );
                })}
            </div>
        </Panel>
    );
}