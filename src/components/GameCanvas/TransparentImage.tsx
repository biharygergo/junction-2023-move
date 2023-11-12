import React, {useEffect, useState} from "react";
import {useLoader} from "@react-three/fiber";
import {LinearFilter, PlaneGeometry, TextureLoader} from "three";


const TransparentImage: React.FC<{ url: string, position: any, scale: number, opacity?: number }> = ({ url, position, scale, opacity = 1 }) => {
    const texture = useLoader(TextureLoader, url);
    const [plane, setPlane] = useState<PlaneGeometry>();

    useEffect(() => {
        if (texture.image) {
            // Update the texture settings if necessary
            texture.minFilter = LinearFilter;
            texture.magFilter = LinearFilter;
            texture.needsUpdate = true;

            // Use the image dimensions to set the plane size
            const { width, height } = texture.image;
            const aspectRatio = width / height;
            setPlane(new PlaneGeometry(aspectRatio, 1));
        }
    }, [texture]);

    if (!plane) {
        return null;
    }

    return (
        <mesh geometry={plane} position={position} scale={scale}>
            <meshBasicMaterial attach="material" map={texture} transparent={true} opacity={opacity} />
        </mesh>
    );
};


export default TransparentImage;