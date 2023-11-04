import axios from "axios";
import { OAuth2Client, OAuth2Token } from "homey-oauth2app";
import querystring from "querystring";
import { http2Transport } from "./H2Adapter";

export class HCSOAuthClient extends OAuth2Client {
  static API_URL = "https://homeycommunity.space/api/hcs";
  static TOKEN_URL = "https://auth.homeycommunity.space/application/o/token/";
  async onGetTokenByCode({ code }: { code: string }) {
    const params = {
      grant_type: "authorization_code",
      client_id: this._clientId,
      client_secret: this._clientSecret,
      redirect_uri: "https://callback.athom.com/oauth2/callback", // the trailing slash does not work anymore and returns a code 500!
      code,
    };
    try {
      // Exchange code for token
      const res = await axios.post(
        this._tokenUrl,
        querystring.stringify(params),
        {
          transport: http2Transport,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        } as any
      );
      const body = res.data;
      return new OAuth2Token(body);
    } catch (err: any) {
      console.log("err", err);
      console.log(params);
      throw new Error("Could not get token");
    }
  }
}
