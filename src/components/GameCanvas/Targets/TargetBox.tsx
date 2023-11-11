import { MeshProps } from "@react-three/fiber";
import React from "react";
import { Vector3 } from "three";
import TargetBase, { CheckHitParams } from "./TargetBase";

export interface BoxProps extends MeshProps {
  corner: number;
  startTime: number;
}

const TargetBox: React.FC<BoxProps> = ({ corner, startTime, ...props }) => {
  const { leftHand, rightHand } = { leftHand: [-1, 1], rightHand: [1, 1] };

  const hitArea = [5, 13];

  const targetPosition = React.useMemo(() => {
    switch (corner) {
      case 1:
        return new Vector3(1.75, 1.9, 15);
      case 2:
        return new Vector3(-1.75, 1.9, 15);
      case 3:
        return new Vector3(1.75, 0, 15);
      case 4:
        return new Vector3(-1.75, 0, 15);
      default:
        return new Vector3(0, 0, 0);
    }
  }, [corner]);

  const checkHit = ({ mesh, position }: CheckHitParams) => {
    const distanceLeftHand = mesh.position.distanceTo(
      new Vector3(leftHand[0], leftHand[1], mesh.position.z),
    );
    const distanceRightHand = mesh.position.distanceTo(
      new Vector3(rightHand[0], rightHand[1], mesh.position.z),
    );

    if (mesh.position.z < hitArea[0] || mesh.position.z > hitArea[1]) {
      return false;
    }

    const distanceThreshold = 1;
    if (corner === 1 || corner === 3) {
      if (distanceRightHand < distanceThreshold) {
        return true;
      }
    } else {
      if (distanceLeftHand < distanceThreshold) {
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
      speed={0.1}
      checkHit={checkHit}
      scale={0.05}
      // recolor={recolor}
    />
  );
};

export default TargetBox;
