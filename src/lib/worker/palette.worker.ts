// Reason: Offload heavy palette generation into a Web Worker to keep UI 60fps.
/// <reference lib="webworker" />
import { generateScale } from "@/lib/color/scale";

export interface WorkerRequest {
  baseHex: string;
  steps: number;
  shift?: number;
}

export interface WorkerResponse {
  colors: string[];
}

self.addEventListener("message", (ev: MessageEvent<WorkerRequest>) => {
  const { baseHex, steps, shift = 0 } = ev.data;
  const colors = generateScale(baseHex, steps, shift);
  const resp: WorkerResponse = { colors };
  (self as unknown as Worker).postMessage(resp);
});