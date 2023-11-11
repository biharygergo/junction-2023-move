import React, { useEffect, useRef } from "react";
import "./GameScreen.css";
import { Segmentation } from "./Segmentation";
import { GameCanvas } from "../components/GameCanvas";
import { CANVAS_HEIGHT, CANVAS_WIDTH, RUN_VIDEO } from "./constants";
import { Recorder } from "./CanvasRecorder";
import { useGameState } from "../components/GameProvider";
///recorderRef.current.isRecording
function GameScreen() {
  const {
    startGame,
    gameStarted,
    score,
    streak,
    updateBodyPosition,
    appState,
    updateLoadingState,
  } = useGameState();
  const recorderRef = useRef(new Recorder());

  const loadedItems = Object.entries(appState.loadingChecklist);

  useEffect(() => {
    recorderRef.current.loadFfmpeg().then(() => {
      updateLoadingState({ ffmpeg: true });
    });
  }, []);

  const clickStart = () => {
    startGame()

    setTimeout(() => {
      console.log("starting record")
      recorderRef.current.startRecording()
    }, 1000)

    setTimeout(() => {
      console.log("ending record")
      recorderRef.current.endRecording()
    }, 40000)
  }

  return (
    <div className="page-wrapper">
      <div className="game-wrapper">
        <div
          className="loader"
          style={{ display: appState.allLoaded ? "none" : "block" }}
        >
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            Just a second...
          </div>
          <ul className="loadedItems">
            {loadedItems.map((entry) => (
              <li key={entry[0]}>
                {entry[0]}:
                {entry[1] ? "✅️" : <span className="rotating-span">🪩</span>}
              </li>
            ))}
          </ul>
        </div>
        {appState.allLoaded && !gameStarted && (
          <button onClick={clickStart} className="startButton">
            START GAME
          </button>
        )}
        {gameStarted && (
          <div className="top-bar">
            {recorderRef.current.isRecording && <div className="blob red"></div>}
            <div className="score">
              Score: {score} | Streak: {streak}x
            </div>
          </div>
        )}
        {RUN_VIDEO && (
          <Segmentation onTargetMove={updateBodyPosition}></Segmentation>
        )}
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
