import { MeshProps } from "@react-three/fiber";
import React, { useState } from "react";
import { Euler, Vector3 } from "three";
import TargetBase, { CheckHitParams } from "./TargetBase";
import { useGameState } from "../../GameProvider";

export interface BoxProps extends MeshProps {
  side: number; // 1 - right, 2 - left, 3 - down
  startTime: number;
}

const TargetJump: React.FC<BoxProps> = ({ side, startTime }) => {
  const [wasHit, setWasHit] = useState(false);
  const hitArea = [5, 20];
  const {
    addHit,
    addMiss,
    bodyPositions: { body },
  } = useGameState();

  const targetPosition = React.useMemo(() => {
    switch (side) {
      case 1:
        return new Vector3(1.2, 0, 35);
      case 2:
        return new Vector3(-1.2, 0, 35);
      case 3:
        return new Vector3(0, 1, 35);
      default:
        return new Vector3(0, 0, 0);
    }
  }, [side]);

  const startPosition = React.useMemo(() => {
    switch (side) {
      case 1:
        return [1, 0, -50];
      case 2:
        return [-1, 0, -50];
      case 3:
        return [0, 1.5, -50];
      default:
        return [0, 1, -50];
    }
  }, [side]) as any;

  const rotation = React.useMemo(() => {
    switch (side) {
      case 1:
        return [0, Math.PI, 0];
      case 2:
        return [0, 0, 0];
      case 3:
        return [0, 0, -Math.PI / 2];
      default:
        return [0, 0, 0];
    }
  }, [side]) as unknown as Euler;

  const scale = React.useMemo(() => {
    switch (side) {
      case 3:
        return [0.1, 0.05, 0.1];
      default:
        return [0.2, 0.1, 0.2];
    }
  }, [side]) as any;

  const checkHit = ({ mesh, position }: CheckHitParams) => {
    // console.log(position)
    if (wasHit) return true;

    if (mesh.position.z < hitArea[0] || mesh.position.z > hitArea[1]) {
      return false;
    }

    // const distanceThresholdDown = 0.9;
    // const distanceThresholdUp = 1.8;
    const distanceThreshold = side === 3 ? 0.4 : 0.4;

    if (body !== undefined) {
      const distanceToBody = new Vector3(position.x, position.y, 0).distanceTo(
        new Vector3(body.x, body.y, 0),
      );

      console.log({ side, distanceToBody, position, body });

      if (distanceToBody < distanceThreshold) {
        console.log("HIT BODY");
        setWasHit(true);
        addMiss();
        return true;
      }
    }

    if (position.x < 0 || position.x > 1 || position.y < 0 || position.y > 1) {
      console.log("Avoided wall " + side.toString());
      addHit();

    }
    return false;
  };

  return (
    <TargetBase
      startTime={startTime}
      staticModelSource={"/model/Side_static.gltf"}
      explodedModelSource={"/model/Side_active.gltf"}
      targetPosition={targetPosition}
      speed={0.1}
      checkHit={checkHit}
      rotation={rotation}
      scale={scale}
      position={startPosition}
    />
  );
};

export default TargetJump;
