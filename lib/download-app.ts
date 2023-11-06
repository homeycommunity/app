import got from "got-cjs";
import { hcsServer } from "./constants";

export async function downloadApp(id: string, version: string, token: string) {
  console.log("downloadApp", id, version);
  const fileUrl = `${hcsServer}/api/hcs/apps/${id}/download/${version}`;
  const download = await got
    .get(fileUrl, {
      headers: {
        Authorization: "Bearer " + token!,
      },
    })
    .buffer();
  return download;
}
