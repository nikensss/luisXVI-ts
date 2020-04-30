import { Page } from 'puppeteer';
import Account from './Account';

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

  addAccount(account: Account): void {
    this._accounts.push(account);
  }

  get accounts(): Account[] {
    return [...this._accounts];
  }

  *accountsY(): Generator<Account> {
    for (let account of this.accounts) {
      yield account;
    }
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
