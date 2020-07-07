import { Page } from 'puppeteer';
import Account from './Account';

/**
 * In charge of going to and getting the linked accounts available at
 * 'https://analytics.twitter.com/accounts'.
 */
class AccountManager {
  private _page: Page;
  private _accounts: Account[] = [];

  private static readonly ACCOUNT_SELECTOR: string =
    'ul.AccountSelector-accounts > li';
  private static readonly AVATAR_SELECTOR: string =
    'ul.AccountSelector-accounts > li > div > div > img';

  constructor(page: Page) {
    this._page = page;
  }

  addAccount(account: Account): void {
    if (account === null) return;
    this._accounts.push(account);
  }

  addAccounts(accounts: Account[]): void {
    if (!Array.isArray(accounts)) return;
    accounts.forEach(a => this.addAccount(a));
  }

  get accounts(): Account[] {
    return [...this._accounts];
  }

  async goToAccounts() {
    await this._page.goto('https://analytics.twitter.com/accounts');
  }

  async updateAccounts(): Promise<void> {
    try {
      await this._page.waitForSelector(AccountManager.ACCOUNT_SELECTOR, {
        timeout: 2500
      });
      console.log('getting user ids');

      const result = await this._page.$$eval(
        AccountManager.AVATAR_SELECTOR,
        avatars => avatars.map(avatar => avatar.getAttribute('alt'))
      );

      this.addAccounts(
        result
          ?.filter(r => typeof r === 'string')
          .map(a => new Account(a as string))
      );
    } catch (ex) {
      if (
        !ex.message.includes(
          'waiting for selector "ul.AccountSelector-accounts > li'
        )
      ) {
        return Promise.reject(ex);
      }

      this.useCurrentAccount();
    }

    console.log(
      `[AccountManager] accounts: '${this._accounts
        .map(a => a.name)
        .join(', ')}'`
    );
    return Promise.resolve();
  }

  private useCurrentAccount(): void {
    const url = this._page.url();
    const accountName = url.replace(/.*\/user\/(.+)\/.*/, '$1');
    this._accounts.push(new Account(accountName));
  }
}

export default AccountManager;
