import {
  MeshProps,
  ObjectMap,
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useHandPositions } from "../../GameProvider";
import { AnimationMixer, Group, Mesh, Object3DEventMap, Vector3 } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useGLTF } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

export interface CheckHitParams {
  position: { x: number; y: number };
  mesh: Mesh;
}
export interface TargetBaseProps extends MeshProps {
  startTime: number;
  staticModelSource: string;
  explodedModelSource: string;
  targetPosition: Vector3;
  speed: number;
  checkHit: (params: CheckHitParams) => boolean;
  recolor?: (params: any, z: number) => any
}

export const TargetBase: React.FC<TargetBaseProps> = ({
  startTime,
  targetPosition,
  staticModelSource,
  explodedModelSource,
  speed = 0.1,
  checkHit,
  position = [0, 0, -15],
    recolor,
  ...props
}) => {
  // const { rightHand, leftHand } = useHandPositions();
  const { camera, size } = useThree();
  const staticModelTemp = useLoader(GLTFLoader, staticModelSource);
  const staticModel = useMemo(
    () => {
      const temp = staticModelTemp.scene.clone();
      return temp
      //
    },
    [staticModelTemp.scene],
  );

  // console.log({position})
  // console.log({size})

  // console.log(staticModel)

  const explodedModelTemp = useLoader(GLTFLoader, explodedModelSource);
  // const explodedModelFBX = useLoader(FBXLoader, "/model/Cube_Break_1.fbx");
  const explodedModel = useMemo(() => {
    const tempModel = explodedModelTemp.scene.clone();
    tempModel.animations = explodedModelTemp.animations;

    return tempModel;
  }, [explodedModelTemp.scene, explodedModelTemp.animations]);

  const [hit, setHit] = useState(false); // New hit state

  const [visible, setVisible] = useState(false);
  const [hovered, hover] = useState(false);

  const ref = useRef<Mesh>(null);
  const mixer = useRef<AnimationMixer | null>(null); // For GLTF animations

  const getScreenPosition = (mesh: Mesh) => {
    const vector = new Vector3();

    // Get the mesh position in world space
    mesh.getWorldPosition(vector);

    // Project the 3D position to NDC space (range -1 to 1)
    vector.project(camera);

    // console.log("projected",corner, vector)

    // Convert the normalized device coordinates to 2D screen space
    // vector.x = Math.round((0.5 + vector.x / 2) * size.width);
    // vector.y = Math.round((0.5 - vector.y / 2) * size.height);

    vector.x = (vector.x + 1) / 2;
    vector.y = (vector.y + 1) / 2;

    return { x: vector.x, y: vector.y };
  };

  useEffect(() => {
    if (hit && explodedModel.animations.length > 0 && ref.current) {
      const newMixer = new AnimationMixer(explodedModel);
      mixer.current = newMixer;
      const action = newMixer.clipAction(explodedModel.animations[0]);
      action.play();
    }
  }, [hit, explodedModel.animations, ref]);

  useFrame(({ clock }, delta) => {
    const mesh = ref.current;

    if (mesh) {
      const currentTime = clock.getElapsedTime();

      if (currentTime > startTime) {
        setVisible(true);
        // ref.current.rotation.x += delta * 0.5; TODO: rotating
        // ref.current.rotation.y += delta * 0.5;

        const elapsedTime = currentTime - startTime;
        const direction = new Vector3()
          .subVectors(targetPosition, mesh.position)
          .normalize();

        const distanceToMoveThisFrame = speed * elapsedTime;
        mesh.position.addScaledVector(direction, distanceToMoveThisFrame);

        if (
          mesh.position.distanceTo(targetPosition) < distanceToMoveThisFrame
        ) {
          mesh.position.copy(targetPosition);
        }
        setHit(checkHit({ position: getScreenPosition(mesh), mesh }));

        // if (recolor) {
        //   recolor(staticModel, mesh.position.z);
        // }


        if (mixer.current) {
          mixer.current.update(delta);
        }
      }
    }
  });

  const handleHit = () => {
    setHit(true);
  };

  return (
    <mesh
      ref={ref}
      {...props}
      position={position}
      // scale={0.05} // TODO: 0.05
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      onClick={handleHit}
      // rotation={rotation}
      visible={visible}
    >
      <primitive object={hit ? explodedModel : staticModel} />
    </mesh>
  );
};

export default TargetBase;
