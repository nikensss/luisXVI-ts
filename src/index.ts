import { promises as fs, PathLike } from 'fs';
import path from 'path';
import puppeteer, { Viewport } from 'puppeteer';
import DownloadManager from './datafetch/DownloadManager';
import Login from './datafetch/Login';
import AccountManager from './datafetch/AccountManager';
import Human from './datafetch/Human';

const DOWNLOAD_PATH: PathLike = path.join(__dirname, 'downloads');
const VIEWPORT: Viewport = {
  width: 1600,
  height: 800
};
const downloadManager = new DownloadManager(DOWNLOAD_PATH);

(async () => {
  downloadManager.flush();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--start-fullscreen']
  });

  const page = (await browser.pages())[0];

  await page.setViewport(VIEWPORT);
  await page.goto('https://www.twitter.com');

  const login = new Login(page);
  await login.login();

  const accountManager = new AccountManager(page);

  if (login.user.includes('rikitzzz')) {
    console.log('setting account for accountManager');
    accountManager.addAccount('MrPiglover');
  } else {
    await page.goto('https://analytics.twitter.com/accounts');
    await accountManager.updateAccounts();
  }

  const human = new Human({ page: page, downloadPath: DOWNLOAD_PATH });

  let problematicPeriods: Array<{ name: string; value: string[] }> = [];

  for (let account of accountManager.accounts) {
    await page.goto(account.link);
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: DOWNLOAD_PATH
    });
    human.page = page;
    await human.tweets();
    await human.downloadCurrentMonth();
    problematicPeriods.push({ name: account.name, value: await human.downloadPreviousMonths(24) });
  }
  console.log(JSON.stringify(problematicPeriods));

  browser.close();
})();
