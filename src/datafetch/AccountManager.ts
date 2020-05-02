import { Page } from 'puppeteer';
import Account from './Account';

/**
 * In charge of getting the linked accounts available when visiting '/accounts'.
 */
class AccountManager {
  private _page: Page;
  private _accounts: Account[] = [];

  private static readonly ACCOUNT_SELECTOR: string = 'ul.AccountSelector-accounts > li';
  private static readonly AVATAR_SELECTOR: string =
    'ul.AccountSelector-accounts > li > div > div > img';

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

  async goToAccounts() {
    await this._page.goto('https://analytics.twitter.com/accounts');
  }

  async updateAccounts(): Promise<void> {
    try {
      await this._page.waitForSelector(AccountManager.ACCOUNT_SELECTOR, { timeout: 2500 });
      console.log('getting user ids');
      const result = await this._page.$$eval(AccountManager.AVATAR_SELECTOR, (avatars) =>
        avatars.map((avatar) => avatar.getAttribute('alt'))
      );
      for (let account of result) {
        if (account !== null) {
          this._accounts.push(new Account(account));
        }
      }
    } catch (ex) {
      if (!ex.message.includes('waiting for selector "ul.AccountSelector-accounts > li')) {
        throw ex;
      }
      const url = this._page.url();
      const accountName = url.replace(/.*\/user\/(.+)\/.*/, '$1');
      this._accounts.push(new Account(accountName));
    }

    console.log(
      `[AccountManager] accounts found: '${this._accounts.map((a) => a.name).join(', ')}'`
    );
    return Promise.resolve();
  }
}

export default AccountManager;
