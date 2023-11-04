import { AthomCloudAPI, HomeyAPI } from "athom-api";
import Cron from "croner";
import { connect, Emitter, EmitterMessage } from "emitter-io";
import FormData from "form-data";
import got from "got-cjs";
import Homey from "homey";
import { OAuth2App, OAuth2Token, OAuth2Util } from "homey-oauth2app";
import fetch from "node-fetch";
import { generators, Issuer } from "openid-client";
import querystring from "querystring";
import { Readable } from "stream";
import { tarGzGlob } from "targz-glob";
import { AthomStorageAdapterSettings } from "./AthomStorageAdapterSettings";
import { HCSOAuthClient } from "./lib/HCSOAuthClient";

class StoreApp extends OAuth2App {
  private hcsServer = "https://homeycommunity.space";
  private _api?: AthomCloudAPI;
  private _cloudUser?: AthomCloudAPI.User;
  private _cloudHomey?: AthomCloudAPI.Homey;
  private homeyId?: string;
  private _cloudHomeyApi?: HomeyAPI;
  private _homeyApi?: HomeyAPI;
  private oidClient: any;
  private token?: string;
  private eventKey?: string;
  private emitter?: Emitter;
  async onInit() {
    this.emitter = connect({
      host: "wss://events.homeycommunity.space",
      port: 443,
      secure: true,
      keepalive: 1000,
    })
      .on("connect", () => {
        console.log("connected to event listener");
      })
      .on("disconnect", () => {
        console.log("disconnected from event listener");
      })
      .on("error", (error) => {
        console.log("error from eventlistener", error);
      });

    await super.onInit();
    await this.refreshToken();
    await this.getHomeyToken();
    Cron("*/4 * * * *", async () => {
      await this.refreshToken();
      await this.getHomeyToken();
    });
  }
  async onOAuth2Init() {
    const hcsIssuer = await Issuer.discover(
      "https://auth.homeycommunity.space/application/o/hcs-app",
    );

    const client = new hcsIssuer.Client({
      client_id: Homey.env.CLIENT_ID,
      client_secret: Homey.env.CLIENT_SECRET,
      redirect_uris: ["https://callback.athom.com/oauth2/callback"],
      response_types: ["code"],
      // id_token_signed_response_alg (default "RS256")
      // token_endpoint_auth_method (default "client_secret_basic")
    });

    // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
    // it should be httpOnly (not readable by javascript) and encrypted.

    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);

    const authorizationUrl = client.authorizationUrl({
      scope: "openid email profile",
      code_challenge,
      code_challenge_method: "S256",
    });

    this.setOAuth2Config({
      client: HCSOAuthClient,
      authorizationUrl,
      tokenUrl: "https://auth.homeycommunity.space/application/o/token/",
      redirectUrl: "https://callback.athom.com/oauth2/callback",
      clientId: Homey.env.CLIENT_ID,
      clientSecret: Homey.env.CLIENT_SECRET,
    });

