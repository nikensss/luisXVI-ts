import { PathLike } from 'fs';
import path from 'path';
import puppeteer, { Viewport } from 'puppeteer';
import DownloadManager from './datafetch/DownloadManager';
import Login from './datafetch/Login';
import AccountManager from './datafetch/AccountManager';
import Human from './datafetch/Human';
import CsvHandler from './analytics/CsvHandler';
import Tweet from './analytics/Tweet';
import Analyzer from './analytics/Analyzer';
import Telegram from './utils/Telegram';
import ProblematicPeriods from './datafetch/interfaces/ProblematicPeriods';
import PeriodAggregations from './analytics/PeriodAggregations';
import Period from './analytics/enums/Period';
import Metric from './analytics/enums/Metric';

class LuisXVI {
  private _downloadManager: DownloadManager;

  private static readonly DOWNLOAD_PATH: PathLike = path.join(
    __dirname,
    'downloads'
  );
  private static readonly VIEWPORT: Viewport = { width: 1600, height: 800 };

  constructor() {
    this._downloadManager = new DownloadManager(LuisXVI.DOWNLOAD_PATH);
  }

  async fetchData(amount: number): Promise<void> {
    if (amount <= 0)
      throw new Error(
        `Given amount must be greater than 0, received: ${amount}`
      );

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
    await accountManager.goToAccounts();
    await accountManager.updateAccounts();

    const human = new Human({
      page: page,
      downloadPath: this._downloadManager.dir
    });
    let problematicPeriods: ProblematicPeriods[] = [];

    for (let account of accountManager.accounts) {
      this.log(`starting csv downloads for ${account.name}`);
      await human.page.goto(account.link);
      await human.enableDownloads(this._downloadManager.dir);
      await human.goToTweets();
      await human.downloadCurrentMonth();
      problematicPeriods.push({
        account: account,
        periods: await human.downloadPreviousMonths(amount - 1)
      });
      this.log(`finished downloading csv's for ${account.name}`);
    }
    this.log(JSON.stringify(problematicPeriods));
    // Telegram.getInstance().sendQuiet(JSON.stringify(problematicPeriods, null, 0));
    browser.close();
  }

  async crunch({
    metrics,
    periods
  }: {
    metrics: Metric[];
    periods: Period[];
  }): Promise<PeriodAggregations[]> {
    this.log('crunching!');

    const csvPaths: PathLike[] = this._downloadManager.listDownloads();
    const tweets: Tweet[] = await CsvHandler.parseMultiple(csvPaths);
    const leonhard = new Analyzer(tweets);
    let result: PeriodAggregations[] = leonhard.sum(metrics, periods);

    this.log('finished with crunching!');
    return result;
  }

  public get downloadPath(): PathLike {
    return this._downloadManager.dir;
  }

  //Private implementations

  private log(msg: string): void {
    if (process.env.verbose === 'true') console.log(`[LuisXVI] ${msg}`);
  }
}

export default LuisXVI;
