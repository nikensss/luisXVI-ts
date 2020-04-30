import { Page } from 'puppeteer';

/**
 * Performs the login operation. Keeps trying until it works.
 */
class Login {
  private _page: Page;
  private _user: string;
  private _pass: string;

  private static readonly USERNAME_INPUT_SELECTOR: string = 'input[name="session[username_or_email]"]';
  private static readonly PASSWORD_INPUT_SELECTOR: string = 'input[name="session[password]"]';
  private static readonly LOGIN_BUTTON_SELECTOR: string = 'div[data-testid="LoginForm_Login_Button"]';

  constructor(page: Page) {
    if (typeof process.env.user !== 'string' || typeof process.env.pass !== 'string') {
      throw new Error("Please, define 'user' and 'pass' in .env file.");
    }

    this._page = page;
    this._user = process.env.user;
    this._pass = process.env.pass;
  }

  public get user(): string {
    return this._user;
  }

  public async login(): Promise<void> {
    let tries = 0;
    while (true) {
      try {
        this.log('waiting for username input');
        await this._page.waitForSelector(Login.USERNAME_INPUT_SELECTOR);
        this.log('entering username');
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
        this.logError('exception while trying to login', ex);
        if (tries > 30) throw new Error('Cannot log in!');
        if (tries % 5 === 0) this._page.reload();
        this.log('trying again');
      }
    }
  }

  private log(msg: string) {
    console.log(`[Login] ${msg}`);
  }

  private logError(msg: string, ex: Error) {
    this.log(msg);
    this.log(ex.message);
  }
}

export default Login;
