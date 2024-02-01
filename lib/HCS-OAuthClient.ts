import { OAuth2Client } from './OAuth/OAuth2Client';

export class HCSOAuthClient extends OAuth2Client {
  static API_URL = 'https://homeycommunity.space/api/';
  static TOKEN_URL = 'https://auth.homeycommunity.space/application/o/token/';
  static AUTHORIZATION_URL =
    'https://auth.homeycommunity.space/application/o/authorize/';

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
