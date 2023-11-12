import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import TargetBox from "./Targets/TargetBox";
import TransparentImage from "./TransparentImage";
import { Html, useProgress } from "@react-three/drei";
import CanvasTexturedObject from "./CanvasTexture";
import TargetJump from "./Targets/TargetJump";
import { NoToneMapping } from "three";
import { RUN_VIDEO } from "../../GameScreen/constants";
import ModelWithAnimation from "./ModelWithAnimation";
import { useGameState } from "../GameProvider";
import "./LoadingScreen.css";
import {Level} from "../../levels";

export interface TargetProps {
  type: string;
  param?: number;
  startTime: number;
}
interface SceneProps {
  selectedLevel:Level;
  startScene: boolean;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center wrapperClass="loading-screen-wrapper">
      <div className="loading-screen">
        <div className="loading-text">Loading game</div>
        <div className="loading-bar-container">
          <div className="loading-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </Html>
  );
}

const countDownLength = 3;

const Scene: React.FC<SceneProps> = ({ selectedLevel, startScene }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 20 }}
      gl={{
        toneMapping: NoToneMapping,
        // outputEncoding: sRGBEncoding, // This ensures the renderer output is in sRGB space
      }}
    >

      {/*{!startScene && (*/}
      {/*  <TransparentImage*/}
      {/*    url={"/img/silhouette.png"}*/}
      {/*    scale={11}*/}
      {/*    position={[0, 0, 0]}*/}
      {/*  />*/}
      {/*)}*/}
      <Suspense fallback={<Loader />}>
        {/*<TransparentImage url={"/img/Csaj.png"} scale={12} position={[-0.2, -1, 0]}/>*/}
        {/*  <CanvasTexturedObject />*/}

        {startScene && (
          <>
            {RUN_VIDEO && <CanvasTexturedObject />}
            <TransparentImage
                url={"/img/silhouette.png"}
                scale={11}
                position={[0, 0, 0]}
                opacity={0.3}
            />
            <ModelWithAnimation
              url={"/model/countdown.gltf"}
              scale={0.015}
              position={[0, 0, 1]}
              startTime={0}
            />
          </>
        )}

        {startScene &&
          selectedLevel.targets.map((target, i) =>
            target.type === "box" ? (
              <TargetBox
                key={i}
                corner={target.param as number}
                startTime={(target.startTime as number) + countDownLength}
              />
            ) : target.type === "jump" ? (
              <TargetJump
                key={i}
                side={target.param as number}
                startTime={(target.startTime as number) + countDownLength}
              />
            ) : (
              <ModelWithAnimation
                url={"/model/Spin.gltf"}
                scale={0.008}
                position={[0, 0, 1]}
                startTime={(target.startTime as number) + countDownLength}
              />
            ),
          )}
        <TransparentImage
          url={"/img/" + selectedLevel.background}
          scale={29}
          position={[0, 0, -50]}
        />

        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={4} />
        <pointLight position={[0, 2, -40]} intensity={5} />
        <pointLight position={[0, 2, -30]} intensity={5} />
        <pointLight position={[0, 2, -20]} intensity={5} />
        <pointLight position={[0, 2, -10]} intensity={5} />
        <pointLight position={[0, 2, 0]} intensity={5} />
        <pointLight position={[0, 2, 10]} intensity={5} />
        <pointLight position={[0, 2, 20]} intensity={5} />
        <pointLight position={[0, 2, 30]} intensity={5} />
        <pointLight position={[0, -2, -40]} intensity={5} />
        <pointLight position={[0, -2, -30]} intensity={5} />
        <pointLight position={[0, -2, -20]} intensity={5} />
        <pointLight position={[0, -2, -10]} intensity={5} />
        <pointLight position={[0, -2, 0]} intensity={5} />
        <pointLight position={[0, -2, 10]} intensity={5} />
        <pointLight position={[0, -2, 20]} intensity={5} />
        <pointLight position={[0, -2, 30]} intensity={5} />
      </Suspense>
    </Canvas>
  );
};

const targets = new Array(120).fill({}).map((value, index) => {
  return {
    // type: index % 2 ? "box" : "jump",
    type: "jump",
    startTime: index * 5,
    param: (index % 3) + 1,
  };
}) as any;

const rickTargets = [
  {
    startTime: 0,
    param: 3,
    type: "box",
  },
  {
    startTime: 1,
    param: 4,
    type: "box",
  },
  {
    startTime: 2,
    param: 1,
    type: "box",
  },
  {
    startTime: 3,
    param: 2,
    type: "jump",
  },
  {
    startTime: 5,
    param: 1,
    type: "jump",
  },
  {
    startTime: 11,
    param: 0,
    type: "spin",
  },
  {
    startTime: 10,
    param: 2,
    type: "box",
  },
  {
    startTime: 10,
    param: 1,
    type: "box",
  },
  {
    startTime: 12,
    param: 3,
    type: "jump",
  },
] as any;

export const GameCanvas = () => {
  const { gameStarted, selectedLevel } = useGameState();

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 10000,
        top: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <Scene selectedLevel={selectedLevel} startScene={gameStarted} />
    </div>
  );
};