    this.oidClient = client;
  }
  async isAuthenticated() {
    try {
      const session = await this._getSession();
      this.log(`isAuthenticated() -> ${!!session}`);
      return !!session;
    } catch (err) {
      this.error("isAuthenticated() -> could not get current session:", err);
      throw new Error("Could not get current OAuth2 session");
    }
  }

  async login() {
    try {
      this.log("login()");

      // Try get first saved client
      let client: HCSOAuthClient = null as any;
      try {
        client = this.getFirstSavedOAuth2Client();
      } catch (err) {
        this.log("login() -> no existing OAuth2 client available");
      }

      // Create new client since first saved was not found
      if (!client || client instanceof Error) {
        client = this.createOAuth2Client({
          sessionId: OAuth2Util.getRandomId(),
        });
      }

      this.log("login() -> created new temporary OAuth2 client");

      // Start OAuth2 process
      const apiUrl = client.getAuthorizationUrl();
      const oauth2Callback = await this.homey.cloud.createOAuth2Callback(
        apiUrl,
      );
      oauth2Callback
        .on("url", (url: string) => this.homey.api.realtime("url", url))
        .on("code", async (code: string) => {
          this.log("login() -> received OAuth2 code");
          try {
            await client.getTokenByCode({ code });
          } catch (err: any) {
            this.error("login() -> could not get token by code", err);
            this.homey.api.realtime(
              "error",
              new Error(
                this.homey.__("authentication.re-login_failed_with_error", {
                  error: err.message || err.toString(),
                }),
              ),
            );
          }
          // get the client's session info
          const session = await client.onGetOAuth2SessionInformation();
          const token = client.getToken();
          const { title }: { title: string } = session;
          client.destroy();

          try {
            // replace the temporary client by the final one and save it
            client = this.createOAuth2Client({ sessionId: session.id });
            client.setTitle({ title });
            client.setToken({ token: token! });
            client.save();
            await this.getHomeyToken();
          } catch (err: any) {
            this.error("Could not create new OAuth2 client", err);
            this.homey.api.realtime(
              "error",
              new Error(
                this.homey.__("authentication.re-login_failed_with_error", {
                  error: err.message || err.toString(),
                }),
              ),
            );
          }

          this.log("login() -> authenticated");
          this.homey.api.realtime("authorized", true);
        });
    } catch (err: any) {
      console.log("err", err);
    }
  }
  async onShouldDeleteSession() {
    return false;
  }

  async _authToken(): Promise<string | undefined> {
    const session: any = await this._getSession();
    if (!session) {
      return;
    }

    const sessionId = Object.keys(session)[0];

    return session?.[sessionId]?.token?.access_token;
  }
  async getHomeyToken() {
    const token = await this._authToken();
    if (!token) {
      return;
    }
    this.homeyId = await this.homey.cloud.getHomeyId();
    console.log("get homey token");
    const res: any = await got
      .get(
        `${this.hcsServer}/api/hcs/homey-token/` +
          this.homeyId,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        },
      )
      .json();
    console.log(res.token);
    this.token = res.token;

    this._api = new AthomCloudAPI({
      clientId: "64691b4358336640a5ecee5c",
      clientSecret: "ed09f559ae12b1522d00431f0bf7c5755603c41e",
      redirectUrl: "https://callback.athom.com/oauth2/callback",
      store: new AthomStorageAdapterSettings(this.homey),
    });

    this._homeyApi = await HomeyAPI.forCurrentHomey(this.homey);

    console.log("1");
    this._api.setToken({
      access_token: res.token,
      refresh_token: res.token,
      expires_in: 3600,
      token_type: "Bearer",
    });

    this._cloudUser = await this._api.getAuthenticatedUser();
    this._cloudHomey = await this._cloudUser.getHomeyById(this.homeyId);
    this._cloudHomeyApi = await this._cloudHomey.authenticate();

    console.log("3");
    // await HomeyAPI.forCurrentHomey(this.homey, res.token);
    if (await this._homeyApi.hasScope("homey:manager:devkit")) {
      console.log("has devkit scope");
    } else {
      console.log("no devkit scope");
    }
    if (!this.eventKey && res.eventKey) {
      this.eventKey = res.eventKey;
      console.log("subscribed to", {
        key: this.eventKey!,
        channel: "homey/" + this.homeyId,
      });
      this.emitter
        ?.subscribe({
          key: this.eventKey!,
          channel: "homey/" + this.homeyId,
        })
        .on("message", (msg: EmitterMessage) => {
          const output = JSON.parse(msg.asString());
          this.downloadApp(output.app, output.version);
        });
    }
  }
  async refreshToken() {
    let client;
    try {
      client = this.getFirstSavedOAuth2Client();
    } catch (err) {
      this.log("login() -> no existing OAuth2 client available");
      return;
    }
    const session: any = await this._getSession();
    if (!session) {
      return;
    }

    const sessionId = Object.keys(session)[0];
    client.destroy();

    console.log("refresh token");
    await got
      .post("https://auth.homeycommunity.space/application/o/token/", {
        method: "POST",
        body: querystring.stringify({
          grant_type: "refresh_token",
          client_id: Homey.env.CLIENT_ID,
          client_secret: Homey.env.CLIENT_SECRET,
          redirect_url: "https://callback.athom.com/oauth2/callback",
          refresh_token: session[sessionId].token.refresh_token,
          access_token: session[sessionId].token.access_token,
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .json()
      .then((res: any) => {
        client = this.createOAuth2Client({ sessionId: session.id });
        client.setTitle({ title: session.title });
        client.setToken({
          token: new OAuth2Token({
            access_token: res.access_token,
            refresh_token: res.refresh_token,
            expires_in: res.expires_in,
            token_type: res.token_type,
          }) as any,
        });
        client.save();
      })
      .catch((e) => console.log(e));
  }
  async downloadApp(id: string, version: string) {
    const token = await this._authToken();
    console.log("downloadApp", id, version);
    const fileUrl = `${this.hcsServer}/api/hcs/apps/${id}/download/${version}`;
    const download = await got
      .get(fileUrl, {
        headers: {
          Authorization: "Bearer " + token!,
        },
      })
      .buffer();

    return this.installApp(id, version, download);
  }

  async getEnv(buffer: Buffer) {
    const env = await tarGzGlob(bufferToStream(buffer), "env.json");
    return env.get("env.json")!;
  }
  async installApp(id: string, version: string, stream: Buffer) {
    const env = await this.getEnv(stream)!;

    const cloudApi = this.homey.settings.get("cloudApi");
    const bearerToken = cloudApi[`homeySession.${this.homeyId}`];
    const ip = await this.homey.cloud.getLocalAddress();

    const form = new FormData();
    form.append("app", stream, {
      filename: id + "-" + version + ".tar.gz",
      contentType: "octet/stream",
    });
    form.append("debug", "false");
    form.append("env", env);
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
    console.log(postResponse);
  }

  async logout() {
    this.log("logout()");
    const session: any = await this._getSession();
    if (!session) {
      return;
    }
    const sessionId = Object.keys(session)[0];
    this.deleteOAuth2Client({ sessionId, configId: session.configId });
  }

  async _getSession() {
    let sessions = null;
    try {
      sessions = this.getSavedOAuth2Sessions();
    } catch (err: any) {
      this.error("isAuthenticated() -> error", err.message);
      throw err;
    }
    if (Object.keys(sessions).length > 1) {
      throw new Error("Multiple OAuth2 sessions found, not allowed.");
    }
    this.log(
      "_getSession() ->",
      Object.keys(sessions).length === 1
        ? Object.keys(sessions)[0]
        : "no session found",
    );
    return Object.keys(sessions).length === 1 ? sessions : null;
  }
}

module.exports = StoreApp;

// buffer to stream
function bufferToStream(buffer: ArrayBuffer) {
  const stream = Readable.from(Buffer.from(buffer));

  return stream;
}
