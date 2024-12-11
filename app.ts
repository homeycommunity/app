import { Emitter, EmitterMessage, connect } from 'emitter-io';
import Homey from 'homey';
import { HCSOAuthClient } from './lib/HCS-OAuthClient';
import { OAuth2App } from './lib/OAuth/OAuth2App';
import { OAuth2Util } from './lib/OAuth/OAuth2Util';
import { installApp, updateApp } from './lib/install-app';

class StoreApp extends OAuth2App {
  static OAUTH2_DEBUG = true;
  private oAuth2Client?: HCSOAuthClient;
  private homeyId?: string;
  private token?: string;
  private bearerToken?: string;
  private expiresAt?: number;
  private eventKey?: string;
  private emitter?: Emitter;
  private eventAdded = false;

  async onInit() {
    this.emitter = connect({
      host: 'wss://events.homeycommunity.space',
      port: 443,
      secure: true,
      keepalive: 100,
    })
      .on('connect', async () => {
        console.log('connected to event listener');
        try {
          this.addEvent();
          this.eventAdded = true;
        } catch (err) {
          this.eventAdded = false;
          console.log(err);
        }
      })
      .on('message', (msg: EmitterMessage) => {
        const output = JSON.parse(msg.asString());
        console.log(output);
        this.installApp(output.app, output.version);
      })
      .on('disconnect', () => {
        console.log('disconnected from event listener');
      })
      .on('error', (error) => {
        console.log('error from eventlistener', error);
      });

    await super.onInit();
    try {
      this.oAuth2Client = await this.getFirstSavedOAuth2Client();
    } catch (err) {}
    try {
      await this.getHomeyToken();
    } catch (err) {
      console.log(err);
    }
  }

  async onOAuth2Init() {
    this.setOAuth2Config({
      client: HCSOAuthClient,
      tokenUrl: 'https://accounts.homeycommunity.space/oidc/token/',
      redirectUrl: 'https://callback.athom.com/oauth2/callback',
      authorizationUrl: 'https://accounts.homeycommunity.space/oidc/auth',
      apiUrl: 'https://homeycommunity.space/api/',
      clientId: Homey.env.CLIENT_ID,
      clientSecret: Homey.env.CLIENT_SECRET,
    });
  }

  async isAuthenticated() {
    try {
      const session = await this._getSession();
      this.log(`isAuthenticated() -> ${!!session}`);
      return !!session;
    } catch (err) {
      this.error('isAuthenticated() -> could not get current session:', err);
      throw new Error('Could not get current OAuth2 session');
    }
  }

  async login() {
    try {
      this.log('login()');

      // Try get first saved client
      let client: HCSOAuthClient = null as any;
      try {
        client = this.getFirstSavedOAuth2Client();
      } catch (err) {
        this.log('login() -> no existing OAuth2 client available');
      }

      // Create new client since first saved was not found
      if (!client || client instanceof Error) {
        client = this.createOAuth2Client({
          sessionId: OAuth2Util.getRandomId(),
        });
      }

      this.log('login() -> created new temporary OAuth2 client');

      // Start OAuth2 process
      const apiUrl = client.getAuthorizationUrl();
      const oauth2Callback = await this.homey.cloud.createOAuth2Callback(
        apiUrl
      );
      oauth2Callback
        .on('url', (url: string) => this.homey.api.realtime('url', url))
        .on('code', async (code: string) => {
          this.log('login() -> received OAuth2 code');
          try {
            console.log({ code });
            await client.getTokenByCode({ code });
          } catch (err: any) {
            this.error('login() -> could not get token by code', err);
            this.homey.api.realtime(
              'error',
              new Error(
                this.homey.__('authentication.re-login_failed_with_error', {
                  error: err.message || err.toString(),
                })
              )
            );
          }
          // get the client's session info
          const session = await client.onGetOAuth2SessionInformation();
          const token = client.getToken();
          const { title }: { title: any } = session;
          client.destroy();

          try {
            // replace the temporary client by the final one and save it
            client = this.createOAuth2Client({ sessionId: session.id });
            client.setTitle({ title });
            console.log(token);
            client.setToken({ token: token! });
            client.save();
            this.oAuth2Client = client;
            await this.getHomeyToken();
          } catch (err: any) {
            this.error('Could not create new OAuth2 client', err);
            this.homey.api.realtime(
              'error',
              new Error(
                this.homey.__('authentication.re-login_failed_with_error', {
                  error: err.message || err.toString(),
                })
              )
            );
          }

          this.log('login() -> authenticated');
          this.homey.api.realtime('authorized', true);
        });
    } catch (err: any) {
      console.log('err', err);
    }
  }

  async onShouldDeleteSession() {
    return false;
  }

  async getHomeyToken() {
    this.homeyId = await this.homey.cloud.getHomeyId();

    const res = await this.oAuth2Client?.getHomeyToken(this.homeyId!);
    this.token = res.token;
    this.bearerToken = res.sessionToken;
    this.expiresAt = res.expiresAt;
    if (!this.eventKey && res.eventKey && !this.eventAdded) {
      this.eventKey = res.eventKey;
      if (!this.eventAdded) {
        try {
          this.addEvent();
          this.eventAdded = true;
        } catch (err) {
          this.eventAdded = false;
          console.log(err);
        }
      }
    }
  }

  addEvent() {
    if (this.eventKey) {
      console.log('adding event', this.eventKey);
      this.emitter?.subscribe({
        key: this.eventKey,
        channel: `homey/${this.homeyId}`,
      });
    } else {
      throw new Error('No event key found');
    }
  }

  async installApp(id: string, version: string) {
    console.log('installing app', id, version);

    const ip = await this.homey.cloud.getLocalAddress();

    if (!this.oAuth2Client) {
      return;
    }

    if (this.expiresAt && this.expiresAt < Date.now()) {
      await this.getHomeyToken();
    }

    const stream = await this.oAuth2Client.downloadApp(id, version);

    await installApp(id, version, stream, this.bearerToken!, ip);

    await updateApp(
      {
        origin: 'devkit_install',
      },
      id,
      this.bearerToken!,
      ip
    );
  }

  async logout() {
    this.log('logout()');
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
      this.error('isAuthenticated() -> error', err.message);
      throw err;
    }
    if (Object.keys(sessions).length > 1) {
      throw new Error('Multiple OAuth2 sessions found, not allowed.');
    }
    this.log(
      '_getSession() ->',
      Object.keys(sessions).length === 1
        ? Object.keys(sessions)[0]
        : 'no session found'
    );
    return Object.keys(sessions).length === 1 ? sessions : null;
  }
}

module.exports = StoreApp;
