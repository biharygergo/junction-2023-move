import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CanvasTexture, MeshBasicMaterial, PlaneGeometry, Mesh } from 'three';

const CanvasVideoTextureObject: React.FC = () => {
  const { scene } = useThree();
  const meshRef = useRef<Mesh>();
  const textureRef = useRef<CanvasTexture>();

  useEffect(() => {
    const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvasElement) {
      const texture = new CanvasTexture(canvasElement);
      textureRef.current = texture;

      const material = new MeshBasicMaterial({ map: texture, transparent: true });
      const geometry = new PlaneGeometry(11, 11);
      const mesh = new Mesh(geometry, material);
      mesh.position.set(0, 0, 0);
      scene.add(mesh);
      meshRef.current = mesh;
      mesh.scale.set(-1, 1, 1)
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