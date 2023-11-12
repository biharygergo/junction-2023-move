import React, { useEffect, useMemo, useRef } from "react";
import "./GameScreen.css";
import { Segmentation } from "./Segmentation";
import { GameCanvas } from "../components/GameCanvas";
import { CANVAS_HEIGHT, CANVAS_WIDTH, RUN_VIDEO } from "./constants";
import { Recorder } from "./CanvasRecorder";
import { useGameState } from "../components/GameProvider";
import { useNavigate } from "react-router-dom";
import UploadModal from "../components/UploadModal";
import AudioPlayer from "../components/Audio/Audio";
import { uploadDancePost } from "../dances-service";
import { getRandomUsername } from "./usernames";

function isRunningInChrome() {
  const isChromium = (window as any).chrome;
  const winNav = window.navigator;
  const vendorName = winNav.vendor;
  const isOpera = typeof (window as any).opr !== "undefined";
  const isIEedge = winNav.userAgent.indexOf("Edg") > -1;
  const isIOSChrome = winNav.userAgent.match("CriOS");

  if (isIOSChrome) {
    // is Google Chrome on IOS
  } else if (
    isChromium !== null &&
    typeof isChromium !== "undefined" &&
    vendorName === "Google Inc." &&
    isOpera === false &&
    isIEedge === false
  ) {
    return true;
    // is Google Chrome
  } else {
    // not Google Chrome
    return false;
  }
}

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
  const recorderRef = useRef(new Recorder((blob) => transcodingReady(blob)));
  const navigate = useNavigate();
  const isChrome = useMemo(() => isRunningInChrome(), []);

  const scoreRef = useRef(0);

  const loadedItems = Object.entries(appState.loadingChecklist);

  useEffect(() => {
    recorderRef.current.loadFfmpeg().then(() => {
      updateLoadingState({ ffmpeg: true });
    });
  }, []);

  useEffect(() => {
    if (recorderRef.current.downloadLink !== undefined) {
      navigate("/reels");
    }
  }, [recorderRef.current.downloadLink]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const transcodingReady = async (blob: any) => {
    await uploadDancePost(
      {
        userId: getRandomUsername(),
        fitnessStats: { score: scoreRef.current },
      },
      blob
    );
  };

  const clickStart = () => {
    const recordingStart = 5;
    const recordingEnd = 30;
    startGame();

    setTimeout(() => {
      console.log("starting record");
      recorderRef.current.startRecording();
    }, recordingStart * 1000);

    setTimeout(() => {
      console.log("ending record");
      recorderRef.current.endRecording();
    }, recordingEnd * 1000);
  };

  return (
    <div className="page-wrapper">
      <div className="game-wrapper">
        <div
          className="loader"
          style={{ display: appState.allLoaded ? "none" : "block" }}
        >
          {isChrome ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                Just a second...
              </div>
              <ul className="loadedItems">
                {loadedItems.map((entry) => (
                  <li key={entry[0]}>
                    {entry[0]}:
                    {entry[1] ? (
                      "✅️"
                    ) : (
                      <span className="rotating-span">🪩</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              Please open this app in Chrome
            </div>
          )}
        </div>
        {appState.allLoaded && !gameStarted && (
          <button onClick={clickStart} className="startButton">
            START GAME
          </button>
        )}
        {gameStarted && (
          <div className="top-bar">
            {recorderRef.current.isRecording && (
              <div className="blob red"></div>
            )}
            <div className="score">
              Score: {score} | Streak: {streak}x
            </div>
          </div>
        )}
        {RUN_VIDEO && (
          <Segmentation onTargetMove={updateBodyPosition}></Segmentation>
        )}
        <AudioPlayer
          audioSrc={`${process.env.PUBLIC_URL}/audio/mesmerizing.mp3`}
          shouldPlay={gameStarted}
        />
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

        {recorderRef.current.isTranscoding && <UploadModal />}
      </div>
    </div>
  );
}

export default GameScreen;
