import React from "react";
import "./GameScreen.css";
import { Segmentation } from "./Segmentation";
import { GameCanvas } from "../components/GameCanvas";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";

function GameScreen() {
  return (
    <div className="page-wrapper">
      <div
        className="game-wrapper"
      >
        <Segmentation></Segmentation>
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
        {/*         <GameCanvas />
         */}{" "}
      </div>
    </div>
  );
}

export default GameScreen;
