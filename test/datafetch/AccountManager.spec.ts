import AccountManager from '../../src/datafetch/AccountManager';
import { Page } from 'puppeteer';
import chai, { expect } from 'chai';
import Account from '../../src/datafetch/Account';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('AccountManager', () => {
  it('creates a new AccountManager', () => {
    const mockPage: unknown = {};
    const accountManager = new AccountManager(mockPage as Page);
    expect(accountManager).to.not.be.undefined;
  });

  it('goes to accounts page', () => {
    const mockPage: unknown = {
      goto: (url: string) => {
        expect(url).to.equal('https://analytics.twitter.com/accounts');
      }
    };
    const accountManager = new AccountManager(mockPage as Page);
    accountManager.goToAccounts();
  });

  it('returns if adding null Account', () => {
    const mockPage: unknown = {};
    const accountManager = new AccountManager(mockPage as Page);
    accountManager.addAccount(null!);

    expect(accountManager.accounts.length).to.be.equal(0);
  });

  it('adds a new Account properly', () => {
    const mockPage: unknown = {};
    const account = new Account('test');
    const accountManager = new AccountManager(mockPage as Page);
    accountManager.addAccount(account);

    expect(accountManager.accounts.length).to.be.equal(1);
  });

  it('adds a new Account and checks account name', () => {
    const mockPage: unknown = {};
    const account = new Account('test');
    const accountManager = new AccountManager(mockPage as Page);
    accountManager.addAccount(account);

    expect(accountManager.accounts.pop()?.name).to.be.equal('test');
  });

  it('updates accounts with available accounts', async () => {
    const mockPage: unknown = {
      waitForSelector: async (selector: string) => {
        return Promise.resolve();
      },
      $$eval: async (selector: string, callback: Function) => {
        const names = callback([
          {
            getAttribute: () => 'test1'
          },
          {
            getAttribute: () => 'test2'
          }
        ]);
        return Promise.resolve(names);
      }
    };
    const accountManager = new AccountManager(mockPage as Page);
    await accountManager.updateAccounts();

    expect(accountManager.accounts).to.deep.equal([
      new Account('test1'),
      new Account('test2')
    ]);
  });

  it('"updates" accounts without available accounts', async () => {
    const mockPage: unknown = {
      waitForSelector: async (selector: string) => {
        return Promise.resolve();
      },
      $$eval: async (selector: string, callback: Function) => {
        return Promise.resolve();
      }
    };
    const accountManager = new AccountManager(mockPage as Page);
    await accountManager.updateAccounts();

    expect(accountManager.accounts.length).to.be.equal(0);
  });

  it('updates accounts with current user after "waiting for selector" exception', async () => {
    const mockPage: unknown = {
      waitForSelector: async (selector: string) => {
        throw new Error(
          'waiting for selector "ul.AccountSelector-accounts > li'
        );
      },
      url: () => {
        return '/user/MrPiglover/';
      }
    };
    const accountManager = new AccountManager(mockPage as Page);
    await accountManager.updateAccounts();

    expect(accountManager.accounts.pop()?.name).to.be.equal('MrPiglover');
  });

  it('throws ex when unknown ex occurs in updateAccoutns', async () => {
    const mockPage: unknown = {
      waitForSelector: async (selector: string) => {
        return Promise.reject(new Error('unknown error'));
      }
    };

    const accountManager = new AccountManager(mockPage as Page);

    await expect(accountManager.updateAccounts()).to.be.rejectedWith(
      'unknown error'
    );
  });
});
