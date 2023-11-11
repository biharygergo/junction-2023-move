import React from "react";
import "./App.css";
import { GameCanvas } from "./components/GameCanvas";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const startGame = () => {
    navigate("/game");
  };

  return (
    <div>
      <h1>Welcome stranger!</h1>
      <button onClick={() => startGame()}>Start game</button>
    </div>
  );
}

export default App;
