import { useGLTF } from "@react-three/drei";
import {useEffect, useMemo, useRef, useState} from "react";
import {MeshProps, useFrame, useLoader} from "@react-three/fiber";
import { AnimationMixer, LoopOnce, Mesh } from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

interface Props extends MeshProps {
  url: string;
  startTime?: number;
}
export const ModelWithAnimation = ({ url, startTime = 0, ...rest }: Props) => {

  const staticModelTemp = useLoader(GLTFLoader, url);
  const model = useMemo(() => {
    const tempModel = staticModelTemp.scene.clone();
    tempModel.animations = staticModelTemp.animations;
    return tempModel
  }, [staticModelTemp.scene, staticModelTemp.animations]);


  // const {  animations } = model;
  // const { ref, mixer } = useAnimations(animations);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [firstRenderTime, setFirstRenderTime] = useState<number | null>(null);


  const [visible, setVisible] = useState(false);
  // const ref = useRef<Mesh>(null);
  // const mixer = useRef<AnimationMixer | null>(null); // For GLTF animations
  const mixer = useRef<AnimationMixer | null>(null);
  const ref = useRef<Mesh>(null);

  useEffect(() => {
    if (visible && model.animations.length > 0) {
      mixer.current = new AnimationMixer(model);
      const action = mixer.current.clipAction(model.animations[0]);
      action.clampWhenFinished = true;
      action.setLoop(LoopOnce, 1);
      action.play();

      mixer.current.addEventListener("finished", () => {
        setAnimationFinished(true);
      });
    }

    // Cleanup function to remove event listener
    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
      }
    };
  }, [model.animations, model, visible]);

  useFrame(({ clock }, delta) => {
    if (firstRenderTime === null) {
      setFirstRenderTime(clock.getElapsedTime())
    }

    const mesh = ref.current;

    if (mixer.current) {
      mixer.current.update(delta);
    }

    if (mesh) {
      if (firstRenderTime !==  null ) {
        const currentTime = clock.getElapsedTime() - (firstRenderTime || 0);
        if (currentTime > startTime) {
          setVisible(true);
        }
      }
    }
  });

  if (animationFinished) return null;

  return (
    <mesh ref={ref} {...rest} visible={visible}>
      <primitive object={model} />
    </mesh>
  );
};

export default ModelWithAnimation;
