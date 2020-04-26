import dotenv from 'dotenv';
import { Page } from 'puppeteer';

const result = dotenv.config();

class Login {
  private _page: Page;
  private _user: string;
  private _pass: string;

  public static readonly USERNAME_INPUT_SELECTOR: string = 'input[name="session[username_or_email]"]';
  public static readonly PASSWORD_INPUT_SELECTOR: string = 'input[name="session[password]"]';
  public static readonly LOGIN_BUTTON_SELECTOR: string = 'div[data-testid="LoginForm_Login_Button"]';

  constructor(page: Page) {
    if (typeof process.env.user !== 'string' || typeof process.env.pass !== 'string') {
      throw new Error("Please, define 'user' and 'pass' in .env file.");
    }

    this._page = page;
    this._user = process.env.user;
    this._pass = process.env.pass;
  }

  get user(): string {
    return this._user;
  }

  async login(): Promise<void> {
    let tries = 0;
    while (true) {
      try {
        this.log('waiting for username input');
        await this._page.waitForSelector(Login.USERNAME_INPUT_SELECTOR);
        console.log('entering username');
        await this._page.click(Login.USERNAME_INPUT_SELECTOR);
        await this._page.keyboard.type(this._user);

        this.log('waiting for password input');
        await this._page.waitForSelector(Login.PASSWORD_INPUT_SELECTOR);
        this.log(`entering password`);
        await this._page.click(Login.PASSWORD_INPUT_SELECTOR);
        await this._page.keyboard.type(this._pass);

        this.log('waiting for login button');
        await this._page.waitForSelector(Login.LOGIN_BUTTON_SELECTOR);
        this.log('clicking login button');
        await this._page.click(Login.LOGIN_BUTTON_SELECTOR);

        return Promise.resolve();
      } catch (ex) {
        tries += 1;
        console.log('[Login] something went wrong while trying to login, trying again', ex);
        if (tries % 5 === 0) this._page.reload();
      }
    }
  }

  private log(msg: string) {
    console.log(`[Login] ${msg}`);
  }
}

export default Login;
