/* eslint-disable camelcase */

export class OAuth2Token {
  public access_token: string | null;
  public refresh_token: string | null;
  public token_type: string | null;
  public expires_in: number | null;

  constructor({
    access_token,
    refresh_token,
    token_type,
    expires_in,
  }: {
    access_token: string | null;
    refresh_token: string | null;
    token_type: string | null;
    expires_in: number | null;
  }) {
    this.access_token = access_token || null;
    this.refresh_token = refresh_token || null;
    this.token_type = token_type || null;
    this.expires_in = expires_in || null;
  }

  isRefreshable(): boolean {
    return !!this.refresh_token;
  }

  toJSON(): {
    access_token: string | null;
    refresh_token: string | null;
    token_type: string | null;
    expires_in: number | null;
  } {
    return {
      access_token: this.access_token,
      refresh_token: this.refresh_token,
      token_type: this.token_type,
      expires_in: this.expires_in,
    };
  }
}
