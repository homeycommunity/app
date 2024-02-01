export class OAuth2Error extends Error {
  constructor(
    message: string,
    public code?: number,
  ) {
    super(message);
    this.name = 'OAuth2Error';
  }

  toString(): string {
    return `[OAuth2Error] ${this.code} ${super.toString()}`;
  }
}
