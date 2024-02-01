import tarGzGlob from 'targz-glob';
import { bufferToStream } from './buffer-to-stream';

export async function getEnv(buffer: ArrayBuffer) {
  const env = await tarGzGlob(bufferToStream(buffer), [
    './env.json',
    'env.json',
  ]);

  return env.get('env.json')! || env.get('./env.json')!;
}
