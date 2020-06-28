import { promises as fs, PathLike } from 'fs';
import { Page } from 'puppeteer';
import ora, { Ora } from 'ora';
import { default as wait } from 'delay';
import Timer from '../utils/Timer';
import TwitterSelector from './enums/TwitterSelector';

class Human {
  private _page: Page;
  private _downloads: number = -1;
  private _downloadPath: PathLike;
  private _last28days: string = '';

  private static readonly MAX_PATIENCE: number = 60e3;

  constructor({ page, downloadPath }: { page: Page; downloadPath: PathLike }) {
    this._page = page;
    this._downloadPath = downloadPath;
  }

  set page(page: Page) {
    this._page = page;
  }

  get page(): Page {
    return this._page;
  }

  /**
   * Goes to the 'Tweets' link. One of the three options on the top-left navbar.
   */
  async goToTweets(): Promise<void> {
    console.log('[Human] I am going to /tweets!');
    await this._page.waitForXPath(TwitterSelector.TWEETS_LINK);
    const tweetsLink = await this._page.$x(TwitterSelector.TWEETS_LINK);
    if (tweetsLink.length > 0) {
      return await tweetsLink[0].click();
    } else {
      throw new Error('[Human] Could not click on the "Tweets" link!');
    }
  }

  /**
   * Downloads the data of the current month.
   */
  async downloadCurrentMonth(): Promise<boolean> {
    await this.openCalendar();
    await this.selectCurrentMonth();
    const exported = await this.exportDataByTweet();
    if (!exported) {
      console.log(
        `[Human] could not download csv for period ${await this.getDateRangeTitle()}`
      );
      await this._page.reload();
    }
    return Promise.resolve(exported);
  }

  /**
   * Downloads the CSV data of the 'amount' previous months.
   * @param amount amount of CSVs to download. One CSV per month.
   */
  async downloadPreviousMonths(amount: number): Promise<string[]> {
    let problematicPeriods = [];
    let range;
    for (let i = 0; i < amount; i++) {
      await this.moveCalendarToPreviousMonth();
      console.log(`[Human] current period: ${await this.getDateRangeTitle()}`);
      if (await this.isLast28Days()) {
        console.log('[Human] moving on...');
        break;
      }

      if (!(await this.exportDataByTweet())) {
        range = await this.getDateRangeTitle();
        problematicPeriods.push(range);
        console.log(`[Human] could not download csv for period ${range}`);
      }
    }
    return problematicPeriods;
  }

