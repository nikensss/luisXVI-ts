import { promises as fs, PathLike } from 'fs';
import { Page } from 'puppeteer';

class Human {
  private _page: Page;
  private _downloads: number = -1;
  private _downloadPath: PathLike;
  private _last28days: string = '';

  public static readonly MAX_PATIENCE: number = 60000;
  public static readonly CALENDAR_DROPDOWN: string = '#daterange-button';
  public static readonly TWEETS_NAVBAR: string = '.SharedNavBar--analytics';
  public static readonly TWEETS_LINK: string = `//a[contains(text(), 'Tweets')]`;
  public static readonly EXPORTAR_DATOS: string = '#export > button > span.ladda-label';
  public static readonly BY_TWEET: string = '#export > ul > li:nth-child(1) > button[data-type="by_tweet"]';
  public static readonly UPDATE: string =
    'body > div.daterangepicker.dropdown-menu.opensleft.show-calendar > div.ranges > div > button.applyBtn.btn.btn-sm.btn-primary';
  public static readonly DATE_RANGE_TITLE: string = '#daterange-button > span.daterange-selected';
  public static readonly DATE_RANGES: string = '.ranges > ul > li';
  public static readonly CALENDAR_LEFT_PREV: string =
    '.calendar.left > .calendar-date > table > thead > tr > th.prev.available';
  public static readonly CALENDAR_LEFT_TBODY: string = '.calendar.left > .calendar-date > table > tbody';
  public static readonly CALENDAR_RIGHT_TBODY: string = '.calendar.right > .calendar-date > table > tbody';
  public static readonly CALENDAR_RIGHT_PREV: string =
    '.calendar.right > .calendar-date > table > thead > tr > th.prev.available';

  constructor({ page, downloadPath }: { page: Page; downloadPath: PathLike }) {
    this._page = page;
    this._downloadPath = downloadPath;
  }

  set page(page: Page) {
    this._page = page;
  }

  /**
   * Goes to the 'Tweets' link. One of the three options on the top-left navbar.
   */
  async tweets(): Promise<void> {
    console.log('[Human] I am going to /tweets!');
    await this._page.waitForXPath(Human.TWEETS_LINK);
    const tweetsLink = await this._page.$x(Human.TWEETS_LINK);
    if (tweetsLink.length > 0) {
      await tweetsLink[0].click();
      return Promise.resolve();
    } else {
      throw new Error('[Human] Could not click on the "Tweets" link!');
    }
  }

  /**
   * Toggles the visibility of the calendar.
   */
  async toggleCalendar(): Promise<void> {
    return await this.waitAndClick({
      name: 'calendar dropdown',
      selector: Human.CALENDAR_DROPDOWN
    });
  }

  /**
   * Clicks on the 'Export data' button followed by the 'By tweet' button.
   * Will start a download.
   */
  async exportDataByTweet(): Promise<boolean> {
    await this.waitAndClick({
      name: 'export data',
      selector: Human.EXPORTAR_DATOS
    });

    this._downloads = await this.countDownloads();
    await this.waitAndClick({
      name: 'by tweet',
      selector: Human.BY_TWEET
    });
    const result = await this.waitForNewDownload();
    console.log('[Human] exported by tweet', result);
    return result;
  }

  /**
   * Clicks the 'Update' button to set the new time range.
   */
  async update(): Promise<void> {
    return await this.waitAndClick({ name: 'update', selector: Human.UPDATE });
  }

  async selectCurrentMonth(): Promise<void> {
    console.log('[Human] I am trying to find the first day of the month!');
    await this._page.waitForSelector(Human.DATE_RANGES);
    console.log('[Human] Clicking current month');
    return await this._page.$$eval(Human.DATE_RANGES, (elements) => (<HTMLElement>elements[2]).click());
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
        continue;
      }
      return Promise.resolve(true);
    }
  }

  async downloadPreviousMonths(amount: number): Promise<string[]> {
    let problematicPeriods = [];
    let range;
    for (let i = 0; i <= amount; i++) {
      await this.toggleCalendar(); //TODO: should be 'this.openCalendar()'!
      await this.leftCalendarToPreviousMonth();
      await this.selectFirstDayOfMonth();
      await this.rightCalendarToPreviousMonth();
      await this.selectLastDayOfMonth();
      await this.update();

      if (await this.checkForLast28Days()) {
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

  //Private methods

  private async wait(ms: number): Promise<void> {
    return await new Promise((resolve) => setTimeout(() => resolve(), ms));
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
    console.log('[Human] Waiting for select first day of the month...');
    await this._page.waitForSelector(Human.CALENDAR_LEFT_TBODY);
    console.log('[Human] Selecting first day of month...');
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
    console.log('[Human] First day selected!');
  }

  private async selectLastDayOfMonth() {
    await this._page.waitForSelector(Human.CALENDAR_RIGHT_TBODY);
    console.log('[Human] Selecting last day of month...');
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
    console.log('[Human] Last day selected!');
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
    console.log(`[Human] expected: ${this._last28days}, found: ${dateRange}`);
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
    console.log('[Human] waiting for new downloads');
    const startTime = new Date();
    let now = new Date();
    let currentDownloads = this._downloads;
    while (this._downloads === currentDownloads) {
      this._downloads = await this.countDownloads();
      await this.wait(400);
      now = new Date();
      if (now.getTime() - startTime.getTime() > Human.MAX_PATIENCE) {
        console.log(`[Human] I've waited for ${(now.getTime() - startTime.getTime()) / 1000} seconds, I am tired!`);
        return Promise.resolve(false);
      }
    }
    console.log('[Human] new downloads found!');
    return Promise.resolve(true);
  }

  private async waitAndClick({ name, selector }: { name: string; selector: string }): Promise<void> {
    while (true) {
      try {
        console.log(`[Human] Waiting for ${name}`);
        await this._page.waitForSelector(selector);
        await this.wait(234);
        console.log(`[Human] Clicking on ${name} (Selector : ${selector})`);
        await this._page.click(selector);
        await this.wait(345);
        console.log(`[Human] Success! (${name})`);
        return Promise.resolve();
      } catch (ex) {
        console.log(`[Human] error when waiting and clicking "${name}", trying again`);
      }
    }
  }
}

export default Human;
