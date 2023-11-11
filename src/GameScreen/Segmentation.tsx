import { useEffect, useRef } from "react";
import "./Segmentation.css";

import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";

import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import * as posedetection from "@tensorflow-models/pose-detection";

import "@mediapipe/selfie_segmentation";
import {
  Keypoint,
  Pose,
} from "@tensorflow-models/body-segmentation/dist/body_pix/impl/types";

const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation; // or 'BodyPix'
const poseDetectionModel = posedetection.SupportedModels.MoveNet;

const segmenterConfig = {
  runtime: "mediapipe", // or 'tfjs'
  modelType: "general", // or 'landscape'
  locateFile: (path: string, prefix?: string) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${path}`;
  },
};

export function Segmentation() {
  const segmenterRef = useRef<any>();
  const poseDetectorRef = useRef<any>();

  useEffect(() => {
    // Not showing vendor prefixes.
    (window.navigator as any).getUserMedia(
      { video: true, audio: false },
      async function (localMediaStream: any) {
        const video = document.querySelector("video") as HTMLVideoElement;
        video.srcObject = localMediaStream;
        console.log("Got video stream...");

        video.addEventListener("loadedmetadata", () => {
          console.log("Metadata loaded...");
          bodySegmentation
            .createSegmenter(model, segmenterConfig as any)
            .then(async (segmenter) => {
              await tf.setBackend("webgl");

              segmenterRef.current = segmenter;
              const poseDetector = await posedetection.createDetector(
                poseDetectionModel,
                {
                  modelType:
                    posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                }
              );
              poseDetectorRef.current = poseDetector;
              animationLoop();
            });
        });
      },
      () => {}
    );
  }, []);

  const animationLoop = () => {
    renderSegmentation();
    requestAnimationFrame(animationLoop);
  };

  const renderSegmentation = async () => {
    const segmenter = segmenterRef.current as bodySegmentation.BodySegmenter;
    const video = document.getElementById("video") as HTMLVideoElement;
    const people = await segmenter.segmentPeople(video as HTMLVideoElement);
    const poses = await poseDetectorRef.current.estimatePoses(video, {
      maxPoses: 1,
    });

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    ctx?.clearRect(0, 0, 640, 480); // clear the image first

    ctx?.drawImage(await people?.[0]?.mask?.toCanvasImageSource(), 0, 0);

    // Add the original video back in (in image) , but only overwrite overlapping pixels.
    if (ctx && video) {
      ctx.globalCompositeOperation = "source-in";
      ctx.drawImage(video, 0, 0, 640, 480);
      ctx.globalCompositeOperation = "source-over";
      renderPoses(poses);
    }
  };

  const renderPoses = (poses: Pose[]) => {
    for (const pose of poses) {
      drawSkeleton(pose.keypoints);
    }
  };

  const drawSkeleton = (keypoints: any[]) => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    // Each poseId is mapped to a color in the color palette.
    const color = "White";

    if (!ctx) return;

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    posedetection.util
      .getAdjacentPairs(poseDetectionModel)
      .forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];
        // If score is null, just show the keypoint.
        const score1 = kp1.score != null ? kp1.score : 1;
        const score2 = kp2.score != null ? kp2.score : 1;
        const scoreThreshold = 0.3;

        if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
          ctx.stroke();
        }
      });
  };

  return (
    <>
      <video id="video" autoPlay={true}></video>
      <canvas id="canvas" width={640} height={480}></canvas>
    </>
  );
}
