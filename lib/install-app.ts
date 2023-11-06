import FormData from "form-data";
import fetch from "node-fetch";
import { getEnv } from "./utils/get-env";
export async function installApp(
  id: string,
  version: string,
  stream: Buffer,
  bearerToken: string,
  ip: string,
) {
  const env = await getEnv(stream)!;
  const form = new FormData();
  form.append("app", stream, {
    filename: id + "-" + version + ".tar.gz",
    contentType: "octet/stream",
  });
  form.append("debug", "false");
  if (env) {
    form.append("env", env);
  } else {
    form.append("env", "{}");
  }
  form.append("purgeSettings", "false");

  const postResponse = await fetch(`http://${ip}/api/manager/devkit`, {
    method: "POST",
    body: form,
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  })
    .then((
      res: any,
    ) => res.json()).catch((e: any) => console.log(e));

  return postResponse;
}
