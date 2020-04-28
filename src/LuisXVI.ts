import { PathLike } from 'fs';
import path from 'path';
import puppeteer, { Viewport } from 'puppeteer';
import DownloadManager from './datafetch/DownloadManager';
import Login from './datafetch/Login';
import AccountManager, { Account } from './datafetch/AccountManager';
import Human from './datafetch/Human';

class LuisXVI {
  private _downloadManager: DownloadManager;

  public static readonly DOWNLOAD_PATH: PathLike = path.join(__dirname, 'downloads');
  public static readonly VIEWPORT: Viewport = { width: 1600, height: 800 };

  constructor() {
    this._downloadManager = new DownloadManager(LuisXVI.DOWNLOAD_PATH);
  }

  async execute(): Promise<void> {
    this._downloadManager.flush();

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--start-fullscreen']
    });

    const page = (await browser.pages())[0];

    await page.setViewport(LuisXVI.VIEWPORT);
    await page.goto('https://www.twitter.com');

    const login = new Login(page);
    await login.login();
    console.log('[LuisXVI] logged in!');

    const accountManager = new AccountManager(page);

    if (login.user.includes('rikitzzz')) {
      console.log('[LuisXVI] setting account for accountManager');
      accountManager.addAccount(new Account('MrPiglover'));
    } else {
      await page.goto('https://analytics.twitter.com/accounts');
      await accountManager.updateAccounts();
    }

    const human = new Human({ page: page, downloadPath: this._downloadManager.path });

    let problematicPeriods: Array<{ name: string; value: string[] }> = [];

    for (let account of accountManager.accounts) {
      console.log(`[LuisXVI] starting csv downloads for ${account.name}`);
      await page.goto(account.link);
      const client = await page.target().createCDPSession();
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: this._downloadManager.path
      });
      human.page = page;
      await human.tweets();
      await human.downloadCurrentMonth();
      problematicPeriods.push({ name: account.name, value: await human.downloadPreviousMonths(12) });
      console.log(`[LuisXVI] finished downloading csv's for ${account.name}`);
    }
    console.log(JSON.stringify(problematicPeriods));

    browser.close();
  }
}

export default LuisXVI;
