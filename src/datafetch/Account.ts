/**
 * Represents a twitter account. Can return the link to the analytics page of
 * this account.
 */
class Account {
  private _name: string;

  public static readonly USER_URL_PREFIX: string =
    'https://analytics.twitter.com/user/';

  constructor(name: string) {
    this._name = name;
  }

  public get name(): string {
    return this._name;
  }

  public get link(): string {
    return `${Account.USER_URL_PREFIX}${this.name}`;
  }
}

export default Account;
