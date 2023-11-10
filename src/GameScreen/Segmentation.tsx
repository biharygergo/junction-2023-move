import { useEffect, useRef, useState } from "react";
import "./Segmentation.css";

import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import "@mediapipe/selfie_segmentation";
import { SelfieSegmentationConfig } from "@mediapipe/selfie_segmentation";

// Uncomment the line below if you want to use TensorFlow.js runtime.
/* // import '@tensorflow/tfjs-converter';

// Uncomment the line below if you want to use MediaPipe runtime.
 */

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
      { video: true, audio: false,  },
      function (localMediaStream: any) {
        const video = document.querySelector("video") as HTMLVideoElement;
        video.srcObject = localMediaStream;

        // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
        // See crbug.com/110938.
        video.onloadedmetadata = function (e: any) {
          // Ready to go. Do some stuff.
        };

        console.log('creating segmenter')
        bodySegmentation
          .createSegmenter(model, segmenterConfig as any)
          .then(async (segmenter) => {
            segmenterRef.current = segmenter;
            animationLoop();
          });
      },
      () => {}
    );
  }, []);

  const animationLoop = () => {
    renderSegmentation();
    requestAnimationFrame(animationLoop);
  }

  const renderSegmentation = async () => {
    const segmenter = segmenterRef.current;
    const video = document.getElementById("video") as HTMLVideoElement;
    let people = await segmenter.segmentPeople(video as HTMLVideoElement);

    const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
    const backgroundColor = { r: 0, g: 0, b: 0, a: 255 };
    const drawContour = true;
    const foregroundThreshold = 0.6;

    const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
      people,
      foregroundColor,
      backgroundColor,
      drawContour,
      foregroundThreshold
    );

    const opacity = 1;
    const maskBlurAmount = 3; // Number of pixels to blur by.
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
/* 
    const context = canvas.getContext('2d');
    context?.clearRect(0, 0, 350, 700);
    canvas.getContext('2d')?.putImageData(backgroundDarkeningMask, 0, 0);
    console.log("got people", people);
    console.log("drawing mask..."); */
    await bodySegmentation.drawMask(
      canvas,
      video,
      backgroundDarkeningMask,
      opacity,
      maskBlurAmount
    );
  };

  return (
    <>
      <video id="video" autoPlay={true}></video>
      <canvas id="canvas"></canvas>
    </>
  );
}
