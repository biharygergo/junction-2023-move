import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  sRGBEncoding,
} from "three";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../../GameScreen/constants";

const CanvasVideoTextureObject: React.FC = () => {
  const { scene } = useThree();
  const meshRef = useRef<Mesh>();
  const textureRef = useRef<CanvasTexture>();

  const scale = 6.1;
  useEffect(() => {
    const canvasElement = document.getElementById(
      "canvas",
    ) as HTMLCanvasElement;
    if (canvasElement) {
      const texture = new CanvasTexture(canvasElement);
      textureRef.current = texture;
      texture.needsUpdate = true;
      texture.encoding = sRGBEncoding;

      const material = new MeshBasicMaterial({
        map: texture,
        transparent: true,
      });
      const geometry = new PlaneGeometry(1, CANVAS_HEIGHT / CANVAS_WIDTH);
      const mesh = new Mesh(geometry, material);
      mesh.position.set(0, 0, 0);
      scene.add(mesh);
      meshRef.current = mesh;
      mesh.scale.set(-scale, scale, scale);
    }

    // Cleanup
    return () => {
      if (meshRef.current) {
        scene.remove(meshRef.current);
        textureRef.current?.dispose();
        // material.dispose();
        // geometry.dispose();
      }
    };
  }, [scene]);

  useFrame(() => {
    // This will update the texture on each frame
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  });

  return null;
};


export default CanvasVideoTextureObject;