import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import TargetBox from "./Targets/TargetBox";
import TransparentImage from "./TransparentImage";
import { Html, useProgress } from "@react-three/drei";
import CanvasTexturedObject from "./CanvasTexture";
import TargetJump from "./Targets/TargetJump";
import { NoToneMapping } from "three";

interface TargetProps {
  type: "box" | "jump";
  param: number;
  startTime: number;
}
interface SceneProps {
  targets: Partial<TargetProps>[];
}

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

const Scene: React.FC<SceneProps> = ({ targets }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 20 }}
      // colorManagement={false}

      // onCreated={({ gl }) => {
      //   gl.toneMapping = NoToneMapping;
      // }}

      gl={{
        toneMapping: NoToneMapping,
        // outputEncoding: sRGBEncoding, // This ensures the renderer output is in sRGB space
      }}
    >
      <CanvasTexturedObject />

      <Suspense fallback={<Loader />}>
        {/*<TransparentImage url={"/img/Csaj.png"} scale={12} position={[-0.2, -1, 0]}/>*/}
        {/*  <CanvasTexturedObject />*/}

        {targets.map((target, i) =>
          target.type === "box" ? (
            <TargetBox
              key={i}
              corner={target.param as number}
              startTime={target.startTime as number}
            />
          ) : (
            <TargetJump
              key={i}
              side={target.param as number}
              startTime={target.startTime as number}
            />
          ),
        )}
        <TransparentImage
          url={"/img/BG_6_FHD.png"}
          scale={29}
          position={[0, 0, -50]}
        />

        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={1} />
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
    type: "box",
    startTime: index * 5 + 2,
    param: index % 4 + 1,
  };
}) as any;


export const GameCanvas = () => {
  // const [startScene, setStartScene] = useState(false);

  // const handleStartScene = () => {
  //   setStartScene(true);
  // };

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
        <Scene
          targets={targets}
          // {
          //   type: "box",
          //   startTime: 0,
          //   param: 1,
          // },
          // { type: "jump", startTime: 2, param: 1 },
          // {
          //   type: "jump",
          //   startTime: 6,
          //   param: 2,
          // },
          // {
          //   type: "jump",
          //   startTime: 8,
          //   param: 3,
          // },
          // { type: "jump", startTime: 10, param: 3 },
          // { type: "box", startTime: 16, param: 1 },
          // {
          //   type: "box",
          //   startTime: 18,
          //   param: 2,
          // },
          // {
          //   startTime: 3.071428,
          //   corner: 3,
          // },
          // {
          //   startTime: 3.607142,
          //   corner: 2,
          // },
          // {
          //   startTime: 4.142856,
          //   corner: 4,
          // },
          // {
          //   startTime: 4.67857,
          //   corner: 3,
          // },
          // {
          //   startTime: 5.214284,
          //   corner: 4,
          // },
          // {
          //   startTime: 5.749998,
          //   corner: 1,
          // },
          // {
          //   startTime: 6.285712,
          //   corner: 3,
          // },
          // {
          //   startTime: 6.285712,
          //   corner: 4,
          // },
          // {
          //   startTime: 6.821426,
          //   corner: 1,
          // },
          // {
          //   startTime: 6.821426,
          //   corner: 2,
          // },
          // {
          //   startTime: 7.35714,
          //   corner: 3,
          // },
          // {
          //   startTime: 7.35714,
          //   corner: 4,
          // },
          // {
          //   startTime: 7.892854,
          //   corner: 1,
          // },
          // {
          //   startTime: 7.892854,
          //   corner: 2,
          // },
          // {
          //   startTime: 8.428568,
          //   corner: 4,
          // },
          // {
          //   startTime: 8.964282,
          //   corner: 1,
          // },
          // {
          //   startTime: 9.499996,
          //   corner: 2,
          // },
          // {
          //   startTime: 10.03571,
          //   corner: 3,
          // },
          // {
          //   startTime: 10.571424,
          //   corner: 4,
          // },
          // {
          //   startTime: 11.107138,
          //   corner: 3,
          // },
          // {
          //   startTime: 11.642852,
          //   corner: 4,
          // },
        />
      </div>
  );
};
