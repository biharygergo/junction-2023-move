import { useEffect, useRef, useState } from "react";
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
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
const ffmpeg = new FFmpeg();

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
  const [downloadLink, setDownloadLink] = useState<string>("");
  const segmenterRef = useRef<any>();
  const poseDetectorRef = useRef<any>();
  const recorderRef = useRef<MediaRecorder>();
  const backgroundImageRef = useRef<any>();

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
      ctx.strokeStyle = "purple";
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.strokeStyle = "white";
      renderPoses(poses);

      // Draw export canvas here...
      const secondCanvas = document.getElementById(
        "canvas-export"
      ) as HTMLCanvasElement;

      const ctx2 = secondCanvas.getContext("2d");
      ctx2?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // clear the image first
      ctx2?.drawImage(
        backgroundImageRef.current,
        0,
        0,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );
      ctx2?.drawImage(ctx.canvas, 0, 0);
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

    const scoreThreshold = 0.3;

    posedetection.util
      .getAdjacentPairs(poseDetectionModel)
      .forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];

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

    props.onTargetMove?.({
      name: "body",
      ...convertToRelativePoint(x, y),
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

    const relativePoint = convertToRelativePoint(
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

  const convertToRelativePoint = (px: number, py: number) => {
    return {
      x: +(1 - px / CANVAS_WIDTH).toFixed(3),
      y: +(py / CANVAS_HEIGHT).toFixed(3),
    };
  };

  const loadFfmpeg = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/umd";
    ffmpeg.on("log", ({ message }: any) => {
      console.log(message);
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });
  };

  const startRecording = async () => {
    console.log("Loading ffmpeg");
    await loadFfmpeg();
    console.log("Loaded ffmpeg");
    const canvas = document.getElementById("canvas-export") as HTMLCanvasElement;

    var stream = canvas.captureStream(25);

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
    });

    recorderRef.current = mediaRecorder;

    mediaRecorder.start(0);
    console.log("Starting recording...");

    const chunks: any[] = [];
    mediaRecorder.ondataavailable = function (e: any) {
      chunks.push(e.data);
      console.log("Got chunk...");
    };

    mediaRecorder.onstop = function (event) {
      var blob = new Blob(chunks, {
        type: "video/webm",
      });
      var url = URL.createObjectURL(blob);
      videoReady({ url, blob }); // resolve both blob and url in an object
    };
  };
  const endRecording = () => {
    recorderRef.current?.stop();
  };

  const videoReady = async (props: { url: string; blob: any }) => {
    await transcode(new Uint8Array(await props.blob.arrayBuffer()));
  };

  const transcode = async (webcamData: any) => {
    const message = document.getElementById("message");
    const name = "record.webm";
    console.log("Transcoding...");
    await ffmpeg.writeFile(name, webcamData);
    const command = `-i ${name} -filter:v fps=25 output.mp4`;
    await ffmpeg.exec(command.split(" "));
    console.log("Transcoding complete...");
    const data = await ffmpeg.readFile("output.mp4");

    setDownloadLink(
      URL.createObjectURL(
        new Blob([(data as any).buffer], { type: "video/mp4" })
      )
    );
  };
  return (
    <>
      <video id="video" autoPlay={true}></video>
      <div className="controls">
        <button onClick={() => startRecording()}>Record</button>
        <button onClick={() => endRecording()}>Stop recording</button>
        {downloadLink && (
          <a href={downloadLink} download>
            Download video
          </a>
        )}
      </div>
    </>
  );
}
