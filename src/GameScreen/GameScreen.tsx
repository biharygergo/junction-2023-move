import React from "react";
import "./GameScreen.css";
import { Segmentation } from "./Segmentation";
import {GameCanvas} from "../components/GameCanvas";

function GameScreen() {
  return (
    <div className="page-wrapper">
      <div className="game-wrapper">
        <Segmentation></Segmentation>
          <canvas id="canvas" width={640} height={480}></canvas>
          <GameCanvas />
      </div>
    </div>
  );
}

export default GameScreen;
