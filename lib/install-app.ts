import { getEnv } from './utils/get-env';
export async function installApp(
  id: string,
  version: string,
  stream: ArrayBuffer,
  bearerToken: string,
  ip: string
) {
  const env = await getEnv(stream);
  const form = new FormData();
  form.append(
    'app',
    new Blob([Buffer.from(stream)]),
    id + '-' + version + '.tar.gz'
  );
  form.append('debug', 'false');
  if (env) {
    form.append('env', env);
  } else {
    form.append('env', '{}');
  }
  form.append('purgeSettings', 'false');
  const postResponse = await fetch(`http://${ip}/api/manager/devkit`, {
    method: 'POST',
    body: form,
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  })
    .then((e) => {
      return e.json();
    })
    .catch((err) => {
      console.log(err);
    });

  console.log(postResponse);

  return postResponse;
}

export async function updateApp(
  app: any,
  id: string,
  bearerToken: string,
  ip: string
) {
  const res = await fetch(`http://${ip}/api/manager/apps/app/${id}`, {
    method: 'PUT',
    body: JSON.stringify(app),
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  })
    .then((e) => {
      return e.json();
    })
    .catch((err) => {
      console.log(err);
    });

  return res;
}
