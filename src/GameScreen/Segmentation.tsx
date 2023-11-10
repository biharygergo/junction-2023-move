import { useEffect, useRef } from "react";
import "./Segmentation.css";

import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import "@mediapipe/selfie_segmentation";


const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation; // or 'BodyPix'
const segmenterConfig = {
  runtime: "mediapipe", // or 'tfjs'
  modelType: "general", // or 'landscape'
  locateFile: (path: string, prefix?: string) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${path}`;
  },
};

export function Segmentation() {
  const segmenterRef = useRef<any>();

  useEffect(() => {
    // Not showing vendor prefixes.
    (window.navigator as any).getUserMedia(
      { video: true, audio: false },
      function (localMediaStream: any) {
        const video = document.querySelector("video") as HTMLVideoElement;
        video.srcObject = localMediaStream;

        console.log("Creating segmenter...");
        bodySegmentation
          .createSegmenter(model, segmenterConfig as any)
          .then(async (segmenter) => {
            segmenterRef.current = segmenter;

            video.addEventListener("loadedmetadata", () => {
              animationLoop();
            });
          });
      },
      () => {}
    );
  }, []);

  const animationLoop = () => {
    try {
      renderSegmentation();
      requestAnimationFrame(animationLoop);
    } catch (e) {
      console.error(e);
    }
  };

  const renderSegmentation = async () => {
    const segmenter = segmenterRef.current as bodySegmentation.BodySegmenter;
    const video = document.getElementById("video") as HTMLVideoElement;
    const people = await segmenter.segmentPeople(video as HTMLVideoElement);

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    const ctx = canvas.getContext("2d");

    ctx?.clearRect(0, 0, 640, 480); // clear the image first

    ctx?.drawImage(await people?.[0]?.mask?.toCanvasImageSource(), 0, 0);

    // Add the original video back in (in image) , but only overwrite overlapping pixels.
    if (ctx && video) {
      ctx.globalCompositeOperation = "source-in";
      ctx.drawImage(video, 0, 0, 640, 480);
      ctx.globalCompositeOperation = "source-over";
    }
  };

  return (
    <>
      <video id="video" autoPlay={true}></video>
      <canvas id="canvas" width={640} height={480}></canvas>
    </>
  );
}
