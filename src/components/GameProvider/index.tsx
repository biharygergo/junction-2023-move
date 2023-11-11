import React, { createContext, useCallback, useContext, useState } from "react";
import { DetectionTarget } from "../../GameScreen/Segmentation";

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
  threejs: boolean;
};

const DEFAULT_CHECKLIST: Checklist = {
  webcamPermission: false,
  webcamStream: false,
  tensorflow: false,
  ffmpeg: false,
  threejs: false,
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

  const [appState, setAppState] = useState<AppState>({
    loadingChecklist: DEFAULT_CHECKLIST,
    allLoaded: false,
  });

  // console.log('GameProvider', bodyPositions)

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
            (loaded) => !!loaded
          ),
        };
      });
    },
    []
  );

  // Include the updateBodyPosition function in the context value
  const contextValue: GameState = {
    bodyPositions,
    updateBodyPosition,
    appState,
    updateAppState,
    updateLoadingState,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};

// Custom hook to use the hand positions
export const useGameState = () => {
  return useContext(GameContext);
};
