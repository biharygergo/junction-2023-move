import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { useRef, useState } from "react";
import "./CanvasRecorder.css";
import { uploadDancePost } from "../dances-service";
const ffmpeg = new FFmpeg();

export class Recorder {
  recorderRef?: MediaRecorder;
  downloadLink?: string;

  loaded: boolean = false;
  isRecording: boolean = false;
  isTranscoding: boolean = false;

  loadFfmpeg = async () => {
    if (!this.loaded) {
      const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/umd";
      ffmpeg.on("log", ({ message }: any) => {
        console.log(message);
      });
      // toBlobURL is used to bypass CORS issue, urls with the same
      // domain can be used directly.
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        ),
      });
      this.loaded = true;
    }
  };

  videoReady = async (props: { url: string; blob: any }) => {
    this.isTranscoding = true;
    const blob = await this.transcode(
      new Uint8Array(await props.blob.arrayBuffer())
    );
    await uploadDancePost(
      { userId: "bela", fitnessStats: { score: 10 } },
      blob
    );
    this.isTranscoding = false;
  };

  startRecording = async () => {
    console.log("Loading ffmpeg");
    await this.loadFfmpeg();
    console.log("Loaded ffmpeg");
    const canvas = document.getElementById(
      "canvas-export"
    ) as HTMLCanvasElement;

    var stream = canvas.captureStream(25);

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
    });

    this.recorderRef = mediaRecorder;

    mediaRecorder.start(0);
    console.log("Starting recording...");
    this.isRecording = true;

    const chunks: any[] = [];
    mediaRecorder.ondataavailable = (e: any) => {
      chunks.push(e.data);
      console.log("Got chunk...");
    };

    mediaRecorder.onstop = (event) => {
      var blob = new Blob(chunks, {
        type: "video/webm",
      });
      var url = URL.createObjectURL(blob);
      this.videoReady({ url, blob }); // resolve both blob and url in an object
    };
  };

  endRecording = () => {
    this.recorderRef?.stop();
    this.isRecording = false;
  };

  transcode = async (webcamData: any) => {
    const name = "record.webm";
    console.log("Transcoding...");
    const music = await fetchFile(`${process.env.PUBLIC_URL}/music/rickroll.mp3`);
    await ffmpeg.writeFile('music.mp3', music);
    await ffmpeg.writeFile(name, webcamData);
    const command = `-i ${name} -filter:v fps=25 output-no-music.mp4`;
    const commandWithMusic = `-i output-no-music.mp4 -i music.mp3 -map 0:v -map 1:a -c:v copy -shortest output.mp4`
    await ffmpeg.exec(command.split(" "));
    await ffmpeg.exec(commandWithMusic.split(" "));
    console.log("Transcoding complete...");
    const data = await ffmpeg.readFile("output.mp4");

    const videoBlob = new Blob([(data as any).buffer], { type: "video/mp4" });
    this.downloadLink = URL.createObjectURL(videoBlob);

    return videoBlob;
  };
}
