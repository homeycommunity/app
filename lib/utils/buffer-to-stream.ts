import { Readable } from "stream";

export function bufferToStream(buffer: ArrayBuffer) {
  const stream = Readable.from(Buffer.from(buffer));

  return stream;
}
