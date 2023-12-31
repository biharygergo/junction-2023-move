import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import GameScreen from "./GameScreen/GameScreen";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Reel from "./Reel/Reel";
import {GameProvider} from "./components/GameProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GameScreen />,
  },
  {
    path: "/game",
    element: <GameScreen />,
  },
  {
    path: "/reels",
    element: <Reel />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <>
    <GameProvider>
      <RouterProvider router={router} />
    </GameProvider>
  </>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
