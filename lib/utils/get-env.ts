import tarGzGlob from "targz-glob";
import { bufferToStream } from "./buffer-to-stream";

export async function getEnv(buffer: Buffer) {
  const env = await tarGzGlob(bufferToStream(buffer), "env.json");
  return env.get("env.json")!;
}
