import React, { createContext, useCallback, useContext, useState } from "react";
import { DetectionTarget } from "../../GameScreen/Segmentation";
import { Level } from "../../levels";
import { level1 } from "../../levels/level-1";

// Define a type for the hand positions
type GameState = {
  bodyPositions: {
    rightHand: { x: number; y: number; name?: string } | undefined;
    leftHand: { x: number; y: number; name?: string } | undefined;
    body: { x: number; y: number; name?: string } | undefined;
  };
  updateBodyPosition?: (target: DetectionTarget) => void;
  appState: AppState;
  updateAppState?: (updatedState: Partial<AppState>) => void;
  updateLoadingState: (updatedState: Partial<Checklist>) => void;
  score: number;
  streak: number;
  addHit: () => void;
  addMiss: () => void;
  gameStarted: boolean;
  startGame: () => void;
  selectedLevel: Level;
  setSelectedLevel: (level: Level | undefined) => void;
};

type AppState = {
  loadingChecklist: Checklist;
  allLoaded: boolean;
};

type Checklist = {
  webcamPermission: boolean;
  webcamStream: boolean;
  tensorflow: boolean;
  ffmpeg: boolean;
  // threejs: boolean;
};

const DEFAULT_CHECKLIST: Checklist = {
  webcamPermission: false,
  webcamStream: false,
  tensorflow: false,
  ffmpeg: false,
  // threejs: false,
};

// Create the context with a default value
const GameContext = createContext<GameState>({
  bodyPositions: { rightHand: undefined, leftHand: undefined, body: undefined },
  updateBodyPosition: undefined,
  appState: {
    loadingChecklist: DEFAULT_CHECKLIST,
    allLoaded: false,
  },
  updateLoadingState: () => {},
  streak: 1,
  score: 0,
  addHit: () => {},
  addMiss: () => {},
  gameStarted: false,
  startGame: () => {},
  selectedLevel: level1,
  setSelectedLevel: () => {},
});

// Create a provider component for the hand positions
export const GameProvider: any = ({ children }: any) => {
  const [bodyPositions, setBodyPositions] = useState<
    GameState["bodyPositions"]
  >({
    rightHand: undefined,
    leftHand: undefined,
    body: undefined,
  });

  const [score, setScore] = useState<GameState["score"]>(0);
  const [streak, setStreak] = useState<GameState["streak"]>(1);
  const [gameStarted, setGameStarted] =
    useState<GameState["gameStarted"]>(false);
  const [selectedLevel, setSelectedLevel] =
    useState<GameState["selectedLevel"]>(level1);

  const [appState, setAppState] = useState<AppState>({
    loadingChecklist: DEFAULT_CHECKLIST,
    allLoaded: false,
  });

  const handleLevelSelect = (level: Level | undefined) => {
    if (level) {
      setSelectedLevel(level);
    }
  };

  // console.log('GameProvider', bodyPositions)

  const addHit = () => {
    setScore(score + streak);
    setStreak(streak + 1);
  };

  const addMiss = () => {
    setStreak(1);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  // useCallback will return a memoized version of the callback that only changes if one of the dependencies has changed.
  const updateBodyPosition = useCallback((target: DetectionTarget) => {
    if (target.name === "left_wrist") {
      if (target.position === undefined) {
        setBodyPositions((prevPositions) => ({
          ...prevPositions,
          leftHand: undefined,
        }));
      } else {
        const position = target.position;
        setBodyPositions((prevPositions) => ({
          ...prevPositions,
          leftHand: { ...position },
        }));
      }
    } else if (target.name === "right_wrist") {
      if (target.position === undefined) {
        setBodyPositions((prevPositions) => ({
          ...prevPositions,
          rightHand: undefined,
        }));
      } else {
        const position = target.position;
        setBodyPositions((prevPositions) => ({
          ...prevPositions,
          rightHand: { ...position },
        }));
      }
    } else if (target.name === "body") {
      if (target.position === undefined) {
        setBodyPositions((prevPositions) => ({
          ...prevPositions,
          body: undefined,
        }));
      } else {
        const position = target.position;
        setBodyPositions((prevPositions) => ({
          ...prevPositions,
          body: { ...position },
        }));
      }
    }
  }, []);

  const updateAppState = useCallback((state: Partial<AppState>) => {
    setAppState((oldState) => ({ ...oldState, state }));
  }, []);

  const updateLoadingState = useCallback(
    (updatedChecks: Partial<Checklist>) => {
      setAppState((oldState) => {
        const newLoadedChecklist = {
          ...oldState.loadingChecklist,
          ...updatedChecks,
        };
        return {
          ...oldState,
          loadingChecklist: newLoadedChecklist,
          allLoaded: Object.values(newLoadedChecklist).every(
            (loaded) => !!loaded,
          ),
        };
      });
    },
    [],
  );

  // Include the updateBodyPosition function in the context value
  const contextValue: GameState = {
    bodyPositions,
    updateBodyPosition,
    appState,
    updateAppState,
    updateLoadingState,
    addMiss,
    addHit,
    score,
    streak,
    gameStarted,
    startGame,
    selectedLevel,
    setSelectedLevel: handleLevelSelect,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};

// Custom hook to use the hand positions
export const useGameState = () => {
  return useContext(GameContext);
};
