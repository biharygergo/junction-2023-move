import { MeshProps } from "@react-three/fiber";
import React, { useState } from "react";
import { Vector3 } from "three";
import TargetBase, { CheckHitParams } from "./TargetBase";
import { useGameState } from "../../GameProvider";

export interface BoxProps extends MeshProps {
  corner: number;
  startTime: number;
}

const TargetBox: React.FC<BoxProps> = ({ corner, startTime, ...props }) => {
  // const { leftHand, rightHand } = { leftHand: [-1, 1], rightHand: [1, 1] };
  const {
    bodyPositions: { leftHand, rightHand },
  } = useGameState();
  const [wasHit, setWasHit] = useState(false);

  const hitArea = [5, 13];

  const targetPosition = React.useMemo(() => {
    switch (corner) {
      case 1:
        return new Vector3(2, 1.9, 15);
      case 2:
        return new Vector3(-2, 1.9, 15);
      case 3:
        return new Vector3(2, 0, 15);
      case 4:
        return new Vector3(-2, 0, 15);
      default:
        return new Vector3(0, 0, 0);
    }
  }, [corner]);

  const checkHit = ({ mesh, position }: CheckHitParams) => {
    if (wasHit) return true;

    if (mesh.position.z < hitArea[0] || mesh.position.z > hitArea[1]) {
      return false;
    }

    const distanceThreshold = 2;

    if (leftHand !== undefined && (corner === 2 || corner === 4)) {
      const distanceLeftHand = mesh.position.distanceTo(
        new Vector3(leftHand.x, leftHand.y, mesh.position.z),
      );

      console.log({ corner, distanceLeftHand, leftHand, mesh: mesh.position });
      if (distanceLeftHand < distanceThreshold) {
        console.log("HIT LEFT");
        setWasHit(true);
        return true;
      }
    }

    if (rightHand !== undefined && (corner === 1 || corner === 3)) {
      const distanceRightHand = mesh.position.distanceTo(
        new Vector3(rightHand.x, rightHand.y, mesh.position.z),
      );

      console.log({ corner, distanceRightHand, rightHand,mesh: mesh.position });

      if (distanceRightHand < distanceThreshold) {
        console.log("HIT RIGHT");
        setWasHit(true);
        return true;
      }
    }
    return false;
  };

  // const recolor = (temp: any, z: number) => {
  //   if (z > hitArea[0]) {
  //     temp.children[0].children[1].material.color.r = 1;
  //   }
  // };

  return (
    <TargetBase
      startTime={startTime}
      staticModelSource={"/model/Cube_static.gltf"}
      explodedModelSource={"/model/Cube_exploded.gltf"}
      targetPosition={targetPosition}
      speed={0.01}
      checkHit={checkHit}
      scale={0.08}
      // recolor={recolor}
    />
  );
};

export default TargetBox;
