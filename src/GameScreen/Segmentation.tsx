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
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";

const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation; // or 'BodyPix'
const poseDetectionModel = posedetection.SupportedModels.MoveNet;

const segmenterConfig = {
  runtime: "mediapipe", // or 'tfjs'
  modelType: "general", // or 'landscape'
  locateFile: (path: string, prefix?: string) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${path}`;
  },
};

export type DetectionTarget = {
  name: "left_hand" | "right_hand" | "body";
  x: number;
  y: number;
};

export function Segmentation(props: {
  onTargetMove?: (target: DetectionTarget) => void;
}) {
  const segmenterRef = useRef<any>();
  const poseDetectorRef = useRef<any>();

  useEffect(() => {
    // Not showing vendor prefixes.
    (window.navigator as any).getUserMedia(
      { video: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }, audio: false },
      async function (localMediaStream: any) {
        const video = document.querySelector("video") as HTMLVideoElement;
        video.srcObject = localMediaStream;
        console.log("Got video stream...");

        video.addEventListener("loadedmetadata", () => {
          console.log("Metadata loaded...");
          bodySegmentation
            .createSegmenter(model, segmenterConfig as any)
            .then(async (segmenter) => {
              console.log("Loaded segmenter...");
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

    ctx?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // clear the image first

    ctx?.drawImage(await people?.[0]?.mask?.toCanvasImageSource(), 0, 0);

    // Add the original video back in (in image) , but only overwrite overlapping pixels.
    if (ctx && video) {
      ctx.globalCompositeOperation = "source-in";
      ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
        const scoreThreshold = 0.3;

        if (
          kp2.score > 0.3 &&
          (kp2.name === "left_wrist" || kp2.name === "right_wrist")
        ) {
          drawHandTarget(kp1, kp2, ctx);
        }

        // If score is null, just show the keypoint.
        const score1 = kp1.score != null ? kp1.score : 1;
        const score2 = kp2.score != null ? kp2.score : 1;

        if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
          ctx.stroke();
        }
      });
  };

  const drawHandTarget = (
    kp1: any,
    kp2: any,
    ctx: CanvasRenderingContext2D
  ) => {
    const leftHandVectorX = (kp2.x - kp1.x) * 0.3;
    const leftHandVectorY = (kp2.y - kp1.y) * 0.3;

    const handCenterPointX = kp2.x + leftHandVectorX;
    const handCenterPointY = kp2.y + leftHandVectorY;

    const circle = new Path2D();
    circle.arc(handCenterPointX, handCenterPointY, 30, 0, 2 * Math.PI);
    ctx.fill(circle);
    ctx.stroke(circle);

    const relativePoint = converToRelativePoint(
      handCenterPointX,
      handCenterPointY
    );
    props.onTargetMove?.({
      name: kp2.name,
      x: relativePoint.x,
      y: relativePoint.y,
    });

    if (kp2.name === "left_wrist") {
      writeHandPosition(relativePoint.x, relativePoint.y, kp2.name, ctx);
    }
  };

  const writeHandPosition = (
    handX: number,
    handY: number,
    name: string,
    ctx: CanvasRenderingContext2D
  ) => {
    ctx.fillStyle = "#fff";
    ctx.font = "24px sans-serif";
    const title = `${name}: (${handX}, ${handY})`;
    ctx.fillText(title, 10, 35);
  };

  const converToRelativePoint = (px: number, py: number) => {
    return {
      x: +(1 - px / CANVAS_WIDTH).toFixed(3),
      y: +(py / CANVAS_HEIGHT).toFixed(3),
    };
  };

  return (
    <>
      <video id="video" autoPlay={true}></video>
    </>
  );
}
