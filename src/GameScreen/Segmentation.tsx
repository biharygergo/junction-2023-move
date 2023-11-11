import { useEffect, useRef } from "react";
import "./Segmentation.css";

import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";

import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import * as posedetection from "@tensorflow-models/pose-detection";

import "@mediapipe/selfie_segmentation";
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
  name: "left_wrist" | "right_wrist" | "body";
  position:
    | {
        x: number;
        y: number;
      }
    | undefined;
};

export function Segmentation(props: {
  onTargetMove?: (target: DetectionTarget) => void;
}) {
  const segmenterRef = useRef<any>();
  const poseDetectorRef = useRef<any>();
  const backgroundImageRef = useRef<any>();
  const animationRef = useRef<any>();

  useEffect(() => {
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

              backgroundImageRef.current = new Image();
              backgroundImageRef.current.onload = function () {
                animationLoop();
              };
              backgroundImageRef.current.src = `${process.env.PUBLIC_URL}/img/background_test.png`;
            });
        });
      },
      () => {}
    );

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const animationLoop = () => {
    renderSegmentation();
    animationRef.current = requestAnimationFrame(animationLoop);
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

    // Draw export canvas here...
    const exportCanvas = document.getElementById(
      "canvas-export"
    ) as HTMLCanvasElement;

    const exportContext = exportCanvas.getContext("2d");

    if (ctx && video) {
      clearCanvas(ctx);
      await drawSegmentedPersonOnCanvas(people, ctx, video);
      drawRenderFrame(ctx);
      for (const pose of poses) {
        drawSkeleton(pose.keypoints, ctx, {
          drawBodyTarget: true,
          drawDebugText: true,
          drawHandTarget: true,
        });
      }

      if (exportContext) {
        clearCanvas(exportContext);
        await drawSegmentedPersonOnCanvas(people, exportContext, video);
        drawBackgroundImageBehindContent(exportContext);
      }
    }
  };

  const drawBackgroundImageBehindContent = (ctx: CanvasRenderingContext2D) => {
    ctx.globalCompositeOperation = "destination-over";
    ctx.drawImage(backgroundImageRef.current, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  };

  const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  const drawRenderFrame = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "purple";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.strokeStyle = "white";
  };

  const drawSegmentedPersonOnCanvas = async (
    people: any[],
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement
  ) => {
    ctx.drawImage(await people?.[0]?.mask?.toCanvasImageSource(), 0, 0);

    // Add the original video back in (in image) , but only overwrite overlapping pixels.
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalCompositeOperation = "source-over";
  };

  const drawSkeleton = (
    keypoints: any[],
    ctx: CanvasRenderingContext2D,
    config: {
      drawHandTarget?: boolean;
      drawBodyTarget?: boolean;
      drawDebugText?: boolean;
    }
  ) => {
    const color = "White";

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const scoreThreshold = 0.3;

    posedetection.util
      .getAdjacentPairs(poseDetectionModel)
      .forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];

        if (
          config.drawHandTarget &&
          (kp2.name === "left_wrist" || kp2.name === "right_wrist")
        ) {
          if (kp2.score > 0.3) {
            drawHandTarget(kp1, kp2, ctx, !!config.drawDebugText);
          } else {
            props.onTargetMove?.({
              name: kp2.name,
              position: undefined,
            });
          }
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

    if (config.drawBodyTarget) {
      const leftShoulder = keypoints.find((kp) => kp.name === "left_shoulder");
      const rightHip = keypoints.find((kp) => kp.name === "right_hip");

      if (
        leftShoulder.score > scoreThreshold &&
        rightHip.score > scoreThreshold
      ) {
        const bodyCenterVector = {
          x: (rightHip.x - leftShoulder.x) / 2,
          y: (rightHip.y - leftShoulder.y) / 2,
        };

        const centerPoint = {
          x: leftShoulder.x + bodyCenterVector.x,
          y: leftShoulder.y + bodyCenterVector.y,
        };

        drawBodyTarget(centerPoint.x, centerPoint.y, ctx);
        props.onTargetMove?.({
          name: "body",
          position: convertToRelativePoint(centerPoint.x, centerPoint.y),
        });
      } else {
        props.onTargetMove?.({
          name: "body",
          position: undefined,
        });
      }
    }
  };

  const drawBodyTarget = (
    x: number,
    y: number,
    ctx: CanvasRenderingContext2D
  ) => {
    const circle = new Path2D();
    circle.arc(x, y, 50, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill(circle);
    ctx.stroke(circle);
    ctx.fillStyle = "white";
  };

  const drawHandTarget = (
    kp1: any,
    kp2: any,
    ctx: CanvasRenderingContext2D,
    drawDebugText: boolean
  ) => {
    const leftHandVectorX = (kp2.x - kp1.x) * 0.3;
    const leftHandVectorY = (kp2.y - kp1.y) * 0.3;

    const handCenterPointX = kp2.x + leftHandVectorX;
    const handCenterPointY = kp2.y + leftHandVectorY;

    const circle = new Path2D();
    circle.arc(handCenterPointX, handCenterPointY, 30, 0, 2 * Math.PI);
    ctx.fill(circle);
    ctx.stroke(circle);

    const relativePoint = convertToRelativePoint(
      handCenterPointX,
      handCenterPointY
    );
    props.onTargetMove?.({
      name: kp2.name,
      position: relativePoint,
    });

    if (drawDebugText && kp2.name === "left_wrist") {
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

  const convertToRelativePoint = (px: number, py: number) => {
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
