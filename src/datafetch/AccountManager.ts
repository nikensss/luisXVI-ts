import { Page } from 'puppeteer';

/**
 * Represents a twitter account. Can return the link to the analytics page of this account.
 */
class Account {
  private _name: string;
  private _link: string;

  public static readonly USER_URL_PREFIX: string = 'https://analytics.twitter.com/user/';

  constructor(name: string) {
    this._name = name;
    this._link = `${Account.USER_URL_PREFIX}${this._name}`;
  }

  public get name(): string {
    return this._name;
  }

  public get link(): string {
    return this._link;
  }
}

/**
 * In charge of getting the linked accounts available when visiting '/accounts'.
 */
class AccountManager {
  private _page: Page;
  private _accounts: Account[] = [];

  public static readonly ACCOUNT_SELECTOR: string = 'ul.AccountSelector-accounts > li';
  public static readonly AVATAR_SELECTOR: string = 'ul.AccountSelector-accounts > li > div > div > img';

  constructor(page: Page) {
    this._page = page;
  }

  addAccount(account: string): void {
    this._accounts.push(new Account(account));
  }

  get accounts(): Account[] {
    return [...this._accounts];
  }

  async updateAccounts(): Promise<void> {
    await this._page.waitForSelector(AccountManager.ACCOUNT_SELECTOR);
    console.log('getting user ids');
    const result = await this._page.$$eval(AccountManager.AVATAR_SELECTOR, (avatars) =>
      avatars.map((avatar) => avatar.getAttribute('alt'))
    );
    for (let account of result) {
      if (account !== null) {
        this._accounts.push(new Account(account));
      }
    }

    console.log(this._accounts);
    return Promise.resolve();
  }
}

export default AccountManager;

export { Account };
