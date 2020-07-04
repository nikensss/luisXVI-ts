import AccountManager from '../../src/datafetch/AccountManager';
import { Page } from 'puppeteer';
import { expect } from 'chai';
import Account from '../../src/datafetch/Account';
import { fail } from 'assert';

describe('AccountManager', () => {
  it('creates new AccountManager', () => {
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
    expect(accountManager.accounts.length).to.be.equal(2);
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
        throw new Error('unknown exception');
      }
    };
    const accountManager = new AccountManager(mockPage as Page);
    try {
      await accountManager.updateAccounts();
      fail();
    } catch (ex) {
      expect(ex.toString()).to.be.equal('Error: unknown exception');
    }
  });
});