  async enableDownloads(downloadPath: PathLike): Promise<void> {
    const client = await this._page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadPath
    });
  }

  async isCalendarClosed(): Promise<boolean> {
    await this._page.waitForSelector(TwitterSelector.CALENDAR);
    return await this.page.$eval(
      TwitterSelector.CALENDAR,
      elem =>
        window.getComputedStyle(elem).getPropertyValue('display') === 'none'
    );
  }

  async isCalendarOpen(): Promise<boolean> {
    return !(await this.isCalendarClosed());
  }

  async openCalendar(): Promise<void> {
    if (await this.isCalendarClosed()) this.toggleCalendar();
  }

  async closeCalendar(): Promise<void> {
    if (await this.isCalendarOpen()) this.toggleCalendar();
  }

  //Private methods

  /**
   * Toggles the visibility of the calendar.
   */
  private async toggleCalendar(): Promise<void> {
    return await this.waitAndClick({
      name: 'calendar dropdown',
      selector: TwitterSelector.CALENDAR_DROPDOWN
    });
  }

  /**
   * Clicks on the 'Export data' button followed by the 'By tweet' button.
   * Will start a download.
   *
   * Returns a promise that resolves to true if a new download starts.
   */
  private async exportDataByTweet(): Promise<boolean> {
    await this.waitAndClick({
      name: 'export data',
      selector: TwitterSelector.EXPORTAR_DATOS
    });

    this._downloads = await this.countDownloads();
    await this.waitAndClick({
      name: 'by tweet',
      selector: TwitterSelector.BY_TWEET
    });
    return await this.waitForNewDownload();
  }

  /**
   * Clicks the 'Update' button to set the new time range.
   */
  private async update(): Promise<void> {
    return await this.waitAndClick({
      name: 'update',
      selector: TwitterSelector.UPDATE
    });
  }

  /**
   * In the 'div.daterangepicker' there is a list of buttons to the right that
   * are shortcuts for different time period: last 7 days, last 28 days, and then
   * months. The first month available is the current one, and clicking on it
   * selects from the first day of the month until the current date.
   *
   * We want to click that button to initially sync our 'moving through the
   * calendar' with the month periods.
   *
   */
  private async selectCurrentMonth(): Promise<void> {
    await this._page.waitForSelector(TwitterSelector.DATE_RANGES);
    return await this._page.$$eval(TwitterSelector.DATE_RANGES, elements =>
      (<HTMLElement>elements[2]).click()
    );
  }

  private async leftCalendarToPreviousMonth() {
    await this.waitAndClick({
      name: 'calendar left prev',
      selector: TwitterSelector.CALENDAR_LEFT_PREV
    });
  }

  private async rightCalendarToPreviousMonth() {
    await this.waitAndClick({
      name: 'calendar right prev',
      selector: TwitterSelector.CALENDAR_RIGHT_PREV
    });
  }

  private async moveCalendarToPreviousMonth() {
    await this.openCalendar();
    await this.leftCalendarToPreviousMonth();
    await this.selectFirstDayOfMonth();
    await this.rightCalendarToPreviousMonth();
    await this.selectLastDayOfMonth();
    await this.update();
  }

  private async selectFirstDayOfMonth() {
    await this._page.waitForSelector(TwitterSelector.CALENDAR_LEFT_TBODY);
    console.log('[Human] selecting first day of month');
    await this._page.$eval(TwitterSelector.CALENDAR_LEFT_TBODY, element => {
      const rows = [...element.children];
      for (let row of rows) {
        let days = [...row.children];
        for (let day of days) {
          if ((<HTMLElement>day).innerText === '1') {
            console.log();
            (<HTMLElement>day).click();
            return;
          }
        }
      }
    });
  }

  private async selectLastDayOfMonth() {
    await this._page.waitForSelector(TwitterSelector.CALENDAR_RIGHT_TBODY);
    console.log('[Human] selecting last day of month');
    await this._page.$eval(TwitterSelector.CALENDAR_RIGHT_TBODY, element => {
      const rows = [...element.children].reverse();
      let firstDayFound = false;
      for (let row of rows) {
        let days = [...row.children].reverse();
        for (let day of days) {
          if (firstDayFound) {
            (<HTMLElement>day).click();
            return;
          }
          if ((<HTMLElement>day).innerText === '1') {
            firstDayFound = true;
          }
        }
      }
    });
  }

  private async isLast28Days(): Promise<boolean> {
    //we first fetch the string corresponding to the 'Last 28 days'
    //this may change according to the language of the account
    //this text is written in one of the li's inside the div.range > ul
    if (!this._last28days) {
      const wasClosed = await this.isCalendarClosed();
      await this.openCalendar();
      await this._page.waitForSelector(TwitterSelector.DATE_RANGES);
      this._last28days = await this._page.$$eval(
        TwitterSelector.DATE_RANGES,
        elements => (elements[1] as HTMLElement).innerText
      );
      if (wasClosed) await this.closeCalendar();
    }
    const dateRange = await this.getDateRangeTitle();
    return this._last28days === dateRange;
  }

  private async getDateRangeTitle() {
    await this._page.waitForSelector(TwitterSelector.DATE_RANGE_TITLE);
    return await this._page.$eval(
      TwitterSelector.DATE_RANGE_TITLE,
      e => (<HTMLElement>e).innerText
    );
  }

  private async countDownloads() {
    const files = await fs.readdir(this._downloadPath);
    return files.length;
  }

  /**
   * Waits until a new download starts. Returns a promise that resolves to true
   * if a new download started within the time limit.
   */
  private async waitForNewDownload(): Promise<boolean> {
    const spinner: Ora = ora({
      text: 'Waiting for new downloads',
      prefixText: '[Human]'
    }).start();
    const timer: Timer = new Timer(Human.MAX_PATIENCE);
    let currentDownloads = this._downloads;
    timer.start();
    while (this._downloads === currentDownloads) {
      this._downloads = await this.countDownloads();
      await wait(400);
      if (timer.isTimeout()) {
        spinner.fail(`No new downloads! Tururut violes!🌺`);
        return Promise.resolve(false);
      }
    }
    spinner.succeed('new downloads found!');
    return Promise.resolve(true);
  }

  //TODO: why is there a while loop in here?
  private async waitAndClick({
    name,
    selector
  }: {
    name: string;
    selector: string;
  }): Promise<void> {
    while (true) {
      try {
        await this._page.waitForSelector(selector);
        await wait(234);
        console.log(`[Human] clicking on ${name}`);
        await this._page.click(selector);
        await wait(345);
        return Promise.resolve();
      } catch (ex) {
        console.log(
          `[Human] error when waiting and clicking "${name}", trying again`
        );
      }
    }
  }
}

export default Human;
