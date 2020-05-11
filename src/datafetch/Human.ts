import { promises as fs, PathLike } from 'fs';
import { Page } from 'puppeteer';
import ora, { Ora } from 'ora';
import { default as wait } from 'delay';
import Timer from '../utils/Timer';

class Human {
  private _page: Page;
  private _downloads: number = -1;
  private _downloadPath: PathLike;
  private _last28days: string = '';

  private static readonly MAX_PATIENCE: number = 60e3;
  private static readonly CALENDAR_DROPDOWN: string = '#daterange-button';
  private static readonly TWEETS_NAVBAR: string = '.SharedNavBar--analytics';
  private static readonly TWEETS_LINK: string = `//a[contains(text(), 'Tweets')]`;
  private static readonly EXPORTAR_DATOS: string = '#export > button > span.ladda-label';
  private static readonly BY_TWEET: string = '#export > ul > li:nth-child(1) > button[data-type="by_tweet"]';
  private static readonly UPDATE: string = 'div.daterangepicker > div.ranges > div > button.applyBtn';
  private static readonly DATE_RANGE_TITLE: string = '#daterange-button > span.daterange-selected';
  private static readonly DATE_RANGES: string = '.ranges > ul > li';
  private static readonly CALENDAR_LEFT_PREV: string =
    '.calendar.left > .calendar-date > table > thead > tr > th.prev.available';
  private static readonly CALENDAR_LEFT_TBODY: string = '.calendar.left > .calendar-date > table > tbody';
  private static readonly CALENDAR_RIGHT_TBODY: string = '.calendar.right > .calendar-date > table > tbody';
  private static readonly CALENDAR_RIGHT_PREV: string =
    '.calendar.right > .calendar-date > table > thead > tr > th.prev.available';

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
    await this._page.waitForXPath(Human.TWEETS_LINK);
    const tweetsLink = await this._page.$x(Human.TWEETS_LINK);
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
    while (true) {
      await this.toggleCalendar();
      await this.selectCurrentMonth();
      if (!(await this.exportDataByTweet())) {
        console.log(`[Human] could not download csv for period ${await this.getDateRangeTitle()}`);
        await this._page.reload();
        return Promise.resolve(false);
      }
      return Promise.resolve(true);
    }
  }

  async downloadPreviousMonths(amount: number): Promise<string[]> {
    let problematicPeriods = [];
    let range;
    for (let i = 0; i < amount; i++) {
      await this.toggleCalendar(); //TODO: should be 'this.openCalendar()'!
      await this.leftCalendarToPreviousMonth();
      await this.selectFirstDayOfMonth();
      await this.rightCalendarToPreviousMonth();
      await this.selectLastDayOfMonth();
      await this.update();
      console.log(`[Human] current period: ${await this.getDateRangeTitle()}`);
      if (await this.checkForLast28Days()) {
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

  //Private methods

  /**
   * Toggles the visibility of the calendar.
   */
  private async toggleCalendar(): Promise<void> {
    return await this.waitAndClick({
      name: 'calendar dropdown',
      selector: Human.CALENDAR_DROPDOWN
    });
  }

  /**
   * Clicks on the 'Export data' button followed by the 'By tweet' button.
   * Will start a download.
   */
  private async exportDataByTweet(): Promise<boolean> {
    await this.waitAndClick({
      name: 'export data',
      selector: Human.EXPORTAR_DATOS
    });

    this._downloads = await this.countDownloads();
    await this.waitAndClick({
      name: 'by tweet',
      selector: Human.BY_TWEET
    });
    return await this.waitForNewDownload();
  }

  /**
   * Clicks the 'Update' button to set the new time range.
   */
  private async update(): Promise<void> {
    return await this.waitAndClick({ name: 'update', selector: Human.UPDATE });
  }

  private async selectCurrentMonth(): Promise<void> {
    await this._page.waitForSelector(Human.DATE_RANGES);
    return await this._page.$$eval(Human.DATE_RANGES, (elements) => (<HTMLElement>elements[2]).click());
  }

  private async leftCalendarToPreviousMonth() {
    await this.waitAndClick({
      name: 'calendar left prev',
      selector: Human.CALENDAR_LEFT_PREV
    });
  }

  private async rightCalendarToPreviousMonth() {
    await this.waitAndClick({
      name: 'calendar right prev',
      selector: Human.CALENDAR_RIGHT_PREV
    });
  }

  private async selectFirstDayOfMonth() {
    await this._page.waitForSelector(Human.CALENDAR_LEFT_TBODY);
    console.log('[Human] selecting first day of month');
    await this._page.$eval(Human.CALENDAR_LEFT_TBODY, (element) => {
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
    await this._page.waitForSelector(Human.CALENDAR_RIGHT_TBODY);
    console.log('[Human] selecting last day of month');
    await this._page.$eval(Human.CALENDAR_RIGHT_TBODY, (element) => {
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

  private async checkForLast28Days() {
    //we first fetch the string corresponding to the 'Last 28 days'
    //this may change according to the language of the account
    //this text is written in one of the li's inside the div.range > ul
    if (!this._last28days) {
      await this.toggleCalendar(); //TODO: should be 'this.openCalendar()'
      await this._page.waitForSelector(Human.DATE_RANGES);
      this._last28days = await this._page.$$eval(Human.DATE_RANGES, (elements) => (<HTMLElement>elements[1]).innerText);
      await this.toggleCalendar(); //TODO: should leave the state as it was before entering
    }
    const dateRange = await this.getDateRangeTitle();
    return this._last28days === dateRange;
  }

  private async getDateRangeTitle() {
    await this._page.waitForSelector(Human.DATE_RANGE_TITLE);
    return await this._page.$eval(Human.DATE_RANGE_TITLE, (e) => (<HTMLElement>e).innerText);
  }

  private async countDownloads() {
    const files = await fs.readdir(this._downloadPath);
    return files.length;
  }

  private async waitForNewDownload(): Promise<boolean> {
    const spinner: Ora = ora({ text: 'Waiting for new downloads', prefixText: '[Human]' }).start();
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

  private async waitAndClick({ name, selector }: { name: string; selector: string }): Promise<void> {
    while (true) {
      try {
        await this._page.waitForSelector(selector);
        await wait(234);
        console.log(`[Human] clicking on ${name}`);
        await this._page.click(selector);
        await wait(345);
        return Promise.resolve();
      } catch (ex) {
        console.log(`[Human] error when waiting and clicking "${name}", trying again`);
      }
    }
  }
}

export default Human;
