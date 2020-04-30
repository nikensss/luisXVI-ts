import { promises as fs, PathLike } from 'fs';
import path from 'path';
import puppeteer, { Viewport } from 'puppeteer';
import DownloadManager from './datafetch/DownloadManager';
import Login from './datafetch/Login';
import AccountManager from './datafetch/AccountManager';
import Human from './datafetch/Human';
import Account from './datafetch/Account';
import CsvHandler from './analytics/CsvHandler';
import Tweet from './analytics/Tweet';

class LuisXVI {
  private _downloadManager: DownloadManager;

  private static readonly DOWNLOAD_PATH: PathLike = path.join(__dirname, 'downloads');
  private static readonly VIEWPORT: Viewport = { width: 1600, height: 800 };

  constructor() {
    this._downloadManager = new DownloadManager(LuisXVI.DOWNLOAD_PATH);
  }

  async execute(amount: number): Promise<void> {
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
    this.log('logged in!');

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
      //TODO: use generator method from AccountManager
      this.log(`starting csv downloads for ${account.name}`);
      await page.goto(account.link);
      human.page = page;
      await human.enableDownloads(this._downloadManager.path);
      await human.tweets();
      await human.downloadCurrentMonth();
      problematicPeriods.push({ name: account.name, value: await human.downloadPreviousMonths(amount - 1) });
      this.log(`finished downloading csv's for ${account.name}`);
    }
    this.log(JSON.stringify(problematicPeriods));

    browser.close();
  }

  async crunch() {
    this.log('crunching!');
    const csvPaths: PathLike[] = await fs
      .readdir(this._downloadManager.path)
      .then((files) => files.map((n) => path.join(this._downloadManager.path.toString(), n)));
    const csvHandler: CsvHandler = new CsvHandler();
    const tweets: Tweet[] = await csvHandler.parseMultiple(csvPaths);
    console.log();
  }

  private log(msg: string): void {
    if (process.env.verbose === 'true') console.log(`[LuisXVI] ${msg}`);
  }
}

export default LuisXVI;
