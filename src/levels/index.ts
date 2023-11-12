import { level1 } from "./level-1";
import { level2 } from "./level-2";
import { TargetProps } from "../components/GameCanvas";
import { level4 } from "./level-4";
import { level5 } from "./level-5";
import { level3 } from "./level-3";

export const levels: Level[] = [level1, level2, level3, level4, level5];

export const getLevelById = (id: string): Level | undefined =>
  levels.find((level) => level.id === id);

export interface Level {
  id: string;
  name: string;
  background: string;
  playingMusic: string;
  uploadMusic: string;
  recordingStart: number;
  recordingEnd: number;
  targets: TargetProps[];
}
