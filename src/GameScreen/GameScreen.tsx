import React, { useEffect, useRef } from "react";
import "./GameScreen.css";
import { Segmentation } from "./Segmentation";
import { GameCanvas } from "../components/GameCanvas";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";
import { Recorder } from "./CanvasRecorder";
import { useGameState } from "../components/GameProvider";

function GameScreen() {
  const { bodyPositions, updateBodyPosition, appState, updateLoadingState } =
    useGameState();
  const recorderRef = useRef(new Recorder());

  const loadedItems = Object.entries(appState.loadingChecklist);

  useEffect(() => {
    recorderRef.current.loadFfmpeg().then(() => {
      updateLoadingState({ ffmpeg: true });
    });
  }, []);

  return (
    <div className="page-wrapper">
      <div className="game-wrapper">
        <Segmentation onTargetMove={updateBodyPosition}></Segmentation>
        <canvas
          id="canvas"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
        ></canvas>
        <canvas
          id="canvas-export"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
        ></canvas>
        <GameCanvas />
        <ul className="loadedItems">
          {loadedItems.map((entry) => (
            <li key={entry[0]}>
              {entry[0]}:{entry[1] ? "Loaded" : "Loading"}
            </li>
          ))}
        </ul>

        <div className="controls">
          {recorderRef.current.isRecording ? (
            <button onClick={() => recorderRef.current.endRecording()}>
              Stop recording
            </button>
          ) : (
            <button onClick={() => recorderRef.current.startRecording()}>
              Record
            </button>
          )}

          {recorderRef.current.isTranscoding && (
            <span>Transcoding video...</span>
          )}

          {recorderRef.current.downloadLink && (
            <a href={recorderRef.current.downloadLink} download>
              Download video
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
