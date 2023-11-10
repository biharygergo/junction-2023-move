import React from "react";
import "./GameScreen.css";
import { Segmentation } from "./Segmentation";

function GameScreen() {
  return (
    <div className="page-wrapper">
      <div className="game-wrapper">
        <Segmentation></Segmentation>
      </div>
    </div>
  );
}

export default GameScreen;
