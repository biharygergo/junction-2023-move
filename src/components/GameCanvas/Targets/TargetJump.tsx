import { MeshProps } from "@react-three/fiber";
import React from "react";
import {Euler, Vector3} from "three";
import TargetBase, { CheckHitParams } from "./TargetBase";

export interface BoxProps extends MeshProps {
  side: number; // 1 - right, 2 - left, 3 - down
  startTime: number;
}

const TargetJump: React.FC<BoxProps> = ({ side, startTime, ...props }) => {
  const { leftHand, rightHand } = { leftHand: [-1, 1], rightHand: [1, 1] };

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
        return [0, 0,-Math.PI/2];
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
    // const distanceLeftHand = mesh.position.distanceTo(
    //   new Vector3(leftHand[0], leftHand[1], mesh.position.z),
    // );
    // const distanceRightHand = mesh.position.distanceTo(
    //   new Vector3(rightHand[0], rightHand[1], mesh.position.z),
    // );
    //
    // if (mesh.position.z < 5 || mesh.position.z > 13) {
    //   return false;
    // }
    //
    // const distanceThreshold = 1;
    // if (corner === 1 || corner === 3) {
    //   if (distanceRightHand < distanceThreshold) {
    //     return true;
    //   }
    // } else {
    //   if (distanceLeftHand < distanceThreshold) {
    //     return true;
    //   }
    // }

    return false;
  };

  return (
    <TargetBase
      startTime={startTime}
      staticModelSource={"/model/Side_static.gltf"}
      explodedModelSource={"/model/Cube_exploded.gltf"}
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
