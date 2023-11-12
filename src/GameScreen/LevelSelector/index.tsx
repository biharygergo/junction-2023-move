import React from 'react';
import './styles.css';
import { useGameState } from "../../components/GameProvider";
import {getLevelById, levels} from "../../levels";

const LevelSelector = () => {
    const { selectedLevel, setSelectedLevel } = useGameState();

    const handleLevelChange = (event: any) => {
        console.log(event.target.value);
        setSelectedLevel(getLevelById(event.target.value));
    };

    return (
        <div className="level-selector">
            <h2>Select level</h2>
            <form>
                {levels.map((level, index) => (
                    <label key={level.id} className="level-option">
                        <input
                            type="radio"
                            value={level.id}
                            // Assuming selectedLevel is an object with an id property
                            checked={selectedLevel.id === level.id}
                            onChange={handleLevelChange}
                        />
                        {level.name}
                    </label>
                ))}
            </form>
        </div>
    );
};

export default LevelSelector;
