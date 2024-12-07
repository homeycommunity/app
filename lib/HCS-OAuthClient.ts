import { OAuth2Client } from './OAuth/OAuth2Client';

const api =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/'
    : 'https://homeycommunity.space/api/';

export class HCSOAuthClient extends OAuth2Client {
  static API_URL = api;
  static TOKEN_URL = 'https://accounts.homeycommunity.space/oidc/token/';
  static AUTHORIZATION_URL = 'https://accounts.homeycommunity.space/oidc/auth/';

  static SCOPES = ['openid', 'email', 'profile'];

  public async getHomeyToken(homeyId: string) {
    const res = await this.get({
      path: `hcs/homey-token/${homeyId}`,
    });

    console.log(res);

    return res;
  }

  public async downloadApp(appId: string, version: string) {
    console.log('downloadApp', appId, version);
    const file: ArrayBuffer = await this.get({
      path: `hcs/apps/${appId}/download/${version}`,
    });
    console.log(file);
    return file;
  }
}
