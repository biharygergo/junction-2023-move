import React, { createContext, useContext, useState } from 'react';

// Define a type for the hand positions
type GameState = {
    rightHand: { x: number; y: number };
    leftHand: { x: number; y: number };
};

// Create the context with a default value
const GameContext = createContext<GameState>({
    rightHand: { x: 0, y: 0 },
    leftHand: { x: 0, y: 0 },
});

// Create a provider component for the hand positions
export const GameProvider: any = ({ children }: any) => {
    const [state, setState] = useState<GameState>({
        rightHand: { x: -1, y: 0 },
        leftHand: { x: 1, y: 0 },
    });

    return (
        <GameContext.Provider value={state}>
            {children}
        </GameContext.Provider>
    );
};

// Custom hook to use the hand positions
export const useHandPositions = () => {
    return useContext(GameContext);
};
