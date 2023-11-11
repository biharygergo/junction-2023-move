import { MeshProps, ObjectMap, useFrame, useLoader } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useHandPositions } from "../GameProvider";
import { AnimationMixer, Mesh, Vector3 } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useGLTF } from "@react-three/drei";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";

/*
function OldBox(props: any) {
  const state = useThree();
  const ref = useRef<Mesh>(null!);
  console.log(ref.current, state);

  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  useFrame((state, delta) => {
    // ref.current.rotation.x += delta * 1.3;
    ref.current.position.z += delta * 5;
  });

  return (
    <mesh
      {...props}
      ref={ref}
      position={[0.4, 5, -5]}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}
 */

export interface BoxProps extends MeshProps {
  corner: number;
  startTime: number;
}

const TargetBox: React.FC<BoxProps> = ({ corner, startTime, ...props }) => {
  // const { rightHand, leftHand } = useHandPositions();

  const staticModel = useLoader(GLTFLoader, "/model/Cube_2.gltf");
  const staticModelClone = useMemo(
    () => staticModel.scene.clone(),
    [staticModel.scene],
  );

  const explodedModel = useLoader(GLTFLoader, "/model/Cube_Movement_4.gltf");
  // const explodedModelFBX = useLoader(FBXLoader, "/model/Cube_Break_1.fbx");
  const explodedModelClone = useMemo(() => {
    const tempModel = explodedModel.scene.clone();
    tempModel.animations = explodedModel.animations;

    return tempModel;
  }, [explodedModel.scene, explodedModel.animations]);


  const [hit, setHit] = useState(false); // New hit state

  const [visible, setVisible] = useState(false);
  const [hovered, hover] = useState(false);

  const ref = useRef<Mesh>(null);
  const mixer = useRef<AnimationMixer | null>(null); // For GLTF animations

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

  // Use a ref to keep track of the mesh

  useEffect(() => {
    console.log(`Box ${corner} mounted with startTime ${startTime}`);
    // Set initial positions or other necessary states here
  }, [corner, startTime]);

  useEffect(() => {
    if (hit && explodedModelClone.animations.length > 0 && ref.current) {
      const newMixer = new AnimationMixer(explodedModelClone);
      mixer.current = newMixer;
      const action = newMixer.clipAction(explodedModelClone.animations[0]);
      action.play();
    }
  }, [hit, explodedModelClone.animations, ref]);

  useFrame(({ clock }, delta) => {
    const mesh = ref.current;

    // console.log("mesh: ", mesh)
    if (mesh) {
      // Check if the current time is past the start time
      const currentTime = clock.getElapsedTime();

      if (currentTime > startTime) {
        // console.log(`Moving box ${corner}`)
        setVisible(true);
        // TODO:
        ref.current.rotation.x += delta * 0.5;
        ref.current.rotation.y += delta * 0.5;

        const elapsedTime = currentTime - startTime;
        const direction = new Vector3()
          .subVectors(targetPosition, mesh.position)
          .normalize();

        // Set a constant speed
        const speed = 0.1; // units per second

        // Calculate the distance to move this frame
        const distanceToMoveThisFrame = speed * elapsedTime;

        // Move the box towards the target position by the calculated distance
        mesh.position.addScaledVector(direction, distanceToMoveThisFrame);

        // If the box is close enough to the target position, snap it to the target
        if (
          mesh.position.distanceTo(targetPosition) < distanceToMoveThisFrame
        ) {
          mesh.position.copy(targetPosition);
        }

        if (mixer.current) {
          mixer.current.update(delta);
        }

      }

      // if (hit && explodedModelClone.animations.length > 0) {
      //   if (!mixer.current) {
      //     console.log("playing anim");
      //     mixer.current = new AnimationMixer(explodedModel.scene);
      //     const action = mixer.current.clipAction(explodedModel.animations[0]);
      //     action.play();
      //   }
      //   mixer.current?.update(delta);
      // }
    }
  });

  const handleHit = () => {
    // Trigger the hit state and start the exploded animation
    setHit(true);
  };

  console.log(explodedModelClone, hit)

  return (
    <mesh
      ref={ref}
      {...props}
      position={[0, 0, -10]}
      scale={0.05} // TODO: 0.05
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      onClick={handleHit}
    >
      <primitive
        object={hit? explodedModelClone:staticModelClone}

        // visible={visible} TODO:
      />
    </mesh>
  );
};

export default TargetBox;
