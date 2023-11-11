import React, { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { GameProvider } from "../GameProvider";
import TargetBox, { BoxProps } from "./TargetBox";
import TransparentImage from "./TransparentImage";
import { Html, useProgress } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import CanvasTexturedObject from "./CanvasTexture";

interface SceneProps {
  boxes: Partial<BoxProps>[];
}

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

const Scene: React.FC<SceneProps> = ({ boxes }) => {
  return (
    <Canvas camera={{ position: [0, 0, 30], fov: 20 }}>
      <Suspense fallback={<Loader />}>
        {/*<TransparentImage url={"/img/Csaj.png"} scale={12} position={[-0.2, -1, 0]}/>*/}
        <CanvasTexturedObject />
        {boxes.map((box, i) => (
          <TargetBox
            key={i}
            corner={box.corner as number}
            startTime={box.startTime as number}
          />
        ))}
        <TransparentImage
          url={"/img/BG_4_FHD.png"}
          scale={18}
          position={[0, 0, -10]}
        />

        <CanvasTexturedObject />

        <color attach="background" args={["#ffbf40"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 2, 10]} intensity={2} />
        <pointLight position={[0, 2, -4]} intensity={2} />
        <pointLight position={[0, 2, 4]} intensity={2} />
      </Suspense>
    </Canvas>
  );
};

export const GameCanvas = () => {
  return (
    <GameProvider>
      <div style={{ position: "absolute", zIndex: 10000, top: 0, width: "100%", height: "100%"}}>
        <Scene
          boxes={[
            { corner: 1, startTime: 0 },
            { corner: 2, startTime: 1 },
            { corner: 3, startTime: 2 },
            { corner: 4, startTime: 3 },
              { corner: 1, startTime: 4 },
              { corner: 2, startTime: 5 },
              { corner: 3, startTime:6 },
              { corner: 4, startTime: 7 },
              { corner: 1, startTime: 8 },
              { corner: 2, startTime: 9 },
              { corner: 3, startTime: 10 },
              { corner: 4, startTime: 11 },
              { corner: 1, startTime: 12 },
              { corner: 2, startTime: 13 },
              { corner: 3, startTime: 14 },
              { corner: 4, startTime: 15 },

          ]}
        />
      </div>
    </GameProvider>
  );
};
