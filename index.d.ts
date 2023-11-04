declare module "homey-oauth2app" {
  import { EventEmitter } from "events";
  import Homey from "homey";
  /**
   * @extends Homey.App
   * @type {module.OAuth2App}
   * @hideconstructor
   */
  export class OAuth2App extends Homey.App {
    /** @type {boolean} */
    static OAUTH2_DEBUG: boolean;
    /** @type {OAuth2Client} */
    static OAUTH2_CLIENT: OAuth2Client;
    /** @type {boolean} */
    static OAUTH2_MULTI_SESSION: boolean;
    /**
     * We assume all drivers use OAuth2.
     * In some cases, some drivers may never become ready.
     * Make sure to exclude those drivers from this array.
     * @type {string[]}
     */
    static OAUTH2_DRIVERS: string[];
    /**
     * @returns {Promise<void>}
     */
    onInit(): Promise<void>;
    /**
     * @returns {Promise<void>}
     */
    onOAuth2Init(): Promise<void>;
    /**
     */
    enableOAuth2Debug(): void;
    /**
     */
    disableOAuth2Debug(): void;
    /**
     * Set the app's config.
     * Most apps will only use one config, `default`.
     * All methods default to this config.
     * For apps using multiple clients, a configId can be provided.
     * @param {object} args
     * @param {string} args.configId
     * @param {OAuth2Client} args.client
     * @param {string} args.clientId
     * @param {string} args.clientSecret
     * @param {string} args.apiUrl
     * @param {string} args.token
     * @param {string} args.tokenUrl
     * @param {string} args.authorizationUrl
     * @param {string} args.redirectUrl
     * @param {string[]} args.scopes
     * @param {boolean} args.allowMultiSession
     */
    setOAuth2Config({
      configId,
      client,
      clientId,
      clientSecret,
      apiUrl,
      token,
      tokenUrl,
      authorizationUrl,
      redirectUrl,
      scopes,
      allowMultiSession,
    }?: {
      configId?: string;
      client: InstanceType<OAuth2Client>;
      clientId: string;
      clientSecret: string;
      apiUrl?: string;
      token?: string;
      tokenUrl: string;
      authorizationUrl: string;
      redirectUrl: string;
      scopes?: string[];
      allowMultiSession?: boolean;
    }): void;
    hasConfig({ configId }?: { configId?: string }): boolean;
    /**
     * @param {object} args
     * @param {string} args.configId
     */
    checkHasConfig({ configId }?: { configId: string }): void;
    /**
     * @param {object} args
     * @param {string} args.configId
     * @returns {*}
     */
    getConfig({ configId }?: { configId: string }): any;
    hasOAuth2Client({
      sessionId,
      configId,
    }?: {
      sessionId: any;
      configId?: string;
    }): boolean;
    /**
     * @param {object} args
     * @param {string} args.sessionId
     * @param {string} args.configId
     */
    checkHasOAuth2Client({
      sessionId,
      configId,
    }?: {
      sessionId: string;
      configId?: string;
    }): void;
    /**
     * @param {object} args
     * @param {string} args.sessionId
     * @param {string} args.configId
     * @returns {*}
     */
    createOAuth2Client({
      sessionId,
      configId,
    }?: {
      sessionId: string;
      configId?: string;
    }): any;
    /**
     * @param {object} args
     * @param {string} args.sessionId
     * @param {string} args.configId
     */
    deleteOAuth2Client({
      sessionId,
      configId,
    }?: {
      sessionId: string;
      configId: string;
    }): void;
    /**
     * @param {object} args
     * @param {string} args.sessionId
     * @param {string} args.configId
     * @returns {OAuth2Client}
     */
    getOAuth2Client({
      sessionId,
      configId,
    }?: {
      sessionId: string;
      configId?: string;
    }): OAuth2Client;
    /**
     * @param {object} args
     * @param {string} args.configId
     * @param {string} args.sessionId
     * @param {OAuth2Client} args.client
     */
    saveOAuth2Client({
      configId,
      sessionId,
      client,
    }: {
      configId: string;
      sessionId: string;
      client: OAuth2Client;
    }): void;
    /**
     * @returns {object}
     */
    getSavedOAuth2Sessions(): object;
    /**
     * @returns {OAuth2Client}
     */
    getFirstSavedOAuth2Client(): OAuth2Client;
    /**
     * @param {object} args
     * @param {string} args.sessionId
     * @param {string} args.configId
     */
    tryCleanSession({
      sessionId,
      configId,
    }: {
      sessionId: string;
      configId: string;
    }): void;
    /**
     * @param {object} args
     * @param {string} args.sessionId
     * @param {string} args.configId
     * @returns {Promise<boolean>}
     */
    onShouldDeleteSession({
      sessionId,
      configId,
    }: {
      sessionId: string;
      configId: string;
    }): Promise<boolean>;
    /**
     * @param {object} args
     * @param {string} args.sessionId
     * @param {string} args.configId
     * @returns {Promise<array>}
     */
    getOAuth2Devices({
      sessionId,
      configId,
    }: {
      sessionId: string;
      configId: string;
    }): Promise<any[]>;
    [sDebug]: boolean;
    [sConfigs]: {};
    [sClients]: {};
  }
  declare const sDebug: unique symbol;
  declare const sConfigs: unique symbol;
  declare const sClients: unique symbol;

  export class OAuth2Client extends EventEmitter {
    /** @type {string} */
    static API_URL: string;
    /** @type {OAuth2Token} */
    static TOKEN: OAuth2Token;
    /** @type {string} */
    static TOKEN_URL: string;
    /** @type {string} */
    static AUTHORIZATION_URL: string;
    /** @type {string} */
    static REDIRECT_URL: string;
    /** @type {string[]} */
    static SCOPES: string[];
    /**
     * @param {object} args
     * @param {Homey} args.homey
     * @param {string} args.token
     * @param {string} args.clientId
     * @param {string} args.clientSecret
     * @param {string} args.apiUrl
     * @param {string} args.tokenUrl
     * @param {string} args.authorizationUrl
     * @param {string} args.redirectUrl
     * @param {array} args.scopes
     */
    constructor({
      homey,
      token,
      clientId,
      clientSecret,
      apiUrl,
      tokenUrl,
      authorizationUrl,
      redirectUrl,
      scopes,
    }: {
      homey: Homey;
      token: string;
      clientId: string;
      clientSecret: string;
      apiUrl: string;
      tokenUrl: string;
      authorizationUrl: string;
      redirectUrl: string;
      scopes: any[];
    });
    public homey: Homey;
    protected _tokenConstructor: string;
    protected _clientId: string;
    protected _clientSecret: string;
    protected _apiUrl: string;
    protected _tokenUrl: string;
    protected _authorizationUrl: string;
    protected _redirectUrl: string;
    protected _scopes: any[];
    protected _token: any;
    /**
     * @description Helper function
     * @returns {Promise<void>}
     */
    init(): Promise<void>;
    /**
     * @description Helper function
     * @param props
     */
    log(...props: any[]): void;
    /**
     * @description Helper function
     * @param props
     */
    error(...props: any[]): void;
    /**
     * @description Helper function
     * @param props
     */
    debug(...props: any[]): void;
    /**
     * @description Helper function
     */
    save(): void;
    /**
     * @description Helper function
     */
    destroy(): void;
    /**
     * @param {object} args
     * @param {string} args.path
     * @param {string} args.query
     * @param {object} args.headers
     * @returns {Promise<*>}
     */
    get({
      path,
      query,
      headers,
    }: {
      path: string;
      query: string;
      headers: object;
    }): Promise<any>;
    /**
     * @param {object} args
     * @param {string} args.path
     * @param {string} args.query
     * @param {object} args.headers
     * @returns {Promise<*>}
     */
    delete({
      path,
      query,
      headers,
    }: {
      path: string;
      query: string;
      headers: object;
    }): Promise<any>;
    /**
     * @param {object} args
     * @param {string} args.path
     * @param {string} args.query
     * @param {object} args.json
     * @param {object} args.body
     * @param {object} args.headers
     * @returns {Promise<*>}
     */
    post({
      path,
      query,
      json,
      body,
      headers,
    }: {
      path: string;
      query: string;
      json: object;
      body: object;
      headers: object;
    }): Promise<any>;
    /**
     * @param {object} args
     * @param {string} args.path
     * @param {string} args.query
     * @param {object} args.json
     * @param {object} args.body
     * @param {object} args.headers
     * @returns {Promise<*>}
     */
    patch({
      path,
      query,
      json,
      body,
      headers,
    }: {
      path: string;
      query: string;
      json: object;
      body: object;
      headers: object;
    }): Promise<any>;
    /**
     * @param {object} args
     * @param {string} args.path
     * @param {string} args.query
     * @param {object} args.json
     * @param {object} args.body
     * @param {object} args.headers
     * @returns {Promise<*>}
     */
    put({
      path,
      query,
      json,
      body,
      headers,
    }: {
      path: string;
      query: string;
      json: object;
      body: object;
      headers: object;
    }): Promise<any>;
    /**
     * @param {object} args
     * @returns {Promise<undefined|void|null>}
     */
    refreshToken(...args: object): Promise<undefined | void | null>;
    _refreshingToken: Promise<OAuth2Token>;
    /**
     * @param {object} args
     * @param args.req
     * @param {boolean} args.didRefreshToken
     * @returns {Promise<void|*>}
     * @private
     */
    private _executeRequest;
    /**
     * @param {object} args
     * @param {string} args.code
     * @returns {Promise<null>}
     */
    getTokenByCode({ code }: { code: string }): Promise<null>;
    /**
     * @param {object} args
     * @param {string} args.username
     * @param {string} args.password
     * @returns {Promise<null>}
     */
    getTokenByCredentials({
      username,
      password,
    }: {
      username: string;
      password: string;
    }): Promise<null>;
    /**
     * @returns {string|null}
     */
    getToken(): string | null;
    /**
     * @param {object} args
     * @param {string} args.token
     */
    setToken({ token }: { token: string }): void;
    /**
     * @param {object} args
     * @param {array} args.scopes
     * @param {string} args.state
     * @returns {string}
     */
    getAuthorizationUrl({
      scopes,
      state,
    }?: {
      scopes: any[];
      state: string;
    }): string;
    /**
     * @returns {string}
     */
    getTitle(): string;
    /**
     * @param {string} title
     */
    setTitle({ title }: { title: string }): void;
    _title: any;
    /**
     * @description Can be extended
     * @returns {Promise<void>}
     */
    onInit(): Promise<void>;
    /**
     * @description Can be extended
     * @returns {Promise<void>}
     */
    onUninit(): Promise<void>;
    /**
     * @description Can be extended
     * @param {object} args
     * @param {string} args.method
     * @param {string} args.path
     * @param {object} args.json
     * @param {object} args.body
     * @param {object} args.query
     * @param {object} args.headers
     * @returns {Promise<{opts: object, url: string}>}
     */
    onBuildRequest({
      method,
      path,
      json,
      body,
      query,
      headers,
    }: {
      method: string;
      path: string;
      json: object;
      body: object;
      query: object;
      headers: object;
    }): Promise<{
      opts: object;
      url: string;
    }>;
    /**
     * @description Can be extended
     * @param {object} args
     * @param {string} args.query
     * @returns {Promise<Object>}
     */
    onRequestQuery({ query }: { query: string }): Promise<any>;
    /**
     * @param {object} args
     * @param {object} args.headers
     * @returns {Promise<Object>}
     */
    onRequestHeaders({ headers }: { headers: object }): Promise<any>;
    /**
     * @description Can be extended
     * @description {@link https://tools.ietf.org/html/rfc6749#section-4.1.3}
     * @param {object} args
     * @param {string} args.code
     * @returns {Promise<OAuth2Token>}
     */
    onGetTokenByCode({ code }: { code: string }): Promise<OAuth2Token>;
    /**
     * @description Can be extended
     * @param {object} args
     * @param {object} args.response
     * @returns {Promise<void>}
     */
    onHandleGetTokenByCodeError({
      response,
    }: {
      response: object;
    }): Promise<void>;
    /**
     * @description Can be extended
     * @param {object} args
     * @param {object} args.response
     * @returns {Promise<void>}
     */
    onHandleGetTokenByCodeResponse({
      response,
    }: {
      response: object;
    }): Promise<void>;
    /**
     * @description {@link https://tools.ietf.org/html/rfc6749#section-4.3.2}
     * @param {object} args
     * @param {string} args.username
     * @param {string} args.password
     * @returns {Promise<OAuth2Token>}
     */
    onGetTokenByCredentials({
      username,
      password,
    }: {
      username: string;
      password: string;
    }): Promise<OAuth2Token>;
    onHandleGetTokenByCredentialsError({
      response,
    }: {
      response: any;
    }): Promise<void>;
    onHandleGetTokenByCredentialsResponse({
      response,
    }: {
      response: any;
    }): Promise<any>;
    /**
     * @description {@link https://tools.ietf.org/html/rfc6749#section-6}
     * @returns {Promise<OAuth2Token>}
     */
    onRefreshToken(): Promise<OAuth2Token>;
    /**
     * @param {object} args
     * @param {object} args.response
     * @returns {Promise<void>}
     */
    onHandleRefreshTokenError({
      response,
    }: {
      response: object;
    }): Promise<void>;
    /**
     * @param {object} args
     * @param {object} args.response
     * @returns {Promise<OAuth2Token>}
     */
    onHandleRefreshTokenResponse({
      response,
    }: {
      response: object;
    }): Promise<OAuth2Token>;
    /**
     * @param {object} args
     * @param args.response
     * @returns {Promise<void>}
     * @private
     */
    private _onHandleGetTokenByErrorGeneric;
    /**
     * @param response
     * @returns {Promise<*>}
     * @private
     */
    private _onHandleGetTokenByResponseGeneric;
    /**
     * @param {object} arg
     * @param {object} arg.err
     * @returns {Promise<void>}
     */
    onRequestError({ err }: { err: object }): Promise<void>;
    /**
     * @description This method returns a boolean if the response is rate limited
     * @param {object} args
     * @param args.req
     * @param {string} args.url
     * @param {object} args.opts
     * @param args.response
     * @param args.didRefreshToken
     * @returns {Promise<void|*>}
     */
    onRequestResponse({
      req,
      url,
      opts,
      response,
      didRefreshToken,
    }: {
      req: any;
      url: string;
      opts: object;
      response: any;
      didRefreshToken: any;
    }): Promise<void | any>;
    /**
     * @description This method returns a boolean if the token should be refreshed
     * @param {object} args
     * @param args.status
     * @returns {Promise<boolean>}
     */
    onShouldRefreshToken({ status }: { status: any }): Promise<boolean>;
    /**
     * @description This method returns a boolean if the response is rate limited
     * @param {object} args
     * @param {number} args.status
     * @param {object} args.headers
     * @returns {Promise<boolean>}
     */
    onIsRateLimited({
      status,
      headers,
    }: {
      status: number;
      headers: object;
    }): Promise<boolean>;
    /**
     * @description This method handles a response and downloads the body
     * @param {object} args
     * @param {object} args.response
     * @param {number} args.status
     * @param {string} args.statusText
     * @param {object} args.headers
     * @param {boolean} args.ok
     * @returns {Promise<*|undefined>}
     */
    onHandleResponse({
      response,
      status,
      statusText,
      headers,
      ok,
    }: {
      response: object;
      status: number;
      statusText: string;
      headers: object;
      ok: boolean;
    }): Promise<any | undefined>;
    /**
     * @description This method handles a response that is not OK (400 <= statuscode <= 599)
     * @param {object} args
     * @param args.body
     * @param {number} args.status
     * @param {string} args.statusText
     * @param {object} args.headers
     * @returns {Promise<Error>}
     */
    onHandleNotOK({
      body,
      status,
      statusText,
      headers,
    }: {
      body: any;
      status: number;
      statusText: string;
      headers: object;
    }): Promise<Error>;
    /**
     * @description This method handles a response that is OK
     * @param {object} args
     * @param args.result
     * @param {number} args.status
     * @param {string} args.statusText
     * @param {object} args.headers
     * @returns {Promise<*>}
     */
    onHandleResult({
      result,
      status,
      statusText,
      headers,
    }: {
      result: any;
      status: number;
      statusText: string;
      headers: object;
    }): Promise<any>;
    /**
     * @param {object} args
     * @param {array.<string>} args.scopes
     * @param {string} args.state
     * @returns {string}
     */
    onHandleAuthorizationURL({
      scopes,
      state,
    }?: {
      scopes: array<string>;
      state: string;
    }): string;
    /**
     * @description {@link https://tools.ietf.org/html/rfc6749#appendix-A.4}
     * @param {object} args
     * @param {array} args.scopes
     * @returns {*}
     */
    onHandleAuthorizationURLScopes({ scopes }: { scopes: any[] }): any;
    /**
     * @description This method returns data that can identify the session
     * @returns {Promise<{id: *, title: any}>}
     */
    onGetOAuth2SessionInformation(): Promise<{
      id: any;
      title: any;
    }>;
  }
  export class OAuth2Device extends Homey.Device {
    /**
     */
    onInit(): Promise<void>;
    oAuth2Client: any;
    /**
     * @description
     * > This method can be extended
     * @returns {Promise<void>}
     */
    onOAuth2Init(): Promise<void>;
    /**
     * @returns {Promise<void>}
     */
    onUninit(): Promise<void>;
    /**
     * @description
     * > This method can be extended
     * @returns {Promise<void>}
     */
    onOAuth2Uninit(): Promise<void>;
    /**
     * @returns {Promise<void>}
     */
    onAdded(): Promise<void>;
    /**
     * @description
     * > This method can be extended
     * @returns {Promise<void>}
     */
    onOAuth2Added(): Promise<void>;
    /**
     * @description
     * > This method can be extended
     * @returns {Promise<void>}
     */
    onOAuth2Saved(): Promise<void>;
    /**
     * @description
     * > This method can be extended
     * @returns {Promise<void>}
     */
    onOAuth2Destroyed(): Promise<void>;
    /**
     * @description
     * > This method can be extended
     * @returns {Promise<void>}
     */
    onOAuth2Expired(): Promise<void>;
    /**
     * @returns {Promise<void>}
     */
    onDeleted(): Promise<void>;
    /**
     * @description
     * > This method can be extended
     * @returns {Promise<void>}
     */
    onOAuth2Deleted(): Promise<void>;
  }
  export class OAuth2Driver extends Homey.Driver {
    static OAUTH2_CONFIG_ID: string;
    /**
     * @returns {Promise<void>}
     */
    onInit(): Promise<void>;
    /**
     * @description
     * > This method can be extended
     * @returns {Promise<void>}
     */
    onOAuth2Init(): Promise<void>;
    /**
     * @returns {*}
     */
    getOAuth2ConfigId(): any;
    /**
     * @param {string} id
     */
    setOAuth2ConfigId(id: string): void;
    /**
     * @param {PairSession} socket
     */
    onPair(socket: PairSession): void;
    /**
     * @description
     * > This method can be extended
     * @returns {Promise<*>}
     */
    onPairListDevices(): Promise<any>;
    /**
     * @param {PairSession} socket
     * @param {Homey.Device} device
     */
    onRepair(socket: PairSession, device: Homey.Device): void;
    [sOAuth2ConfigId]: string;
  }
  declare const sOAuth2ConfigId: unique symbol;

  export class OAuth2Error extends Error {}
  export class OAuth2Token {
    /**
     * @param {object} args
     * @param args.access_token
     * @param args.refresh_token
     * @param args.token_type
     * @param args.expires_in
     */
    constructor({
      access_token,
      refresh_token,
      token_type,
      expires_in,
    }: {
      access_token: any;
      refresh_token: any;
      token_type?: any;
      expires_in?: any;
    });
    access_token: any;
    refresh_token: any;
    token_type: any;
    expires_in: any;
    /**
     * @returns {boolean}
     */
    isRefreshable(): boolean;
    /**
     * @returns {
     *  {access_token: (*|null), refresh_token: (*|null), token_type: (*|null), expires_in: (*|null)}
     * }
     */
    toJSON(): any;
  }
  export class OAuth2Util {
    /**
     * @returns {string}
     */
    static getRandomId(): string;
    /**
     * @param {number} delay
     * @returns {Promise<void>}
     */
    static wait(delay?: number): Promise<void>;
  }
}
